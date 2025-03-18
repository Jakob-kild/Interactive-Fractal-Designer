//-------------------------------------
// DOM Elements & Constants
//-------------------------------------
const canvas = document.getElementById('fractalCanvas');
const ctx = canvas.getContext('2d');

const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const timeline = document.getElementById('timeline');
const iterationLabel = document.getElementById('iterationLabel');

const MAX_ITERATIONS = 50000;

// The triangle corners
const corners = [
  { x: canvas.width / 2, y: 0 },            // top
  { x: 0,               y: canvas.height }, // bottom-left
  { x: canvas.width,    y: canvas.height }  // bottom-right
];

// Data structure to hold all iteration info
// Each entry: { from: {x, y}, corner: {x, y}, to: {x, y} }
let iterationSteps = [];

// Current iteration index
let currentIteration = 0;
// Whether we are animating
let isPlaying = false;
let playInterval = null;

//-------------------------------------
// Utility: Draw the outline of the main triangle
//-------------------------------------
function drawTriangleOutline() {
  ctx.beginPath();
  ctx.moveTo(corners[0].x, corners[0].y);
  ctx.lineTo(corners[1].x, corners[1].y);
  ctx.lineTo(corners[2].x, corners[2].y);
  ctx.closePath();
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.stroke();
}

//-------------------------------------
// Utility: Check if user click is inside the big triangle
// Using "area" method
//-------------------------------------
function area(x1, y1, x2, y2, x3, y3) {
  return Math.abs(
    x1*(y2 - y3) + x2*(y3 - y1) + x3*(y1 - y2)
  ) / 2;
}

function pointInTriangle(px, py, c1, c2, c3) {
  const totalArea = area(c1.x, c1.y, c2.x, c2.y, c3.x, c3.y);
  const area1 = area(px, py, c2.x, c2.y, c3.x, c3.y);
  const area2 = area(c1.x, c1.y, px, py, c3.x, c3.y);
  const area3 = area(c1.x, c1.y, c2.x, c2.y, px, py);

  return Math.abs(totalArea - (area1 + area2 + area3)) < 0.001;
}

//-------------------------------------
// 1) Precompute iteration steps
//    For each iteration, we store:
//    - "from" = current point (blue circle)
//    - "corner" = chosen corner
//    - "to" = midpoint (red circle)
//-------------------------------------
function computeIterationSteps(startX, startY) {
  const steps = [];

  let currentPoint = { x: startX, y: startY };

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    // Pick a corner
    const corner = corners[Math.floor(Math.random() * corners.length)];
    // Prepare the step object
    const stepData = {
      from: { x: currentPoint.x, y: currentPoint.y },
      corner: { x: corner.x, y: corner.y },
      to: {}
    };
    // Compute midpoint
    const midX = (currentPoint.x + corner.x) / 2;
    const midY = (currentPoint.y + corner.y) / 2;
    stepData.to = { x: midX, y: midY };

    // Update our current point to the new midpoint
    currentPoint = { x: midX, y: midY };

    // Store the step
    steps.push(stepData);
  }
  return steps;
}

//-------------------------------------
// 2) Draw up to a certain iteration index
//    For each step i up to "iteration":
//    - Draw big blue circle at "from"
//    - Draw line from "from" to "corner"
//    - Draw small red circle at "to"
//-------------------------------------
function drawUpToIteration(iteration) {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw the triangle outline
  drawTriangleOutline();

  // Draw all steps from 0..(iteration - 1) inclusive
  // If iteration=0, we skip drawing any fractal step
  for (let i = 0; i < iteration; i++) {
    const step = iterationSteps[i];
    // "from" in blue
    drawCircle(step.from.x, step.from.y, 4, 'blue'); // bigger radius for clarity
    // line from "from" to corner
    drawLine(step.from.x, step.from.y, step.corner.x, step.corner.y, 'black');
    // midpoint "to" in red
    drawCircle(step.to.x, step.to.y, 2, 'red');
  }
}

//-------------------------------------
// 3) Helper: draw a circle
//-------------------------------------
function drawCircle(x, y, radius, color) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

//-------------------------------------
// 4) Helper: draw a line
//-------------------------------------
function drawLine(x1, y1, x2, y2, color) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();
}

//-------------------------------------
// Canvas click: set initial point
//-------------------------------------
canvas.addEventListener('click', (e) => {
  // If we already have data, prompt user about resetting
  if (iterationSteps.length > 0 && !confirm('Reset fractal with a new start point?')) {
    return;
  }

  // Identify click coordinates
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  // Check inside triangle
  if (!pointInTriangle(clickX, clickY, corners[0], corners[1], corners[2])) {
    alert('You clicked outside the triangle! Try again.');
    return;
  }

  // Compute all iteration steps from this start point
  iterationSteps = computeIterationSteps(clickX, clickY);

  // Reset iteration and timeline
  currentIteration = 0;
  timeline.value = 0;
  iterationLabel.textContent = '0';

  // Enable the timeline + play/pause
  timeline.disabled = false;
  playBtn.disabled = false;
  pauseBtn.disabled = false;

  // Draw the outline plus the initial chosen point
  drawUpToIteration(0);
  // Mark the initial chosen point in big blue
  drawCircle(clickX, clickY, 5, 'blue');
});

//-------------------------------------
// Timeline manual scrub
//-------------------------------------
timeline.addEventListener('input', () => {
  currentIteration = parseInt(timeline.value, 10);
  iterationLabel.textContent = currentIteration;
  drawUpToIteration(currentIteration);
});

//-------------------------------------
// Play & Pause
//-------------------------------------
playBtn.addEventListener('click', () => {
  if (isPlaying) return;
  isPlaying = true;

  playInterval = setInterval(() => {
    if (currentIteration < MAX_ITERATIONS) {
      currentIteration++;
      timeline.value = currentIteration;
      iterationLabel.textContent = currentIteration;
      drawUpToIteration(currentIteration);
    } else {
      pausePlayback();
    }
  }, 10); // adjust speed by changing interval
});

pauseBtn.addEventListener('click', pausePlayback);

function pausePlayback() {
  if (playInterval) {
    clearInterval(playInterval);
    playInterval = null;
  }
  isPlaying = false;
}

//-------------------------------------
// Initial: just draw the empty canvas with outline
//-------------------------------------
ctx.clearRect(0, 0, canvas.width, canvas.height);
drawTriangleOutline();
