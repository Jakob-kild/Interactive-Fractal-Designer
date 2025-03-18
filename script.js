// Grab DOM elements
const canvas = document.getElementById('fractalCanvas');
const ctx = canvas.getContext('2d');

const slider = document.getElementById('iterationsSlider');
const sliderValue = document.getElementById('sliderValue');

// Define corners of the Sierpinski triangle
const corners = [
  { x: canvas.width / 2, y: 0 },            // top
  { x: 0,               y: canvas.height }, // bottom-left
  { x: canvas.width,    y: canvas.height }  // bottom-right
];

// ---------------------
// Utility: Check if a point is inside the triangle
// using the "area" or "triangulation" method
// ---------------------
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

  // Allow for a tiny floating error margin if desired
  return Math.abs(totalArea - (area1 + area2 + area3)) < 0.001;
}

// ---------------------
// Draw an outline of the triangle so the user knows where to click
// ---------------------
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

// ---------------------
// Draw Sierpinski via Chaos Game
// starting from a user-defined point
// ---------------------
function drawSierpinski(iterations, startX, startY) {
  // Clear the canvas first
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Redraw the triangle outline
  drawTriangleOutline();

  // Current point (set by the user click)
  let currentPoint = { x: startX, y: startY };

  // Plot the fractal
  for (let i = 0; i < iterations; i++) {
    // Randomly select one corner
    const randomCorner = corners[Math.floor(Math.random() * corners.length)];
    // Move halfway toward that corner
    currentPoint.x = (currentPoint.x + randomCorner.x) / 2;
    currentPoint.y = (currentPoint.y + randomCorner.y) / 2;
    // Draw a pixel at the current point
    ctx.fillRect(currentPoint.x, currentPoint.y, 1, 1);
  }
}

// ---------------------
// Handle slider changes
// ---------------------
slider.addEventListener('input', () => {
  sliderValue.textContent = slider.value;
});

// ---------------------
// Handle user click to set the initial point
// ---------------------
canvas.addEventListener('click', (e) => {
  // Get the bounding rectangle of the canvas
  const rect = canvas.getBoundingClientRect();
  // Calculate the x,y of the click relative to canvas
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  // Check if click is inside the big triangle
  if (pointInTriangle(clickX, clickY, corners[0], corners[1], corners[2])) {
    // It's inside -> Draw the fractal
    const iterations = parseInt(slider.value, 10);
    drawSierpinski(iterations, clickX, clickY);
  } else {
    // It's outside -> Show an error
    alert('You clicked outside the triangle! Try again.');
  }
});

// ---------------------
// Initial: Clear and draw just the outline
// ---------------------
ctx.clearRect(0, 0, canvas.width, canvas.height);
drawTriangleOutline();
