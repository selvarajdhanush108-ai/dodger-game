const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restartBtn");

// Game variables
let animationId;
let score = 0;
let highScore = localStorage.getItem("dodgerHighScore") || 0; // Load saved high score
let isGameOver = false;

// Player Object
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    color: "#3498db",
    speed: 6, // Made the player slightly faster for v2!
    dx: 0
};

// Enemies Array
let enemies = [];

// Input handling
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") player.dx = -player.speed;
    if (e.key === "ArrowRight") player.dx = player.speed;
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") player.dx = 0;
});

// Create a new enemy
function spawnEnemy() {
    const size = Math.random() * 30 + 20; 
    const x = Math.random() * (canvas.width - size);
    enemies.push({
        x: x,
        y: -size,
        width: size,
        height: size,
        color: "#e74c3c",
        speed: Math.random() * 4 + 2 
    });
}

// Update game state
function update() {
    if (isGameOver) return;

    // Move player
    player.x += player.dx;
    
    // Wall collision for player
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Move enemies
    enemies.forEach((enemy, index) => {
        enemy.y += enemy.speed;

        // Collision detection
        if (
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        ) {
            isGameOver = true;
            // Check and save High Score
            if (score > highScore) {
                highScore = score;
                localStorage.setItem("dodgerHighScore", highScore);
            }
        }

        // Remove enemies that fall off screen and increase score
        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
            score++;
        }
    });

    // Spawn new enemies
    if (Math.random() < 0.04) { // Slightly increased spawn rate
        spawnEnemy();
    }
}

// Draw graphics
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw enemies
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });

    // Draw Current Score
    ctx.fillStyle = "#2c3e50";
    ctx.font = "bold 20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);

    // Draw High Score
    ctx.fillStyle = "#f39c12";
    ctx.font = "bold 16px Arial";
    ctx.fillText(`High Score: ${highScore}`, 10, 55);

    // Game Over Text
    if (isGameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "#e74c3c";
        ctx.font = "bold 45px Arial";
        ctx.fillText("GAME OVER", canvas.width / 2 - 135, canvas.height / 2 - 20);
        
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2 - 65, canvas.height / 2 + 20);
        
        restartBtn.style.display = "inline-block";
    }
}

// Main Game Loop
function gameLoop() {
    update();
    draw();
    if (!isGameOver) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// Restart functionality
restartBtn.addEventListener("click", () => {
    isGameOver = false;
    score = 0;
    enemies = [];
    player.x = canvas.width / 2 - 25;
    restartBtn.style.display = "none";
    gameLoop();
});

// Start the game
gameLoop();