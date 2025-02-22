# Podcast Generator Backend

This is the backend service for the Podcast Generator application, built with Flask.

## Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- Virtual environment (recommended)

## Setup Instructions

1. **Clone the repository**
```bash
git clone <repository-url>
cd backend
```

2. **Create and activate a virtual environment**
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Linux/MacOS
python3 -m venv venv
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables**
Create a `.env` file in the backend directory with the following variables:
```env
PLAYHT_API_KEY=your_playht_api_key
PLAYHT_USER_ID=your_playht_user_id
GEMINI_API_KEY=your_gemini_api_key
```

5. **Create uploads directory**
```bash
mkdir -p static/uploads
```

6. **Run the application**
```bash
python app.py
```
The server will start on `http://localhost:5000`

## API Endpoints

- `POST /generate_script`: Generate a podcast script
  - Request body: `{ "topic": string, "duration": number, "speakers": number }`

- `POST /generate_audio`: Generate audio from script
  - Request body: `{ "script": string, "voices": string[] }`

- `POST /upload_pdf`: Upload and process PDF
  - Request body: FormData with "file" field

## Environment Variables

- `PLAYHT_API_KEY`: API key for Play.HT text-to-speech service
- `PLAYHT_USER_ID`: User ID for Play.HT service
- `GEMINI_API_KEY`: API key for Google's Gemini AI model

## Project Structure

```
backend/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── static/            # Static files
│   └── uploads/       # Upload directory for files
└── utils/             # Utility functions
    ├── script_generator.py    # Script generation logic
    ├── audio_generator.py     # Audio generation logic
    ├── pdf_processor.py       # PDF processing
    ├── text_processing.py     # Text processing utilities
    └── voice_processing.py    # Voice processing utilities
```

## Error Handling

The API includes proper error handling for:
- Invalid file uploads
- Missing API keys
- Failed script generation
- Failed audio generation

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

