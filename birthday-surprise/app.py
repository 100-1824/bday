from flask import Flask, render_template, jsonify, send_from_directory, request
import json
import os
import glob
from datetime import datetime
import time
from werkzeug.utils import secure_filename


from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///birthday.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Models
class MediaItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    url = db.Column(db.String(500), nullable=False)
    media_type = db.Column(db.String(50), nullable=False) # 'image', 'video'
    category = db.Column(db.String(50), nullable=False) # 'gallery', 'nails', 'private'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255))
    text = db.Column(db.Text, nullable=False)
    image = db.Column(db.String(255))
    category = db.Column(db.String(50), default='notes')
    is_user_note = db.Column(db.Boolean, default=False)
    created_at_usec = db.Column(db.BigInteger) # To match Keep timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class VisionBoard(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    image = db.Column(db.String(500))
    placeholder_color = db.Column(db.String(50), default='#E1BEE7')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class BibleVerse(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ref = db.Column(db.String(255), nullable=False)
    text = db.Column(db.Text, nullable=False)
    theme = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# Upload Configuration
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'mov', 'webm'}
GALLERY_UPLOAD_FOLDER = os.path.join('static', 'images', 'WhatsApp Unknown 2026-01-25 at 2.47.31 AM')
PRIVATE_UPLOAD_FOLDER = os.path.join('static', 'images', 'private')

# Ensure upload directories exist
os.makedirs(GALLERY_UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PRIVATE_UPLOAD_FOLDER, exist_ok=True)

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
VISION_BOARDS_FILE = "vision_boards.json"
VERSES_FILE = "verses.json"

def load_data_file(filepath):
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return []
    return []

def save_data_file(filepath, data):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def allowed_file(filename, file_type='image'):
    """Check if file extension is allowed"""
    if '.' not in filename:
        return False
    ext = filename.rsplit('.', 1)[1].lower()
    if file_type == 'image':
        return ext in ALLOWED_IMAGE_EXTENSIONS
    elif file_type == 'video':
        return ext in ALLOWED_VIDEO_EXTENSIONS
    return False


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


@app.route('/')
def index():
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


# --- MIGRATION LOGIC ---

def migrate_data():
    with app.app_context():
        db.create_all()
        
        # 1. Migrate Vision Boards
        if not VisionBoard.query.first():
            boards = load_data_file(VISION_BOARDS_FILE)
            if not boards:
                boards = [
                    { "id": 1, "title": "Bible Vision Board", "image": "/assets/images/vision-board.jpg", "placeholder_color": "#E1BEE7" },
                    { "id": 2, "title": "Church & Home", "image": "/assets/images/church-home-board.jpg", "placeholder_color": "#C5CAE9" }
                ]
            for b_data in boards:
                b = VisionBoard(
                    title=b_data.get('title'),
                    image=b_data.get('image'),
                    placeholder_color=b_data.get('placeholder_color') or b_data.get('placeholderColor')
                )
                db.session.add(b)
        
        # 2. Migrate Bible Verses
        if not BibleVerse.query.first():
            verses = load_data_file(VERSES_FILE)
            if not verses:
                verses = [
                    { "ref": "Numbers 6:24-26", "text": "The Lord bless you and keep you...", "theme": "Blessing" }
                ]
            for v_data in verses:
                v = BibleVerse(ref=v_data.get('ref'), text=v_data.get('text'), theme=v_data.get('theme'))
                db.session.add(v)
        
        # 3. Migrate Notes
        if not Note.query.filter_by(is_user_note=True).first():
            user_notes = load_user_notes()
            for n_data in user_notes:
                n = Note(
                    title=n_data.get('title'),
                    text=n_data.get('text'),
                    image=n_data.get('image'),
                    category=n_data.get('category', 'notes'),
                    is_user_note=True,
                    created_at_usec=n_data.get('created')
                )
                db.session.add(n)
        
        # 4. Migrate/Scan Media
        if not MediaItem.query.first():
            # Gallery
            base_dir = os.path.join(app.root_path, 'static', 'images', 'WhatsApp Unknown 2026-01-25 at 2.47.31 AM')
            if os.path.exists(base_dir):
                for filename in os.listdir(base_dir):
                    if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.mp4', '.mov', '.webm')):
                        url = f"/static/images/WhatsApp Unknown 2026-01-25 at 2.47.31 AM/{filename}"
                        mtype = 'image' if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')) else 'video'
                        m = MediaItem(filename=filename, url=url, media_type=mtype, category='gallery')
                        db.session.add(m)
            # Nails
            nails_dir = os.path.join(app.root_path, 'static', 'images', 'nails')
            if os.path.exists(nails_dir):
                for filename in os.listdir(nails_dir):
                    if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                        url = f"/static/images/nails/{filename}"
                        m = MediaItem(filename=filename, url=url, media_type='image', category='nails')
                        db.session.add(m)
            # Private
            private_dir = os.path.join(app.root_path, 'static', 'images', 'private')
            if os.path.exists(private_dir):
                for filename in os.listdir(private_dir):
                    if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.mp4', '.mov', '.webm')):
                        url = f"/static/images/private/{filename}"
                        mtype = 'image' if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')) else 'video'
                        m = MediaItem(filename=filename, url=url, media_type=mtype, category='private')
                        db.session.add(m)
                        
        db.session.commit()

# --- REFACTORED ENDPOINTS ---

@app.route('/api/notes')
def get_notes():
    # User notes from DB
    db_notes = Note.query.filter_by(is_user_note=True).order_by(Note.created_at.desc()).all()
    user_notes = [{
        'id': n.id,
        'title': n.title,
        'text': n.text,
        'image': n.image,
        'category': n.category,
        'isUserNote': True,
        'created': n.created_at_usec or int(n.created_at.timestamp() * 1000000)
    } for n in db_notes]
    
    # Static notes from Keep
    keep_notes = get_parsed_notes()
    return jsonify(user_notes + keep_notes)

@app.route('/api/notes', methods=['POST'])
def create_note():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'Text is required'}), 400
    
    new_note = Note(
        title=data.get('title', ''),
        text=data['text'],
        category=data.get('category', 'notes'),
        is_user_note=True,
        created_at_usec=int(time.time() * 1000000)
    )
    db.session.add(new_note)
    db.session.commit()
    
    return jsonify({
        'id': new_note.id,
        'title': new_note.title,
        'text': new_note.text,
        'created': new_note.created_at_usec,
        'isUserNote': True
    }), 201

@app.route('/api/notes/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    note = Note.query.get(note_id)
    if note:
        db.session.delete(note)
        db.session.commit()
        return jsonify({'success': True}), 200
    return jsonify({'error': 'Note not found'}), 404

@app.route('/api/media')
def get_media():
    items = MediaItem.query.all()
    print(f"DEBUG: Found {len(items)} total media items in DB")
    media = {"images": [], "videos": [], "nails": []}
    for item in items:
        if item.category == 'gallery':
            if item.media_type == 'image':
                media["images"].append(item.url)
            else:
                media["videos"].append(item.url)
        elif item.category == 'nails':
            media["nails"].append(item.url)
    return jsonify(media)

@app.route('/api/media', methods=['DELETE'])
def delete_media():
    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({'error': 'URL is required'}), 400
    
    url = data['url']
    print(f"DEBUG: Deleting media with URL: '{url}'")
    
    # Try exact match
    item = MediaItem.query.filter_by(url=url).first()
    
    # Try leading slash variation
    if not item:
        alt_url = url[1:] if url.startswith('/') else '/' + url
        item = MediaItem.query.filter_by(url=alt_url).first()
        if item:
            print(f"DEBUG: Found item with alt URL: '{alt_url}'")

    # Try decoded variation (if URL encoded with %20 etc)
    if not item:
        from urllib.parse import unquote
        decoded_url = unquote(url)
        if decoded_url != url:
            item = MediaItem.query.filter_by(url=decoded_url).first()
            if not item:
                alt_decoded = decoded_url[1:] if decoded_url.startswith('/') else '/' + decoded_url
                item = MediaItem.query.filter_by(url=alt_decoded).first()
            if item:
                print(f"DEBUG: Found item with decoded URL: '{decoded_url}'")
    
    if not item:
        print(f"DEBUG: Item not found in DB for URL: '{url}'")
        # Check if file exists anyway
        filepath = url.lstrip('/')
        if os.path.exists(filepath):
            print(f"DEBUG: File exists on disk but not in DB: '{filepath}'")
            try:
                os.remove(filepath)
                return jsonify({'success': True, 'message': 'File deleted from disk (not in DB)'}), 200
            except Exception as e:
                return jsonify({'error': f'Disk delete failed: {str(e)}'}), 500
        return jsonify({'error': 'Item not found in database or disk'}), 404

    # Delete file from disk
    filepath = item.url.lstrip('/')
    if os.path.exists(filepath):
        try:
            os.remove(filepath)
            print(f"DEBUG: Deleted file from disk: '{filepath}'")
        except Exception as e:
            print(f"DEBUG: Failed to delete file from disk: '{filepath}', error: {e}")
    else:
        print(f"DEBUG: File not found on disk: '{filepath}' (deleting from DB anyway)")
            
    db.session.delete(item)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Deleted from DB and disk'}), 200

@app.route('/api/upload/gallery', methods=['POST'])
def upload_to_gallery():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    file_type = request.form.get('type', 'image')
    
    if file.filename == '' or not allowed_file(file.filename, file_type):
        return jsonify({'error': 'Invalid file'}), 400
    
    try:
        filename = secure_filename(file.filename)
        name, ext = os.path.splitext(filename)
        filename = f"{name}_{int(time.time())}{ext}"
        filepath = os.path.join(GALLERY_UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        url = f"/{GALLERY_UPLOAD_FOLDER}/{filename}".replace('\\', '/')
        new_item = MediaItem(filename=filename, url=url, media_type=file_type, category='gallery')
        db.session.add(new_item)
        db.session.commit()
        
        return jsonify({'success': True, 'url': url}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/inspiration/vision', methods=['GET'])
def get_vision_boards():
    boards = VisionBoard.query.all()
    return jsonify([{
        'id': b.id,
        'title': b.title,
        'image': b.image,
        'placeholderColor': b.placeholder_color
    } for b in boards])

@app.route('/api/inspiration/vision', methods=['POST'])
def add_vision_board():
    data = request.get_json()
    new_board = VisionBoard(
        title=data.get('title'),
        image=data.get('image'),
        placeholder_color=data.get('placeholderColor', '#E1BEE7')
    )
    db.session.add(new_board)
    db.session.commit()
    return jsonify({'id': new_board.id}), 201

@app.route('/api/inspiration/verses', methods=['GET'])
def get_verses():
    verses = BibleVerse.query.all()
    return jsonify([{
        'id': v.id,
        'ref': v.ref,
        'text': v.text,
        'theme': v.theme
    } for v in verses])

@app.route('/api/inspiration/verses', methods=['POST'])
def add_verse():
    data = request.get_json()
    new_verse = BibleVerse(ref=data.get('ref'), text=data.get('text'), theme=data.get('theme'))
    db.session.add(new_verse)
    db.session.commit()
    return jsonify({'id': new_verse.id}), 201

@app.route('/api/inspiration/verses/<int:verse_id>', methods=['DELETE'])
def delete_verse_by_id(verse_id):
    v = BibleVerse.query.get(verse_id)
    if v:
        db.session.delete(v)
        db.session.commit()
        return jsonify({'success': True}), 200
    return jsonify({'error': 'Verse not found'}), 404

if __name__ == '__main__':
    migrate_data() # Run migration on start
    app.run(debug=True, host='0.0.0.0', port=5000)
