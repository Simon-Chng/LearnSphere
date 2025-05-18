import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv
from passlib.context import CryptContext
from models import Base, User, Category, ModelList, Conversation
import logging
import requests

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/learn_sphere")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Password hashing setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_groq_models():
    """Get list of models supported by Groq API
    
    If API call fails, returns a basic model list as fallback
    
    Returns:
        List[dict]: List of model dictionaries containing id and availability
    """
    groq_api_key = os.getenv("GROQ_API_KEY", "")
    if not groq_api_key:
        logger.warning("No Groq API key found, using default models")
        return [
            {"name": "llama3-70b-8192", "is_avail": False, "model_type": "groq"},
            {"name": "llama3-8b-8192", "is_avail": False, "model_type": "groq"},
            {"name": "gemma-7b-it", "is_avail": False, "model_type": "groq"}
        ]
    
    try:
        logger.info("Fetching models from Groq API...")
        groq_response = requests.get(
            "https://api.groq.com/v1/models",
            headers={"Authorization": f"Bearer {groq_api_key}"}
        )
        
        if groq_response.status_code == 200:
            groq_models_data = groq_response.json()
            models_list = [
                {"name": model["id"], "is_avail": True, "model_type": "groq"}
                for model in groq_models_data.get("data", [])
            ]
            logger.info(f"Retrieved {len(models_list)} models from Groq API")
            return models_list
        else:
            logger.error(f"Error fetching Groq models: {groq_response.status_code} - {groq_response.text}")
            return [
                {"name": "llama3-70b-8192", "is_avail": False, "model_type": "groq"},
                {"name": "llama3-8b-8192", "is_avail": False, "model_type": "groq"},
                {"name": "gemma-7b-it", "is_avail": False, "model_type": "groq"}
            ]
    except Exception as e:
        logger.error(f"Exception when fetching Groq models: {str(e)}")
        return [
            {"name": "llama3-70b-8192", "is_avail": False, "model_type": "groq"},
            {"name": "llama3-8b-8192", "is_avail": False, "model_type": "groq"},
            {"name": "gemma-7b-it", "is_avail": False, "model_type": "groq"}
        ]

def init_db():
    """
    Initialize the database by dropping all existing tables, recreating them,
    and populating default data including an admin user, AI models, and categories.

    - Drops and recreates all tables.
    - Adds a default admin user if not present.
    - Queries available Ollama models and sets their availability.
    - Adds a predefined set of default models to the ModelList table.
    - Adds predefined categories to the Category table.
    """
    try:
        logger.info("Recreating database tables...")
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        
        db = SessionLocal()
        
        try:
            # Create default admin user
            logger.info("Creating default admin user...")
            hashed_password = pwd_context.hash("Password123")
            admin_user = User(
                username="admin",
                email="admin@example.com",
                hashed_password=hashed_password,
                is_admin=True
            )
            db.add(admin_user)
            
            # Create default categories
            logger.info("Creating default categories...")
            categories = [
                Category(name="General"),
                Category(name="Goal Setting"),
                Category(name="Problem Solving"),
                Category(name="Text Summarization"),
                Category(name="Emotional Support"),
                Category(name="Social Learning")
            ]
            db.add_all(categories)
            
            # Create default models
            logger.info("Creating default models...")
            # Ollama models
            ollama_models = [
                ModelList(name="llama3.2", is_avail=False, model_type="ollama"),
                ModelList(name="phi4", is_avail=False, model_type="ollama"),
                ModelList(name="gemma3", is_avail=False, model_type="ollama"),
                ModelList(name="deepseek-r1", is_avail=False, model_type="ollama")
            ]
            db.add_all(ollama_models)
            
            # Groq models - dynamically fetch from API
            groq_models = get_groq_models()
            for model_data in groq_models:
                model = ModelList(**model_data)
                db.add(model)
            
            db.commit()
            logger.info("Database initialization completed successfully.")
            
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Database initialization failed: {str(e)}")
            raise
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Error during database initialization: {str(e)}")
        raise

if __name__ == "__main__":
    init_db()
