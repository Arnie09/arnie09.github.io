// Calculate and display years of experience
const startYear = 2021;
const currentYear = new Date().getFullYear();
const experienceYears = currentYear - startYear;
const experienceElement = document.getElementById('experience-years');
if (experienceElement) {
    experienceElement.textContent = experienceYears;
}

// Create binary code background effect
const binaryContainer = document.querySelector('.binary-code');
if (binaryContainer) {
    const binaryChars = '01';
    for (let i = 0; i < 300; i++) {
        const span = document.createElement('span');
        span.textContent = binaryChars[Math.floor(Math.random() * binaryChars.length)];
        span.style.left = `${Math.random() * 100}%`;
        span.style.top = `${Math.random() * 100}%`;
        span.style.animationDelay = `${Math.random() * 4}s`;
        binaryContainer.appendChild(span);
    }
} 