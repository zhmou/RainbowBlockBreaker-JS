/**
 * Represents a single particle with position, velocity and color properties.
 */
class Particle {
    /**
     * Particle constructor.
     * @param {number} [x=0] - The x-coordinate of the particle.
     * @param {number} [y=0] - The y-coordinate of the particle.
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.color = undefined;
    }
}

/**
 * Represents a collection of particles arranged in a grid.
 */
class Blocks {
    /**
     * Blocks constructor.
     * @param {number} width - The width of the blocks grid.
     * @param {number} height - The height of the blocks grid.
     */

    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.count = width * height; // Total number of blocks.
        this.values = new Array(this.count); // Array to store the particles.

        // Populate the grid with particles colored according to their x-position.
        for (let i = 0; i < width; i++) {
            const color = hsv2rgb(360 * i / width, 1, 1);
            for (let j = 0; j < height; j++) {
                const p = new Particle(i, j);
                p.color = color;
                this.values[i + j * width] = p;
            }
        }
    }

    /**
     * Retrieves a particle from the grid.
     * @param {number} x - The x-coordinate of the particle to retrieve.
     * @param {number} y - The y-coordinate of the particle to retrieve.
     * @returns {Particle|null} The particle at the specified coordinates or null if out of bounds.
     */
    getParticle(x, y) {
        const index = x + y * this.width;
        if (index >= this.values.length || index < 0) {
            return null;
        } else {
            return this.values[index];
        }
    }

    /**
     * Removes a particle from the grid.
     * @param {number} x - The x-coordinate of the particle to remove.
     * @param {number} y - The y-coordinate of the particle to remove.
     * @returns {Particle|undefined} The removed particle or undefined if none was removed.
     */
    removeParticle(x, y) {
        const index = x + y * this.width;
        const p = this.values[index];
        if (p) {
            this.count--;
            this.values[index] = undefined;
        }
        return p;
    }
}

/**
 * The main game class handling the logic for the Rainbow Brick Breaker game.
 */
class RainbowBrickBreaker {
    static WIDTH = 465;
    static HEIGHT = 465;
    constructor() {
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.blocks = new Blocks(RainbowBrickBreaker.WIDTH, 100);

        this.bar = { width: 50, height: 10 };
        this.bar.x = (RainbowBrickBreaker.WIDTH - this.bar.width) / 2;
        this.bar.y = 415;
        this.ctx.fillStyle = "#00DD00";
        this.ctx.fillRect(this.bar.x, this.bar.y, this.bar.width, this.bar.height);

        const ball = new Particle(RainbowBrickBreaker.WIDTH / 2, RainbowBrickBreaker.HEIGHT / 2);
        ball.vx = Math.random() * 10;
        ball.vy = Math.random() * 9 - 1;
        ball.color = [255, 255, 255]

        this.balls = new Array();
        this.balls.push(ball);
        this.fallBlocks = new Array();
        this.removedBalls = new Array();
        this.removedFallBlocks = new Array();


        this.animationFrameId = undefined;
        this.lastUpdateTime = Date.now();

        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = RainbowBrickBreaker.WIDTH;
        this.offscreenCanvas.height = RainbowBrickBreaker.HEIGHT;
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');

        document.addEventListener("mousemove", (e) => {
            const mouseX = e.clientX;
            const canvasLeft = this.canvas.offsetLeft;
            let newBarX = mouseX - canvasLeft - this.bar.width / 2;
            this.offscreenCtx.fillStyle = 'rgb(0,0,0)';
            this.offscreenCtx.fillRect(this.bar.x, this.bar.y, this.bar.width, this.bar.height);
            if (newBarX > RainbowBrickBreaker.WIDTH - this.bar.width) {
                newBarX = RainbowBrickBreaker.WIDTH - this.bar.width;
            } else if (newBarX < 0) {
                newBarX = 0;
            }
            this.bar.x = newBarX;
        });
    }

    update() {
        const _this = this;
        const now = Date.now();
        // The original Flash code fixes the frame rate to 30 fps.
        const deltaTime = (now - _this.lastUpdateTime) / 33.33;
        _this.lastUpdateTime = now;
        _this.offscreenCtx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        _this.offscreenCtx.fillRect(0, 0, RainbowBrickBreaker.WIDTH, RainbowBrickBreaker.HEIGHT);

        let imageData = _this.offscreenCtx.getImageData(0, 0, RainbowBrickBreaker.WIDTH, 100);

        _this.blocks.values.forEach(block => {
            if (block) {
                const index = (block.x + block.y * imageData.width) * 4;
                imageData.data[index + 0] = block.color[0]; // R
                imageData.data[index + 1] = block.color[1]; // G
                imageData.data[index + 2] = block.color[2]; // B
                imageData.data[index + 3] = 255; // A
            }
        });
        _this.offscreenCtx.putImageData(imageData, 0, 0);

        _this.balls.forEach(function (ball) {
            const ballSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
            const ballRadius = Math.atan2(ball.vy, ball.vx);
            for (let i = 0; i < ballSpeed; i++) {
                ball.x += ball.vx * deltaTime / ballSpeed;
                ball.y += ball.vy * deltaTime / ballSpeed;
                const hitParticle = _this.blocks.getParticle(parseInt(ball.x), parseInt(ball.y));
                if (hitParticle) {
                    const removedParticle = _this.blocks.removeParticle(parseInt(ball.x), parseInt(ball.y));
                    removedParticle.vx = Math.cos(ballRadius + Math.PI * 2 / (30 * Math.random()) - 15) * 3;
                    removedParticle.vy = 1;
                    removedParticle.color = hitParticle.color;
                    _this.fallBlocks.push(removedParticle);
                    ball.vy = -ball.vy;
                }
                if ((ball.x < 0 && ball.vx < 0) || (ball.x > RainbowBrickBreaker.WIDTH && ball.vx > 0)) {
                    ball.vx = -ball.vx;
                }
                if (ball.y < 0 && ball.vy < 0) {
                    ball.vy = -ball.vy;
                }
                if (ball.y > RainbowBrickBreaker.HEIGHT) {
                    _this.removedBalls.push(ball);
                }
                if (ball.y > _this.bar.y) {
                    if (RainbowBrickBreaker.hitTestPoint(_this.bar, ball)) {
                        ball.vy = -Math.abs(ball.vy);
                    }
                }
                _this.offscreenCtx.fillStyle = `rgb(${ball.color[0]}, ${ball.color[1]}, ${ball.color[2]})`;
                _this.offscreenCtx.fillRect(ball.x, ball.y, 1, 1);
            }
        })
        _this.removedBalls.forEach(function (particle) {
            const index = _this.balls.indexOf(particle)
            if (index !== -1) {
                _this.balls.splice(index, 1);
            }
        })

        _this.removedBalls.length = 0;
        _this.fallBlocks.forEach(function (fallParticle) {
            fallParticle.vy += 0.1 * deltaTime;
            fallParticle.x += fallParticle.vx * deltaTime;
            fallParticle.y += fallParticle.vy * deltaTime;
            _this.offscreenCtx.fillStyle = `rgb(${fallParticle.color[0]}, ${fallParticle.color[1]}, ${fallParticle.color[2]})`;
            _this.offscreenCtx.fillRect(fallParticle.x, fallParticle.y, 1, 1);
            if (RainbowBrickBreaker.hitTestPoint(_this.bar, fallParticle)) {
                const newBall = new Particle(fallParticle.x, fallParticle.y);
                newBall.vx = Math.random() * 10;
                newBall.vy = Math.random() * 9 + 1;
                newBall.color = fallParticle.color;
                _this.balls.push(newBall);
                _this.removedFallBlocks.push(fallParticle);
            } else if (fallParticle.y > RainbowBrickBreaker.HEIGHT) {
                _this.removedFallBlocks.push(fallParticle);
            }
        })

        _this.removedFallBlocks.forEach(function (block) {
            const index = _this.fallBlocks.indexOf(block);
            if (index !== -1) {
                _this.fallBlocks.splice(index, 1);
            }
        })

        _this.removedFallBlocks.length = 0;

        _this.offscreenCtx.fillStyle = "#00DD00";
        _this.offscreenCtx.fillRect(_this.bar.x, _this.bar.y, _this.bar.width, _this.bar.height);

        _this.ctx.clearRect(0, 0, RainbowBrickBreaker.WIDTH, RainbowBrickBreaker.HEIGHT);
        _this.ctx.drawImage(this.offscreenCanvas, 0, 0);
        if (_this.blocks.count === 0) {
            cancelAnimationFrame(_this.animationFrameId);
            _this.offscreenCtx.fillStyle = "#FFFFFF";
            _this.offscreenCtx.font = "40px Arial";
            _this.offscreenCtx.textBaseline = "middle";
            _this.offscreenCtx.textAlign = "center";

            const textLines = ["CLEAR!", "おめでと"];
            const lineHeight = 40;
            const totalHeight = textLines.length * lineHeight;

            let startY = (RainbowBrickBreaker.HEIGHT - totalHeight) / 2;
            textLines.forEach((line, index) => {
                _this.offscreenCtx.fillText(
                    line,
                    RainbowBrickBreaker.WIDTH / 2,
                    startY + lineHeight * index
                );
            });
            _this.ctx.drawImage(_this.offscreenCanvas, 0, 0);
        } else {
            _this.animationFrameId = requestAnimationFrame(() => _this.update());
        }
    }

    /**
     * Checks if a point lies within a given rectangle.
     * @param {Object} Rect - The rectangle to test, with properties x (left), y (top), width, and height.
     * @param {Object} Point - The point to test, with properties x and y.
     * @returns {boolean} Returns true if the point is inside the rectangle, false otherwise.
     */
    static hitTestPoint(Rect, Point) {
        if (Point.x >= Rect.x && Point.x <= Rect.x + Rect.width && Point.y >= Rect.y && Point.y <= Rect.y + Rect.height) {
            return true;
        } else {
            return false;
        }
    }
}

const game = new RainbowBrickBreaker()
document.addEventListener("DOMContentLoaded", () => { game.update() });


/**
 * Converts an HSV color value to RGB.
 * @param {number} h - Hue component of the color.
 * @param {number} s - Saturation component of the color.
 * @param {number} v - Value component of the color.
 * @returns {number[]} The RGB representation of the color.
 */
function hsv2rgb(h, s, v) {
    let f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return [f(5) * 255, f(3) * 255, f(1) * 255];
}