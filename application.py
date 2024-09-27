from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

import random

def generate_sudoku(remove_count):
    global Solution
    board = [[0]*9 for _ in range(9)]
    for i in range(0, 9, 3):
        fill_3x3(board, i, i)
    
    solve(board)

    # Copy the solved board before removing cells
    Solution = [row[:] for row in board]  
    
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

# Solve with random number choices to introduce randomness
def solve(board):
    for row in range(9):
        for col in range(9):
            if board[row][col] == 0:
                nums = list(range(1, 10))
                random.shuffle(nums)  
                for num in nums:
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
def play():
    remove_count = 0 
    difficulty = request.args.get('difficulty', 'easy')
    if difficulty == 'master':
        remove_count = random.randint(52, 56)
    elif difficulty == 'expert':
        remove_count = random.randint(49, 53)
    elif difficulty == 'hard':
        remove_count = random.randint(46, 50)
    elif difficulty == 'medium':
        remove_count = random.randint(43, 47)
    elif difficulty == 'easy':
        remove_count = random.randint(40, 44)

    board = generate_sudoku(remove_count)
    return render_template('play.html', board=board)


@app.route('/validate', methods=['POST'])
def validate_cell():
    data = request.get_json()
    row = data['row']
    col = data['col']
    number = data['number']

    # Solve the board for checking move
    correct_number = Solution[row][col]

    # Compare user input with the correct solution
    if number == correct_number:
        return jsonify({'correct': True})
    else:
        return jsonify({'correct': False})
        
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)