// Create an empty 9x9 array (2D array) for the Sudoku board
let board = Array(9).fill().map(() => Array(9).fill(0));
let selectedCell = document.querySelector('.cell[data-row="0"][data-col="0"]');
let mistakeCount = 0;
let timerInterval;
let gameStart = false;

// Start the timer
function startTimer() {
    if (!gameStart) {
        gameStart = true;
        let seconds = 0;
        const timerDisplay = document.getElementById('timer');
        timerInterval = setInterval(() => {
            seconds++;
            let min = Math.floor(seconds / 60);
            let sec = seconds % 60;
            timerDisplay.innerText = `Time: ${min}:${sec < 10 ? '0' + sec : sec}`;
        }, 1000);
    }
}

// Stop the timer
function stopTimer() {
    clearInterval(timerInterval);
}

// Game Over function: Check if all cells are filled correctly
// Function to show the popup
function showPopup(message) {
    const popup = document.getElementById('game-over-popup');
    const messageElement = document.getElementById('game-over-message');
    messageElement.innerText = message; // Display the game over message
    popup.classList.remove('hidden'); // Show the popup
}

// Modified checkGameOver function
function checkGameOver() {
    let allCellsCorrect = true;
    cells.forEach(cell => {
        const cellValue = parseInt(cell.innerText);
        const { row, col } = cell.dataset;
        if (!cellValue) {
            allCellsCorrect = false;
        } else {
            fetch('/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ row: parseInt(row), col: parseInt(col), number: cellValue })
            })
                .then(response => response.json())
                .then(data => {
                    if (!data.correct) {
                        countMistakes();
                        allCellsCorrect = false;      // Set allCellsCorrect to false if any cell is incorrect
                    }

                    // Check if the game is over based on conditions
                    if (mistakeCount >= 3) {
                        stopTimer();
                        showPopup("You have made 3 mistakes.\n\t\t Game Over!");
                    } else if (allCellsCorrect) {
                        stopTimer();
                        showPopup("\t\tCongratulations!\nYou've completed the Sudoku.");
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    });
}




// Mistake counter: Increase and display mistakes
function countMistakes() {
    mistakeCount++;
    const mistakeDisplay = document.getElementById('mistake-counter'); // Add this element in HTML
    mistakeDisplay.innerText = `Mistakes: ${mistakeCount}/3`;
}

// Cache cell and numpad buttons for performance
const cells = document.querySelectorAll('.cell');
const numpadButtons = document.querySelectorAll('.numpad button');

// Populate the board using the cells from the DOM
cells.forEach(cell => {
    const { row, col } = cell.dataset;
    const value = Number(cell.innerText) || 0;
    board[row][col] = value;

    if (row === "0" && col === "0") {
        cell.classList.add('current');
        highlight(+row, +col);
        if (value !== 0) {
            highlight_samenum(value);
        }
    }
    startTimer();
});

// Erase current selected cell (if not pre-filled)
function erase() {
    if (selectedCell && !selectedCell.classList.contains('pre-filled')) {
        cells.forEach(cell => {
            cell.classList.remove('same-num');
        });
        selectedCell.innerText = '';
        selectedCell.classList.remove('wrong')
    }
}

// Disable the numpad button if the number is used 9 times
function disable(num) {
    let count = 0;
    cells.forEach(cell => {
        if (parseInt(cell.innerText) === num && !cell.classList.contains('wrong'))
            count++;
    });
    if (count === 9) {
        numpadButtons.forEach(btn => {
            const number = parseInt(btn.innerText);
            if (num === number) {
                btn.disabled = true;
            }
        });
    }
}

// Highlight the row, column, and 3x3 grid
function highlight(row, col) {
    cells.forEach(cell => {
        const cellRow = parseInt(cell.dataset.row);
        const cellCol = parseInt(cell.dataset.col);
        if (cellRow === row || cellCol === col) {
            cell.classList.add('not-in');
        }
        // Highlight the 3x3 grid
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        if (cellRow >= startRow && cellRow < startRow + 3 && cellCol >= startCol && cellCol < startCol + 3) {
            cell.classList.add('not-in');
        }
    });
}

function highlight_samenum(num) {
    cells.forEach(cell => {
        if (num === parseInt(cell.innerText)) {
            cell.classList.add('same-num');
        }
    });
}

cells.forEach(cell => {
    cell.addEventListener('click', function () {
        cells.forEach(c => {
            c.classList.remove('current');
            c.classList.remove('not-in');
            c.classList.remove('same-num');
        });
        this.classList.add('current');
        selectedCell = this;
        const selectedRow = parseInt(this.dataset.row);
        const selectedCol = parseInt(this.dataset.col);
        highlight(selectedRow, selectedCol);
        // checkLast(selectedRow,selectedCol);
        const num = parseInt(this.innerText);
        highlight_samenum(num);
    });
});

numpadButtons.forEach(btn => {
    btn.addEventListener('click', function () {
        const num = parseInt(this.innerText);
        if (selectedCell && !selectedCell.classList.contains('pre-filled')) {
            cells.forEach(c => {
                c.classList.remove('same-num');
            });
            const row = parseInt(selectedCell.dataset.row);
            const col = parseInt(selectedCell.dataset.col);

            fetch('/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    row: row,
                    col: col,
                    number: num,
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.correct) {
                        selectedCell.classList.remove('wrong');
                    } else {
                        selectedCell.classList.add('wrong');
                    }
                    selectedCell.innerText = num;
                    checkGameOver();
                    highlight_samenum(num);
                    disable(num);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    });
});
