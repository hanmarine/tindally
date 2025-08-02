import pytest
import json
from unittest.mock import patch, MagicMock
import sys
import os
import sqlite3

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

if project_root not in sys.path:
    sys.path.insert(0, project_root)

try:
    from backend import create_app
    from backend.db import get_db
except ImportError as e:
    print(f"CRITICAL ERROR: Could not import Flask app components: {e}")
    print("Please ensure you have a 'create_app()' function in 'backend/__init__.py' "
          "that returns your Flask application instance, and that 'get_db()' "
          "is correctly defined in 'backend/db.py'.")
    print("Also, verify your project structure and Python environment.")
    sys.exit(1)

class MockSqliteRow(object):
    def __init__(self, data, description):
        self._data = data
        self._keys = [col[0] for col in description]
        for k, v in data.items():
            setattr(self, k, v)

    def __getitem__(self, key):
        if isinstance(key, str):
            return self._data[key]
        elif isinstance(key, int):
            return self._data[self._keys[key]]
        raise IndexError("Invalid index or key")

    def keys(self):
        return self._data.keys()

    def __iter__(self):
        for key in self._data:
            yield (key, self._data[key])

    def __len__(self):
        return len(self._data)


@pytest.fixture
def app_instance():
    app = create_app()
    app.config['TESTING'] = True
    app.config['DATABASE'] = ':memory:'

    with app.app_context():
        with app.open_resource('schema.sql') as f:
            get_db().executescript(f.read().decode('utf8'))
        get_db().commit()

    yield app

    with app.app_context():
        db_connection = get_db()
        if db_connection is not None:
            db_connection.close()


@pytest.fixture
def client(app_instance):
    return app_instance.test_client()

# Get all items test
@patch('backend.routes.get_db')
def test_get_all_items(mock_get_db, client):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_get_db.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.description = [('id',), ('name',), ('description',), ('price',)]

    mock_cursor.fetchall.return_value = [
        MockSqliteRow({'id': 1, 'name': 'Item A', 'description': 'Description A', 'price': 10.99}, mock_cursor.description),
        MockSqliteRow({'id': 2, 'name': 'Item B', 'description': 'Description B', 'price': 20.50}, mock_cursor.description)
    ]

    response = client.get('/api/items')

    assert response.status_code == 200
    data = json.loads(response.data)

    assert len(data) == 2
    assert data[0]['id'] == 1
    assert data[0]['name'] == 'Item A'
    assert data[0]['description'] == 'Description A'
    assert data[0]['price'] == 10.99
    assert data[1]['id'] == 2
    assert data[1]['name'] == 'Item B'
    assert data[1]['description'] == 'Description B'
    assert data[1]['price'] == 20.50

    mock_get_db.assert_called_once()
    mock_cursor.execute.assert_called_with('SELECT * FROM items')
    mock_cursor.fetchall.assert_called_once()

# Create new item test
@patch('backend.routes.get_db')
def test_create_item_success(mock_get_db, client):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_get_db.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.lastrowid = 3

    new_item_data = {'name': 'New Item', 'description': 'New Description', 'price': 5.99}
    response = client.post(
        '/api/items',
        data=json.dumps(new_item_data),
        content_type='application/json'
    )

    assert response.status_code == 201
    data = json.loads(response.data)

    assert data['id'] == 3
    assert data['name'] == 'New Item'
    assert data['description'] == 'New Description'
    assert data['price'] == 5.99

    mock_cursor.execute.assert_called_with(
        'INSERT INTO items (name, description, price) VALUES (?, ?, ?)',
        ('New Item', 'New Description', 5.99)
    )
    mock_conn.commit.assert_called_once()

# Test cases for creating an item with missing fields
@patch('backend.routes.get_db')
def test_create_item_missing_fields(mock_get_db, client):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_get_db.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    response = client.post(
        '/api/items',
        data=json.dumps({'description': 'Desc', 'price': 10.0}),
        content_type='application/json'
    )
    assert response.status_code == 400
    assert json.loads(response.data)['error'] == "Missing 'name' or 'price' in request body"

    response = client.post(
        '/api/items',
        data=json.dumps({'name': 'Item', 'description': 'Desc'}),
        content_type='application/json'
    )
    assert response.status_code == 400
    assert json.loads(response.data)['error'] == "Missing 'name' or 'price' in request body"

    mock_cursor.execute.assert_not_called()
    mock_conn.commit.assert_not_called()
    mock_get_db.assert_not_called()

# Test cases for creating an item with database errors
@patch('backend.routes.get_db')
def test_create_item_db_error(mock_get_db, client):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_get_db.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.execute.side_effect = sqlite3.Error("Mock DB error during insert")

    new_item_data = {'name': 'Error Item', 'description': 'Desc', 'price': 1.0}
    response = client.post(
        '/api/items',
        data=json.dumps(new_item_data),
        content_type='application/json'
    )

    assert response.status_code == 500
    assert "Database error: Mock DB error during insert" in json.loads(response.data)['error']
    mock_conn.rollback.assert_called_once()


# Test cases for getting a single item
@patch('backend.routes.get_db')
def test_get_single_item(mock_get_db, client):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_get_db.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.description = [('id',), ('name',), ('description',), ('price',)]
    mock_cursor.fetchone.return_value = MockSqliteRow({'id': 1, 'name': 'Item A', 'description': 'Description A', 'price': 10.99}, mock_cursor.description)

    response = client.get('/api/items/1')

    assert response.status_code == 200
    data = json.loads(response.data)

    assert data['id'] == 1
    assert data['name'] == 'Item A'
    assert data['description'] == 'Description A'
    assert data['price'] == 10.99

    mock_cursor.execute.assert_called_with('SELECT * FROM items WHERE id = ?', (1,))
    mock_cursor.fetchone.assert_called_once()

# Test cases for getting a single item that does not exist
@patch('backend.routes.get_db')
def test_get_single_item_not_found(mock_get_db, client):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_get_db.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.fetchone.return_value = None

    response = client.get('/api/items/999')

    assert response.status_code == 404
    data = json.loads(response.data)
    assert data['error'] == 'Item not found'

    mock_cursor.execute.assert_called_with('SELECT * FROM items WHERE id = ?', (999,))
    mock_cursor.fetchone.assert_called_once()

# Test cases for updating an item
@patch('backend.routes.get_db')
def test_update_item_success(mock_get_db, client):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_get_db.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.rowcount = 1
    mock_cursor.description = [('id',), ('name',), ('description',), ('price',)]
    mock_cursor.fetchone.return_value = MockSqliteRow({'id': 1, 'name': 'Updated Item', 'description': 'Updated Description', 'price': 25.00}, mock_cursor.description)


    updated_item_data = {'name': 'Updated Item', 'description': 'Updated Description', 'price': 25.00}
    response = client.put(
        '/api/items/1',
        data=json.dumps(updated_item_data),
        content_type='application/json'
    )

    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['id'] == 1
    assert data['name'] == 'Updated Item'
    assert data['description'] == 'Updated Description'
    assert data['price'] == 25.00

    mock_cursor.execute.assert_any_call(
        'UPDATE items SET name = ?, description = ?, price = ? WHERE id = ?',
        ('Updated Item', 'Updated Description', 25.00, 1)
    )
    mock_cursor.execute.assert_any_call("SELECT * FROM items WHERE id = ?", (1,))
    assert mock_cursor.execute.call_count == 2 

    mock_conn.commit.assert_called_once()

# Test cases for updating an item that does not exist
@patch('backend.routes.get_db')
def test_update_item_not_found(mock_get_db, client):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_get_db.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.rowcount = 0

    updated_item_data = {'name': 'Updated Item', 'description': 'New Description', 'price': 99.99}
    response = client.put(
        '/api/items/999',
        data=json.dumps(updated_item_data),
        content_type='application/json'
    )

    assert response.status_code == 404
    data = json.loads(response.data)
    assert data['error'] == 'Item not found'

    mock_cursor.execute.assert_called_with(
        'UPDATE items SET name = ?, description = ?, price = ? WHERE id = ?',
        ('Updated Item', 'New Description', 99.99, 999)
    )
    mock_conn.commit.assert_called_once()


# Test cases for updating an item with no data provided
@patch('backend.routes.get_db')
def test_update_item_no_data_provided(mock_get_db, client):
    response = client.put(
        '/api/items/1',
        data=json.dumps({}),
        content_type='application/json'
    )
    assert response.status_code == 400
    assert json.loads(response.data)['error'] == "No data provided for update"
    mock_get_db.assert_not_called()


# Test cases for updating an item with database errors
@patch('backend.routes.get_db')
def test_update_item_db_error(mock_get_db, client):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_get_db.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.execute.side_effect = sqlite3.Error("Mock DB update error")

    updated_item_data = {'name': 'Updated Item', 'price': 100.0}
    response = client.put(
        '/api/items/1',
        data=json.dumps(updated_item_data),
        content_type='application/json'
    )

    assert response.status_code == 500
    assert "Database error: Mock DB update error" in json.loads(response.data)['error']
    mock_conn.rollback.assert_called_once()


# Test cases for deleting an item
@patch('backend.routes.get_db')
def test_delete_item_success(mock_get_db, client):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_get_db.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.rowcount = 1

    response = client.delete('/api/items/1')

    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['message'] == 'Item 1 deleted successfully'

    mock_cursor.execute.assert_called_with('DELETE FROM items WHERE id = ?', (1,))
    mock_conn.commit.assert_called_once()

# Test cases for deleting an item that does not exist
@patch('backend.routes.get_db')
def test_delete_item_not_found(mock_get_db, client):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_get_db.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.rowcount = 0

    response = client.delete('/api/items/999')

    assert response.status_code == 404
    data = json.loads(response.data)
    assert data['error'] == 'Item not found'

    mock_cursor.execute.assert_called_with('DELETE FROM items WHERE id = ?', (999,))
    mock_conn.commit.assert_called_once()

# Test cases for deleting an item with database errors
@patch('backend.routes.get_db')
def test_delete_item_db_error(mock_get_db, client):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_get_db.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.execute.side_effect = sqlite3.Error("Mock DB delete error")

    response = client.delete('/api/items/1')

    assert response.status_code == 500
    assert "Database error: Mock DB delete error" in json.loads(response.data)['error']
    mock_conn.rollback.assert_called_once()
