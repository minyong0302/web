const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("gameScore");
const startBtn = document.getElementById("startGameBtn");

let animationId;
let poopInterval;
let score = 0;
let isGameOver = true;
let isDebugMode = false; // true로 바꾸면 히트박스가 보입니다.

let player = { x: 200, y: 200, radius: 15 };
let poops = [];

// 1. 마우스 움직임 및 화면 밖 이탈 방지
canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;

    if (mouseX < player.radius) mouseX = player.radius;
    if (mouseX > canvas.width - player.radius) mouseX = canvas.width - player.radius;
    if (mouseY < player.radius) mouseY = player.radius;
    if (mouseY > canvas.height - player.radius) mouseY = canvas.height - player.radius;

    player.x = mouseX;
    player.y = mouseY;
});

// 마우스 이탈 시 경고
canvas.addEventListener("mouseleave", () => {
    if (!isGameOver) {
        canvas.style.border = "4px solid red";
        canvas.style.boxShadow = "0 0 20px red";
    }
});

canvas.addEventListener("mouseenter", () => {
    canvas.style.border = "2px solid #333";
    canvas.style.boxShadow = "inset 0 0 10px rgba(0,0,0,0.1)";
});

// 2. 변칙성을 포함한 장애물 생성
function spawnPoop() {
    if (isGameOver) return;
    const radius = Math.random() * 10 + 10;
    const x = Math.random() * (canvas.width - radius * 2) + radius;
    
    // 점수 비례 속도 증가 (100점마다 1씩 증가)
    const speedMultiplier = Math.floor(score / 100);
    const speed = Math.random() * 3 + 2 + speedMultiplier; 
    
    const rand = Math.random();
    let type = "normal";
    if (rand > 0.8) type = "homing"; 
    else if (rand > 0.5) type = "zigzag"; 
    
    const startX = x;
    const angle = Math.random() * Math.PI * 2;
    
    // type, startX, angle 등을 모두 포함해서 push 해야 작동합니다.
    poops.push({ x, y: -20, radius, speed, type, startX, angle });
}

// 3. 게임 메인 루프 (변칙 이동 및 충돌 체크)
function updateGame() {
    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("😎", player.x, player.y);

    if (isDebugMode) {
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    for (let i = 0; i < poops.length; i++) {
        let p = poops[i];
        p.y += p.speed;

        // 변칙 이동 로직
        if (p.type === "zigzag") {
            p.angle += 0.1; 
            p.x = p.startX + Math.sin(p.angle) * 30; 
        } else if (p.type === "homing") {
            if (p.x < player.x) p.x += 1.5; // 유도탄 추적 속도
            else if (p.x > player.x) p.x -= 1.5;
        }

        ctx.font = (p.radius * 2) + "px Arial";
        ctx.fillText("💩", p.x, p.y);

        if (isDebugMode) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.strokeStyle = "red";
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        const dx = player.x - p.x;
        const dy = player.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < player.radius + p.radius - 5) {
            endGame();
            return;
        }

        if (p.y > canvas.height + 20) {
            poops.splice(i, 1);
            score += 10;
            scoreDisplay.innerText = score;
            i--; 
        }
    }

    animationId = requestAnimationFrame(updateGame);
}

// 4. 게임 시작 및 종료
function startGame() {
    isGameOver = false;
    score = 0;
    poops = [];
    scoreDisplay.innerText = score;
    startBtn.style.display = "none";
    canvas.style.border = "2px solid #333";
    canvas.style.boxShadow = "inset 0 0 10px rgba(0,0,0,0.1)";
    
    poopInterval = setInterval(spawnPoop, 300); 
    updateGame();
}

function endGame() {
    isGameOver = true;
    cancelAnimationFrame(animationId);
    clearInterval(poopInterval);
    
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "white";
    ctx.font = "40px 맑은 고딕";
    ctx.fillText("게임 오버!", canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = "20px 맑은 고딕";
    ctx.fillText(`최종 점수: ${score}점`, canvas.width / 2, canvas.height / 2 + 20);
    
    startBtn.style.display = "inline-block";
    startBtn.innerText = "다시 도전하기";
}

startBtn.addEventListener("click", startGame);