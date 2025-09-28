from database.db import get_collection #funcion para obtener cualquier coleccion 

# funcion helper para mapear un documento de mongo a dict valido
def parameter_helper(doc) -> dict:
    return {
        "id": doc["id"],
        "name": doc["name"],
        "data": doc["data"]
    }

def get_all_parameters(collection_name: str):
    collection = get_collection(collection_name)
    parameters = []
    for doc in collection.find():  # <- sin async
        parameters.append(parameter_helper(doc))
    return parameters
