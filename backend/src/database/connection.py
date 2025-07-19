from pymongo import MongoClient
from config.settings import settings

class MongoDB:
    client: MongoClient = None
    database = None

db = MongoDB()

async def connect_to_mongo():
    db.client = MongoClient(settings.MONGODB_URL)
    db.database = db.client[settings.DATABASE_NAME]
    
    # Create indexes
    await create_indexes()

async def close_mongo_connection():
    if db.client:
        db.client.close()

async def create_indexes():
    # User collection indexes
    users_collection = db.database.users
    users_collection.create_index("email", unique=True)
    users_collection.create_index("verification_token")
    users_collection.create_index("invitation_token")
    users_collection.create_index("magic_link_token")

def get_database():
    return db.database