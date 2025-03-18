// Grab the canvas, context, slider, and sliderValue display
const canvas = document.getElementById('fractalCanvas');
const ctx = canvas.getContext('2d');

const slider = document.getElementById('iterationsSlider');
const sliderValue = document.getElementById('sliderValue');

// Draw Sierpinski Triangle using the Chaos Game method
function drawSierpinski(iterations) {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Define corners of the triangle
  const corners = [
    { x: canvas.width / 2, y: 0 },            // top
    { x: 0,               y: canvas.height }, // bottom-left
    { x: canvas.width,    y: canvas.height }  // bottom-right
  ];

  // Random starting point
  let currentPoint = {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height
  };

  // Perform the iterations
  for (let i = 0; i < iterations; i++) {
    // Randomly select one corner
    const randomCorner = corners[Math.floor(Math.random() * corners.length)];

    // Move halfway towards that corner
    currentPoint.x = (currentPoint.x + randomCorner.x) / 2;
    currentPoint.y = (currentPoint.y + randomCorner.y) / 2;

    // Draw a small rectangle or pixel
    ctx.fillRect(currentPoint.x, currentPoint.y, 1, 1);
  }
}

// Event listener for slider changes
slider.addEventListener('input', () => {
  // Get the new iteration count from the slider
  const iterations = parseInt(slider.value, 10);

  // Update the displayed value
  sliderValue.textContent = iterations;

  // Re-draw the fractal with the new iteration count
  drawSierpinski(iterations);
});

// Initial draw with default value
drawSierpinski(parseInt(slider.value, 10));
