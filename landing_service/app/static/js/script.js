class Particle {
    constructor(x, y) {
      this.element = document.createElement('div');
      this.element.className = 'particle';
      this.element.style.width = Math.random() * 4 + 2 + 'px';
      this.element.style.height = this.element.style.width;
      this.x = x;
      this.y = y;
      this.color = this.getRandomColor();
      this.element.style.background = this.color;
      this.speed = Math.random() * 0.5 + 0.2;
      this.vx = (Math.random() - 0.5) * 10 * this.speed;
      this.vy = (Math.random() - 0.5) * this.speed;
      this.updatePosition();
      
      document.getElementById('particles').appendChild(this.element);
    }

    getRandomColor() {
      const colors = ['#ff3366', '#4466ff', '#44ff66', '#ffff44', '#ff44ff', '#44ffff'];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    updatePosition() {
      this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }

    changeColor() {
      this.color = this.getRandomColor();
      this.element.style.background = this.color;
    }
  }

  class ParticleSystem {
    constructor() {
      this.particles = [];
      this.mouseX = 0;
      this.mouseY = 0;
      this.init();
    }

    init() {
      for (let i = 0; i < 100; i++) {
        this.particles.push(new Particle(
          Math.random() * window.innerWidth,
          Math.random() * window.innerHeight
        ));
      }

      document.addEventListener('mousemove', (e) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
      });

      this.animate();
    }

    animate() {
      this.particles.forEach(particle => {
        const dx = this.mouseX - particle.x;
        const dy = this.mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const angle = Math.atan2(dy, dx);
          const force = 10 * (150 - distance) / 150;
          
          particle.x += Math.cos(angle) * force * particle.speed;
          particle.y += Math.sin(angle) * force * particle.speed;
          
          if (Math.random() < 0.1) {
            particle.changeColor();
          }
        }
        
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Smooth boundary transitions
        if (particle.x < 0) {
          particle.x = 0;
          particle.vx = Math.abs(particle.vx) * 0.3;
        }
        if (particle.x > window.innerWidth) {
          particle.x = window.innerWidth;
          particle.vx = -Math.abs(particle.vx) * 0.3;
        }
        if (particle.y < 0) {
          particle.y = 0;
          particle.vy = Math.abs(particle.vy) * 0.3;
        }
        if (particle.y > window.innerHeight) {
          particle.y = window.innerHeight;
          particle.vy = -Math.abs(particle.vy) * 0.3;
        }
        
        particle.updatePosition();
      });

      requestAnimationFrame(() => this.animate());
    }
  }

  new ParticleSystem();