
import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
from urllib.parse import urlparse

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("Error: DATABASE_URL not found in .env file.")
    sys.exit(1)

def create_database():
    try:
        # Parse the URL to get the database name
        url = urlparse(DATABASE_URL)
        db_name = url.path.lstrip('/')
        
        # Connect to the server without selecting a database
        # Reconstruct URL without the database name
        server_url = f"{url.scheme}://{url.username}:{url.password}@{url.hostname}:{url.port}"
        
        engine = create_engine(server_url)
        
        with engine.connect() as conn:
            # Check if database exists
            result = conn.execute(text(f"SHOW DATABASES LIKE '{db_name}'"))
            if result.fetchone():
                print(f"Database '{db_name}' already exists.")
            else:
                print(f"Creating database '{db_name}'...")
                conn.execute(text(f"CREATE DATABASE {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"))
                print(f"Database '{db_name}' created successfully.")
                
    except Exception as e:
        print(f"Failed to create database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    create_database()
