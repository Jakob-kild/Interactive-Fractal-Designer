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

// Define the big triangle corners
const corners = [
  { x: canvas.width / 2, y: 0 },            // top
  { x: 0,               y: canvas.height }, // bottom-left
  { x: canvas.width,    y: canvas.height }  // bottom-right
];

// We'll store data for each step:
// steps[i] = {
//   from: {x,y},    // start of iteration i
//   corner: {x,y},  // chosen corner
//   to: {x,y}       // midpoint
// }
let steps = [];

// Track current iteration index (timeline position)
let currentIteration = 0;
// Whether we are animating
let isPlaying = false;
let playInterval = null;

//-------------------------------------
// 1) Draw the outline of the big triangle
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
// 2) Check if user click is inside the main triangle
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
// 3) Compute all iteration steps
//-------------------------------------
function computeSteps(startX, startY) {
  const allSteps = [];
  let current = { x: startX, y: startY };

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const corner = corners[Math.floor(Math.random() * corners.length)];
    const midpoint = {
      x: (current.x + corner.x) / 2,
      y: (current.y + corner.y) / 2
    };
    allSteps.push({
      from: { x: current.x, y: current.y },
      corner: { x: corner.x, y: corner.y },
      to: { x: midpoint.x, y: midpoint.y }
    });
    current = midpoint; // update for next iteration
  }
  return allSteps;
}

//-------------------------------------
// 4) Draw everything up to 'iteration'
//    - For steps 0..(iteration-2): only draw the 'to' point in black
//    - For step (iteration-1): draw 'from' (blue), line to corner, 'to' (red)
//-------------------------------------
function drawUpToIteration(iterationCount) {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw the red outline
  drawTriangleOutline();

  // If iterationCount == 0, no steps are displayed
  if (iterationCount === 0) {
    return;
  }

  // 1) Draw older steps in black
  //    from step 0 up to iterationCount-2
  for (let i = 0; i < iterationCount - 1; i++) {
    const step = steps[i];
    // The "to" is the final position for that iteration
    drawCircle(step.to.x, step.to.y, 1.5, 'black');
  }

  // 2) Draw the current step (iterationCount-1) in color
  const currentIndex = iterationCount - 1;
  if (currentIndex < steps.length) {
    const step = steps[currentIndex];
    // "from" in blue (bigger circle)
    drawCircle(step.from.x, step.from.y, 4, 'blue');

    // line from "from" to corner
    drawLine(step.from.x, step.from.y, step.corner.x, step.corner.y, 'black');

    // "to" in red (smaller circle)
    drawCircle(step.to.x, step.to.y, 3, 'red');
  }
}

//-------------------------------------
// 5) Helpers to draw circles and lines
//-------------------------------------
function drawCircle(x, y, radius, color) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawLine(x1, y1, x2, y2, color) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();
}

//-------------------------------------
// 6) Canvas click => set initial point
//-------------------------------------
canvas.addEventListener('click', (e) => {
  if (steps.length > 0 && !confirm('Reset fractal with a new start point?')) {
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  if (!pointInTriangle(clickX, clickY, corners[0], corners[1], corners[2])) {
    alert('You clicked outside the triangle! Try again.');
    return;
  }

  // Compute steps from the chosen point
  steps = computeSteps(clickX, clickY);

  // Reset iteration/timeline
  currentIteration = 0;
  timeline.value = 0;
  iterationLabel.textContent = '0';

  // Enable timeline & play/pause
  timeline.disabled = false;
  playBtn.disabled = false;
  pauseBtn.disabled = false;

  // Draw the outline plus the initial chosen point in blue
  drawUpToIteration(0);
  drawCircle(clickX, clickY, 5, 'blue');
});

//-------------------------------------
// 7) Timeline (scrub manually)
//-------------------------------------
timeline.addEventListener('input', () => {
  currentIteration = parseInt(timeline.value, 10);
  iterationLabel.textContent = currentIteration;
  drawUpToIteration(currentIteration);
});

//-------------------------------------
// 8) Play/Pause
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
  }, 10); // Adjust speed as desired
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
// Initial: just the outline
//-------------------------------------
ctx.clearRect(0, 0, canvas.width, canvas.height);
drawTriangleOutline();
