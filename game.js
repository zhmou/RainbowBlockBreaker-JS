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
    static WIDTH = 465;
    static HEIGHT = 465;
    constructor() {
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.blocks = new Blocks(RainbowBlockBreaker.WIDTH, 100);
        this.fallBlocks = new Array();
        this.bar = { width: 50, height: 10 };
        this.bar.x = (RainbowBlockBreaker.WIDTH - this.bar.width) / 2;
        this.bar.y = RainbowBlockBreaker.WIDTH - this.bar.width;
        this.ctx.fillStyle = "#00DD00";
        this.ctx.fillRect(this.bar.x, this.bar.y, this.bar.width, this.bar.height);
        const ball = new Particle(465 / 2, 465 / 2);
        ball.vx = Math.random() * 10;
        ball.vy = Math.random() * 9 - 1;
        ball.color = [255, 255, 255]
        this.balls = new Array();
        this.balls.push(ball);

        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = RainbowBlockBreaker.WIDTH;
        this.offscreenCanvas.height = RainbowBlockBreaker.HEIGHT;
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');

        document.addEventListener("mousemove", (e) => {
            this.offscreenCtx.fillStyle = 'rgb(0,0,0)';
            this.offscreenCtx.fillRect(this.bar.x, this.bar.y, this.bar.width, this.bar.height);

            this.bar.x = e.clientX - this.canvas.offsetLeft - this.bar.width / 2;
            if (this.bar.x > RainbowBlockBreaker.WIDTH - this.bar.width) {
                this.bar.x = RainbowBlockBreaker.WIDTH - this.bar.width;
            } else if (this.bar.x < 0) {
                this.bar.x = 0;
            }
        })
    }

    update() {
        const _this = this;

        _this.offscreenCtx.fillStyle = 'black';
        _this.offscreenCtx.fillRect(0, 0, RainbowBlockBreaker.WIDTH, RainbowBlockBreaker.HEIGHT);

        _this.blocks.values.forEach(block => {
            if (block) {
                _this.offscreenCtx.fillStyle = `rgb(${block.color[0]}, ${block.color[1]}, ${block.color[2]})`;
                _this.offscreenCtx.fillRect(block.x, block.y, 1, 1)
            }
        });
        const removedBalls = new Array();
        _this.balls.forEach(function (ball) {
            const ballSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
            const ballRadius = Math.atan2(ball.vy, ball.vx);
            for (let i = 0; i < ballSpeed; i++) {
                ball.x += ball.vx / ballSpeed;
                ball.y += ball.vy / ballSpeed;
                const hitParticle = _this.blocks.getParticle(parseInt(ball.x), parseInt(ball.y));
                if (hitParticle) {
                    const removedParticle = _this.blocks.removeParticle(parseInt(ball.x), parseInt(ball.y));
                    removedParticle.vx = Math.cos(ballRadius + Math.PI * 2 / (30 * Math.random()) - 15) * 3;
                    removedParticle.vy = 1;
                    removedParticle.color = hitParticle.color;
                    _this.fallBlocks.push(removedParticle);
                    ball.vy = -ball.vy;
                }
                if ((ball.x < 0 && ball.vx < 0) || (ball.x > RainbowBlockBreaker.WIDTH && ball.vx > 0)) {

                    ball.vx = -ball.vx;
                }
                if (ball.y < 0 && ball.vy < 0) {
                    ball.vy = -ball.vy;
                }
                if (ball.y > RainbowBlockBreaker.HEIGHT) {
                    removedBalls.push(ball);
                }
                if (RainbowBlockBreaker.hitTestPoint(_this.bar, ball)) {
                    ball.vy = -Math.abs(ball.vy);
                }
                _this.offscreenCtx.fillStyle = `rgb(${ball.color[0]}, ${ball.color[1]}, ${ball.color[2]})`;
                _this.offscreenCtx.fillRect(ball.x, ball.y, 1, 1);
            }
        })
        removedBalls.forEach(function (particle) {
            const index = _this.balls.indexOf(particle)
            if (index !== -1) {
                _this.balls.splice(index, 1);
            }
        })

        const removedFallBlocks = new Array();
        _this.fallBlocks.forEach(function (fallParticle) {
            fallParticle.vy += 0.1;
            fallParticle.x += fallParticle.vx;
            fallParticle.y += fallParticle.vy;
            _this.offscreenCtx.fillStyle = `rgb(${fallParticle.color[0]}, ${fallParticle.color[1]}, ${fallParticle.color[2]})`;
            _this.offscreenCtx.fillRect(fallParticle.x, fallParticle.y, 1, 1);
            if (RainbowBlockBreaker.hitTestPoint(_this.bar, fallParticle)) {
                const newBall = new Particle(fallParticle.x, fallParticle.y);
                newBall.vx = Math.random() * 10;
                newBall.vy = Math.random() * 9 + 1;
                newBall.color = fallParticle.color;
                _this.balls.push(newBall);
                removedFallBlocks.push(fallParticle);
            } else if (fallParticle.y > RainbowBlockBreaker.HEIGHT) {
                removedFallBlocks.push(fallParticle);
            }
        })

        removedFallBlocks.forEach(function (block) {
            const index = _this.fallBlocks.indexOf(block);
            if (index !== -1) {
                _this.fallBlocks.splice(index, 1);
            }
        })

        if (_this.blocks.count === 0) {
            alert("Game End");
            return
        }
        _this.offscreenCtx.fillStyle = "#00DD00";
        _this.offscreenCtx.fillRect(_this.bar.x, _this.bar.y, _this.bar.width, _this.bar.height);

        _this.ctx.clearRect(0, 0, RainbowBlockBreaker.WIDTH, RainbowBlockBreaker.HEIGHT);
        _this.ctx.drawImage(this.offscreenCanvas, 0, 0);

        requestAnimationFrame(() => _this.update());
    }

    static hitTestPoint(Rect, Point) {
        if (Point.x >= Rect.x && Point.x <= Rect.x + Rect.width && Point.y >= Rect.y && Point.y <= Rect.y + Rect.height) {
            return true;
        } else {
            return false;
        }
    }
}

const game = new RainbowBlockBreaker()
document.addEventListener("DOMContentLoaded", () => { game.update() });


function hsv2rgb(h, s, v) {
    let f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return [f(5) * 255, f(3) * 255, f(1) * 255];
}


