from flask import Flask, render_template, jsonify, request, session
import random

app = Flask(__name__)
app.secret_key = '14112002'



def generate_sudoku(remove_count):
    board = [[0]*9 for _ in range(9)]
    # Randomly fill diagonal 3x3 grids to ensure validity
    for i in range(0, 9, 3):
        fill_3x3(board, i, i)
    # Solve the board (simple backtracking to fill it completely)
    solve(board)
    # Copy the solution before removing cells
    solution = [row[:] for row in board]
    # Remove some cells to create a puzzle
    remove_cells(board, remove_count)  
    return board, solution

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
    board,solution = generate_sudoku(remove_count)
    session['board'] = board
    session['solution'] = solution
    session['history'] = [board]
    
    return render_template('play.html', board=board, solution=solution)


@app.route('/submit_move', methods=['POST'])
def submit_move():
        data = request.get_json()
        row = int(data['row'])
        col = int(data['col'])
        value = int(data['value'])

        board = session.get('board')
        solution = session.get('solution')
        history = session.get('history', [])

        if board[row][col] == 0 and solution[row][col] == value:
            # Save the current board state to the history stack before updating
            history.append(copy.deepcopy(board))  # Use deep copy here
            session['history'] = history

            # Update the board with the correct move
            board[row][col] = value
            session['board'] = board
            return jsonify(success=True, message="Correct move!")
        else:
            return jsonify(success=False, message="Incorrect move.")

@app.route('/undo_move', methods=['POST'])
def undo_move():
    history = session.get('history', [])
    if len(history) > 1:
        # Remove the latest state and revert to the previous one
        history.pop()
        board = history[-1]  # Get the last state after popping
        session['board'] = board
        session['history'] = history
        return jsonify(success=True, board=board)
    else:
        return jsonify(success=False, message="No moves to undo.")

@app.route('/leaderboard')
def lead():
  return render_template('leaderboard.html')

@app.route('/login')
def login():
  return render_template('login.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
