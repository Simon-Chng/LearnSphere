import models
import database
import ollama
from auth import get_password_hash

def init_db():
    models.Base.metadata.drop_all(bind=database.engine);
    models.Base.metadata.create_all(bind=database.engine)

    db = next(database.get_db())
    
    # Create admin user
    admin_user = db.query(models.User).filter(models.User.username == "admin").first()
    if not admin_user:
        admin_user = models.User(
            username="admin",
            email="xiaoyu.zhuang@student.uq.edu.au",
            hashed_password=get_password_hash("Password123"),
            is_admin=True
        )
        db.add(admin_user)
    
    # Get available models from Ollama
    available_models = set()
    try:
        ollama_models = ollama.list()
        if ollama_models and "models" in ollama_models:
            available_models = {model.model.split(':')[0] for model in ollama_models["models"]}
    except Exception:
        pass  # If Ollama is not available, available_models will be empty
    
    # Add default models if they don't exist
    default_models = ["llama3.2"]
    
    for model_name in default_models:
        model = db.query(models.ModelList).filter(models.ModelList.name == model_name).first()
        if not model:
            model = models.ModelList(
                name=model_name,
                is_avail=model_name in available_models
            )
            db.add(model)
        else:
            model.is_avail = model_name in available_models
    
    # Add default categories
    default_categories = [
        "General",
        "Goal Setting",
        "Problem Solving",
        "Text Summarization",
        "Emotional Support",
        "Social Learning"
    ]
    
    for category_name in default_categories:
        category = db.query(models.Category).filter(models.Category.name == category_name).first()
        if not category:
            category = models.Category(name=category_name)
            db.add(category)
    
    db.commit()
    print("Database initialized successfully.")

if __name__ == "__main__":
    init_db()
