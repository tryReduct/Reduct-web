from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from twelvelabs_upload import run_upload_process
import threading

# load environment variables
load_dotenv()
PORT = os.getenv('PORT', 5000)

# initialize flask app
app = Flask(__name__)

# configure CORS
CORS(app)

# Configure upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Supported formats dictionary
SUPPORTED_FORMATS = {
    "Video": [
        "mp4", "mov", "mxf", "avi", "mkv", "flv", "mpeg", "mpg", "m4v",
        "wmv", "3gp", "vob", "mts", "m2ts", "webm", "r3d", "xavc"
    ],
    "Audio": [
        "mp3", "wav", "aac", "aiff", "ogg", "m4a", "wma"
    ],
    "Image": [
        "jpg", "jpeg", "png", "gif", "bmp", "tiff", "tif", "psd", "heic"
    ],
    "Sequence & Project Files": [
        "prproj", "xml", "aaf", "edl", "omf"
    ],
    "Camera Raw Formats": [
        "cr2", "nef", "dng", "arw", "orf", "rw2"
    ]
}

# Flatten into a single set
ALLOWED_EXTENSIONS = set()
for formats in SUPPORTED_FORMATS.values():
    ALLOWED_EXTENSIONS.update(formats)

def allowed_file(filename):
    filename = filename.strip()
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def trigger_twelvelabs_upload():
    """
    Trigger TwelveLabs upload process in a separate thread
    """
    thread = threading.Thread(target=run_upload_process)
    thread.daemon = True
    thread.start()

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        
        # Trigger TwelveLabs upload process
        trigger_twelvelabs_upload()
        
        return jsonify({
            'message': 'File uploaded successfully and queued for TwelveLabs processing',
            'filename': filename,
            'path': file_path
        }), 200
    
    return jsonify({'error': 'File type not allowed'}), 400

if __name__ == '__main__':
    app.run(debug=True, port=PORT)
