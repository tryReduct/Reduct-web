from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

# load environment variables
load_dotenv()
PORT = os.getenv('PORT')

# initialize flask app
app = Flask(__name__)

# configure CORS
CORS(app)



if __name__ == '__main__':
    app.run(debug=True, port=PORT)
