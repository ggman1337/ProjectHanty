const startBtn = document.getElementById('start-btn');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const container = document.querySelector('.game-container');
const bgAudio = document.getElementById('bg-audio');

// Установим громкость фона на 30%
bgAudio.volume = 0.3;

let score = 0;
let timeLeft = 45;
let timerInterval;
let spawnInterval;

startBtn.addEventListener('click', () => {
    startGame();
    bgAudio.play().catch(e => console.error('Audio playback failed', e));
});

function startGame() {
    score = 0;
    timeLeft = 45;
    scoreEl.textContent = score;
    timerEl.textContent = timeLeft;
    startBtn.disabled = true;
    document.querySelectorAll('.stick').forEach(s => s.remove());
    timerInterval = setInterval(updateTimer, 1000);
    spawnInterval = setInterval(spawnStick, 800);
}

function updateTimer() {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 0) {
        endGame();
    }
}

function spawnStick() {
    const stick = document.createElement('img');
    stick.src = 'images/branch.png';
    stick.className = 'stick';
    const rect = container.getBoundingClientRect();
    const x = Math.random() * (rect.width - 50);
    const y = Math.random() * (rect.height - 50);
    stick.style.left = x + 'px';
    stick.style.top = y + 'px';
    container.appendChild(stick);
    stick.addEventListener('click', () => {
        score++;
        scoreEl.textContent = score;
        stick.remove();
    });
    setTimeout(() => {
        stick.remove();
    }, 3000);
}

function endGame() {
    clearInterval(timerInterval);
    clearInterval(spawnInterval);
    startBtn.disabled = false;
    document.querySelectorAll('.stick').forEach(s => s.remove());
    alert('Игра окончена! Ваш счёт: ' + score);
}
