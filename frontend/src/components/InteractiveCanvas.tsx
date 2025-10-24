// src/components/InteractiveCanvas.tsx

"use client";

import { useRef, useEffect } from 'react';

export default function InteractiveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;

    const parent = canvas.parentElement;
    if (!parent) return;

    // Function to set canvas size
    const setCanvasSize = () => {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
    };
    setCanvasSize();

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    let particles: Particle[] = [];

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    };
    // Use parent to track mouse movement within the section
    parent.addEventListener('mousemove', handleMouseMove);

    class Particle {
      x: number; y: number; size: number; baseX: number; baseY: number; density: number; color: string;
      constructor(x: number, y: number, color: string) {
        this.x = x; this.y = y; this.size = Math.random() * 1.5 + 1;
        this.baseX = this.x; this.baseY = this.y;
        this.density = (Math.random() * 40) + 5;
        this.color = color;
      }
      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.closePath(); ctx.fill();
      }
      update() {
        if (!ctx) return;
        let dx = mouse.x - this.x; let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance; let forceDirectionY = dy / distance;
        let maxDistance = 200;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density; let directionY = forceDirectionY * force * this.density;
        if (distance < maxDistance) {
          this.x -= directionX; this.y -= directionY;
        } else {
          if (this.x !== this.baseX) { let dx = this.x - this.baseX; this.x -= dx / 10; }
          if (this.y !== this.baseY) { let dy = this.y - this.baseY; this.y -= dy / 10; }
        }
      }
    }

    function init() {
      particles = [];
      if (!canvas) return;
      const particleCount = (canvas.width * canvas.height) / 9000;
      for (let i = 0; i < particleCount; i++) {
        let x = Math.random() * canvas.width; let y = Math.random() * canvas.height;
        let color = 'rgba(51, 215, 177, 0.5)';
        particles.push(new Particle(x, y, color));
      }
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update(); particles[i].draw();
      }
      connect();
      animationFrameId = requestAnimationFrame(animate);
    }

    function connect() {
      if (!ctx) return;
      let opacityValue = 1;
      if (!canvas) return;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x)) + ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));
          if (distance < (canvas.width / 7) * (canvas.height / 7)) {
            opacityValue = 1 - (distance / 20000);
            ctx.strokeStyle = `rgba(51, 215, 177, ${opacityValue})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(particles[a].x, particles[a].y); ctx.lineTo(particles[b].x, particles[b].y); ctx.stroke();
          }
        }
      }
    }

    const handleResize = () => {
        setCanvasSize();
        init();
    }
    window.addEventListener('resize', handleResize);

    init();
    animate();

    return () => {
      parent.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full -z-10"></canvas>;
}