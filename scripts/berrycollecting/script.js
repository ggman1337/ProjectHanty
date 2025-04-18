const startBtn = document.getElementById('start-btn');
const scoreEl = document.getElementById('score');
const targetEl = document.getElementById('target');
const timerEl = document.getElementById('timer');
const container = document.querySelector('.game-container');
const bgAudio = document.getElementById('bg-audio');

// Установим громкость фона на 30%
bgAudio.volume = 0.3;

let score = 0;
const target = parseInt(targetEl.textContent);
let timeLeft = parseInt(timerEl.textContent);
let timerInterval;
let spawnInterval;

startBtn.addEventListener('click', () => {
    startGame();
    bgAudio.play().catch(e => console.error('Audio playback failed:', e));
});

function startGame() {
    score = 0;
    timeLeft = parseInt(timerEl.textContent);
    scoreEl.textContent = score;
    timerEl.textContent = timeLeft;
    startBtn.disabled = true;
    document.querySelectorAll('.berry, .poison').forEach(el => el.remove());
    // сразу отображаем первую ягоду для наглядности
    spawnBerry();
    timerInterval = setInterval(updateTimer, 1000);
    spawnInterval = setInterval(spawnBerry, 800);
}

function updateTimer() {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 0) endGame();
}

function spawnBerry() {
    const isPoison = Math.random() < 0.3;
    const el = document.createElement('img');
    el.src = isPoison ? 'images/poison.png' : 'images/berry.png';
    el.className = isPoison ? 'poison' : 'berry';
    const rect = container.getBoundingClientRect();
    const size = 80;
    const x = Math.random() * (rect.width - size);
    const y = Math.random() * (rect.height - size);
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    container.appendChild(el);
    el.addEventListener('click', () => {
        if (isPoison) score = Math.max(0, score - 1);
        else score++;
        scoreEl.textContent = score;
        el.remove();
    });
    setTimeout(() => el.remove(), 3000);
}

function endGame() {
    clearInterval(timerInterval);
    clearInterval(spawnInterval);
    startBtn.disabled = false;
    document.querySelectorAll('.berry, .poison').forEach(el => el.remove());
    if (score >= target) alert('Поздравляем! Вы собрали достаточно ягод: ' + score);
    else alert('Время вышло. Собрано ягод: ' + score + '. Нужно минимум: ' + target);
}
