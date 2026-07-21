from flask import Flask, render_template, request
import json
import os

app = Flask(__name__)

# Base directory for relative file access
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'botdefense_website', 'data')

# Homepage
@app.route('/')
def home():
    return render_template('index.html')

# About Page
@app.route('/about')
def about():
    return render_template('about.html')

# Services Page
@app.route('/services')
def services():
    return render_template('services.html')

# Internships Page - loads data from internships.json
@app.route('/internships')
def internships():
    internships_data = []
    file_path = os.path.join(DATA_DIR, 'internships.json')
    try:
        with open(file_path, 'r') as file:
            internships_data = json.load(file)
    except FileNotFoundError:
        print("⚠️ internships.json not found.")
    return render_template('internships.html', internships=internships_data)

# Contact Page - handles GET and POST form submissions
@app.route('/contact', methods=['GET', 'POST'])
def contact():
    success = None
    contact_path = os.path.join(DATA_DIR, 'contact_messages.json')

    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        message = request.form.get('message')

        contact_entry = {
            "name": name,
            "email": email,
            "message": message
        }

        # Ensure file exists
        if not os.path.exists(contact_path):
            with open(contact_path, 'w') as f:
                json.dump([], f)

        # Append the new entry
        with open(contact_path, 'r+') as f:
            try:
                messages = json.load(f)
            except json.JSONDecodeError:
                messages = []
            messages.append(contact_entry)
            f.seek(0)
            json.dump(messages, f, indent=4)

        success = "Thank you! Your message has been received."

    return render_template('contact.html', success=success)

# Admin Dashboard - View internships and contact messages
@app.route('/admin')
def admin():
    contacts = []
    internships = []

    contact_path = os.path.join(DATA_DIR, 'contact_messages.json')
    internships_path = os.path.join(DATA_DIR, 'internships.json')

    try:
        with open(contact_path, 'r') as f:
            contacts = json.load(f)
    except FileNotFoundError:
        print("⚠️ contact_messages.json not found.")

    try:
        with open(internships_path, 'r') as f:
            internships = json.load(f)
    except FileNotFoundError:
        print("⚠️ internships.json not found.")

    return render_template('admin.html', contacts=contacts, internships=internships)

# Run the app
if __name__ == '__main__':
    app.run(debug=True)
