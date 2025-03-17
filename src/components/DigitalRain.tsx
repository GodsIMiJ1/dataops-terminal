
import { useEffect, useRef } from 'react';

const DigitalRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', resizeCanvas);

    // Matrix rain settings
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    
    // Characters for the matrix rain
    const chars = '01010101アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'.split('');
    
    // Drops starting position for each column
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -canvas.height;
    }

    const greenColors = [
      'rgba(0, 255, 70, 0.1)',
      'rgba(0, 255, 70, 0.2)',
      'rgba(0, 255, 70, 0.3)',
      'rgba(0, 255, 70, 0.4)',
      'rgba(0, 255, 70, 0.5)',
      'rgba(0, 255, 70, 0.6)',
      'rgba(0, 255, 70, 0.7)',
      'rgba(0, 255, 70, 0.8)',
      'rgba(0, 255, 70, 0.9)',
      'rgba(0, 255, 70, 1.0)',
    ];

    // Drawing the matrix rain
    const draw = () => {
      if (!ctx || !canvas) return;
      
      // Fading effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = chars[Math.floor(Math.random() * chars.length)];
        
        // Random green shade
        const colorIndex = Math.floor(Math.random() * greenColors.length);
        ctx.fillStyle = greenColors[colorIndex];
        
        // Drawing the character
        ctx.font = `${fontSize}px monospace`;
        ctx.fillText(text, i * fontSize, drops[i]);
        
        // Moving the drop down
        drops[i] += fontSize;
        
        // Resetting the drop
        if (drops[i] > canvas.height && Math.random() > 0.975) {
          drops[i] = Math.random() * -canvas.height;
        }
      }
    };

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      draw();
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 opacity-20 z-[-1]" 
    />
  );
};

export default DigitalRain;
