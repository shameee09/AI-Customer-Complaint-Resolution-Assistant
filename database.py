import sqlite3
from datetime import datetime

DATABASE_NAME = "support_tickets.db"


def get_connection():
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def initialize_database():

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tickets (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            ticket_id TEXT UNIQUE,

            order_id TEXT,

            category TEXT,

            priority TEXT,

            product TEXT,

            issue TEXT,

            customer_request TEXT,

            status TEXT,

            resolution TEXT,

            created_at TEXT

        )
    """)

    conn.commit()
    conn.close()


def create_ticket(
    order_id=None,
    category=None,
    priority=None,
    product=None,
    issue=None,
    customer_request=None,
    resolution=None
):

    conn = get_connection()

    cursor = conn.cursor()

    # First create the database row
    cursor.execute("""
        INSERT INTO tickets (
            ticket_id,
            order_id,
            category,
            priority,
            product,
            issue,
            customer_request,
            status,
            resolution,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        None,
        order_id,
        category,
        priority,
        product,
        issue,
        customer_request,
        "Pending Review",
        resolution,
        datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ))

    database_id = cursor.lastrowid

    # Generate ticket ID
    ticket_id = f"TKT-{1000 + database_id}"

    # Update ticket ID
    cursor.execute("""
        UPDATE tickets
        SET ticket_id = ?
        WHERE id = ?
    """, (
        ticket_id,
        database_id
    ))

    conn.commit()

    conn.close()

    return ticket_id