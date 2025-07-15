class ParticlePool {
    constructor(size = 10000) {
        this.particles = [];
        this.available = [];
        this.active = [];
        
        // Pre-allocate particles
        for (let i = 0; i < size; i++) {
            const particle = {
                x: 0, y: 0, vx: 0, vy: 0,
                life: 0, decay: 0, color: '',
                size: 0, gravity: 0, fractalPhase: 0,
                depth: 0, active: false,
                // Text fireworks properties
                isTextParticle: false,
                targetX: 0, targetY: 0,
                attractionForce: 0, formationStage: 0,
                originalSpeed: 0, glowIntensity: 1.0
            };
            this.particles.push(particle);
            this.available.push(particle);
        }
    }
    
    get() {
        if (this.available.length > 0) {
            const particle = this.available.pop();
            particle.active = true;
            this.active.push(particle);
            return particle;
        }
        return null;
    }
    
    release(particle) {
        particle.active = false;
        const index = this.active.indexOf(particle);
        if (index !== -1) {
            this.active.splice(index, 1);
            this.available.push(particle);
        }
    }
    
    clear() {
        this.active.forEach(particle => {
            particle.active = false;
            this.available.push(particle);
        });
        this.active.length = 0;
    }
}

class PerformanceMonitor {
    constructor() {
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;
        this.targetFPS = 45;
        this.qualityLevel = 1.0;
    }
    
    update() {
        this.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            // Adjust quality based on FPS
            if (this.fps < this.targetFPS) {
                this.qualityLevel = Math.max(0.3, this.qualityLevel - 0.1);
            } else if (this.fps > this.targetFPS + 10) {
                this.qualityLevel = Math.min(1.0, this.qualityLevel + 0.05);
            }
        }
        
        return this.qualityLevel;
    }
}

class TextFireworks {
    constructor() {
        this.charSpacing = 60;
        this.lineHeight = 80;
        this.maxCharsPerLine = 12;
        this.textQueue = [];
        this.isPlaying = false;
        this.currentLine = 0;
        this.currentChar = 0;
        this.charDelay = 800; // ms between characters
        this.lineDelay = 2000; // ms between lines
        this.explosionDuration = 400; // ms for explosion phase
        this.coalesceDuration = 1200; // ms for coalesce phase
        this.holdDuration = 2000; // ms to hold letter shape
        this.wordParticles = []; // Track all particles for word lifecycle
    }
    
    // Character patterns for fireworks (simplified bitmap)
    getCharacterPattern(char) {
        const patterns = {
            'A': [
                '  ██  ',
                ' ████ ',
                '██  ██',
                '██████',
                '██  ██'
            ],
            'B': [
                '█████ ',
                '██  ██',
                '█████ ',
                '██  ██',
                '█████ '
            ],
            'C': [
                ' █████',
                '██    ',
                '██    ',
                '██    ',
                ' █████'
            ],
            'D': [
                '█████ ',
                '██  ██',
                '██  ██',
                '██  ██',
                '█████ '
            ],
            'E': [
                '██████',
                '██    ',
                '█████ ',
                '██    ',
                '██████'
            ],
            'F': [
                '██████',
                '██    ',
                '█████ ',
                '██    ',
                '██    '
            ],
            'G': [
                ' █████',
                '██    ',
                '██ ███',
                '██  ██',
                ' █████'
            ],
            'H': [
                '██  ██',
                '██  ██',
                '██████',
                '██  ██',
                '██  ██'
            ],
            'I': [
                '██████',
                '  ██  ',
                '  ██  ',
                '  ██  ',
                '██████'
            ],
            'J': [
                '██████',
                '    ██',
                '    ██',
                '██  ██',
                ' █████'
            ],
            'K': [
                '██  ██',
                '██ ██ ',
                '████  ',
                '██ ██ ',
                '██  ██'
            ],
            'L': [
                '██    ',
                '██    ',
                '██    ',
                '██    ',
                '██████'
            ],
            'M': [
                '██████',
                '██████',
                '██  ██',
                '██  ██',
                '██  ██'
            ],
            'N': [
                '██  ██',
                '███ ██',
                '██████',
                '██ ███',
                '██  ██'
            ],
            'O': [
                ' █████',
                '██  ██',
                '██  ██',
                '██  ██',
                ' █████'
            ],
            'P': [
                '█████ ',
                '██  ██',
                '█████ ',
                '██    ',
                '██    '
            ],
            'Q': [
                ' █████',
                '██  ██',
                '██  ██',
                '██ ███',
                ' ██████'
            ],
            'R': [
                '█████ ',
                '██  ██',
                '█████ ',
                '██ ██ ',
                '██  ██'
            ],
            'S': [
                ' █████',
                '██    ',
                ' ████ ',
                '    ██',
                '█████ '
            ],
            'T': [
                '██████',
                '  ██  ',
                '  ██  ',
                '  ██  ',
                '  ██  '
            ],
            'U': [
                '██  ██',
                '██  ██',
                '██  ██',
                '██  ██',
                ' █████'
            ],
            'V': [
                '██  ██',
                '██  ██',
                '██  ██',
                ' ████ ',
                '  ██  '
            ],
            'W': [
                '██  ██',
                '██  ██',
                '██  ██',
                '██████',
                '██████'
            ],
            'X': [
                '██  ██',
                ' ████ ',
                '  ██  ',
                ' ████ ',
                '██  ██'
            ],
            'Y': [
                '██  ██',
                '██  ██',
                ' ████ ',
                '  ██  ',
                '  ██  '
            ],
            'Z': [
                '██████',
                '   ██ ',
                '  ██  ',
                ' ██   ',
                '██████'
            ],
            ' ': [
                '      ',
                '      ',
                '      ',
                '      ',
                '      '
            ],
            '!': [
                '  ██  ',
                '  ██  ',
                '  ██  ',
                '      ',
                '  ██  '
            ],
            '?': [
                ' █████',
                '██  ██',
                '   ██ ',
                '      ',
                '  ██  '
            ],
            '.': [
                '      ',
                '      ',
                '      ',
                '      ',
                '  ██  '
            ],
            ',': [
                '      ',
                '      ',
                '      ',
                '  ██  ',
                ' ██   '
            ],
            ':': [
                '      ',
                '  ██  ',
                '      ',
                '  ██  ',
                '      '
            ],
            '♥': [
                ' ██ ██',
                '██████',
                '██████',
                ' ████ ',
                '  ██  '
            ],
            '★': [
                '  ██  ',
                ' ████ ',
                '██████',
                ' ████ ',
                '██  ██'
            ]
        };
        
        return patterns[char.toUpperCase()] || patterns[' '];
    }
    
    breakTextIntoLines(text) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        for (const word of words) {
            if ((currentLine + word).length <= this.maxCharsPerLine) {
                currentLine += (currentLine ? ' ' : '') + word;
            } else {
                if (currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    // Word too long, break it
                    lines.push(word.substring(0, this.maxCharsPerLine));
                    currentLine = word.substring(this.maxCharsPerLine);
                }
            }
        }
        
        if (currentLine) {
            lines.push(currentLine);
        }
        
        return lines;
    }
    
    createCharacterFireworks(char, centerX, centerY, fireworksInstance, textSize = 1.0, particleQuantity = 3, glowIntensity = 1.0) {
        const pattern = this.getCharacterPattern(char);
        const colors = ['#ff0080', '#00ff80', '#8000ff', '#ff8000', '#0080ff', '#ff0040', '#40ff00'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const pixelSize = 6 * textSize;
        const particlesPerPixel = particleQuantity;
        
        // Calculate pattern dimensions and offset for centering
        const patternWidth = pattern[0].length * pixelSize;
        const patternHeight = pattern.length * pixelSize;
        const offsetX = centerX - patternWidth / 2;
        const offsetY = centerY - patternHeight / 2;
        
        // Calculate target positions for letter formation
        const targetPositions = [];
        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                if (pattern[row][col] === '█') {
                    for (let p = 0; p < particlesPerPixel; p++) {
                        const targetX = offsetX + col * pixelSize + Math.random() * pixelSize;
                        const targetY = offsetY + row * pixelSize + Math.random() * pixelSize;
                        targetPositions.push({ x: targetX, y: targetY });
                    }
                }
            }
        }
        
        // Create explosion particles
        const explosionParticles = [];
        const baseParticleCount = Math.min(120, targetPositions.length + 30);
        const particleCount = Math.floor(baseParticleCount * (0.5 + particleQuantity * 0.15));
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 3;
            
            const particle = fireworksInstance.particlePool.get();
            if (!particle) continue;
            
            particle.x = centerX + (Math.random() - 0.5) * 10;
            particle.y = centerY + (Math.random() - 0.5) * 10;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.life = 1.0;
            particle.decay = 0.004; // Slower initial decay
            particle.color = color;
            particle.size = Math.random() * 2 + 1;
            particle.gravity = 0.015;
            particle.fractalPhase = Math.random() * Math.PI * 2;
            particle.depth = 0;
            particle.isTextParticle = true;
            particle.formationStage = 0; // 0: exploding, 1: coalescing, 2: formed, 3: dissolving
            particle.originalSpeed = speed;
            particle.attractionForce = 0;
            particle.glowIntensity = glowIntensity;
            
            // Assign target position if available
            if (i < targetPositions.length) {
                particle.targetX = targetPositions[i].x;
                particle.targetY = targetPositions[i].y;
            } else {
                // Extra particles without targets will just explode and fade
                particle.targetX = particle.x;
                particle.targetY = particle.y;
            }
            
            explosionParticles.push(particle);
        }
        
        // Add to word particles tracking
        this.wordParticles.push(...explosionParticles);
        
        // Start coalescing animation after explosion
        setTimeout(() => {
            explosionParticles.forEach(particle => {
                if (particle.active) {
                    particle.formationStage = 1;
                    particle.attractionForce = 0.08;
                    particle.gravity = 0.005;
                    particle.decay = 0.001; // Very slow decay during formation
                }
            });
        }, this.explosionDuration);
        
        // Mark particles as formed
        setTimeout(() => {
            explosionParticles.forEach(particle => {
                if (particle.active) {
                    particle.formationStage = 2;
                    particle.attractionForce = 0.12;
                    particle.gravity = 0;
                    particle.decay = 0.0005; // Extremely slow decay when formed
                }
            });
        }, this.explosionDuration + this.coalesceDuration);
        
        return explosionParticles;
    }
    
    dissolveWordParticles() {
        this.wordParticles.forEach(particle => {
            if (particle.active) {
                particle.formationStage = 3;
                particle.attractionForce = 0;
                particle.gravity = 0.02;
                particle.decay = 0.012; // Normal decay for dissolving
            }
        });
        this.wordParticles = [];
    }
}

class FractalFireworks {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particlePool = new ParticlePool(8000);
        this.performanceMonitor = new PerformanceMonitor();
        this.animationId = null;
        
        // Performance optimizations
        this.ctx.imageSmoothingEnabled = false;
        this.pixelSize = 2;
        this.maxParticles = 2000;
        
        // User settings
        this.fireworkCount = 3;
        this.fireworkSize = 1;
        this.baseParticleCount = 80; // Reduced from 150
        this.fractalDepth = 3; // Reduced from 4
        
        // Text fireworks system
        this.textFireworks = new TextFireworks();
        
        // Text fireworks settings
        this.textSize = 1.0;
        this.particleQuantity = 3;
        this.glowIntensity = 1.0;
        
        // Rendering optimization
        this.colorGroups = new Map();
        this.lastRenderTime = 0;
        this.renderInterval = 16; // ~60fps
        
        // Canvas buffer for faster rendering
        this.bufferCanvas = document.createElement('canvas');
        this.bufferCtx = this.bufferCanvas.getContext('2d');
        this.bufferCtx.imageSmoothingEnabled = false;
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.setupEventListeners();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.bufferCanvas.width = this.canvas.width;
        this.bufferCanvas.height = this.canvas.height;
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
        
        document.getElementById('textFireworksButton').addEventListener('click', () => {
            this.createTextFireworks();
        });
        
        document.getElementById('textInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.createTextFireworks();
            }
        });
        
        document.getElementById('textSizeSlider').addEventListener('input', (e) => {
            this.textSize = parseFloat(e.target.value);
            document.getElementById('textSizeValue').textContent = this.textSize.toFixed(1);
        });
        
        document.getElementById('particleQuantitySlider').addEventListener('input', (e) => {
            this.particleQuantity = parseInt(e.target.value);
            document.getElementById('particleQuantityValue').textContent = this.particleQuantity;
        });
        
        document.getElementById('glowIntensitySlider').addEventListener('input', (e) => {
            this.glowIntensity = parseFloat(e.target.value);
            document.getElementById('glowIntensityValue').textContent = this.glowIntensity.toFixed(1);
        });
        
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.createMultipleFireworks(x, y);
        });
    }
    
    launchFireworks() {
        for (let i = 0; i < this.fireworkCount; i++) {
            setTimeout(() => {
                const x = Math.random() * this.canvas.width;
                const y = Math.random() * (this.canvas.height * 0.7) + this.canvas.height * 0.1;
                this.createFirework(x, y);
            }, i * 100);
        }
    }
    
    createMultipleFireworks(x, y) {
        for (let i = 0; i < this.fireworkCount; i++) {
            setTimeout(() => {
                this.createFirework(
                    x + (Math.random() - 0.5) * 40,
                    y + (Math.random() - 0.5) * 40
                );
            }, i * 80);
        }
    }
    
    createFirework(x, y) {
        const colors = ['#ff0080', '#00ff80', '#8000ff', '#ff8000', '#0080ff', '#ff0040', '#40ff00'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const qualityLevel = this.performanceMonitor.qualityLevel;
        
        // Adaptive particle count based on performance
        const particleCount = Math.floor(this.baseParticleCount * this.fireworkSize * qualityLevel);
        const branches = Math.floor(6 * qualityLevel) + 2;
        const maxDepth = Math.floor(this.fractalDepth * qualityLevel);
        
        // Limit total particles
        if (this.particlePool.active.length + particleCount > this.maxParticles) {
            return;
        }
        
        // Create fractal explosion pattern with reduced complexity
        for (let depth = 0; depth < maxDepth; depth++) {
            const depthFactor = (maxDepth - depth) / maxDepth;
            const depthParticles = Math.floor(particleCount * depthFactor * 0.4);
            
            for (let i = 0; i < depthParticles; i++) {
                const particle = this.particlePool.get();
                if (!particle) break;
                
                const angle = (Math.PI * 2 * i) / depthParticles;
                const branchAngle = (Math.PI * 2 * Math.floor(i / (depthParticles / branches))) / branches;
                
                // Simplified fractal pattern for better performance
                const fractalFactor = Math.sin(angle * 2) * 0.3 + Math.cos(angle * 3) * 0.2;
                const speed = (Math.random() * 3 + 1) * (1 + fractalFactor) * this.fireworkSize * depthFactor;
                const branchInfluence = Math.cos(branchAngle) * 0.3;
                
                particle.x = x;
                particle.y = y;
                particle.vx = Math.cos(angle) * speed + Math.cos(branchAngle) * branchInfluence;
                particle.vy = Math.sin(angle) * speed + Math.sin(branchAngle) * branchInfluence;
                particle.life = 1.0;
                particle.decay = Math.random() * 0.02 + 0.01;
                particle.color = color;
                particle.size = Math.max(1, Math.random() * 2 + 1) * this.fireworkSize;
                particle.gravity = 0.02;
                particle.fractalPhase = Math.random() * Math.PI * 2;
                particle.depth = depth;
            }
        }
        
        if (!this.animationId) {
            this.animate();
        }
    }
    
    createTextFireworks() {
        const textInput = document.getElementById('textInput');
        const text = textInput.value.trim();
        
        if (!text) return;
        
        // Disable button during animation
        const button = document.getElementById('textFireworksButton');
        button.disabled = true;
        button.textContent = '⏳ Playing...';
        
        // Clear any existing word particles
        this.textFireworks.dissolveWordParticles();
        
        // Break text into lines
        const lines = this.textFireworks.breakTextIntoLines(text);
        
        // Start text animation
        this.animateTextLines(lines, 0, () => {
            // Re-enable button when done
            button.disabled = false;
            button.textContent = '✨ Text Fireworks';
            textInput.value = '';
        });
    }
    
    animateTextLines(lines, currentLineIndex, callback) {
        if (currentLineIndex >= lines.length) {
            // All lines complete - hold the full text, then dissolve and callback
            setTimeout(() => {
                this.textFireworks.dissolveWordParticles();
                setTimeout(() => {
                    if (callback) callback();
                }, 1000); // Wait for dissolution
            }, 2000); // Hold full text for 2 seconds
            return;
        }
        
        const line = lines[currentLineIndex];
        const startY = this.canvas.height * 0.5 + (currentLineIndex * this.textFireworks.lineHeight);
        const startX = (this.canvas.width - (line.length * this.textFireworks.charSpacing * this.textSize)) / 2;
        
        // Animate characters in this line
        this.animateCharacters(line, startX, startY, 0, () => {
            // Wait before next line
            setTimeout(() => {
                this.animateTextLines(lines, currentLineIndex + 1, callback);
            }, this.textFireworks.lineDelay);
        });
    }
    
    animateCharacters(text, startX, startY, charIndex, callback) {
        if (charIndex >= text.length) {
            if (callback) callback();
            return;
        }
        
        const char = text[charIndex];
        const x = startX + (charIndex * this.textFireworks.charSpacing * this.textSize);
        const y = startY;
        
        // Create fireworks for this character with user settings
        this.textFireworks.createCharacterFireworks(char, x, y, this, this.textSize, this.particleQuantity, this.glowIntensity);
        
        // Start animation if not already running
        if (!this.animationId) {
            this.animate();
        }
        
        // Schedule next character
        setTimeout(() => {
            this.animateCharacters(text, startX, startY, charIndex + 1, callback);
        }, this.textFireworks.charDelay);
    }
    
    animate() {
        const currentTime = performance.now();
        
        // Throttle rendering for better performance
        if (currentTime - this.lastRenderTime < this.renderInterval) {
            this.animationId = requestAnimationFrame(() => this.animate());
            return;
        }
        
        this.lastRenderTime = currentTime;
        const qualityLevel = this.performanceMonitor.update();
        
        // Update performance display
        this.updatePerformanceDisplay();
        
        // Clear buffer with optimized alpha for afterglow
        this.bufferCtx.fillStyle = `rgba(0, 0, 0, ${0.08 * qualityLevel})`;
        this.bufferCtx.fillRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
        
        // Group particles by color for batch rendering
        this.colorGroups.clear();
        
        // Update and group particles
        const activeParticles = this.particlePool.active.slice();
        for (let i = activeParticles.length - 1; i >= 0; i--) {
            const particle = activeParticles[i];
            
            // Update particle physics
            particle.fractalPhase += 0.05;
            const fractalInfluence = Math.sin(particle.fractalPhase) * 0.2;
            
            // Handle text particle attraction with smooth physics
            if (particle.isTextParticle && particle.formationStage === 1) {
                // Coalescing stage - smooth attraction to target position
                const dx = particle.targetX - particle.x;
                const dy = particle.targetY - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 1) {
                    // Smooth attraction force that increases as we get closer
                    const attractionStrength = Math.min(particle.attractionForce * (1 + 2 / Math.max(distance, 1)), 0.3);
                    
                    // Normalize direction and apply smooth force
                    const normalizedX = dx / distance;
                    const normalizedY = dy / distance;
                    
                    particle.vx += normalizedX * attractionStrength;
                    particle.vy += normalizedY * attractionStrength;
                }
                
                // Smooth damping
                particle.vx *= 0.92;
                particle.vy *= 0.92;
            } else if (particle.isTextParticle && particle.formationStage === 2) {
                // Formed stage - gently hold position
                const dx = particle.targetX - particle.x;
                const dy = particle.targetY - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0.5) {
                    const holdStrength = 0.15;
                    particle.vx += dx * holdStrength;
                    particle.vy += dy * holdStrength;
                }
                
                // Gentle damping to maintain position
                particle.vx *= 0.85;
                particle.vy *= 0.85;
            } else {
                // Normal particle physics
                particle.vx *= 0.99;
                particle.vy *= 0.99;
            }
            
            particle.vy += particle.gravity;
            
            particle.x += particle.vx + (particle.isTextParticle ? 0 : fractalInfluence);
            particle.y += particle.vy;
            particle.life -= particle.decay;
            
            // Cull off-screen particles
            if (particle.x < -10 || particle.x > this.canvas.width + 10 ||
                particle.y < -10 || particle.y > this.canvas.height + 10 ||
                particle.life <= 0) {
                this.particlePool.release(particle);
                continue;
            }
            
            // Group by color for batch rendering
            if (!this.colorGroups.has(particle.color)) {
                this.colorGroups.set(particle.color, []);
            }
            this.colorGroups.get(particle.color).push(particle);
        }
        
        // Batch render particles by color
        this.batchRenderParticles(qualityLevel);
        
        // Copy buffer to main canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.bufferCanvas, 0, 0);
        
        // Continue animation if particles exist
        if (this.particlePool.active.length > 0) {
            this.animationId = requestAnimationFrame(() => this.animate());
        } else {
            this.animationId = null;
        }
    }
    
    batchRenderParticles(qualityLevel) {
        const shadowBlur = Math.floor(8 * qualityLevel);
        
        for (const [color, particles] of this.colorGroups) {
            this.bufferCtx.fillStyle = color;
            this.bufferCtx.shadowColor = color;
            
            // Batch render all particles of the same color
            this.bufferCtx.beginPath();
            
            for (const particle of particles) {
                const alpha = particle.life;
                const size = particle.size * qualityLevel;
                
                // Apply glow intensity for text particles
                const glowMultiplier = particle.isTextParticle ? particle.glowIntensity : 1.0;
                this.bufferCtx.shadowBlur = shadowBlur * glowMultiplier;
                
                // Pixelated rendering
                const pixelX = Math.floor(particle.x / this.pixelSize) * this.pixelSize;
                const pixelY = Math.floor(particle.y / this.pixelSize) * this.pixelSize;
                const pixelSize = Math.max(this.pixelSize, Math.floor(size / this.pixelSize) * this.pixelSize);
                
                this.bufferCtx.globalAlpha = alpha;
                this.bufferCtx.fillRect(pixelX, pixelY, pixelSize, pixelSize);
            }
            
            this.bufferCtx.shadowBlur = 0;
            this.bufferCtx.globalAlpha = 1.0;
        }
    }
    
    updatePerformanceDisplay() {
        const fpsElement = document.getElementById('fpsValue');
        const qualityElement = document.getElementById('qualityValue');
        
        if (fpsElement) {
            fpsElement.textContent = this.performanceMonitor.fps;
        }
        if (qualityElement) {
            const qualityPercent = Math.round(this.performanceMonitor.qualityLevel * 100);
            qualityElement.textContent = `${qualityPercent}%`;
        }
    }
    
    clearFireworks() {
        this.particlePool.clear();
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.bufferCtx.fillStyle = 'rgba(0, 0, 0, 1)';
        this.bufferCtx.fillRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('fireworksCanvas');
    const fireworks = new FractalFireworks(canvas);
    
    // Reduced auto-launch frequency
    setInterval(() => {
        if (Math.random() < 0.03 && fireworks.particlePool.active.length < 1000) {
            fireworks.launchFireworks();
        }
    }, 4000);
});