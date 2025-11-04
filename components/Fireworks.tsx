"use client";

import { useEffect, useRef } from "react";

interface FireworksProps {
  active?: boolean;
  duration?: number;
}

export default function Fireworks({ active = true, duration = 5000 }: FireworksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const fireworksRef = useRef<any[]>([]);
  const particlesRef = useRef<any[]>([]);
  const autoLaunchRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const gravity = 0.05;

    // Setup canvas
    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Generate random color
    const randomHsl = () => {
      const h = Math.random() * 360;
      const s = 90 + Math.random() * 10;
      const l = 50 + Math.random() * 10;
      return `hsl(${h}, ${s}%, ${l}%)`;
    };

    // Particle class
    class Particle {
      x: number;
      y: number;
      color: string;
      isShell: boolean;
      alpha: number;
      friction: number;
      trailLength: number;
      history: { x: number; y: number }[];
      angle: number;
      speed: number;
      vx: number;
      vy: number;
      life: number;
      initialLife: number;

      constructor(
        x: number,
        y: number,
        color: string,
        isShell = false,
        angle: number | null = null,
        speed: number | null = null
      ) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.isShell = isShell;
        this.alpha = 1;
        this.friction = 0.99;
        this.trailLength = 4;
        this.history = [{ x, y }];

        if (isShell) {
          this.angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.2;
          this.speed = 8 + Math.random() * 2;
          this.vx = Math.cos(this.angle) * this.speed;
          this.vy = Math.sin(this.angle) * this.speed;
          this.life = 120 + Math.random() * 40;
        } else {
          this.angle = angle || Math.random() * Math.PI * 2;
          this.speed = speed || Math.random() * 4 + 1;
          this.vx = Math.cos(this.angle) * this.speed;
          this.vy = Math.sin(this.angle) * this.speed;
          this.life = 60 + Math.random() * 60;
        }
        this.initialLife = this.life;
      }

      update() {
        if (this.isShell) {
          this.vy += gravity * 2;
          this.vx *= 0.99;

          if (this.vy > 0 && this.life < this.initialLife - 20) {
            this.life = 0;
            return;
          }
        } else {
          this.vy += gravity;
          this.vx *= this.friction;
          this.vy *= this.friction;
        }

        this.x += this.vx;
        this.y += this.vy;

        this.history.push({ x: this.x, y: this.y });
        while (this.history.length > this.trailLength) {
          this.history.shift();
        }

        this.life--;
        this.alpha = this.life / this.initialLife;
      }

      draw(ctx: CanvasRenderingContext2D) {
        if (this.history.length > 1) {
          ctx.beginPath();
          ctx.moveTo(this.history[0].x, this.history[0].y);

          for (let i = 1; i < this.history.length - 1; i++) {
            ctx.lineTo(this.history[i].x, this.history[i].y);
          }

          ctx.lineTo(this.x, this.y);

          ctx.strokeStyle = this.color
            .replace(")", `, ${this.alpha * 0.6})`)
            .replace("hsl", "hsla");
          ctx.lineWidth = this.isShell ? 2 : 1;
          ctx.stroke();
          ctx.closePath();
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.isShell ? 2 : 1, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color
          .replace(")", `, ${this.alpha})`)
          .replace("hsl", "hsla");
        ctx.fill();
      }
    }

    // Explosion
    const explode = (x: number, y: number, color: string) => {
      const numParticles = 80 + Math.random() * 40;
      for (let i = 0; i < numParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1;
        particlesRef.current.push(new Particle(x, y, color, false, angle, speed));
      }
    };

    // Launch firework
    const launchFirework = (startX: number) => {
      const color = randomHsl();
      fireworksRef.current.push(new Particle(startX, height + 10, color, true));
    };

    // Animation loop
    const animate = () => {
      ctx.fillStyle = "rgba(13, 13, 26, 0.15)";
      ctx.fillRect(0, 0, width, height);

      // Update fireworks
      for (let i = fireworksRef.current.length - 1; i >= 0; i--) {
        const fw = fireworksRef.current[i];
        fw.update();
        fw.draw(ctx);

        if (fw.life <= 0) {
          explode(fw.x, fw.y, fw.color);
          fireworksRef.current.splice(i, 1);
        }
      }

      // Update particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.update();
        p.draw(ctx);

        if (p.life <= 0 || p.alpha <= 0.05 || p.y > height + 50) {
          particlesRef.current.splice(i, 1);
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Auto-launch fireworks at intervals
    const autoLaunch = () => {
      const x = Math.random() * width;
      launchFirework(x);
    };

    // Start animation
    animate();

    // Launch fireworks automatically
    autoLaunchRef.current = setInterval(autoLaunch, 800);

    // Stop after duration
    const timeout = setTimeout(() => {
      if (autoLaunchRef.current) {
        clearInterval(autoLaunchRef.current);
      }
    }, duration);

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (autoLaunchRef.current) {
        clearInterval(autoLaunchRef.current);
      }
      clearTimeout(timeout);
    };
  }, [active, duration]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10"
      style={{ background: "transparent" }}
    />
  );
}
