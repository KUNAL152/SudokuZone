let selectedCell = null;
// Handle cell click
document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', function() {
        document.querySelectorAll('.cell').forEach(c => {
            c.classList.remove('current');
            c.classList.remove('not-in');
            c.classList.remove('same-num');
        });

        this.classList.add('current');
        selectedCell = this;

        // Get row and column of the selected cell
        const selectedRow = parseInt(this.dataset.row);
        const selectedCol = parseInt(this.dataset.col);
        const num = parseInt(this.innerText);
        highlight(selectedRow,selectedCol,num);
    });
});

// Highlight the row, column, and 3x3 grid
function highlight(row, col, num) {
    const cells = document.querySelectorAll('.cell');
    // Highlight the row and column
    cells.forEach(cell => {
        const cellRow = parseInt(cell.dataset.row);
        const cellCol = parseInt(cell.dataset.col);
        const cellNum = parseInt(cell.innerText);

        if (cellNum === num){
            cell.classList.add('same-num');
        }

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