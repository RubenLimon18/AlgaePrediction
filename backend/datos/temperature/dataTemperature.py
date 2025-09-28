import pandas as pd
import sys
import os

# Agrega el src al sys.path
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../src"))
if root_path not in sys.path:
    sys.path.insert(0, root_path)

from database.db import get_collection

# =================== LECTURA DEL EXCEL ===================
EXCEL_FILE = "biomasa_algas_promedio.xlsx"
SHEET_NAME = "HojaTemperaturas"

# Leer el archivo
df_temp = pd.read_excel(EXCEL_FILE, sheet_name=SHEET_NAME, engine="openpyxl")

# Reshape (de ancho a largo)
df_long = df_temp.melt(id_vars=["Site"], var_name="Month", value_name="valor")

# Eliminar filas sin sitio
df_long = df_long.dropna(subset=["Site"])
df_long["Site"] = df_long["Site"].str.strip()
df_long["Month"] = df_long["Month"].str.strip()

# Agregar temporada por mes
season_map = {
    "Feb": "Cold", "Mar": "Dry", "Apr": "Dry", "May": "Dry", "Jun": "Dry",
    "Jul": "Rainy", "Aug": "Rainy", "Sep": "Rainy", "Oct": "Rainy",
    "Nov": "Cold", "Dec": "Cold"
}
df_long["season"] = df_long["Month"].map(season_map)

# Agrupar por sitio y armar estructura tipo:
# {
#   id: 1,
#   name: "Tecolote",
#   data: [{site: ..., valor: ..., month: ..., season: ...}]
# }
documentos = []
for idx, (site_name, group) in enumerate(df_long.groupby("Site"), start=1):
    data = []
    for _, row in group.iterrows():
        if pd.notnull(row["valor"]):
            data.append({
                "site": site_name,
                "valor": float(row["valor"]),
                "month": row["Month"],
                "season": row["season"]
            })
    documentos.append({
        "id": idx,
        "name": site_name,
        "data": data
    })

# =================== MONGO: INSERCIÓN/ACTUALIZACIÓN ===================
collection = get_collection("temperature")

for doc in documentos:
    result = collection.update_one(
        {"name": doc["name"]},
        {"$set": doc},
        upsert=True
    )
    action = "🆕 Insertado" if result.upserted_id else "🔁 Actualizado"
    print(f"{action}: {doc['name']}")

print("✅ Datos procesados y enviados a MongoDB.")
