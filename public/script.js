class FractalFireworks {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.setupEventListeners();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    setupEventListeners() {
        document.getElementById('launchButton').addEventListener('click', () => {
            this.launchFireworks();
        });
        
        document.getElementById('clearButton').addEventListener('click', () => {
            this.clearFireworks();
        });
        
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.createFirework(x, y);
        });
    }
    
    launchFireworks() {
        const x = Math.random() * this.canvas.width;
        const y = Math.random() * (this.canvas.height * 0.7) + this.canvas.height * 0.1;
        this.createFirework(x, y);
    }
    
    createFirework(x, y) {
        const colors = ['#ff0080', '#00ff80', '#8000ff', '#ff8000', '#0080ff', '#ff0040', '#40ff00'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const particleCount = 200;
        const branches = 6;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const branchAngle = (Math.PI * 2 * Math.floor(i / (particleCount / branches))) / branches;
            
            const fractalFactor = Math.sin(angle * 3) * 0.3 + Math.cos(angle * 5) * 0.2;
            const speed = (Math.random() * 3 + 2) * (1 + fractalFactor);
            
            const vx = Math.cos(angle) * speed + Math.cos(branchAngle) * fractalFactor;
            const vy = Math.sin(angle) * speed + Math.sin(branchAngle) * fractalFactor;
            
            this.particles.push({
                x: x,
                y: y,
                vx: vx,
                vy: vy,
                life: 1.0,
                decay: Math.random() * 0.02 + 0.01,
                color: color,
                size: Math.random() * 3 + 1,
                trail: [],
                gravity: 0.05,
                fractalPhase: Math.random() * Math.PI * 2
            });
        }
        
        this.animate();
    }
    
    animate() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        const animateFrame = () => {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.particles = this.particles.filter(particle => {
                particle.fractalPhase += 0.1;
                const fractalInfluence = Math.sin(particle.fractalPhase) * 0.5;
                
                particle.vx *= 0.98;
                particle.vy *= 0.98;
                particle.vy += particle.gravity;
                
                particle.x += particle.vx + fractalInfluence;
                particle.y += particle.vy;
                
                particle.trail.push({x: particle.x, y: particle.y, life: particle.life});
                if (particle.trail.length > 10) {
                    particle.trail.shift();
                }
                
                particle.life -= particle.decay;
                
                this.ctx.save();
                
                particle.trail.forEach((point, index) => {
                    const alpha = (point.life * index) / particle.trail.length;
                    this.ctx.globalAlpha = alpha;
                    this.ctx.fillStyle = particle.color;
                    this.ctx.beginPath();
                    this.ctx.arc(point.x, point.y, particle.size * alpha, 0, Math.PI * 2);
                    this.ctx.fill();
                });
                
                this.ctx.globalAlpha = particle.life;
                this.ctx.fillStyle = particle.color;
                this.ctx.shadowBlur = 20;
                this.ctx.shadowColor = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.restore();
                
                return particle.life > 0;
            });
            
            if (this.particles.length > 0) {
                this.animationId = requestAnimationFrame(animateFrame);
            }
        };
        
        animateFrame();
    }
    
    clearFireworks() {
        this.particles = [];
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('fireworksCanvas');
    const fireworks = new FractalFireworks(canvas);
    
    setInterval(() => {
        if (Math.random() < 0.1) {
            fireworks.launchFireworks();
        }
    }, 2000);
});