#Los esquemas sirven para validar los datos antes de enviar/recibir de MongoDB

def individual_serial(todo) -> dict :
    return {
        "id": str(todo["_id"]),
        "name": str(todo["name"]),
        "description": str(todo["description"]),
        "complete": str(todo["complete"])
    }

def list_serial(todos) -> list :
    return [individual_serial(todo) for todo in todos]