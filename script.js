//-------------------------------------
// Constants & DOM Elements
//-------------------------------------
const canvas = document.getElementById('fractalCanvas');
const ctx = canvas.getContext('2d');

const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const timeline = document.getElementById('timeline');
const iterationLabel = document.getElementById('iterationLabel');

const MAX_ITERATIONS = 50000;

// Corners of the main triangle
const corners = [
  { x: canvas.width / 2, y: 0 },            // top
  { x: 0,               y: canvas.height }, // bottom-left
  { x: canvas.width,    y: canvas.height }  // bottom-right
];

// We'll store all fractal points here once computed
let fractalPoints = [];
// Keep track of current iteration on the timeline
let currentIteration = 0;
// Playback state
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
// 2) Check if the user's click is inside the main triangle
//    Using the "area" method
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
// 3) Compute all 50,000 chaos-game points
//-------------------------------------
function computeChaosGamePoints(startX, startY) {
  const points = [];
  // Current point
  let currentPoint = { x: startX, y: startY };

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    // Randomly pick a corner
    const corner = corners[Math.floor(Math.random() * corners.length)];
    // Move halfway towards that corner
    currentPoint.x = (currentPoint.x + corner.x) / 2;
    currentPoint.y = (currentPoint.y + corner.y) / 2;
    // Store a copy of this point
    points.push({ x: currentPoint.x, y: currentPoint.y });
  }
  return points;
}

//-------------------------------------
// 4) Draw points up to 'iteration' index
//-------------------------------------
function drawPointsUpToIteration(iteration) {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Redraw the outline
  drawTriangleOutline();

  // Draw fractal points from 0 to 'iteration'
  // (iteration is inclusive, so let's go up to that index)
  for (let i = 0; i < iteration; i++) {
    const p = fractalPoints[i];
    ctx.fillRect(p.x, p.y, 1, 1);
  }
}

//-------------------------------------
// 5) Canvas Click -> Attempt to set initial point
//-------------------------------------
canvas.addEventListener('click', (e) => {
  // Only set a new starting point if we haven't started playing
  // (Alternatively, you could allow re-click to reset everything.)
  if (fractalPoints.length > 0 && !confirm('Reset fractal with a new start point?')) {
    return;
  }

  // Get click coordinates relative to canvas
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  // Check if inside the main triangle
  if (!pointInTriangle(clickX, clickY, corners[0], corners[1], corners[2])) {
    alert('You clicked outside the triangle! Try again.');
    return;
  }

  // Valid point -> compute fractal
  fractalPoints = computeChaosGamePoints(clickX, clickY);

  // Reset timeline to 0
  currentIteration = 0;
  timeline.value = 0;
  iterationLabel.textContent = '0';

  // Enable timeline & buttons
  timeline.disabled = false;
  playBtn.disabled = false;
  pauseBtn.disabled = false;

  // Draw the outline (no fractal points shown yet)
  drawPointsUpToIteration(currentIteration);
});

//-------------------------------------
// 6) Timeline Controls (scrub manually)
//-------------------------------------
timeline.addEventListener('input', () => {
  // Update iteration to the timeline's value
  currentIteration = parseInt(timeline.value, 10);
  iterationLabel.textContent = currentIteration;
  // Re-draw fractal up to that iteration
  drawPointsUpToIteration(currentIteration);
});

//-------------------------------------
// 7) Play/Pause buttons
//-------------------------------------
playBtn.addEventListener('click', () => {
  if (isPlaying) return; // already playing
  isPlaying = true;

  playInterval = setInterval(() => {
    if (currentIteration < MAX_ITERATIONS) {
      currentIteration++;
      timeline.value = currentIteration;
      iterationLabel.textContent = currentIteration;
      // Draw next point incrementally or from scratch
      // For simplicity, we'll just re-draw from scratch:
      drawPointsUpToIteration(currentIteration);
    } else {
      pausePlayback();
    }
  }, 10); // Increase or decrease delay to control speed
});

pauseBtn.addEventListener('click', () => {
  pausePlayback();
});

function pausePlayback() {
  if (playInterval) {
    clearInterval(playInterval);
    playInterval = null;
  }
  isPlaying = false;
}

//-------------------------------------
// Initial draw: just the outline
//-------------------------------------
ctx.clearRect(0, 0, canvas.width, canvas.height);
drawTriangleOutline();
