from flask import Flask, render_template, jsonify, send_from_directory, request
import json
import os
import glob
from datetime import datetime
import time


app = Flask(__name__)

# --- CONFIGURATION & DATA (EDIT HERE) ---
HER_NAME = "My Love"
YOUR_CITY_COORDS = [40.7128, -74.0060]  # Example: New York
HER_CITY_COORDS = [48.8566, 2.3522]    # Example: Paris
YOUR_CITY_NAME = "New York"
HER_CITY_NAME = "Paris"

# Configuration
KEEP_EXPORT_DIR = "keep_export/Takeout/Keep" # Updated path
KEEP_LABEL = "BirthdayNotes"
USER_NOTES_FILE = "user_notes.json"  # File to store user-created notes


def load_user_notes():
    """Load user-created notes from JSON file"""
    if os.path.exists(USER_NOTES_FILE):
        try:
            with open(USER_NOTES_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return []
    return []

def save_user_notes(notes):
    """Save user-created notes to JSON file"""
    with open(USER_NOTES_FILE, 'w', encoding='utf-8') as f:
        json.dump(notes, f, ensure_ascii=False, indent=2)


# Data Structure: Each note is now a dictionary { "text": "...", "image": "filename.jpg" (optional) }
REASONS_I_LOVE_YOU = [
    {
        "text": "Happy New Year my baby boy 🤭🩷\nAs I look back, we've grown a lot as a couple this year, we fought we fixed we stayed.\nLast year this day I was really convinced that I don't matter much to you but as time went by I came to realise that being the first one to wish on new year doesn't really define my importance in your life, if doesn't state whether you're going to be the person who sticks around throughout the year. So this year I won't expect that from your end but yes I'm more into such things (I've made it pretty obvious by now 😶‍🌫️) that is why I'm writing it here!\n\nI wish and pray that God listens to your prayers, you lead an even healthier life this year, I wish and pray you get to achieve all of that you've wished for Umair.\nI pray that God keeps you safe from everything that comes in your way (even if it's me) 🥺\n\nI pray that we both grow even more in love and patience and understanding.\nI pray that we make past this year too and many more that's to come.\nI LOVE YOU UMAIR 🩷",
        "image": "new_year.jpg"
    },
    {"text": "Your laugh is my favorite sound."},
    {"text": "The way you scrunch your nose when you're thinking."},
    {"text": "How you always support my dreams."},
    {"text": "Your kindness to strangers."},
    {"text": "The way you look at me."},
    {"text": "Our late night video calls."},
    {"text": "Your amazing taste in music."},
    {"text": "How hard you work."},
    {"text": "Your warm hugs (even virtual ones feel warm)."},
    {"text": "Just being you."}
]


@app.route('/api/notes')
def get_notes():
    notes = get_parsed_notes()
    # Add user-created notes at the beginning
    user_notes = load_user_notes()
    return jsonify(user_notes + notes)

@app.route('/api/notes', methods=['POST'])
def create_note():
    """Create a new note"""
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'Text is required'}), 400
    
    new_note = {
        'title': data.get('title', ''),
        'text': data['text'],
        'created': int(time.time() * 1000000),  # Microseconds like Keep notes
        'image': None,
        'isUserNote': True  # Mark as user-created
    }
    
    user_notes = load_user_notes()
    user_notes.insert(0, new_note)  # Add to beginning
    save_user_notes(user_notes)
    
    return jsonify(new_note), 201

# Helper to look for Angular's index.html if we were serving static build
# For dev, we use the proxy in Angular CLI.
@app.route('/')
def index():
    # If using typical Angular build output in static/frontend
    # return send_from_directory('static/frontend', 'index.html')
    # But since we are likely developing, we can just return a message or redirect
    return "Please visit port 4200 for the Angular App (Frontend)"
    
    try:
        # Check if directory exists
        if os.path.exists(KEEP_EXPORT_DIR):
            json_files = glob.glob(os.path.join(KEEP_EXPORT_DIR, "*.json"))
            
            parsed_notes = []
            
            for file_path in json_files:
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        
                        # Check for trash/archive if we care, or just labels
                        # Google Keep JSON usually has "labels": [{"name": "LabelName"}]
                        labels = [l['name'] for l in data.get('labels', [])]
                        
                        if KEEP_LABEL in labels and not data.get('isTrashed', False):
                            # Extract Content
                            content = data.get('textContent', '')
                            
                            # Handle Lists (Checkboxes)
                            if not content and 'listContent' in data:
                                items = [item.get('text', '') for item in data['listContent']]
                                content = "\n".join(items)
                            
                            # Handle Images (Attachments)
                            image_filename = None
                            if 'attachments' in data:
                                for att in data['attachments']:
                                    if 'image' in att.get('mimetype', ''):
                                        # Takeout often puts images in the same folder
                                        # We accept the first image found
                                        image_filename = att.get('filePath') 
                                        break

                            if content.strip() or image_filename:
                                note_obj = {
                                    "text": content,
                                    "created": int(data.get('createdTimestampUsec', 0)),
                                    "image": image_filename
                                }
                                parsed_notes.append(note_obj)
                                
                except Exception as e:
                    print(f"Skipping file {file_path}: {e}")

            # Sort by creation time (Oldest first usually tells a story, or Newest)
            # Sorting by created timestamp
            parsed_notes.sort(key=lambda x: x['created'])
            
            if parsed_notes:
                print(f"Loaded {len(parsed_notes)} notes from {KEEP_EXPORT_DIR}")
                # Append to our list
                reasons_list.extend(parsed_notes)
            else:
                print(f"No notes found with label '{KEEP_LABEL}' in {KEEP_EXPORT_DIR}")
                
        else:
            print(f"Export directory '{KEEP_EXPORT_DIR}' not found.")
            
    except Exception as e:
        print(f"Error loading local notes: {e}")

    return render_template('index.html', 
                         name=HER_NAME,
                         my_city=YOUR_CITY_NAME,
                         her_city=HER_CITY_NAME,
                         my_coords=YOUR_CITY_COORDS,
                         her_coords=HER_CITY_COORDS,
                         reasons=reasons_list)

def get_parsed_notes():
    """Helper to parse notes from JSON with categories"""
    parsed_notes = []
    if os.path.exists(KEEP_EXPORT_DIR):
        json_files = glob.glob(os.path.join(KEEP_EXPORT_DIR, "*.json"))
        for file_path in json_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                    content = data.get('textContent', '')
                    if not content and 'listContent' in data:
                        items = [item.get('text', '') for item in data['listContent']]
                        content = "\n".join(items)
                    
                    image_filename = None
                    if 'attachments' in data:
                        for att in data['attachments']:
                            if 'image' in att.get('mimetype', ''):
                                image_filename = att.get('filePath')
                                break
                    
                    # Extract labels/categories
                    labels = [l['name'] for l in data.get('labels', [])]
                    
                    # Categorize based on labels
                    category = 'all'  # Default
                    if any('Letters' in l for l in labels):
                        category = 'letters'
                    elif any('Poems' in l for l in labels):
                        category = 'poems'
                    elif any('Reasons' in l for l in labels):
                        category = 'reasons'
                    elif any('Notes' in l for l in labels):
                        category = 'notes'
                    
                    title = data.get('title', '')

                    if content.strip() or image_filename or title:
                        parsed_notes.append({
                            "title": title,
                            "text": content,
                            "created": int(data.get('createdTimestampUsec', 0)),
                            "image": image_filename,
                            "labels": labels,
                            "category": category
                        })
            except:
                pass
    
    # Sort by creation (newest first)
    parsed_notes.sort(key=lambda x: x['created'], reverse=True)
    return parsed_notes

@app.route('/notes')
def notes_page():
    all_notes = get_parsed_notes()
    return render_template('notes.html', notes=all_notes)

from flask import send_from_directory
@app.route('/note-image/<path:filename>')
def serve_note_image(filename):
    return send_from_directory(KEEP_EXPORT_DIR, filename)

@app.route('/api/note-image/<path:filename>')
def serve_note_image_api(filename):
    return send_from_directory(KEEP_EXPORT_DIR, filename)


@app.route('/api/media')
def get_media():
    base_dir = os.path.join(app.root_path, 'static', 'images', 'WhatsApp Unknown 2026-01-25 at 2.47.31 AM')
    nails_dir = os.path.join(app.root_path, 'static', 'images', 'nails')
    
    media = {
        "images": [],
        "videos": [],
        "nails": []
    }
    
    # Main gallery images
    if os.path.exists(base_dir):
        for filename in os.listdir(base_dir):
            file_path = os.path.join(base_dir, filename)
            if not os.path.isfile(file_path):
                continue
                
            file_url = f"/static/images/WhatsApp Unknown 2026-01-25 at 2.47.31 AM/{filename}"
            
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                media["images"].append(file_url)
            elif filename.lower().endswith(('.mp4', '.mov', '.webm')):
                media["videos"].append(file_url)
    
    # Nails images
    if os.path.exists(nails_dir):
        for filename in os.listdir(nails_dir):
            file_path = os.path.join(nails_dir, filename)
            if not os.path.isfile(file_path):
                continue
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                media["nails"].append(f"/static/images/nails/{filename}")
            
    return jsonify(media)

# Private media with password protection
PRIVATE_PASSWORD = "3001"

@app.route('/api/private/verify', methods=['POST'])
def verify_private_password():
    """Verify password for private gallery access"""
    data = request.get_json()
    password = data.get('password', '')
    
    if password == PRIVATE_PASSWORD:
        return jsonify({'success': True})
    return jsonify({'success': False, 'error': 'Wrong password'}), 401

@app.route('/api/private/media', methods=['POST'])
def get_private_media():
    """Get private media (requires password in request)"""
    data = request.get_json()
    password = data.get('password', '')
    
    if password != PRIVATE_PASSWORD:
        return jsonify({'error': 'Unauthorized'}), 401
    
    private_dir = os.path.join(app.root_path, 'static', 'images', 'private')
    
    media = {
        "images": [],
        "videos": []
    }
    
    if os.path.exists(private_dir):
        for filename in os.listdir(private_dir):
            file_path = os.path.join(private_dir, filename)
            if not os.path.isfile(file_path):
                continue
            file_url = f"/static/images/private/{filename}"
            
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                media["images"].append(file_url)
            elif filename.lower().endswith(('.mp4', '.mov', '.webm')):
                media["videos"].append(file_url)
    
    return jsonify(media)

# Serve Angular App (Assuming build output will be in static/frontend or similar)
# For now, just a placeholder or we can setup a route that returns the angular index.html
# once it is built.
@app.route('/gallery')
def gallery_page():
     return render_template('gallery_index.html') # We will need to create this or point to angular dist

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
