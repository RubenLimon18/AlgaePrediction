from database.db import get_collection

# Definicion de los índices
def create_indexes():

    algaes_collection = get_collection('dataset')
    algaes_collection.create_index("Site")
    algaes_collection.create_index("Season")
    algaes_collection.create_index("Date")