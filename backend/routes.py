from flask import Blueprint, request, jsonify
from .db import get_db 
import sqlite3

bp = Blueprint('api_items', __name__, url_prefix='/api')

@bp.route('/items', methods=['GET'])
def get_all_items():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM items")
    items = cursor.fetchall()
    return jsonify([dict(item) for item in items])

# GET Request: Retrieve a specific item by ID
@bp.route('/items/<int:item_id>', methods=['GET'])
def get_item(item_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM items WHERE id = ?", (item_id,))
    item = cursor.fetchone()
    if item:
        return jsonify(dict(item))
    return jsonify({"error": "Item not found"}), 404

# POST Request: Create a new item
@bp.route('/items', methods=['POST'])
def create_item():
    data = request.get_json()
    if not data or 'name' not in data or 'price' not in data:
        return jsonify({"error": "Missing 'name' or 'price' in request body"}), 400

    name = data['name']
    description = data.get('description', '') 
    price = data['price']

    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(
            "INSERT INTO items (name, description, price) VALUES (?, ?, ?)",
            (name, description, price)
        )
        db.commit()
        new_item_id = cursor.lastrowid
        return jsonify({"id": new_item_id, "name": name, "description": description, "price": price}), 201
    except sqlite3.Error as e:
        db.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500

# PUT Request: Update an existing item
@bp.route('/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided for update"}), 400

    db = get_db()
    cursor = db.cursor()

    set_clauses = []
    values = []

    if 'name' in data:
        set_clauses.append("name = ?")
        values.append(data['name'])
    if 'description' in data:
        set_clauses.append("description = ?")
        values.append(data['description'])
    if 'price' in data:
        set_clauses.append("price = ?")
        values.append(data['price'])

    if not set_clauses:
        return jsonify({"error": "No fields to update"}), 400

    values.append(item_id) 
    query = "UPDATE items SET " + ", ".join(set_clauses) + " WHERE id = ?"

    try:
        cursor.execute(query, tuple(values))
        db.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "Item not found"}), 404

        cursor.execute("SELECT * FROM items WHERE id = ?", (item_id,))
        updated_item = cursor.fetchone()
        return jsonify(dict(updated_item))
    except sqlite3.Error as e:
        db.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500

@bp.route('/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute("DELETE FROM items WHERE id = ?", (item_id,))
        db.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Item not found"}), 404
        return jsonify({"message": f"Item {item_id} deleted successfully"}), 200
    except sqlite3.Error as e:
        db.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500