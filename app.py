from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from wordcloud import WordCloud, STOPWORDS
import os
import nltk

# Download stopwords
nltk.download('stopwords')
from nltk.corpus import stopwords

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

# Create folder for saving generated images
UPLOAD_FOLDER = os.path.join(app.static_folder, 'wordclouds')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Combine stopwords
default_stopwords = set(STOPWORDS)
nltk_stopwords = set(stopwords.words('english'))
combined_stopwords = default_stopwords.union(nltk_stopwords)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate_wordcloud():
    data = request.get_json()
    text = data.get('text', '').strip()
    theme = data.get('theme', 'light')
    max_words = int(data.get('max_words', 100))
    remove_stopwords = data.get('remove_stopwords', True)

    if not text:
        return jsonify({'error': 'No text provided'}), 400

    # Theme color settings
    bg_color = 'black' if theme == 'dark' else 'white'
    colormap = 'Pastel1' if theme == 'dark' else 'viridis'
    stopword_set = combined_stopwords if remove_stopwords else set()

    # Generate Word Cloud
    wordcloud = WordCloud(
        width=800,
        height=400,
        background_color=bg_color,
        colormap=colormap,
        stopwords=stopword_set,
        max_words=max_words
    ).generate(text)

    # Save image to static folder
    output_path = os.path.join(UPLOAD_FOLDER, 'wordcloud.png')
    wordcloud.to_file(output_path)

    # Return public URL
    return jsonify({'image_url': '/static/wordclouds/wordcloud.png'})

# (Optional) Serve static files manually if needed
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory(app.static_folder, filename)

if __name__ == '__main__':
    app.run(debug=True)
