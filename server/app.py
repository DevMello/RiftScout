import os
import uuid
import time
import threading
from flask import Flask, request, jsonify, render_template
import easyocr
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app) 

reader = easyocr.Reader(['en'])

TEMP_FILE_DIR = 'temp_files'

os.makedirs(TEMP_FILE_DIR, exist_ok=True)

def detect_text(image_path):
    """Detect text in an image using EasyOCR."""
    results = reader.readtext(image_path)

    if not results:
        print("No text found in the image.")
        return []

    raw_text = " ".join([result[1] for result in results])
    return raw_text

def clean_text(raw_text):
    """Clean up the OCR text to extract the match data."""
    cleaned_text = re.sub(r'[^a-zA-Z0-9\s]', '', raw_text)
    words = cleaned_text.split()
    numbers = [word for word in words if word.isdigit()]

    if len(numbers) % 4 != 0:
        print(f"Warning: The number of numbers in the text is not divisible by 4. {len(numbers)} elements found.")
    
    matches = []
    for i in range(0, len(numbers), 4):
        red_team = numbers[i:i+2]
        blue_team = numbers[i+2:i+4]
        matches.append({'redTeam': red_team, 'blueTeam': blue_team})
    
    return matches

def filter_matches_by_team(matches, team_number):
    """Filter the matches to only include those that contain the specified team number."""
    filtered_matches = []
    for match in matches:
        if team_number in match['redTeam'] or team_number in match['blueTeam']:
            filtered_matches.append(match)
    return filtered_matches

def delete_file_after_delay(file_path, delay=30):
    """Delete the uploaded file after a specified delay (default 30 seconds)."""
    time.sleep(delay)
    if os.path.exists(file_path):
        os.remove(file_path)
        print(f"Deleted {file_path}")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/process_image', methods=['POST'])
def process_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    team_number = request.form.get('team_number')

    if not team_number or not team_number.isdigit():
        return jsonify({'error': 'Invalid team number'}), 400
    
    file_id = str(uuid.uuid4())
    file_path = os.path.join(TEMP_FILE_DIR, f'{file_id}.jpg')
    
    file.save(file_path)
   
    raw_text = detect_text(file_path)

    if not raw_text:
        return jsonify({'error': 'No text detected in image'}), 400
    
    matches = clean_text(raw_text)
    
    filtered_matches = filter_matches_by_team(matches, team_number)
    
    threading.Thread(target=delete_file_after_delay, args=(file_path, 30)).start()

    return jsonify({'filtered_matches': filtered_matches})

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
