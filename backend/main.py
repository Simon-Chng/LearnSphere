import os
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from langchain.llms import Ollama
from pydantic import BaseModel
from starlette.responses import StreamingResponse
import ollama
import models
import database
import auth
from auth_routes import router as auth_router

# Create database tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# Enable CORS for cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Allow requests from any origin
    allow_credentials=True,   # Allow credentials (cookies, auth headers)
    allow_methods=["*"],      # Allow all HTTP methods
    allow_headers=["*"],      # Allow all HTTP headers
)

# Include auth routes
app.include_router(auth_router, prefix="/auth", tags=["auth"])

def load_prompt(category: str) -> str:
    """Load prompt from file for a specific category.
    
    Args:
        category: The category name
        
    Returns:
        str: The prompt text for the category
    """
    prompt_file = os.path.join("prompts", f"{category}.txt")
    try:
        with open(prompt_file, "r", encoding="utf-8") as f:
            return f.read().strip()
    except FileNotFoundError:
        return ""  # Return empty string if prompt file not found

# Category-specific prompts
CATEGORY_PROMPTS = {
    'goal-setting': load_prompt('goal-setting'),
    'problem-solving': load_prompt('problem-solving'),
    'text-summarization': load_prompt('text-summarization'),
    'emotional-support': load_prompt('emotional-support'),
    'social-learning': load_prompt('social-learning'),
    'general': load_prompt('general')
}

class Message(BaseModel):
    """Message structure for chat communication.
    
    Attributes:
        role: The role of the message sender ('user' or 'assistant').
        content: The content of the message.
    """
    role: str
    content: str

class ChatRequest(BaseModel):
    """Request structure for chat API.
    
    Attributes:
        user_input: The user's input message.
        remember_history: Whether to include conversation history.
        history: List of previous messages in the conversation.
        model_id: The ID of the model to use for generation.
        conversation_id: The ID of the conversation.
        category_id: The ID of the category.
    """
    user_input: str
    remember_history: bool
    history: Optional[List[Message]] = []
    model_id: int
    conversation_id: Optional[int] = None
    category_id: Optional[int] = None

class GuestChatRequest(BaseModel):
    """Request structure for guest chat API.
    
    Attributes:
        user_input: The user's input message.
        history: List of previous messages in the conversation.
        model: The name of the model to use for generation.
        category: The category ID for the conversation.
    """
    user_input: str
    history: Optional[List[Message]] = []
    model: str
    category: Optional[int] = 1

class ConversationTitle(BaseModel):
    """Request structure for updating conversation title."""
    title: str

@app.get("/models")
async def get_models(
    db: Session = Depends(database.get_db)
):
    """Get list of available models and update their availability status"""
    try:
        # Get available models from Ollama
        ollama_models = ollama.list()
        available_model_names = set()
        
        if ollama_models and "models" in ollama_models:
            available_model_names = {model.model.split(':')[0] for model in ollama_models["models"]}
        
        # Get all models from database
        db_models = db.query(models.ModelList).all()
        db_model_names = {model.name for model in db_models}
        
        # Update existing models' availability
        for model in db_models:
            model.is_avail = model.name in available_model_names
        
        # Add new models to database
        for model_name in available_model_names - db_model_names:
            new_model = models.ModelList(name=model_name, is_avail=True)
            db.add(new_model)
        
        db.commit()
        
        # Return all models with their availability status
        models_list = db.query(models.ModelList).all()
        return {
            "models": [
                {
                    "id": model.id,
                    "name": model.name,
                    "is_avail": model.is_avail
                } for model in models_list
            ]
        }
        
    except Exception as e:
        # If Ollama is not available, return database models with is_avail=False
        models_list = db.query(models.ModelList).all()
        return {
            "models": [
                {
                    "id": model.id,
                    "name": model.name,
                    "is_avail": False
                } for model in models_list
            ]
        }

async def stream_ai_response(prompt: str, history: List[Message], model_name: str, conversation_id: int):
    """Generate AI response using structured conversation history"""
    try:
        # Create new LLM instance
        llm = Ollama(model=model_name)
        
        # Get category for the conversation
        db = next(database.get_db())
        conversation = db.query(models.Conversation).filter(
            models.Conversation.id == conversation_id
        ).first()
        
        # Get the category name for prompt selection
        category_name = "general"
        if conversation and conversation.category:
            category_name = conversation.category.name.lower().replace(" ", "-")
        
        # Get the appropriate system prompt based on category
        system_prompt = CATEGORY_PROMPTS.get(category_name, CATEGORY_PROMPTS['general'])
        
        # Build context with system prompt and conversation history
        context = f"{system_prompt}\n\n"
        if history:
            for msg in history:
                if msg.role == "user":
                    context += f"Human: {msg.content}\n"
                else:
                    context += f"Assistant: {msg.content}\n"
        
        # Add current question
        context += f"Human: {prompt}\nAssistant:"

        response_text = ""
        for chunk in llm.stream(context):
            response_text += chunk
            yield chunk

        # Save assistant message
        assistant_message = models.Message(
            conversation_id=conversation_id,
            role="assistant",
            content=response_text
        )
        db.add(assistant_message)
        db.commit()

    except Exception as e:
        yield f"[Error] Failed to generate response: {str(e)}"

@app.post("/chat")
async def chat(
    request: ChatRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Handle chat requests and stream AI responses - admin can use any conversation"""
    try:
        # Get model from database
        model = db.query(models.ModelList).filter(models.ModelList.id == request.model_id).first()
        if not model:
            raise HTTPException(status_code=404, detail="Model not found")

        # Create or get conversation
        conversation = None
        if request.conversation_id is not None:
            # Admin can use any conversation, regular user can only use their own
            if current_user.is_admin:
                conversation = db.query(models.Conversation).filter(
                    models.Conversation.id == request.conversation_id
                ).first()
            else:
                conversation = db.query(models.Conversation).filter(
                    models.Conversation.id == request.conversation_id,
                    models.Conversation.user_id == current_user.id
                ).first()
                
            if not conversation:
                conversation = models.Conversation(
                    user_id=current_user.id,
                    model_id=model.id,
                    category_id=request.category_id,
                    title="New Conversation"
                )
                db.add(conversation)
                db.commit()
                db.refresh(conversation)
                print(f"Created new conversation with ID: {conversation.id}")
            else:
                print(f"Found existing conversation: {conversation.id}")
        else:
            # Create new conversation
            print("Creating new conversation")
            conversation = models.Conversation(
                user_id=current_user.id,
                model_id=model.id,
                category_id=request.category_id,
                title="New Conversation"
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)
            print(f"Created new conversation with ID: {conversation.id}")

        # Save user message
        user_message = models.Message(
            conversation_id=conversation.id,
            role="user",
            content=request.user_input
        )
        db.add(user_message)
        db.commit()

        # Return conversation ID in headers
        headers = {
            "X-Conversation-ID": str(conversation.id)
        }

        # Stream AI response
        return StreamingResponse(
            stream_ai_response(
                request.user_input,
                request.history if request.remember_history else [],
                model.name,
                conversation.id
            ),
            media_type="text/plain",
            headers=headers
        )
    except Exception as e:
        print(f"Chat error: {str(e)}")
        return StreamingResponse(
            iter([f"Error: {str(e)}"]),
            media_type="text/plain"
        )

@app.get("/conversations")
async def get_conversations(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Get all conversations for the current user or all conversations for admin"""
    try:
        if current_user.is_admin:
            # Admin can see all conversations
            conversations = db.query(models.Conversation).all()
        else:
            # Regular user can only see their own conversations
            conversations = db.query(models.Conversation).filter(
                models.Conversation.user_id == current_user.id
            ).all()

        return {
            "conversations": [
                {
                    "id": conv.id,
                    "title": conv.title,
                    "messages": [
                        {
                            "role": msg.role,
                            "content": msg.content,
                            "created_at": msg.created_at.isoformat()
                        } for msg in conv.messages
                    ],
                    "model": conv.model.name if conv.model else None,
                    "category": conv.category.name if conv.category else None,
                    "created_at": conv.created_at.isoformat(),
                    "updated_at": conv.updated_at.isoformat()
                } for conv in conversations
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Delete a conversation - admin can delete any conversation"""
    try:
        # Admin can delete any conversation, regular user can only delete their own
        if current_user.is_admin:
            conversation = db.query(models.Conversation).filter(
                models.Conversation.id == conversation_id
            ).first()
        else:
            conversation = db.query(models.Conversation).filter(
                models.Conversation.id == conversation_id,
                models.Conversation.user_id == current_user.id
            ).first()
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Delete all messages associated with the conversation
        db.query(models.Message).filter(
            models.Message.conversation_id == conversation_id
        ).delete()
        
        # Delete the conversation
        db.delete(conversation)
        db.commit()
        
        return {"message": "Conversation deleted successfully"}
    except Exception as e:
        db.rollback()
        print(f"Error deleting conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def stream_guest_ai_response(prompt: str, history: List[Message], model_name: str, category_id: int = 1):
    """Generate AI response for guest users without saving to database"""
    try:
        # Create new LLM instance
        llm = Ollama(model=model_name)
        
        # Get category name from id
        db = next(database.get_db())
        category = db.query(models.Category).filter(models.Category.id == category_id).first()
        
        # Get the category name for prompt selection
        category_name = "general"
        if category:
            category_name = category.name.lower().replace(" ", "-")
        
        # Get the appropriate system prompt based on category
        system_prompt = CATEGORY_PROMPTS.get(category_name, CATEGORY_PROMPTS['general'])
        
        # Build context with system prompt and conversation history
        context = f"{system_prompt}\n\n"
        if history:
            for msg in history:
                if msg.role == "user":
                    context += f"Human: {msg.content}\n"
                else:
                    context += f"Assistant: {msg.content}\n"
        
        # Add current question
        context += f"Human: {prompt}\nAssistant:"

        response_text = ""
        for chunk in llm.stream(context):
            response_text += chunk
            yield chunk

    except Exception as e:
        yield f"[Error] Failed to generate response: {str(e)}"

@app.post("/guest/chat")
async def guest_chat(request: GuestChatRequest):
    """Handle guest chat requests and stream AI responses without saving to database"""
    try:
        # Get available models from Ollama
        ollama_models = ollama.list()
        available_model_names = set()
        
        if ollama_models and "models" in ollama_models:
            available_model_names = {model.model.split(':')[0] for model in ollama_models["models"]}
        
        if request.model not in available_model_names:
            raise HTTPException(status_code=404, detail="Model not found")

        return StreamingResponse(
            stream_guest_ai_response(
                request.user_input,
                request.history,
                request.model,
                request.category
            ),
            media_type="text/plain"
        )

    except HTTPException as e:
        print(f"HTTP Exception: {str(e)}")
        raise e
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/conversations/{conversation_id}/title")
async def update_conversation_title(
    conversation_id: int,
    request: ConversationTitle,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Update conversation title - admin can update any conversation"""
    try:
        # Admin can update any conversation, regular user can only update their own
        if current_user.is_admin:
            conversation = db.query(models.Conversation).filter(
                models.Conversation.id == conversation_id
            ).first()
        else:
            conversation = db.query(models.Conversation).filter(
                models.Conversation.id == conversation_id,
                models.Conversation.user_id == current_user.id
            ).first()
            
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Update title
        conversation.title = request.title
        db.commit()
        
        return {"message": "Title updated successfully"}
        
    except Exception as e:
        db.rollback()
        print(f"Error updating conversation title: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Admin routes - only accessible to admin users
@app.get("/admin/tables")
async def get_tables(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Get all database tables data for admin"""
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Forbidden - Admin access required")
    
    try:
        # Get users table data
        users = db.query(models.User).all()
        users_data = [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_admin": user.is_admin,
                "created_at": user.created_at.isoformat()
            } for user in users
        ]
        
        # Get categories table data
        categories = db.query(models.Category).all()
        categories_data = [
            {
                "id": category.id,
                "name": category.name
            } for category in categories
        ]
        
        # Get models table data
        models_list = db.query(models.ModelList).all()
        models_data = [
            {
                "id": model.id,
                "name": model.name,
                "is_avail": model.is_avail
            } for model in models_list
        ]
        
        # Get conversations table data (limit to 100 to avoid huge payloads)
        conversations = db.query(models.Conversation).limit(100).all()
        conversations_data = [
            {
                "id": conv.id,
                "user_id": conv.user_id,
                "model_id": conv.model_id,
                "category_id": conv.category_id,
                "title": conv.title,
                "created_at": conv.created_at.isoformat(),
                "updated_at": conv.updated_at.isoformat()
            } for conv in conversations
        ]
        
        # Get messages table data (limit to 100 to avoid huge payloads)
        messages = db.query(models.Message).limit(100).all()
        messages_data = [
            {
                "id": msg.id,
                "conversation_id": msg.conversation_id,
                "role": msg.role,
                "content": msg.content[:100] + "..." if len(msg.content) > 100 else msg.content,
                "created_at": msg.created_at.isoformat()
            } for msg in messages
        ]
        
        return {
            "users": users_data,
            "categories": categories_data,
            "models": models_data,
            "conversations": conversations_data,
            "messages": messages_data
        }
    except Exception as e:
        print(f"Error getting admin tables: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
