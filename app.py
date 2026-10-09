from flask import Flask, render_template, request, jsonify, session
from genai_model import chat_with_customer
import sqlite3
import os
from datetime import datetime


# ==========================================================
# FLASK APP
# ==========================================================

app = Flask(__name__)

# Secret key for maintaining the user's chat session
app.secret_key = os.getenv(
    "FLASK_SECRET_KEY",
    "dev-secret-key-change-before-deployment"
)


# ==========================================================
# DATABASE
# ==========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATABASE = os.path.join(
    BASE_DIR,
    "customer_support.db"
)


def get_db_connection():

    connection = sqlite3.connect(DATABASE)

    connection.row_factory = sqlite3.Row

    return connection


def init_database():

    connection = get_db_connection()

    cursor = connection.cursor()

    # ------------------------------------------------------
    # Tickets table
    # ------------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tickets (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            ticket_id TEXT UNIQUE NOT NULL,

            status TEXT DEFAULT 'Open',

            created_at TEXT NOT NULL

        )
    """)

    # ------------------------------------------------------
    # Messages table
    # ------------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            ticket_id TEXT NOT NULL,

            sender TEXT NOT NULL,

            message TEXT NOT NULL,

            timestamp TEXT NOT NULL,

            FOREIGN KEY (ticket_id)
                REFERENCES tickets(ticket_id)

        )
    """)

    connection.commit()

    connection.close()


# ==========================================================
# CREATE NEW TICKET
# ==========================================================

def create_ticket():

    connection = get_db_connection()

    cursor = connection.cursor()

    created_at = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    # Create temporary row first
    cursor.execute("""
        INSERT INTO tickets
        (
            ticket_id,
            status,
            created_at
        )
        VALUES (?, ?, ?)
    """, (
        "TEMP",
        "Open",
        created_at
    ))

    database_id = cursor.lastrowid

    # Generate ticket ID
    ticket_id = f"TKT-{database_id:04d}"

    # Update temporary ticket ID
    cursor.execute("""
        UPDATE tickets
        SET ticket_id = ?
        WHERE id = ?
    """, (
        ticket_id,
        database_id
    ))

    connection.commit()

    connection.close()

    return ticket_id


# ==========================================================
# SAVE MESSAGE
# ==========================================================

def save_message(ticket_id, sender, message):

    connection = get_db_connection()

    cursor = connection.cursor()

    timestamp = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    cursor.execute("""
        INSERT INTO messages
        (
            ticket_id,
            sender,
            message,
            timestamp
        )
        VALUES (?, ?, ?, ?)
    """, (
        ticket_id,
        sender,
        message,
        timestamp
    ))

    connection.commit()

    connection.close()


# ==========================================================
# HOME
# ==========================================================

@app.route("/")
def home():

    return render_template("index.html")


# ==========================================================
# CHAT API
# ==========================================================

@app.route("/api/chat", methods=["POST"])
def chat():

    try:

        # --------------------------------------------------
        # Get request data
        # --------------------------------------------------

        data = request.get_json()

        if not data:

            return jsonify({
                "success": False,
                "error": "No data received."
            }), 400

        # --------------------------------------------------
        # Get customer message
        # --------------------------------------------------

        message = data.get(
            "message",
            ""
        ).strip()

        if not message:

            return jsonify({
                "success": False,
                "error": "Message cannot be empty."
            }), 400

        # --------------------------------------------------
        # Conversation history
        # --------------------------------------------------

        conversation_history = data.get(
            "conversation_history",
            []
        )

        # --------------------------------------------------
        # Get existing ticket
        # --------------------------------------------------

        ticket_id = session.get("ticket_id")

        # --------------------------------------------------
        # Create new ticket if required
        # --------------------------------------------------

        if not ticket_id:

            ticket_id = create_ticket()

            session["ticket_id"] = ticket_id

            print("\n====================================")
            print("NEW TICKET CREATED:")
            print(ticket_id)
            print("====================================")

        # --------------------------------------------------
        # Save customer message
        # --------------------------------------------------

        save_message(
            ticket_id,
            "customer",
            message
        )

        print("\n====================================")
        print("CUSTOMER MESSAGE:")
        print(message)
        print("TICKET ID:")
        print(ticket_id)
        print("====================================")

        # --------------------------------------------------
        # Call Gemini
        # --------------------------------------------------

        ai_response = chat_with_customer(
            message,
            conversation_history,
            ticket_id
        )

        # --------------------------------------------------
        # Safety check
        # --------------------------------------------------

        if not ai_response or not ai_response.strip():

            return jsonify({
                "success": False,
                "error": "AI returned an empty response."
            }), 500

        ai_response = ai_response.strip()

        # --------------------------------------------------
        # Save AI response
        # --------------------------------------------------

        save_message(
            ticket_id,
            "assistant",
            ai_response
        )

        print("\n====================================")
        print("AI RESPONSE:")
        print(ai_response)
        print("====================================")

        # --------------------------------------------------
        # Return response to frontend
        # --------------------------------------------------

        return jsonify({

            "success": True,

            "response": ai_response,

            "ticket_id": ticket_id

        })

    except Exception as e:

        print("\n====================================")
        print("FLASK ERROR:")
        print(str(e))
        print("====================================")

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


# ==========================================================
# DATABASE INITIALIZATION
# ==========================================================

# Initialize database when Flask/Gunicorn starts
init_database()


# ==========================================================
# RUN
# ==========================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=int(
            os.environ.get(
                "PORT",
                5000
            )
        ),
        debug=False
    )
