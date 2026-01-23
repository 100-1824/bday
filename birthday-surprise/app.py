from flask import Flask, render_template

app = Flask(__name__)

# --- CONFIGURATION & DATA (EDIT HERE) ---
# Replace these with real values!
HER_NAME = "My Love"
YOUR_CITY_COORDS = [40.7128, -74.0060]  # Example: New York
HER_CITY_COORDS = [48.8566, 2.3522]    # Example: Paris
YOUR_CITY_NAME = "New York"
HER_CITY_NAME = "Paris"

REASONS_I_LOVE_YOU = [
    "Your laugh is my favorite sound.",
    "The way you scrunch your nose when you're thinking.",
    "How you always support my dreams.",
    "Your kindness to strangers.",
    "The way you look at me.",
    "Our late night video calls.",
    "Your amazing taste in music.",
    "How hard you work.",
    "Your warm hugs (even virtual ones feel warm).",
    "Just being you."
]

# ----------------------------------------

@app.route('/')
def index():
    return render_template('index.html', 
                         name=HER_NAME,
                         my_city=YOUR_CITY_NAME,
                         her_city=HER_CITY_NAME,
                         my_coords=YOUR_CITY_COORDS,
                         her_coords=HER_CITY_COORDS,
                         reasons=REASONS_I_LOVE_YOU)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
