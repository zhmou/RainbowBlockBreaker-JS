class Particle {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.color = void 0;
    }
}

class Blocks {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.count = width * height;
        this.values = new Array(this.count);
        for (let i = 0; i < width; i++) {
            const color = hsv2rgb(360 * i / width, 1, 1);
            for (let j = 0; j < height; j++) {
                const p = new Particle(i, j);
                p.color = color;
                this.values[i + j * width] = p;
            }
        }
    }

    getParticle(x, y) {
        const index = x + y * this.width;
        if (index >= this.values.length || index < 0) {
            return null;
        } else {
            return this.values[index];
        }
    }

    removeParticle(x, y) {
        const index = x + y * this.width;
        const p = this.values[index];
        if (p) {
            this.count--;
            this.values[index] = void 0;
        }
        return p;
    }
}

class RainbowBlockBreaker {
    constructor() {
        const WIDTH = 465;
        const HEIGHT = 100;
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.blocks = new Blocks(WIDTH, HEIGHT);
        this.fallBlocks = new Array(0);
        this.bar = { width: 50, height: 10 };
        this.bar.x = (WIDTH - this.bar.width) / 2;
        this.bar.y = WIDTH - this.bar.width;
        this.ctx.fillStyle = "#00DD00";
        this.ctx.fillRect(this.bar.x, this.bar.y, this.bar.width, this.bar.height);
        const ball = new Particle(465 / 2, 465 / 2);
        ball.vx = Math.random() * 10;
        ball.vy = Math.random() * 9 - 1;
        ball.color = "#FFFFFF"
        this.balls = new Array();
        this.balls.push(ball);
    }

    update() {
        this.blocks.values.forEach(block => {
            if (block) {
                this.ctx.putImageData(new ImageData(new Uint8ClampedArray([block.color[0], block.color[1], block.color[2], 255]), 1, 1), block.x, block.y);
            }
        });
        const removeBalls = new Array();
        this.balls.forEach(ball => {
            ballSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
            ballRadius = Math.atan2(ball.vy, ball.vx);
        })
    }
}

const game = new RainbowBlockBreaker()

function hsv2rgb(h, s, v) {
    let f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return [f(5), f(3), f(1)];
}


