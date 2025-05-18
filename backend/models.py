from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    """
    Represents a user in the system.

    Attributes:
        id (int): Primary key.
        username (str): Unique username.
        email (str): Unique email address.
        hashed_password (str): Secure hashed password.
        is_admin (bool): Flag for administrative privileges.
        created_at (datetime): Timestamp of account creation.
        conversations (List[Conversation]): Conversations created by the user.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversations = relationship("Conversation", back_populates="user")

class Category(Base):
    """
    Represents a conversation category (e.g., Emotional Support, Goal Setting).

    Attributes:
        id (int): Primary key.
        name (str): Unique category name.
        conversations (List[Conversation]): Conversations under this category.
    """
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    
    conversations = relationship("Conversation", back_populates="category")

class ModelList(Base):
    """
    Represents an AI model used in conversations.

    Attributes:
        id (int): Primary key.
        name (str): Name of the model.
        is_avail (bool): Availability status of the model.
        model_type (str): Type of model - 'ollama' or 'groq'.
        conversations (List[Conversation]): Conversations that used this model.
    """
    __tablename__ = "model_list"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    is_avail = Column(Boolean, default=False)
    model_type = Column(String(20), default="ollama")
    
    conversations = relationship("Conversation", back_populates="model")

class Conversation(Base):
    """
    Represents a conversation between a user and a model in a specific category.

    Attributes:
        id (int): Primary key.
        user_id (int): Foreign key referencing the user.
        model_id (int): Foreign key referencing the model (nullable).
        category_id (int): Foreign key referencing the category (nullable).
        title (str): Optional title of the conversation.
        created_at (datetime): Creation timestamp.
        updated_at (datetime): Last updated timestamp.
        user (User): Associated user.
        model (ModelList): Associated AI model.
        category (Category): Associated category.
        messages (List[Message]): Messages in this conversation.
    """
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    model_id = Column(Integer, ForeignKey("model_list.id", ondelete="SET NULL", onupdate="CASCADE"))
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL", onupdate="CASCADE"))
    title = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="conversations")
    model = relationship("ModelList", back_populates="conversations")
    category = relationship("Category", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation")

class Message(Base):
    """
    Represents a message within a conversation.

    Attributes:
        id (int): Primary key.
        conversation_id (int): Foreign key referencing the conversation.
        role (str): Role of the sender (e.g., user, assistant).
        content (str): Text content of the message.
        created_at (datetime): Timestamp when the message was created.
        conversation (Conversation): Associated conversation.
    """
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    role = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    conversation = relationship("Conversation", back_populates="messages")
