// `scripts/src/main/resources/userscripts/tetris.user.js`

// ==UserScript==
// @name         Tetris Game
// @version      1.2
// @description  Adds a Tetris game to the webpage with resizable window and restart functionality
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Create game container
    const gameContainer = document.createElement('div');
    gameContainer.style.position = 'fixed';
    gameContainer.style.top = '50%';
    gameContainer.style.left = '50%';
    gameContainer.style.transform = 'translate(-50%, -50%)';
    gameContainer.style.width = '400px'; // Increased initial width
    gameContainer.style.height = '800px'; // Increased initial height
    gameContainer.style.backgroundColor = 'black';
    gameContainer.style.zIndex = '10000';
    gameContainer.style.resize = 'both'; // Make the container resizable
    gameContainer.style.overflow = 'auto'; // Ensure content is visible when resized
    document.body.appendChild(gameContainer);

    // Create canvas for Tetris game
    const canvas = document.createElement('canvas');
    canvas.width = 400; // Match initial width
    canvas.height = 800; // Match initial height
    gameContainer.appendChild(canvas);
    const context = canvas.getContext('2d');

    // Create speed control
    const speedControl = document.createElement('input');
    speedControl.type = 'range';
    speedControl.min = '100';
    speedControl.max = '1000';
    speedControl.value = '500';
    speedControl.style.position = 'fixed';
    speedControl.style.top = '10px';
    speedControl.style.left = '50%';
    speedControl.style.transform = 'translateX(-50%)';
    document.body.appendChild(speedControl);

    // Create restart button
    const restartButton = document.createElement('button');
    restartButton.textContent = 'Restart Game';
    restartButton.style.position = 'fixed';
    restartButton.style.top = '50px';
    restartButton.style.left = '50%';
    restartButton.style.transform = 'translateX(-50%)';
    document.body.appendChild(restartButton);

    // Tetris game logic
    const COLS = 10;
    const ROWS = 20;
    const BLOCK_SIZE = 40; // Adjusted block size for larger canvas
    const COLORS = ['#ADD8E6', '#87CEEB', '#FFA07A', '#FFFFE0', '#98FB98', '#DDA0DD', '#FFB6C1']; // Softer colors

    const SHAPES = [
        [[1, 1, 1, 1]],
        [[1, 1, 1], [0, 1, 0]],
        [[1, 1, 0], [0, 1, 1]],
        [[0, 1, 1], [1, 1, 0]],
        [[1, 1], [1, 1]],
        [[1, 1, 1], [1, 0, 0]],
        [[1, 1, 1], [0, 0, 1]]
    ];

    let board, currentPiece, gameOver, gameSpeed;

    function initGame() {
        board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        currentPiece = getRandomPiece();
        gameOver = false;
        gameSpeed = 500;
        update();
    }

    function getRandomPiece() {
        const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        return { shape, color, x: 3, y: 0 };
    }

    function drawBoard() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (board[y][x]) {
                    context.fillStyle = board[y][x];
                    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                }
            }
        }
    }

    function drawPiece(piece) {
        piece.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value) {
                    context.fillStyle = piece.color;
                    context.fillRect((piece.x + dx) * BLOCK_SIZE, (piece.y + dy) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                }
            });
        });
    }

    function movePiece(dx, dy) {
        currentPiece.x += dx;
        currentPiece.y += dy;
        if (isCollision()) {
            currentPiece.x -= dx;
            currentPiece.y -= dy;
            return false;
        }
        return true;
    }

    function rotatePiece() {
        const shape = currentPiece.shape;
        const newShape = shape[0].map((_, i) => shape.map(row => row[i]).reverse());
        const oldShape = currentPiece.shape;
        currentPiece.shape = newShape;
        if (isCollision()) {
            currentPiece.shape = oldShape;
        }
    }

    function isCollision() {
        return currentPiece.shape.some((row, dy) => {
            return row.some((value, dx) => {
                const x = currentPiece.x + dx;
                const y = currentPiece.y + dy;
                return value && (x < 0 || x >= COLS || y >= ROWS || board[y] && board[y][x]);
            });
        });
    }

    function mergePiece() {
        currentPiece.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value) {
                    board[currentPiece.y + dy][currentPiece.x + dx] = currentPiece.color;
                }
            });
        });
    }

    function clearLines() {
        board = board.filter(row => row.some(cell => !cell));
        while (board.length < ROWS) {
            board.unshift(Array(COLS).fill(0));
        }
    }

    function dropPiece() {
        if (!movePiece(0, 1)) {
            mergePiece();
            clearLines();
            currentPiece = getRandomPiece();
            if (isCollision()) {
                gameOver = true;
            }
        }
    }

    function update() {
        if (!gameOver) {
            dropPiece();
            drawBoard();
            drawPiece(currentPiece);
            setTimeout(update, gameSpeed);
        } else {
            alert('Game Over');
        }
    }

    document.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') {
            movePiece(-1, 0);
        } else if (event.key === 'ArrowRight') {
            movePiece(1, 0);
        } else if (event.key === 'ArrowDown') {
            dropPiece();
        } else if (event.key === 'ArrowUp') {
            rotatePiece();
        }
        drawBoard();
        drawPiece(currentPiece);
    });

    speedControl.addEventListener('input', event => {
        gameSpeed = 1000 - event.target.value;
    });

    restartButton.addEventListener('click', () => {
        initGame();
    });

    initGame();
})();