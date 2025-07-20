// ===== MENU MOBILE =====
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const menuLinks = document.querySelectorAll('.mobile-menu a');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    
    if (mobileMenu.classList.contains('active')) {
        menuLinks.forEach((link, index) => {
            link.style.transitionDelay = `${index * 0.1}s`;
            link.classList.add('visible');
            document.body.style.overflow = 'hidden';
        });
    } else {
        menuLinks.forEach(link => {
            link.style.transitionDelay = '0s';
            link.classList.remove('visible');
            document.body.style.overflow = '';
        });
    }
});

// Fermer le menu quand on clique à l'extérieur
document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        menuLinks.forEach(link => {
            link.classList.remove('visible');
        });
        document.body.style.overflow = '';
    }
});

// ===== ABOUT MODAL =====
const aboutPage = document.getElementById('aboutPage');
const openAboutBtn = document.getElementById('openAbout');
const closeAboutBtn = document.getElementById('closeAbout');

openAboutBtn.addEventListener('click', () => {
    aboutPage.classList.add('active');
    document.body.style.overflow = 'hidden';
});

closeAboutBtn.addEventListener('click', () => {
    aboutPage.classList.remove('active');
    document.body.style.overflow = '';
});

aboutPage.addEventListener('click', (e) => {
    if (e.target === aboutPage) {
        aboutPage.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ===== PARTICLES BACKGROUND =====
const canvas = document.querySelector('.particles');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const particleCount = window.innerWidth < 768 ? 30 : 100;

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = `rgba(110, 69, 226, ${Math.random() * 0.5 + 0.1})`;
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
    
    connectParticles();
    requestAnimationFrame(animateParticles);
}

function connectParticles() {
    for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
            const dx = particles[a].x - particles[b].x;
            const dy = particles[a].y - particles[b].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                ctx.strokeStyle = `rgba(110, 69, 226, ${1 - distance/100})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(particles[a].x, particles[a].y);
                ctx.lineTo(particles[b].x, particles[b].y);
                ctx.stroke();
            }
        }
    }
}

// ===== SCROLL ANIMATIONS =====
const fadeElements = document.querySelectorAll('[data-fade]');
        
function checkFade() {
    fadeElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight - 100) {
            element.classList.add('visible');
        }
    });
}

// ===== BACK TO TOP BUTTON =====
const backToTopBtn = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('active');
    } else {
        backToTopBtn.classList.remove('active');
    }
    
    checkFade();
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ===== CONTACT FORM =====
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    const whatsappMessage = `Nouveau message de ${name} (${email}):\n\n${message}`;
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/243833389567?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    // Reset le formulaire
    this.reset();
});

// ===== INITIALIZATION =====
window.addEventListener('load', () => {
    initParticles();
    animateParticles();
    checkFade();
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});