from typing import Collection

from database.db import get_database


class AlgaeService:
    
    def __init__(self):
        self.db = None
        self.algaes_collection: Collection = None

    def get_algaes_collection(self) -> Collection:
        if self.db is None:
            self.db = get_database()
            self.algaes_collection = self.db.dataset
        
        return self.algaes_collection
    
