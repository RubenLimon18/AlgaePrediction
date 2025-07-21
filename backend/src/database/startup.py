from database.db import get_collection

# Definicion de los índices
def create_indexes():
    # Todo_collection
    todo_collection = get_collection("todo_collection")
    todo_collection.create_index("name")
    todo_collection.create_index("description")
    todo_collection.create_index("complete")