// Background particles for visual appeal
try {
particlesJS('particles', {
    particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: '#ffffff' },
        shape: { type: 'circle' },
        opacity: { value: 0.2, random: true },
        size: { value: 3, random: true },
        move: {
            enable: true,
            speed: 0.5,
            direction: 'none',
            random: true,
            straight: false,
            out_mode: 'out',
            bounce: false
        }
    },
    interactivity: {
        detect_on: 'canvas',
        events: {
            onhover: { enable: true, mode: 'repulse' },
            resize: true
        }
    },
    retina_detect: true
});
} catch (error) {
    // Particles failed to load, but game will still work
}

class Game {
    constructor() {
        try {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
            
            if (!this.canvas || !this.ctx) {
                throw new Error('Canvas or context not available');
            }
            
            // Device detection for responsive design
            this.dpr = window.devicePixelRatio || 1;
            this.isMobile = window.innerWidth <= 768;
            this.isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
            this.isLandscape = window.innerWidth > window.innerHeight;
            
            // Set up responsive system
            this.initializeResponsiveSystem();
        this.setupCanvas();
        
        // Core game state
        this.gameStarted = false;
        this.gameOver = false;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
        this.level = 1;
        this.pointsToNextLevel = 100;
        this.levelMultiplier = 1;
        this.platformsJumped = 0;
            this.startTime = Date.now();
        this.timeSurvived = 0;
        this.maxHeight = 0;
        this.achievements = new Set();
        
            // Difficulty settings that scale with screen size
        this.difficultyConfig = {
                platformSpacing: this.getResponsiveValue(100, 80, 120),
                minPlatformWidth: this.getResponsiveValue(70, 50, 90),
                maxPlatformWidth: this.getResponsiveValue(100, 80, 120),
                platformSpeed: this.getResponsiveValue(2, 1.5, 2.5),
            platformDensity: 0.9,
            typeDistribution: {
                normal: 0.85,
                moving: 0.05,
                breakable: 0.05,
                boost: 0.05
            }
        };
        
        // Level progression
        this.level = 1;
        this.pointsToNextLevel = 100;
        this.levelMultiplier = 1;
        
        // Visual effects and particles
        this.particles = [];
        this.backgroundStars = this.generateStars();
        this.platformSpawnTimer = 0;
        
            // Player character with responsive sizing
        this.player = {
            x: this.canvasWidth / 2,
            y: this.canvasHeight - this.getResponsiveValue(100, 80, 120),
            width: this.getResponsiveValue(30, 25, 35),
            height: this.getResponsiveValue(30, 25, 35),
            velocityX: 0,
            velocityY: 0,
            baseSpeed: this.getResponsiveValue(11.04, 9.936, 8.832), // 15% faster than before
            speed: this.getResponsiveValue(11.04, 9.936, 8.832),
            jumpForce: -20, // Strong jump for good feel
            color: '#4a90e2',
            isJumping: false,
            jumpCount: 0,
            maxJumps: 2,
            scale: 1,
            rotation: 0,
            trail: [],
            acceleration: this.getResponsiveValue(1.38, 1.242, 1.104), // 15% faster acceleration
            deceleration: 0.7,
            canJump: true,
            jumpCooldown: 0,
            powerJumpCharge: 3,
            isCharging: false
        };
        
            // Platform system with different types
        this.platforms = [];
        this.platformTypes = {
                normal: { 
                    width: this.getResponsiveValue(70, 60, 80), 
                    height: this.getResponsiveValue(15, 12, 18), 
                    color: '#2ecc71', 
                    points: 10 
                },
                moving: { 
                    width: this.getResponsiveValue(70, 60, 80), 
                    height: this.getResponsiveValue(15, 12, 18), 
                    color: '#e74c3c', 
                    points: 20 
                },
                breakable: { 
                    width: this.getResponsiveValue(70, 60, 80), 
                    height: this.getResponsiveValue(15, 12, 18), 
                    color: '#f1c40f', 
                    points: 15 
                },
                boost: { 
                    width: this.getResponsiveValue(70, 60, 80), 
                    height: this.getResponsiveValue(15, 12, 18), 
                    color: '#9b59b6', 
                    points: 30 
                }
            };
            
            // Platform spacing for good gameplay feel
            this.minPlatformSpace = 60;
            this.maxPlatformSpace = 150;
        
        // Physics settings for smooth movement
            this.gravity = 1.2; // Fast falling for responsive feel
            this.terminalVelocity = 25; // Max fall speed
            this.friction = 0.7; // Smooth deceleration
            this.airResistance = 0.9; // Air control
        this.cameraY = 0;
        this.shake = { intensity: 0, duration: 0 };
        
        // Input handling
        this.keys = {};
        this.touchStartX = null;
            this.touchStartY = null;
            this.touchSensitivity = 5; // Touch responsiveness
        
        // Jump mechanics
            this.jumpKeys = new Set();
            this.canJump = true;
        this.lastTouchedPlatform = null;
            
            // Touch control state tracking
            this.touchControls = {
                left: false,
                right: false,
                jump: false
            };
        
        // Initialize everything
        this.initializeControls();
        this.initializeUI();
        
        // Make sure canvas is ready before creating platforms
        this.setupCanvas();
        
        // Position player in starting spot
        this.player.x = this.canvasWidth / 2;
        this.player.y = this.canvasHeight - this.getResponsiveValue(100, 80, 120);
        
        // Create initial platforms
        this.generateInitialPlatforms();
        
        // Double-check platforms were created
        if (this.platforms.length === 0) {
            setTimeout(() => {
                this.generateInitialPlatforms();
            }, 50);
        }
        
        this.updateUI();
        this.lastTime = 0; this.deltaTime = 0; this.gameTime = 0;
        this.animate(0);
        
        // Start monitoring for false game over screens
        this.monitorGameOverElement();
            
        } catch (error) {
            // Game failed to start, but that's okay
        }
    }
    
    // Set up responsive design system
    initializeResponsiveSystem() {
        // Debounced resize handler to prevent spam
        this.resizeTimeout = null;
        this.resizeHandler = () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 100);
        };
        
        // Listen for window changes
        window.addEventListener('resize', this.resizeHandler);
        window.addEventListener('orientationchange', this.resizeHandler);
        
        // Update what device we're on
        this.updateDeviceProperties();
    }
    
    // Figure out what kind of device we're on
    updateDeviceProperties() {
        this.isMobile = window.innerWidth <= 768;
        this.isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
        this.isLandscape = window.innerWidth > window.innerHeight;
        this.dpr = window.devicePixelRatio || 1;
        
        // Show/hide touch controls based on device
        this.updateTouchControls();
    }
    
    // Show touch controls on mobile/tablet
    updateTouchControls() {
        const touchControls = document.getElementById('touchControls');
        if (this.isMobile || this.isTablet) {
            touchControls.classList.remove('hidden');
        } else {
            touchControls.classList.add('hidden');
        }
    }
    
    // Handle window resize events
    handleResize() {
        this.updateDeviceProperties();
        this.setupCanvas();
        this.updateDifficulty();
        this.updateUI();
        
        // Keep player on screen
        this.player.x = Math.min(this.player.x, this.canvas.width - this.player.width);
        this.player.y = Math.min(this.player.y, this.canvas.height - this.player.height);
    }
    
    // Get responsive values based on device type
    getResponsiveValue(base, mobile, desktop) {
        if (this.isMobile) return mobile;
        if (this.isTablet) return base;
        return desktop;
    }
    
    // Set up the canvas for drawing
    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        const minWidth = Math.max(rect.width, 300); // Make sure it's not too small
        const minHeight = Math.max(rect.height, 400);
        this.canvas.width = minWidth * this.dpr;
        this.canvas.height = minHeight * this.dpr;
        this.canvas.style.width = `${minWidth}px`;
        this.canvas.style.height = `${minHeight}px`;
        this.ctx.scale(this.dpr, this.dpr);
        this.ctx.imageSmoothingEnabled = true; this.ctx.imageSmoothingQuality = 'high';
        this.canvasWidth = minWidth; // Store the actual size
        this.canvasHeight = minHeight;
    }
    
    // Set up keyboard and touch controls
    initializeControls() {
        const JUMP_KEYS = new Set([' ', 'ArrowUp', 'w']);
        
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            // Handle jump keys
            if (JUMP_KEYS.has(e.key) && !this.gameOver && this.canJump) {
                this.jumpKeys.add(e.key);
                this.tryJump();
            }
            
            // Prevent default for game keys
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'w', 'a', 's', 'd'].includes(e.key)) {
                e.preventDefault();
            }
            
            // Manual game over trigger for testing (G key) - removed for production
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            
            // Handle jump key release
            if (JUMP_KEYS.has(e.key)) {
                this.jumpKeys.delete(e.key);
                
                // Reset jump ability if no jump keys are pressed
                if (this.jumpKeys.size === 0) {
                    this.canJump = true;
                }
            }
        });
        
        // Set up touch controls
        this.initializeTouchControls();
        
        // Prevent default touch behaviors
        this.canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
        this.canvas.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
    }
    
    initializeTouchControls() {
        // Touch areas
        const leftTouch = document.getElementById('leftTouch');
        const rightTouch = document.getElementById('rightTouch');
        const jumpTouch = document.getElementById('jumpTouch');
        
        // Left touch area
        leftTouch.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchControls.left = true;
            this.keys['ArrowLeft'] = true;
        });
        
        leftTouch.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchControls.left = false;
            this.keys['ArrowLeft'] = false;
        });
        
        // Right touch area
        rightTouch.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchControls.right = true;
            this.keys['ArrowRight'] = true;
        });
        
        rightTouch.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchControls.right = false;
            this.keys['ArrowRight'] = false;
        });
        
        // Jump touch area
        jumpTouch.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!this.gameOver && this.canJump) {
                this.tryJump();
            }
        });
        
        // Canvas touch controls for direct interaction
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
            
            // Jump on tap
            if (!this.gameOver && this.canJump) {
                this.tryJump();
            }
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.touchStartX === null) return;
            
            const touch = e.touches[0];
            const touchX = touch.clientX;
            const touchY = touch.clientY;
            const diffX = touchX - this.touchStartX;
            const diffY = touchY - this.touchStartY;
            
            // Handle horizontal movement with sensitivity
            if (Math.abs(diffX) > this.touchSensitivity) {
                if (diffX > 0) {
                    this.keys['ArrowRight'] = true;
                    this.keys['ArrowLeft'] = false;
                } else {
                    this.keys['ArrowLeft'] = true;
                    this.keys['ArrowRight'] = false;
                }
            } else {
                    this.keys['ArrowRight'] = false;
                    this.keys['ArrowLeft'] = false;
                }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchStartX = null;
            this.touchStartY = null;
            this.keys['ArrowRight'] = false;
            this.keys['ArrowLeft'] = false;
            this.canJump = true;
            this.jumpKeys.clear();
        });
    }
    
    initializeUI() {
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('restartButton').addEventListener('click', () => this.restartGame());
        
        // Remove the incorrect playAgain button reference
        // const playAgainButton = document.getElementById('playAgain');
        // if (playAgainButton) {
        //     playAgainButton.addEventListener('click', () => {
        //         document.getElementById('gameOver').classList.add('hidden');
        //         this.restartGame();
        //     });
        // }
    }
    
    startGame() {
        document.getElementById('instructions').classList.add('hidden');
        this.gameStarted = true;
        this.gameOver = false; // Ensure game is not over when starting
        this.startTime = Date.now();
        
        // Hide any existing game over screen
        this.hideGameOverScreen();
        
        // Ensure platforms are generated if they don't exist
        if (this.platforms.length === 0) {
            this.generateInitialPlatforms();
        }
        
        // Reset player position when starting - ensure proper position
        this.player.x = this.canvasWidth / 2;
        
        // Position player precisely on top of the starting platform
        if (this.platforms.length > 0) {
            const startingPlatform = this.platforms[0];
            // Position player exactly on top of the platform with a small gap
            this.player.y = startingPlatform.y - this.player.height - 2;
            // Ensure player is centered on the platform
            this.player.x = startingPlatform.x + (startingPlatform.width / 2) - (this.player.width / 2);
        } else {
            // Fallback position if no platforms
            this.player.y = this.canvasHeight - this.getResponsiveValue(150, 120, 180);
        }
        
        this.player.velocityX = 0;
        this.player.velocityY = 0;
        this.player.isJumping = false;
        this.player.jumpCount = 0;
        this.canJump = true;
        this.jumpKeys.clear();
        
        // Reset camera
        this.cameraY = 0;
    }
    
    tryJump() {
        if (!this.canJump) return;
        
        if (this.player.jumpCount < this.player.maxJumps) {
            this.player.velocityY = this.player.jumpForce;
            this.player.isJumping = true;
            this.player.jumpCount++;
            this.canJump = false;
            this.createJumpParticles();
            this.shake.intensity = 3;
            this.shake.duration = 5;
            
            // Cleanup particles when jumping to prevent accumulation
            if (this.particles.length > 20) {
                this.particles = this.particles.slice(-10); // Keep only last 10 particles
            }
        }
    }
    
    createJumpParticles() {
        const colors = ['#4a90e2', '#2ecc71', '#e74c3c', '#f1c40f'];
        const particleCount = 4; // Reduced from 8 to 4
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y + this.player.height,
                velocityX: (Math.random() - 0.5) * 8,
                velocityY: Math.random() * 2 + 2,
                size: Math.random() * 4 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                life: 30,
                rotation: Math.random() * Math.PI * 2
            });
        }
    }
    
    createPlatformParticles(platform, count = 3) { // Reduced default count from 5 to 3
        const particleCount = count; // Use fixed count instead of responsive value
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: platform.x + platform.width / 2,
                y: platform.y,
                velocityX: (Math.random() - 0.5) * 4,
                velocityY: (Math.random() - 0.5) * 4,
                size: Math.random() * 3 + 2,
                color: platform.color,
                alpha: 1,
                life: 20
            });
        }
    }
    
    generatePlatform(y) {
        try {
            // Responsive platform width (15-25% of screen width)
            const minWidth = this.canvasWidth * 0.15;
            const maxWidth = this.canvasWidth * 0.25;
            const width = Math.random() * (maxWidth - minWidth) + minWidth;
        
            const x = Math.random() * (this.canvasWidth - width);
        
        // Determine platform type based on distribution
        const rand = Math.random();
        let type = 'normal';
        let cumulative = 0;
        
            // Ensure difficultyConfig exists
            if (!this.difficultyConfig || !this.difficultyConfig.typeDistribution) {
                type = 'normal';
            } else {
        for (const [platformType, probability] of Object.entries(this.difficultyConfig.typeDistribution)) {
            cumulative += probability;
            if (rand <= cumulative) {
                type = platformType;
                break;
                    }
            }
        }
            
            // Ensure platform type exists
            if (!this.platformTypes[type]) {
                type = 'normal';
        }
        
        const platform = {
            x,
            y,
            width,
                height: this.platformTypes[type].height,
            type,
            broken: false,
            color: this.platformTypes[type].color,
                opacity: 1.0
        };
        
        if (type === 'moving') {
                const platformSpeed = this.difficultyConfig ? this.difficultyConfig.platformSpeed : 2;
                platform.velocityX = platformSpeed * (Math.random() < 0.5 ? 1 : -1);
        }
        
        return platform;
        } catch (error) {
            console.error('Error generating platform:', error);
            // Return a fallback platform
            return {
                x: Math.random() * (this.canvasWidth - 100),
                y: y,
                width: 100,
                height: 15,
                type: 'normal',
                broken: false,
                color: '#2ecc71',
                opacity: 1.0
            };
        }
    }
    
    // Create the initial platforms for the game
    generateInitialPlatforms() {
        // Clear out any old platforms
        this.platforms = [];
        
        // Make sure we have canvas dimensions
        if (!this.canvasWidth || !this.canvasHeight) {
            this.setupCanvas();
        }
        
        // Create the starting platform where the player begins
        const playerStartY = this.canvasHeight - this.getResponsiveValue(150, 120, 180);
        const platformY = playerStartY + this.player.height + 5; // Platform just below player
        
        // Build the starting platform
        const startingPlatform = {
            x: Math.max(0, this.canvasWidth / 2 - 50), // Keep it on screen
            y: platformY,
            width: Math.min(100, this.canvasWidth * 0.2), // Responsive width
            height: 15,
            color: '#2ecc71',
            type: 'normal',
            velocityX: 0,
            broken: false,
            opacity: 1.0
        };
        
        this.platforms.push(startingPlatform);
        
        // Create platforms above the starting one for jumping
        let currentPlatformY = platformY;
        let platformCount = 0;
        const maxInitialPlatforms = 15; // Don't create too many
        
        while (currentPlatformY > -800 && platformCount < maxInitialPlatforms) {
            currentPlatformY -= Math.random() * (this.maxPlatformSpace - this.minPlatformSpace) + this.minPlatformSpace;
            const newPlatform = this.generatePlatform(currentPlatformY);
            if (newPlatform) {
                this.platforms.push(newPlatform);
                platformCount++;
            }
        }
        
        // Make sure we have at least one platform to land on
        if (this.platforms.length === 0) {
            // Emergency platform if something went wrong
            this.platforms.push({
                x: Math.max(0, this.canvasWidth / 2 - 50),
                y: this.canvasHeight - 100,
                width: Math.min(100, this.canvasWidth * 0.2),
                height: 15,
                color: '#2ecc71',
                type: 'normal',
                velocityX: 0,
                broken: false,
                opacity: 1.0
            });
        }
        
        // Add a second platform if we only have one
        if (this.platforms.length === 1) {
            this.platforms.push({
                x: Math.max(0, this.canvasWidth / 2 - 60),
                y: this.platforms[0].y - 120,
                width: Math.min(120, this.canvasWidth * 0.25),
                height: 15,
                color: '#2ecc71',
                type: 'normal',
                velocityX: 0,
                broken: false,
                opacity: 1.0
            });
        }
    }
    
    generateStars() {
        const stars = [];
        const starCount = this.getResponsiveValue(100, 70, 130);
        
        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * this.canvasWidth,
                y: Math.random() * this.canvasHeight * 2,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 0.5 + 0.1
            });
        }
        return stars;
    }
    
    showAchievement(text) {
        if (this.achievements.has(text)) return;
        
        this.achievements.add(text);
        const achievement = document.getElementById('achievement');
        achievement.textContent = text;
        achievement.classList.add('show');
        
        setTimeout(() => {
            achievement.classList.remove('show');
        }, 3000);
    }
    
    checkAchievements() {
        if (this.score >= 1000 && !this.achievements.has('Reached 1000 points!')) {
            this.showAchievement('Reached 1000 points!');
        }
        if (this.platformsJumped >= 50 && !this.achievements.has('Jumped 50 platforms!')) {
            this.showAchievement('Jumped 50 platforms!');
        }
        if (this.timeSurvived >= 60 && !this.achievements.has('Survived 1 minute!')) {
            this.showAchievement('Survived 1 minute!');
        }
    }
    
    createTrail() {
        // Simplified trail creation to prevent performance issues
        if (this.player.trail.length < 3) { // Reduced trail length
        this.player.trail.push({
            x: this.player.x + this.player.width / 2,
            y: this.player.y + this.player.height / 2,
            alpha: 1
        });
        }
    }
    
    updateTrail() {
        // Simplified trail update
        this.player.trail.forEach((point, index) => {
            point.alpha -= 0.2; // Faster fade
        });
        this.player.trail = this.player.trail.filter(point => point.alpha > 0);
    }
    
    updateUI() {
        // Update score and high score
        const scoreElement = document.getElementById('scoreValue');
        const highScoreElement = document.getElementById('highScoreValue');
        const levelElement = document.getElementById('levelValue');
        const levelBar = document.querySelector('.level-bar');
        const timeElement = document.getElementById('timeValue');
        
        if (scoreElement) scoreElement.textContent = this.score;
        if (highScoreElement) highScoreElement.textContent = this.highScore;
        
        // Update level display
        if (levelElement) {
            const level = this.level;
            const pointsInCurrentLevel = this.score - (level - 1) * 100;
            levelElement.textContent = `${level} (${pointsInCurrentLevel}/100)`;
        }
        
        // Update level progress bar
        if (levelBar) {
            const pointsInCurrentLevel = this.score - (this.level - 1) * 100;
            const progress = Math.min(pointsInCurrentLevel / 100, 1);
            
            levelBar.style.width = `${progress * 100}%`;
            
            // Add color transition based on progress
            const hue = Math.floor(120 + (1 - progress) * 240) % 360;
            levelBar.style.background = `linear-gradient(90deg, hsl(${hue}, 70%, 50%), hsl(${(hue + 30) % 360}, 70%, 50%))`;
        }

        // Update time display
        if (timeElement) {
            const minutes = Math.floor(this.timeSurvived / 60);
            const seconds = this.timeSurvived % 60;
            timeElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    checkLevelProgression() {
        const shouldBeLevel = Math.floor(this.score / 100) + 1;
        
        if (shouldBeLevel > this.level) {
            this.level = shouldBeLevel;
            this.updateDifficulty();
            this.createLevelUpEffect();
            this.updateUI();
        }
    }
    
    createLevelUpEffect() {
        // Create gold particles
        const particleCount = this.getResponsiveValue(20, 15, 25);
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: this.canvasWidth / 2,
                y: this.canvasHeight / 2,
                velocityX: (Math.random() - 0.5) * 10,
                velocityY: (Math.random() - 0.5) * 10,
                size: Math.random() * 4 + 2,
                color: '#FFD700',
                alpha: 1,
                life: 60,
                rotation: Math.random() * Math.PI * 2
            });
        }
        
        // Level up text
        this.particles.push({
            x: this.canvasWidth / 2,
            y: this.canvasHeight / 2,
            text: `Level ${this.level}!`,
            velocityY: -2,
            alpha: 1,
            life: 60,
            fontSize: this.getResponsiveValue('24px', '20px', '28px')
        });
        
        // Screen shake
        this.shake.intensity = 8;
        this.shake.duration = 15;
    }
    
    updateDifficulty() {
        // Each level needs exactly 100 points
        this.pointsToNextLevel = 100;
        
        // Platform spacing increases more aggressively
        this.difficultyConfig.platformSpacing = Math.min(
            this.getResponsiveValue(100, 80, 120) + this.level * 8, 
            this.getResponsiveValue(300, 250, 350)
        );
        
        // Platforms get significantly narrower but maintain minimum width
        const minWidth = this.canvasWidth * 0.15;
        const maxWidth = this.canvasWidth * 0.25;
        this.difficultyConfig.minPlatformWidth = Math.max(minWidth - this.level * 3, minWidth * 0.3);
        this.difficultyConfig.maxPlatformWidth = Math.max(maxWidth - this.level * 2, minWidth * 0.5);
        
        // Platforms move faster and more erratically
        this.difficultyConfig.platformSpeed = Math.min(
            this.getResponsiveValue(2, 1.5, 2.5) + this.level * 0.6, 
            this.getResponsiveValue(15, 12, 18)
        );
        
        // More sparse platform placement
        this.difficultyConfig.platformDensity = Math.max(0.9 - this.level * 0.035, 0.3);
        
        // Adjust platform type distribution to have more challenging platforms
        const normalPlatformRatio = Math.max(0.85 - this.level * 0.04, 0.1);
        const movingRatio = Math.min(0.1 + this.level * 0.02, 0.4);
        const breakableRatio = Math.min(0.05 + this.level * 0.015, 0.3);
        const boostRatio = 1 - (normalPlatformRatio + movingRatio + breakableRatio);
        
        this.difficultyConfig.typeDistribution = {
            normal: normalPlatformRatio,
            moving: movingRatio,
            breakable: breakableRatio,
            boost: boostRatio
        };
        
        // More challenging player physics
        this.gravity = Math.min(
            this.getResponsiveValue(0.5, 0.4, 0.6) + this.level * 0.03, 
            this.getResponsiveValue(1.2, 1.0, 1.4)
        );
        this.player.baseSpeed = Math.min(
            this.getResponsiveValue(7, 6, 8) + this.level * 0.4, 
            this.getResponsiveValue(20, 18, 22)
        );
        this.player.speed = this.player.baseSpeed;
        
        // Stronger jump force but with more gravity for tighter control
        this.player.jumpForce = -this.getResponsiveValue(15, 12, 18) - Math.min(this.level * 0.3, 8);
        
        // Score multiplier increases faster
        this.levelMultiplier = 1 + (this.level - 1) * 0.5;
        
        // Add environmental challenges based on level
        if (this.level >= 5) {
            // Add wind effect that pushes player
            this.windForce = (Math.sin(Date.now() / 1000) * 0.5) * (this.level * 0.1);
            this.player.x += this.windForce;
        }
        
        if (this.level >= 10) {
            // Add screen rotation effect
            const rotationAmount = Math.sin(Date.now() / 2000) * (this.level * 0.5);
            document.getElementById('gameCanvas').style.transform = `rotate(${rotationAmount}deg)`;
        }
    }
    
    applyEnvironmentalEffects() {
        if (this.level >= 5) {
            // Update wind effect
            this.windForce = (Math.sin(Date.now() / 1000) * 0.5) * (this.level * 0.1);
            // Apply wind resistance based on player movement direction
            if (this.player.velocityX > 0) {
                this.windForce *= 1.5; // Harder to move against the wind
            }
            this.player.x += this.windForce;
        }
        
        if (this.level >= 10) {
            // Update screen rotation
            const rotationAmount = Math.sin(Date.now() / 2000) * (this.level * 0.5);
            document.getElementById('gameCanvas').style.transform = `rotate(${rotationAmount}deg)`;
        }
        
        // Safe platform visibility fluctuation using canvas opacity
        if (this.level >= 15) {
            this.platforms.forEach(platform => {
                if (platform.type === 'normal' && Math.random() < 0.01) {
                    platform.opacity = Math.max(0.2, Math.random());
                }
            });
        }
    }
    
    // Monitor game over element for unauthorized changes
    monitorGameOverElement() {
        const gameOverElement = document.getElementById('gameOver');
        if (gameOverElement) {
            // Create a MutationObserver to watch for changes
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        const hasHidden = gameOverElement.classList.contains('hidden');
                        const hasShow = gameOverElement.classList.contains('show');
                        
                        // If game over screen is being shown but game is not over, hide it
                        if (!hasHidden && !this.gameOver) {
                            gameOverElement.classList.add('hidden');
                        }
                    }
                });
            });
            
            observer.observe(gameOverElement, {
                attributes: true,
                attributeFilter: ['class']
            });
            
        }
    }
    
    // Function to safely show game over screen
    showGameOverScreen() {
        if (!this.gameOver) {
            return;
        }
        
        const gameOverElement = document.getElementById('gameOver');
        if (gameOverElement) {
            gameOverElement.classList.remove('hidden');
            document.getElementById('finalScore').textContent = this.score;
            document.getElementById('platformsJumped').textContent = this.platformsJumped;
            document.getElementById('maxHeight').textContent = Math.floor(this.cameraY / 100);
            
            const minutes = Math.floor(this.timeSurvived / 60);
            const seconds = this.timeSurvived % 60;
            const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            document.getElementById('timeSurvived').textContent = `Time Survived: ${timeString}`;
            
        }
    }
    
    // Function to safely hide game over screen
    hideGameOverScreen() {
        const gameOverElement = document.getElementById('gameOver');
        if (gameOverElement) {
            gameOverElement.classList.add('hidden');
        }
    }
    
    // Function to check if game over screen should be hidden
    checkGameOverScreen() {
        const gameOverElement = document.getElementById('gameOver');
        if (gameOverElement && !this.gameOver && gameOverElement.classList.contains('show')) {
            gameOverElement.classList.add('hidden');
        }
    }
    
    update() {
        if (!this.gameStarted || this.gameOver) return;
        
        // Update timer
        if (this.gameStarted && !this.gameOver) {
            this.timeSurvived = Math.floor((Date.now() - this.startTime) / 1000);
        }
        
        // Check for level progression
        this.checkLevelProgression();
        
        // Update player movement with simplified acceleration
        const targetSpeed = this.player.speed; // Remove jumping modifier
        
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.player.velocityX -= this.player.acceleration;
            this.player.velocityX = Math.max(this.player.velocityX, -targetSpeed);
            this.player.rotation = -0.2;
        } else if (this.keys['ArrowRight'] || this.keys['d']) {
            this.player.velocityX += this.player.acceleration;
            this.player.velocityX = Math.min(this.player.velocityX, targetSpeed);
            this.player.rotation = 0.2;
        } else {
            // Simplified deceleration
            this.player.velocityX *= this.player.deceleration;
            this.player.rotation *= 0.9;
        }
        
        // Remove air resistance to prevent movement slowdown
        // if (this.player.isJumping) {
        //     this.player.velocityX *= this.airResistance;
        // }
        
        // Remove speed boost when falling to prevent inconsistent movement
        // if (this.player.velocityY > 5) {
        //     this.player.speed = this.player.baseSpeed * 1.5;
        // } else {
        //     this.player.speed = this.player.baseSpeed;
        // }
        
        // Apply physics
        this.player.velocityY = Math.min(this.player.velocityY + this.gravity, this.terminalVelocity);
        this.player.x += this.player.velocityX;
        this.player.y += this.player.velocityY;
        
        // Ensure velocity doesn't get stuck at low values
        if (Math.abs(this.player.velocityX) < 0.1) {
            this.player.velocityX = 0;
        }
        
        // Create trail
        this.createTrail();
        this.updateTrail();
        
        // Screen wrap
        if (this.player.x + this.player.width < 0) {
            this.player.x = this.canvasWidth;
        } else if (this.player.x > this.canvasWidth) {
            this.player.x = -this.player.width;
        }
        
        // Platform collision and updates
        this.platforms.forEach(platform => {
            if (platform.type === 'moving') {
                platform.x += platform.velocityX;
                if (platform.x <= 0 || platform.x + platform.width >= this.canvasWidth) {
                    platform.velocityX *= -1;
                }
            }
            
            if (!platform.broken && 
                this.player.velocityY > 0 &&
                this.player.x < platform.x + platform.width &&
                this.player.x + this.player.width > platform.x &&
                this.player.y + this.player.height > platform.y &&
                this.player.y + this.player.height < platform.y + platform.height + this.player.velocityY
            ) {
                if (this.lastTouchedPlatform !== platform) {
                    this.platformsJumped++;
                    const basePoints = this.platformTypes[platform.type].points;
                    const points = Math.round(basePoints * this.levelMultiplier);
                    this.score += points;
                    this.updateUI();
                    
                    // Add score popup
                    this.particles.push({
                        x: this.player.x + this.player.width / 2,
                        y: this.player.y,
                        text: `+${points}`,
                        velocityY: -2,
                        alpha: 1,
                        life: 30
                    });
                    
                    this.lastTouchedPlatform = platform;
                }
                
                switch (platform.type) {
                    case 'normal':
                        this.player.velocityY = this.player.jumpForce;
                        this.createPlatformParticles(platform);
                        break;
                    case 'breakable':
                        this.player.velocityY = this.player.jumpForce;
                        platform.broken = true;
                        this.createPlatformParticles(platform, 15);
                        this.shake.intensity = 5;
                        this.shake.duration = 10;
                        break;
                    case 'boost':
                        this.player.velocityY = this.player.jumpForce * 1.5;
                        this.createPlatformParticles(platform, 15);
                        this.shake.intensity = 8;
                        this.shake.duration = 15;
                        break;
                    case 'moving':
                        this.player.velocityY = this.player.jumpForce;
                        this.player.velocityX += platform.velocityX * 0.5;
                        this.createPlatformParticles(platform);
                        break;
                }
                
                // Cleanup particles after platform touch to prevent accumulation
                if (this.particles.length > 30) {
                    this.particles = this.particles.slice(-15); // Keep only last 15 particles
                }
                
                this.player.isJumping = false;
                this.player.jumpCount = 0;
                this.canJump = true;
                this.jumpKeys.clear();
                this.player.y = platform.y - this.player.height;
                this.player.scale = 1.2;
            }
        });
        
        // Update player scale
        this.player.scale += (1 - this.player.scale) * 0.2;
        
        // Camera follow
        if (this.player.y < this.canvasHeight / 3) {
            const diff = this.canvasHeight / 3 - this.player.y;
            this.cameraY += diff;
            this.player.y += diff;
            this.platforms.forEach(platform => platform.y += diff);
            this.particles.forEach(particle => particle.y += diff);
        }
        
        // Remove platforms and generate new ones with performance limits
        this.platforms = this.platforms.filter(platform => platform.y < this.canvasHeight + platform.height);
        
        // Limit platform generation to prevent too many platforms
        const maxPlatforms = 15; // Reduced from 30 to 15
        while (this.platforms.length < maxPlatforms && this.platforms[this.platforms.length - 1].y > -1000) {
            const lastPlatform = this.platforms[this.platforms.length - 1];
            const spacing = Math.random() * (this.difficultyConfig.platformSpacing - 60) + 60;
            this.platforms.push(this.generatePlatform(lastPlatform.y - spacing));
        }
        
        // Update particles with performance limits
        this.particles = this.particles.filter(particle => {
            if (particle.text) {
                particle.y += particle.velocityY;
                particle.alpha *= 0.95;
            } else {
                particle.x += particle.velocityX;
                particle.y += particle.velocityY;
                particle.alpha *= 0.95;
                if (particle.rotation !== undefined) {
                    particle.rotation += 0.1;
                }
            }
            particle.life--;
            return particle.life > 0;
        });
        
        // More aggressive performance optimization: Limit total particles
        if (this.particles.length > 30) { // Reduced from 50 to 30
            this.particles = this.particles.slice(-30); // Keep only the last 30 particles
        }
        
        // More aggressive performance optimization: Limit platforms
        if (this.platforms.length > 15) { // Reduced from 25 to 15
            this.platforms = this.platforms.slice(-15); // Keep only the last 15 platforms
        }
        
        // Update screen shake
        if (this.shake.duration > 0) {
            this.shake.duration--;
            if (this.shake.duration === 0) {
                this.shake.intensity = 0;
            }
        }
        
        // Check achievements
        this.checkAchievements();
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
            document.getElementById('highScoreValue').textContent = this.highScore;
        }
        
        // Check game over - VERY STRICT CONDITIONS
        if (this.gameStarted && !this.gameOver && this.player.velocityY > 2 && this.player.y > this.canvasHeight + 200) {
            this.gameOver = true;
            this.showGameOverScreen();
        }
        
        // Performance monitoring
        // if (this.timeSurvived % 10 === 0) { // Check every 10 seconds
        //     console.log('Performance check:', {
        //         particles: this.particles.length,
        //         platforms: this.platforms.length,
        //         trailLength: this.player.trail.length,
        //         timeSurvived: this.timeSurvived,
        //         score: this.score
        //     });
        // }
        
        // Ensure player speed stays constant
        this.player.speed = this.getResponsiveValue(11.04, 9.936, 8.832); // Reset speed every frame with 15% increased responsive values
        
        // Frequent cleanup to prevent accumulation
        if (this.timeSurvived % 3 === 0) { // Cleanup every 3 seconds (increased from 2)
            this.cleanup();
        }
        
        // Aggressive cleanup every 20 seconds (increased from 10)
        if (this.timeSurvived % 20 === 0) {
            this.aggressiveCleanup();
        }
        
        // Check if game over screen should be hidden
        this.checkGameOverScreen();
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background stars
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.backgroundStars.forEach(star => {
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Apply screen shake
        if (this.shake.intensity > 0) {
            this.ctx.save();
            this.ctx.translate(
                Math.random() * this.shake.intensity - this.shake.intensity / 2,
                Math.random() * this.shake.intensity - this.shake.intensity / 2
            );
        }
        
        // Draw player trail
        this.player.trail.forEach((point, index) => {
            this.ctx.fillStyle = `rgba(74, 144, 226, ${point.alpha * 0.3})`;
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 
                this.player.width / 2 * (index / this.player.trail.length),
                0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw platforms
        this.platforms.forEach(platform => {
            if (platform.broken) return;
            
            // Apply platform opacity for visual effects
            this.ctx.globalAlpha = platform.opacity || 1.0;
            
            this.ctx.fillStyle = platform.color;
            this.ctx.beginPath();
            this.ctx.roundRect(
                platform.x,
                platform.y,
                platform.width,
                platform.height,
                5
            );
            this.ctx.fill();
            
            // Platform glow effect
            this.ctx.shadowColor = platform.color;
            this.ctx.shadowBlur = 10;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            
            // Reset global alpha
            this.ctx.globalAlpha = 1.0;
        });
        
        // Draw particles
        this.particles.forEach(particle => {
            if (particle.text) {
                this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.alpha})`;
                this.ctx.font = particle.fontSize || '16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(particle.text, particle.x, particle.y);
            } else {
                this.ctx.save();
                this.ctx.globalAlpha = particle.alpha;
                this.ctx.fillStyle = particle.color;
                this.ctx.translate(particle.x, particle.y);
                if (particle.rotation !== undefined) {
                    this.ctx.rotate(particle.rotation);
                }
                this.ctx.beginPath();
                this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
        });
        
        // Draw player
        this.ctx.save();
        this.ctx.translate(
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height / 2
        );
        this.ctx.rotate(this.player.rotation);
        this.ctx.scale(this.player.scale, 1 / this.player.scale);
        
        // Player glow effect
        this.ctx.shadowColor = this.player.color;
        this.ctx.shadowBlur = 15;
        
        // Player body
        this.ctx.fillStyle = this.player.color;
        this.ctx.beginPath();
        this.ctx.roundRect(
            -this.player.width / 2,
            -this.player.height / 2,
            this.player.width,
            this.player.height,
            8
        );
        this.ctx.fill();
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
        
        // Player eyes
        const eyeSize = this.getResponsiveValue(4, 3, 5);
        const eyeOffset = this.getResponsiveValue(5, 4, 6);
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(-eyeOffset, -2, eyeSize, 0, Math.PI * 2);
        this.ctx.arc(eyeOffset, -2, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
        
        if (this.shake.intensity > 0) {
            this.ctx.restore();
        }
    }
    
    animate(currentTime) {
        // Frame rate limiting to prevent excessive CPU usage
        if (currentTime - this.lastTime < 16) { // Limit to ~60 FPS
            requestAnimationFrame((time) => this.animate(time));
            return;
        }
        
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        this.update();
        this.applyEnvironmentalEffects();
        this.render();
        
        requestAnimationFrame((time) => this.animate(time));
    }
    
    restartGame() {
        // Reset game state
        this.gameOver = false;
        this.score = 0;
        this.level = 1;
        this.levelMultiplier = 1;
        this.pointsToNextLevel = 100;
        this.cameraY = 0;
        this.platformsJumped = 0;
        this.startTime = Date.now();
        this.timeSurvived = 0;
        this.maxHeight = 0;
        this.lastTouchedPlatform = null;
        this.canJump = true;
        this.jumpKeys.clear();
        
        // Reset difficulty
        this.updateDifficulty();
        
        // Reset platforms and particles first
        this.platforms = [];
        this.particles = [];
        
        // Ensure canvas is set up before generating platforms
        this.setupCanvas();
        
        // Generate platforms with retry logic
        this.generateInitialPlatforms();
        
        // Verify platforms were generated, retry if needed
        if (this.platforms.length === 0) {
            setTimeout(() => {
                this.generateInitialPlatforms();
            }, 50);
        }
        
        // Reset player - ensure proper positioning on starting platform
        this.player.x = this.canvasWidth / 2;
        
        // Position player precisely on top of the starting platform
        if (this.platforms.length > 0) {
            const startingPlatform = this.platforms[0];
            // Position player exactly on top of the platform with a small gap
            this.player.y = startingPlatform.y - this.player.height - 2;
            // Ensure player is centered on the platform
            this.player.x = startingPlatform.x + (startingPlatform.width / 2) - (this.player.width / 2);
        } else {
            // Fallback position if no platforms (shouldn't happen)
            this.player.y = this.canvasHeight - this.getResponsiveValue(150, 120, 180);
        }
        
        this.player.velocityX = 0;
        this.player.velocityY = 0;
        this.player.rotation = 0;
        this.player.scale = 1;
        this.player.isJumping = false;
        this.player.jumpCount = 0;
        this.player.trail = [];
        
        // Reset UI
        document.getElementById('scoreValue').textContent = '0';
        document.getElementById('levelValue').textContent = '1';
        
        // Hide game over screen
        this.hideGameOverScreen();
        
        // Reset effects
        this.shake.intensity = 0;
        this.shake.duration = 0;
        
        // Reset canvas rotation
        document.getElementById('gameCanvas').style.transform = 'rotate(0deg)';
        
        // Set game as started
        this.gameStarted = true;
    }

    // Cleanup function to prevent memory leaks
    cleanup() {
        // Remove dead particles
        this.particles = this.particles.filter(particle => particle.life > 0);
        
        // Remove broken platforms that are far below the player
        this.platforms = this.platforms.filter(platform => {
            // Keep platforms that are:
            // 1. Not broken, OR
            // 2. Broken but still within reasonable distance
            return !platform.broken || platform.y < this.player.y + 600;
        });
        
        // Clear trail if too long
        if (this.player.trail.length > 4) {
            this.player.trail = this.player.trail.slice(-4);
        }
        
        // Force garbage collection hint (if available)
        if (window.gc) {
            window.gc();
    }
    }
    
    // Aggressive cleanup function to remove ALL leftover objects
    aggressiveCleanup() {
        // Clear ALL particles
        this.particles = [];
        
        // Remove platforms that are truly out of view (not visible to player)
        this.platforms = this.platforms.filter(platform => {
            // Keep platforms that are:
            // 1. Above the player (for jumping up)
            // 2. Below the player but still visible (for safety)
            // 3. Within a safe range around the player
            const isAbovePlayer = platform.y < this.player.y - 50; // Above player
            const isBelowPlayer = platform.y > this.player.y + 50 && platform.y < this.player.y + 800; // Below but visible
            const isNearPlayer = Math.abs(platform.y - this.player.y) < 800; // Within safe range
            const isEssential = this.platforms.indexOf(platform) < 8; // Keep first 8 platforms
            
            return isAbovePlayer || isBelowPlayer || isNearPlayer || isEssential;
        });
        
        // Clear ALL trail
        this.player.trail = [];
        
        // Clear ALL effects
        this.shake.intensity = 0;
        this.shake.duration = 0;
        
        // Reset player velocity if it's too small (prevent getting stuck)
        if (Math.abs(this.player.velocityX) < 0.5) {
            this.player.velocityX = 0;
        }
        
        // Force garbage collection
        if (window.gc) {
            window.gc();
        }
    }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Ensure all elements are loaded before initializing
    const canvas = document.getElementById('gameCanvas');
    const gameContainer = document.querySelector('.game-container');
    
    if (!canvas || !gameContainer) {
        // console.error('Required elements not found. Retrying in 100ms...'); // Removed debug log
        setTimeout(() => {
    new Game();
        }, 100);
        return;
    }
    
    // Wait a bit more to ensure CSS is applied and layout is complete
            setTimeout(() => {
        new Game();
    }, 50);
});

// Fallback for older browsers
window.onload = () => {
    if (!window.gameInstance) {
        window.gameInstance = new Game();
    }
}; 