import os
import psycopg
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        raise ValueError("DATABASE_URL is not configured")

    connection = psycopg.connect(database_url)
    return connection

def create_users_table():
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            full_name VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role VARCHAR(20) NOT NULL
                CHECK (role IN ('pet_owner', 'veterinarian', 'admin')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    connection.commit()
    cursor.close()
    connection.close()


def create_pets_table():
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pets (
            id SERIAL PRIMARY KEY,
            owner_id INTEGER NOT NULL REFERENCES users(id)
                ON DELETE CASCADE,
            pet_name VARCHAR(100) NOT NULL,
            species VARCHAR(50) NOT NULL,
            breed VARCHAR(100),
            date_of_birth DATE,
            gender VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    connection.commit()
    cursor.close()
    connection.close()


def create_appointments_table():
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS appointments (
            id SERIAL PRIMARY KEY,
            pet_id INTEGER NOT NULL REFERENCES pets(id)
                ON DELETE CASCADE,
            vet_id INTEGER REFERENCES users(id)
                ON DELETE SET NULL,
            appointment_datetime TIMESTAMP NOT NULL,
            reason TEXT,
            status VARCHAR(20) DEFAULT 'pending'
                CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    connection.commit()
    cursor.close()
    connection.close()

    
def create_vaccinations_table():
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS vaccinations (
            id SERIAL PRIMARY KEY,
            pet_id INTEGER NOT NULL REFERENCES pets(id)
                ON DELETE CASCADE,
            vaccine_name VARCHAR(150) NOT NULL,
            date_given DATE NOT NULL,
            next_due_date DATE,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    connection.commit()
    cursor.close()
    connection.close()


def create_medical_records_table():
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS medical_records (
            id SERIAL PRIMARY KEY,
            pet_id INTEGER NOT NULL REFERENCES pets(id)
                ON DELETE CASCADE,
            vet_id INTEGER REFERENCES users(id)
                ON DELETE SET NULL,
            diagnosis TEXT,
            treatment TEXT,
            notes TEXT,
            record_date DATE DEFAULT CURRENT_DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    connection.commit()
    cursor.close()
    connection.close()

def create_chat_history_table():
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_history (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id)
                ON DELETE CASCADE,
            user_message TEXT NOT NULL,
            ai_response TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    connection.commit()
    cursor.close()
    connection.close()


def create_all_tables():
    create_users_table()
    create_pets_table()
    create_appointments_table()
    create_vaccinations_table()
    create_medical_records_table()
    create_chat_history_table()

    print("All database tables created successfully!")



