from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)



def generate_sudoku(remove_count):
    board = [[0]*9 for _ in range(9)]
    # Randomly fill diagonal 3x3 grids to ensure validity
    for i in range(0, 9, 3):
        fill_3x3(board, i, i)
    # Solve the board (simple backtracking to fill it completely)
    solve(board)
    # Remove some cells to create a puzzle
    remove_cells(board, remove_count)  
    return board

def fill_3x3(board, row, col):
    nums = list(range(1, 10))
    random.shuffle(nums)
    for i in range(3):
        for j in range(3):
            board[row + i][col + j] = nums.pop()

def is_valid(board, row, col, num):
    for i in range(9):
        if board[row][i] == num or board[i][col] == num:
            return False
    start_row, start_col = 3 * (row // 3), 3 * (col // 3)
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False
    return True

def solve(board):
    for row in range(9):
        for col in range(9):
            if board[row][col] == 0:
                for num in range(1, 10):
                    if is_valid(board, row, col, num):
                        board[row][col] = num
                        if solve(board):
                            return True
                        board[row][col] = 0
                return False
    return True

def remove_cells(board, count):
    for _ in range(count):
        row, col = random.randint(0, 8), random.randint(0, 8)
        while board[row][col] == 0:
            row, col = random.randint(0, 8), random.randint(0, 8)
        board[row][col] = 0

@app.route('/')
def index():
    return render_template('home.html')
@app.route('/leaderboard')
def lead():
      return render_template('leaderboard.html')

@app.route('/login')
def login():
      return render_template('login.html')

@app.route('/play')
def play():
    difficulty = request.args.get('difficulty', 'easy')
    if difficulty == 'easy':
        remove_count = random.randint(40,44)
    elif difficulty == 'medium':
        remove_count = random.randint(43,47)
    elif difficulty == 'hard':
        remove_count = random.randint(46,50)
    elif difficulty == 'expert':
        remove_count = random.randint(49,53)
    else:
        remove_count = random.randint(52,56)

    board = generate_sudoku(remove_count)

    return render_template('play.html',board=board)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
