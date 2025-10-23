from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from wordcloud import WordCloud, STOPWORDS
import os
import nltk

# Try to download stopwords if not already present (non-blocking-ish)
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    try:
        nltk.download('stopwords', quiet=True)
    except Exception:
        pass

from nltk.corpus import stopwords

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

# Create folder for saving generated images
UPLOAD_FOLDER = os.path.join(app.static_folder, 'wordclouds')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Combine stopwords
default_stopwords = set(STOPWORDS)
try:
    nltk_stopwords = set(stopwords.words('english'))
except Exception:
    nltk_stopwords = set()
combined_stopwords = default_stopwords.union(nltk_stopwords)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate_wordcloud():
    data = request.get_json()
    text = data.get('text', '').strip()
    theme = data.get('theme', 'light')
    try:
        max_words = int(data.get('max_words', 100))
    except Exception:
        max_words = 100
    remove_stopwords = data.get('remove_stopwords', True)

    if not text:
        return jsonify({'error': 'No text provided'}), 400

    # Theme color settings
    bg_color = 'black' if theme == 'dark' else 'white'
    # use a colormap that looks good on both backgrounds; fallback if invalid
    colormap = 'viridis' if theme == 'light' else 'plasma'
    stopword_set = combined_stopwords if remove_stopwords else set()

    # Generate Word Cloud
    try:
        wordcloud = WordCloud(
            width=1200,
            height=600,
            background_color=bg_color,
            colormap=colormap,
            stopwords=stopword_set,
            max_words=max_words,
            collocations=False
        ).generate(text)
    except Exception as e:
        return jsonify({'error': f'Failed to generate word cloud: {str(e)}'}), 500

    # Save image to static folder with a timestamp to bust cache
    output_filename = 'wordcloud.png'
    output_path = os.path.join(UPLOAD_FOLDER, output_filename)
    try:
        wordcloud.to_file(output_path)
    except Exception as e:
        return jsonify({'error': f'Failed to save image: {str(e)}'}), 500

    # Return public URL
    image_url = f'/static/wordclouds/{output_filename}'
    return jsonify({'image_url': image_url})

# (Optional) Serve static files manually if needed
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory(app.static_folder, filename)

if __name__ == '__main__':
    # Use 0.0.0.0 for easier testing on LAN; remove host= for production as needed
    app.run(debug=True, host='0.0.0.0', port=5000)
