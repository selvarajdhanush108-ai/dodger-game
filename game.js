const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restartBtn");

// Game variables
let animationId;
let score = 0;
let highScore = localStorage.getItem("dodgerHighScore") || 0;
let isGameOver = false;
let isPaused = false; // New variable for YouTube's pause state

// ==========================================
// YOUTUBE PLAYABLES NATIVE HOOKS
// ==========================================
window.onPause = function() {
    isPaused = true;
};

window.onResume = function() {
    if (isPaused) {
        isPaused = false;
        gameLoop(); // Kickstart the loop again
    }
};

window.onAudioEnabledChange = function(isEnabled) {
    // If we had a soundtrack, we would mute/unmute it right here!
};
// ==========================================

// Player Object
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    color: "#3498db",
    speed: 6,
    dx: 0
};

let enemies = [];

// Keyboard Input
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") player.dx = -player.speed;
    if (e.key === "ArrowRight") player.dx = player.speed;
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") player.dx = 0;
});

// Mobile Touch Input (Mandatory for Playables)
canvas.addEventListener("touchstart", (e) => {
    e.preventDefault(); 
    const touchX = e.touches[0].clientX;
    const rect = canvas.getBoundingClientRect();
    
    // Move left if tapped on the left half, right if tapped on the right half
    if (touchX < rect.left + rect.width / 2) {
        player.dx = -player.speed;
    } else {
        player.dx = player.speed;
    }
}, {passive: false});

canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    player.dx = 0;
}, {passive: false});

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

function update() {
    if (isGameOver || isPaused) return;

    player.x += player.dx;
    
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    enemies.forEach((enemy, index) => {
        enemy.y += enemy.speed;

        if (
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        ) {
            isGameOver = true;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem("dodgerHighScore", highScore);
            }
        }

        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
            score++;
        }
    });

    if (Math.random() < 0.04) {
        spawnEnemy();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });

    ctx.fillStyle = "#2c3e50";
    ctx.font = "bold 20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);

    ctx.fillStyle = "#f39c12";
    ctx.font = "bold 16px Arial";
    ctx.fillText(`High Score: ${highScore}`, 10, 55);

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

function gameLoop() {
    if (isPaused) return; // Completely halt the loop when YouTube pauses it
    
    update();
    draw();
    if (!isGameOver) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

restartBtn.addEventListener("click", () => {
    isGameOver = false;
    score = 0;
    enemies = [];
    player.x = canvas.width / 2 - 25;
    restartBtn.style.display = "none";
    gameLoop();
});

gameLoop();