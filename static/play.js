let mistakes = 0;
let score = 0;
let time = 0;
let timerInterval;


// Create an empty 9x9 array (2D array) for the Sudoku board
let board = Array(9).fill().map(() => Array(9).fill(0));
let selectedCell = document.querySelector('.cell[data-row="0"][data-col="0"]');

// Populate the board using the cells from the DOM
document.querySelectorAll('.cell').forEach(cell => {
    const cellRow = parseInt(cell.dataset.row);
    const cellCol = parseInt(cell.dataset.col);
    const value = parseInt(cell.innerText) || 0;
    board[cellRow][cellCol] = value;
    if (cellRow === 0 && cellCol === 0) {
        cell.classList.add('current');
        highlight(cellRow, cellCol);
        if (value != 0) {
            highlight_samenum(value);
        }
    }
});

function erase() {
    if (selectedCell && !selectedCell.classList.contains('pre-filled')) {
        document.querySelectorAll('.cell').forEach(c => {
            if (c === selectedCell) {
                c.classList.remove('wrong');
            }
            c.classList.remove('same-num');
        });
        selectedCell.innerText = '';
        selectedCell = null;
    }
}

function disable(num) {
    let count = 0
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        const cellNum = parseInt(cell.innerText);
        if (cellNum === num) {
            count++;
        }
        if (count === 9) {
            const buttons = document.querySelectorAll('.numpad button');
            buttons.forEach(btn => {
                const number = parseInt(btn.innerText);
                if (num === number) {
                    btn.disabled = true;
                }
            });
        }
    });
}

// Highlight the row, column, and 3x3 grid
function highlight(row, col) {
    const cells = document.querySelectorAll('.cell');
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
    cell = document.querySelectorAll('.cell');
    cell.forEach(cell => {
        if (num === parseInt(cell.innerText)) {
            cell.classList.add('same-num');
        }
    });
}

document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', function () {
        document.querySelectorAll('.cell').forEach(c => {
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

document.querySelectorAll('.numpad button').forEach(btn => {
    btn.addEventListener('click', function () {
        const num = parseInt(this.innerText);
        if (selectedCell && !selectedCell.classList.contains('pre-filled')) {
            document.querySelectorAll('.cell').forEach(c => {
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
                    selectedCell.innerText = num;
                    highlight_samenum(num);
                    if (data.correct) {
                        selectedCell.classList.remove('wrong');
                        disable(num);
                    } else {
                        selectedCell.classList.add('wrong');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    });
});