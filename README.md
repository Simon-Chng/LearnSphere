# LearnSphere

This project is a full-stack web application for **Self-Regulated Learning Research** & **Web Information Systems (INFS3202) Course**.

This project aims to introduce and evaluate an application designed to enhance self-regulated learning (SRL) by leveraging a large language model (LLM) that runs locally and is privacy preserving. The application aims to support learners in effectively managing their study habits and optimizing learning outcomes. Unlike traditional SRL tools, the proposed tool integrates advanced natural language processing capabilities to provide real-time feedback, personalized study suggestions, and interactive learning sessions. The app's functionality includes a range of features such as automated summarization of text, generation of practice questions, and reflective prompts that encourage learners to evaluate their understanding and learning strategies. This research evaluates the impact of the tool on learners' self-regulation skills, motivation, and academic performance.

## Prerequisites

### Required Software
- Ollama installed and running locally
  ```bash
  # Install Ollama from: https://ollama.com/download
  ```
- Required LLM models are installed in Ollama:
  ```bash
  # Examples:
  ollama run llama3.2
  ollama run gemma3
  ollama run phi4
  ollama run deepseek-r1
  ```
- PostgreSQL database installed and running
  ```bash
  # Install PostgreSQL from: https://www.postgresql.org/download/
  # Or use Docker:
  docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
  ```

### Test Environment
- macOS Sequoia 15.3.2
- Note: Windows environment has not been tested yet

### Frontend
- Node.js (v23.6.0 or higher)
- npm (v10.9.2 or higher)

### Backend
- Python 3.11 or higher
- pip (Python package manager)

## Project Structure

```
.
├── frontend/          # Next.js frontend application
├── backend/           # Python backend application
└── README.md
```

## Setup Instructions

Open two terminal windows for *Frontend* and *Backend* separately.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment (optional but recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Initialize the database (first time setup):
```bash
# Note: THIS COMMAND WILL RESET THE DATEBASE AND ALL EXISTING RECORDS WILL BE CLEARED!!!
python init_db.py
```

5. Start the backend server:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

If you want to visit backend API content, please visit `http://localhost:8000` in your browser.

**Application entry (frontend) will be available at `http://localhost:3000`.**

## Database Schema

The application uses PostgreSQL with SQLAlchemy ORM. Below are the database tables and their relationships:

### Users Table

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| username | String | Unique username |
| email | String | Unique email address |
| hashed_password | String | Encrypted password |
| is_admin | Boolean | Admin status flag |
| created_at | DateTime | Account creation timestamp |

### Categories Table

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| name | String(50) | Unique category name |

### Model List Table

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| name | String(100) | Model name |
| is_avail | Boolean | Availability status |

### Conversations Table

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| user_id | Integer | Foreign key to users.id |
| model_id | Integer | Foreign key to model_list.id |
| category_id | Integer | Foreign key to categories.id |
| title | String | Conversation title |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

### Messages Table

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| conversation_id | Integer | Foreign key to conversations.id |
| role | String | Message role (user/assistant) |
| content | Text | Message content |
| created_at | DateTime | Message timestamp |

### Entity Relationships

- User (1) → Conversations (many)
- Category (1) → Conversations (many)
- ModelList (1) → Conversations (many)
- Conversation (1) → Messages (many)

## Development

- Frontend development server supports hot-reload
- Backend server will automatically reload when changes are detected
- Make sure both frontend and backend servers are running simultaneously for full functionality

## Environment Variables

### Frontend
Create a `.env` file in the frontend directory with the following variables:
```
VITE_API_URL=http://localhost:8000
```

### Backend
Create a `.env` file in the backend directory with the following variables:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/learn_sphere
FLASK_ENV=development
FLASK_APP=main.py
GROQ_API_KEY=your_groq_api_key_here
```

## Database Setup

1. Create a PostgreSQL database:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE learn_sphere;

# Exit psql
\q
```

2. The application will automatically create the necessary tables when you run `python init_db.py` or start the backend server for the first time.

## Default Login

After initializing the database, you can log in with the default admin account:
- *Username:* `admin`
- *Password:* `Password123`

## Troubleshooting

1. If you encounter any dependency issues:
   - Frontend: Delete `node_modules` folder and run `npm install` again
   - Backend: Delete and recreate virtual environment, then run `pip install -r requirements.txt`

2. If ports are already in use:
   - Frontend: Change the port in `vite.config.js`
   - Backend: Change the port in the uvicorn command

3. Database connection issues:
   - Verify PostgreSQL is running: `pg_isready`
   - Check your DATABASE_URL environment variable
   - Ensure the database 'learn_sphere' exists

## Quick Launch commands After Setup
```bash
# Backend
cd backend && uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Frontend
cd frontend && npm run dev
```
