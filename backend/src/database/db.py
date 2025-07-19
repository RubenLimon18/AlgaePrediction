from pymongo import MongoClient
from config.settings import settings

class MongoDB:
    client = MongoClient(settings.MONGODB_URL) #
    database = client[settings.DATABASE_NAME] # algaetrack


db = MongoDB()


# Funcion para obtener la coleccion que necesitemos
def get_collection(name: str):
    return db.database[name]

def get_database():
    return db.database






# users_collection = db.database.users
    # users_collection.create_index("email", unique=True)
    # users_collection.create_index("verification_token")
    # users_collection.create_index("invitation_token")
    # users_collection.create_index("magic_link_token")