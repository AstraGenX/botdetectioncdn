
// Array to store the mouse movement data
let mouseMovements = [];

// Function to handle mouse movement
function handleMouseMove(event) {
  const movementData = {
    x: event.clientX, // X position relative to viewport
    y: event.clientY, // Y position relative to viewport
    timestamp: Date.now(), // Capture the timestamp
  };

  // Add the movement data to the array
  mouseMovements.push(movementData);

  // Optional: Log to console for testing
  axios
    .post("http://localhost:5500/save-mouse-movements", mouseMovements)
    .then((response) => {
      console.log("Data successfully sent:", mouseMovements);
    })
    .catch((error) => {
      console.error("Error sending data:", error);
    });
}

// Add event listener for mouse movement
window.addEventListener("mousemove", handleMouseMove);

// Optional: Save to localStorage every 5 seconds (for client-side persistence)
setInterval(() => {
  localStorage.setItem("mouseMovements", JSON.stringify(mouseMovements));
}, 5000);


// Wait for the page to fully load
// Wait for the page to fully load


let lastX = 0, lastY = 0;
let movements = [];

document.addEventListener("mousemove", (event) => {
    let { clientX, clientY } = event;

    // Calculate movement distance
    let dx = Math.abs(clientX - lastX);
    let dy = Math.abs(clientY - lastY);
    
    // Store movement data
    movements.push({ dx, dy });

    // Keep only the last 50 movements
    if (movements.length > 50) movements.shift();

    // Analyze bot-like patterns
    detectBotMovement();

    lastX = clientX;
    lastY = clientY;
});

function detectBotMovement() {
    if (movements.length < 20) return;

    let totalDx = 0, totalDy = 0;
    let samePattern = true;

    for (let i = 1; i < movements.length; i++) {
        totalDx += movements[i].dx;
        totalDy += movements[i].dy;

        if (movements[i].dx !== movements[i - 1].dx || movements[i].dy !== movements[i - 1].dy) {
            samePattern = false;
        }
    }

    // If movement is perfectly linear or repetitive, trigger alert
    if (samePattern || totalDx === 0 || totalDy === 0) {
         alert("Bot Detected");
        document.removeEventListener("mousemove", detectBotMovement); // Stop further detection
    }
}
