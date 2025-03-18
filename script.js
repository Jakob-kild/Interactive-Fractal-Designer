// Grab the canvas and its 2D context
const canvas = document.getElementById('fractalCanvas');
const ctx = canvas.getContext('2d');

// A simple function to draw the Sierpinski triangle (Chaos Game version)
function drawSierpinski() {
  // Clear the canvas in case it's been drawn on before
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Define the triangle's corners
  // We'll just place them at top/left/right corners of the canvas
  const corners = [
    { x: canvas.width / 2, y: 0 },         // top
    { x: 0,               y: canvas.height }, // bottom-left
    { x: canvas.width,    y: canvas.height }  // bottom-right
  ];

  // Pick a random starting point anywhere on the canvas
  let currentPoint = {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height
  };

  // Choose how many points to plot
  const iterations = 5000;

  // Draw each point
  for (let i = 0; i < iterations; i++) {
    // Randomly choose one of the corners
    const randomCorner = corners[Math.floor(Math.random() * corners.length)];

    // Move halfway from the current point to that corner
    currentPoint.x = (currentPoint.x + randomCorner.x) / 2;
    currentPoint.y = (currentPoint.y + randomCorner.y) / 2;

    // Draw a tiny pixel at the new point
    // You could also use a small circle if you like
    ctx.fillRect(currentPoint.x, currentPoint.y, 1, 1);
  }
}

// Immediately draw the fractal on page load
drawSierpinski();
