from flask import Flask,render_template

app = Flask(__name__)

@app.route('/')
def index():
  return render_template('home.html')

@app.route('/login')
def login():
  return render_template('home.html')

@app.route('/play')
def play():
  return render_template('play.html')

@app.route('/leaderboard')
def lead():
  return render_template('leaderboard.html')

if __name__=='__main__':
  app.run(host='0.0.0.0', port=8080, debug=True)
