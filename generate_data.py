import os
import json
import glob
import time

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, 'birthday-surprise', 'static')
KEEP_EXPORT_DIR = os.path.join(BASE_DIR, 'birthday-surprise', 'keep_export', 'Takeout', 'Keep')
OUTPUT_DIR = os.path.join(BASE_DIR, 'birthday-surprise', 'video-gallery', 'public', 'assets', 'data')

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

def generate_media_json():
    print("Generating media.json...")
    base_images_dir = os.path.join(STATIC_DIR, 'images', 'WhatsApp Unknown 2026-01-25 at 2.47.31 AM')
    nails_dir = os.path.join(STATIC_DIR, 'images', 'nails')
    
    media = {
        "images": [],
        "videos": [],
        "nails": []
    }
    
    # Process Base Images/Videos
    if os.path.exists(base_images_dir):
        for filename in os.listdir(base_images_dir):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                media["images"].append(f"assets/images/WhatsApp Unknown 2026-01-25 at 2.47.31 AM/{filename}")
            elif filename.lower().endswith(('.mp4', '.mov', '.webm')):
                media["videos"].append(f"assets/images/WhatsApp Unknown 2026-01-25 at 2.47.31 AM/{filename}")
    
    # Process Nails
    if os.path.exists(nails_dir):
        for filename in os.listdir(nails_dir):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                media["nails"].append(f"assets/images/nails/{filename}")
                
    with open(os.path.join(OUTPUT_DIR, 'media.json'), 'w') as f:
        json.dump(media, f, indent=2)
    print(f"media.json created with {len(media['images'])} images, {len(media['videos'])} videos, {len(media['nails'])} nails.")

def generate_private_media_json():
    print("Generating private_media.json...")
    private_dir = os.path.join(STATIC_DIR, 'images', 'private')
    
    media = {
        "images": [],
        "videos": []
    }
    
    if os.path.exists(private_dir):
        for filename in os.listdir(private_dir):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                media["images"].append(f"assets/images/private/{filename}")
            elif filename.lower().endswith(('.mp4', '.mov', '.webm')):
                media["videos"].append(f"assets/images/private/{filename}")
                
    with open(os.path.join(OUTPUT_DIR, 'private_media.json'), 'w') as f:
        json.dump(media, f, indent=2)
    print(f"private_media.json created with {len(media['images'])} private images.")

def generate_notes_json():
    print("Generating notes.json...")
    parsed_notes = []
    
    # 1. Custom 'Reasons I Love You' (Hardcoded in app.py previously)
    REASONS_I_LOVE_YOU = [
        {
            "text": "Happy New Year my baby boy 🤭🩷\nAs I look back, we've grown a lot as a couple this year, we fought we fixed we stayed.\nLast year this day I was really convinced that I don't matter much to you but as time went by I came to realise that being the first one to wish on new year doesn't really define my importance in your life, if doesn't state whether you're going to be the person who sticks around throughout the year. So this year I won't expect that from your end but yes I'm more into such things (I've made it pretty obvious by now 😶‍🌫️) that is why I'm writing it here!\n\nI wish and pray that God listens to your prayers, you lead an even healthier life this year, I wish and pray you get to achieve all of that you've wished for Umair.\nI pray that God keeps you safe from everything that comes in your way (even if it's me) 🥺\n\nI pray that we both grow even more in love and patience and understanding.\nI pray that we make past this year too and many more that's to come.\nI LOVE YOU UMAIR 🩷",
            "image": "new_year.jpg",
            "category": "reasons",
            "created": int(time.time() * 1000000) # Now
        },
        {"text": "Your laugh is my favorite sound.", "category": "reasons", "created": 0},
        {"text": "The way you scrunch your nose when you're thinking.", "category": "reasons", "created": 0},
        {"text": "How you always support my dreams.", "category": "reasons", "created": 0},
        {"text": "Your kindness to strangers.", "category": "reasons", "created": 0},
        {"text": "The way you look at me.", "category": "reasons", "created": 0},
        {"text": "Our late night video calls.", "category": "reasons", "created": 0},
        {"text": "Your amazing taste in music.", "category": "reasons", "created": 0},
        {"text": "How hard you work.", "category": "reasons", "created": 0},
        {"text": "Your warm hugs (even virtual ones feel warm).", "category": "reasons", "created": 0},
        {"text": "Just being you.", "category": "reasons", "created": 0}
    ]
    parsed_notes.extend(REASONS_I_LOVE_YOU)

    # 2. Parse Google Keep Notes
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
                    
                    # Labels
                    labels = [l['name'] for l in data.get('labels', [])]
                    
                    # Category Logic
                    category = 'all'
                    if any('Letters' in l for l in labels): category = 'letters'
                    elif any('Poems' in l for l in labels): category = 'poems'
                    elif any('Reasons' in l for l in labels): category = 'reasons'
                    elif any('Notes' in l for l in labels): category = 'notes'
                    
                    parsed_notes.append({
                        "title": data.get('title', ''),
                        "text": content,
                        "created": int(data.get('createdTimestampUsec', 0)),
                        "labels": labels,
                        "category": category
                    })
            except Exception as e:
                print(f"Error parsing {file_path}: {e}")

    # Sort
    parsed_notes.sort(key=lambda x: x['created'], reverse=True)
    
    with open(os.path.join(OUTPUT_DIR, 'notes.json'), 'w') as f:
        json.dump(parsed_notes, f, indent=2)
    print(f"notes.json created with {len(parsed_notes)} notes.")

if __name__ == "__main__":
    generate_media_json()
    generate_private_media_json()
    generate_notes_json()
