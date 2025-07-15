class FractalFireworks {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.afterglowParticles = [];
        this.animationId = null;
        
        // Performance optimizations
        this.ctx.imageSmoothingEnabled = false;
        this.pixelSize = 2;
        
        // User settings
        this.fireworkCount = 3;
        this.fireworkSize = 1;
        this.particleCount = 150;
        this.fractalDepth = 4;
        
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
        
        document.getElementById('countSlider').addEventListener('input', (e) => {
            this.fireworkCount = parseInt(e.target.value);
            document.getElementById('countValue').textContent = this.fireworkCount;
        });
        
        document.getElementById('sizeSlider').addEventListener('input', (e) => {
            this.fireworkSize = parseFloat(e.target.value);
            document.getElementById('sizeValue').textContent = this.fireworkSize.toFixed(1);
        });
        
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            for (let i = 0; i < this.fireworkCount; i++) {
                setTimeout(() => {
                    this.createFirework(x + (Math.random() - 0.5) * 50, y + (Math.random() - 0.5) * 50);
                }, i * 100);
            }
        });
    }
    
    launchFireworks() {
        for (let i = 0; i < this.fireworkCount; i++) {
            setTimeout(() => {
                const x = Math.random() * this.canvas.width;
                const y = Math.random() * (this.canvas.height * 0.7) + this.canvas.height * 0.1;
                this.createFirework(x, y);
            }, i * 150);
        }
    }
    
    createFirework(x, y) {
        const colors = ['#ff0080', '#00ff80', '#8000ff', '#ff8000', '#0080ff', '#ff0040', '#40ff00', '#ff4080', '#8040ff'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const particleCount = Math.floor(this.particleCount * this.fireworkSize);
        const branches = 8;
        
        // Create fractal explosion pattern
        for (let depth = 0; depth < this.fractalDepth; depth++) {
            const depthFactor = (this.fractalDepth - depth) / this.fractalDepth;
            const depthParticles = Math.floor(particleCount * depthFactor * 0.3);
            
            for (let i = 0; i < depthParticles; i++) {
                const angle = (Math.PI * 2 * i) / depthParticles;
                const branchAngle = (Math.PI * 2 * Math.floor(i / (depthParticles / branches))) / branches;
                
                // Enhanced fractal pattern with multiple sine waves
                const fractalFactor = Math.sin(angle * 3) * 0.4 + 
                                    Math.cos(angle * 5) * 0.3 + 
                                    Math.sin(angle * 7) * 0.2;
                
                const speed = (Math.random() * 4 + 1) * (1 + fractalFactor) * this.fireworkSize * depthFactor;
                const branchInfluence = Math.cos(branchAngle + depth) * 0.5;
                
                const vx = Math.cos(angle) * speed + Math.cos(branchAngle) * branchInfluence;
                const vy = Math.sin(angle) * speed + Math.sin(branchAngle) * branchInfluence;
                
                this.particles.push({
                    x: x,
                    y: y,
                    vx: vx,
                    vy: vy,
                    life: 1.0,
                    decay: Math.random() * 0.015 + 0.008,
                    color: color,
                    size: Math.max(1, Math.random() * 2 + 1) * this.fireworkSize,
                    gravity: 0.03,
                    fractalPhase: Math.random() * Math.PI * 2,
                    depth: depth,
                    pixelated: true
                });
            }
        }
        
        this.animate();
    }
    
    animate() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        const animateFrame = () => {
            // More efficient clearing with reduced alpha for better afterglow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Update particles with optimization
            this.particles = this.particles.filter(particle => {
                particle.fractalPhase += 0.08;
                const fractalInfluence = Math.sin(particle.fractalPhase) * 0.3 + 
                                       Math.cos(particle.fractalPhase * 1.5) * 0.2;
                
                particle.vx *= 0.985;
                particle.vy *= 0.985;
                particle.vy += particle.gravity;
                
                particle.x += particle.vx + fractalInfluence;
                particle.y += particle.vy;
                
                particle.life -= particle.decay;
                
                // Create afterglow particles when particle is about to die
                if (particle.life < 0.3 && particle.life > 0.25) {
                    this.afterglowParticles.push({
                        x: particle.x,
                        y: particle.y,
                        life: 0.8,
                        decay: 0.005,
                        color: particle.color,
                        size: particle.size * 0.5,
                        alpha: 0.3
                    });
                }
                
                // Pixelated rendering
                if (particle.pixelated) {
                    this.drawPixelatedParticle(particle);
                } else {
                    this.drawSmoothParticle(particle);
                }
                
                return particle.life > 0;
            });
            
            // Update and draw afterglow particles
            this.afterglowParticles = this.afterglowParticles.filter(glow => {
                glow.life -= glow.decay;
                
                this.ctx.save();
                this.ctx.globalAlpha = glow.life * glow.alpha;
                this.ctx.fillStyle = glow.color;
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = glow.color;
                this.ctx.beginPath();
                this.ctx.arc(glow.x, glow.y, glow.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
                
                return glow.life > 0;
            });
            
            if (this.particles.length > 0 || this.afterglowParticles.length > 0) {
                this.animationId = requestAnimationFrame(animateFrame);
            }
        };
        
        animateFrame();
    }
    
    drawPixelatedParticle(particle) {
        const pixelX = Math.floor(particle.x / this.pixelSize) * this.pixelSize;
        const pixelY = Math.floor(particle.y / this.pixelSize) * this.pixelSize;
        const pixelSize = Math.floor(particle.size / this.pixelSize) * this.pixelSize + this.pixelSize;
        
        this.ctx.save();
        this.ctx.globalAlpha = particle.life;
        this.ctx.fillStyle = particle.color;
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = particle.color;
        this.ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize);
        this.ctx.restore();
    }
    
    drawSmoothParticle(particle) {
        this.ctx.save();
        this.ctx.globalAlpha = particle.life;
        this.ctx.fillStyle = particle.color;
        this.ctx.shadowBlur = 12;
        this.ctx.shadowColor = particle.color;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
    
    clearFireworks() {
        this.particles = [];
        this.afterglowParticles = [];
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
    
    // Reduced auto-launch frequency for better performance
    setInterval(() => {
        if (Math.random() < 0.05) {
            fireworks.launchFireworks();
        }
    }, 3000);
});