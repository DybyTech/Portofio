// Animation des particules
const canvas = document.querySelector('.particles');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const particleCount = Math.floor(window.innerWidth / 10);

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.1})`;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }
    
    requestAnimationFrame(animateParticles);
}

// Calculatrice
const btns = document.querySelectorAll(".btn");
const display = document.querySelector(".display");
let currentInput = '';
let shouldResetDisplay = false;

btns.forEach(btn => {
    btn.addEventListener("click", () => {
        const value = btn.textContent;
        
        // Animation au clic
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.style.transform = '';
        }, 100);
        
        if (value === "AC") {
            currentInput = '';
            display.value = '0';
        } 
        else if (value === "C") {
            currentInput = currentInput.slice(0, -1);
            display.value = currentInput || '0';
        } 
        else if (value === "=") {
            try {
                currentInput = currentInput.replace(/×/g, '*').replace(/÷/g, '/');
                const result = eval(currentInput);
                display.value = result;
                currentInput = String(result);
            } catch {
                display.value = 'Error';
                currentInput = '';
            }
        } 
        else {
            if (shouldResetDisplay) {
                currentInput = '';
                shouldResetDisplay = false;
            }
            currentInput += value;
            display.value = currentInput;
        }
    });
});

// Effet de pression sur les touches
document.addEventListener('keydown', (e) => {
    const key = e.key;
    const btn = Array.from(btns).find(b => 
        b.textContent === key || 
        (key === '*' && b.textContent === '×') ||
        (key === '/' && b.textContent === '÷') ||
        (key === 'Enter' && b.textContent === '=') ||
        (key === 'Backspace' && b.textContent === 'C') ||
        (key === 'Escape' && b.textContent === 'AC') ||
        (key === ',' && b.textContent === '.')
    );
    
    if (btn) {
        btn.click();
        btn.style.transform = 'scale(0.95)';
    }
});

document.addEventListener('keyup', (e) => {
    const key = e.key;
    const btn = Array.from(btns).find(b => 
        b.textContent === key || 
        (key === '*' && b.textContent === '×') ||
        (key === '/' && b.textContent === '÷') ||
        (key === 'Enter' && b.textContent === '=') ||
        (key === 'Backspace' && b.textContent === 'C') ||
        (key === 'Escape' && b.textContent === 'AC') ||
        (key === ',' && b.textContent === '.')
    );
    
    if (btn) {
        btn.style.transform = '';
    }
});

// Initialisation
window.addEventListener('load', () => {
    initParticles();
    animateParticles();
    display.value = '0';
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});