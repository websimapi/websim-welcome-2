document.addEventListener('DOMContentLoaded', () => {
  const title = document.querySelector('h1');
  const message = document.querySelector('p');
  
  // Add hover effect
  title.addEventListener('mouseover', () => {
    message.style.transform = 'scale(1.1)';
    message.style.transition = 'transform 0.3s ease';
  });
  
  title.addEventListener('mouseout', () => {
    message.style.transform = 'scale(1)';
  });
  
  // Add click interaction
  title.addEventListener('click', () => {
    const colors = ['#ff6b6b,#4ecdc4', '#a8e6cf,#dcedc1', '#ffd3b6,#ffaaa5'];
    const randomGradient = colors[Math.floor(Math.random() * colors.length)];
    title.style.background = `linear-gradient(45deg, ${randomGradient})`;
    title.style.webkitBackgroundClip = 'text';
    title.style.webkitTextFillColor = 'transparent';
  });
});