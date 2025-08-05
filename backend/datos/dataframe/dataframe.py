import pandas as pd


import sys
import os

root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../src"))
if root_path not in sys.path:
    sys.path.insert(0, root_path)



from database.db import get_collection

# ============================================== NUTRIENTES ==============================================


# Trabajando con la tabla de NUTRIENTES
df_nutrientes = pd.read_excel("Condensado de biomasa Laboratorio de Macroalgas.xlsx", sheet_name="HojaNutrientes", engine="openpyxl");

# Conversion del nombre de las cabeceras, "Cold season" -> "cold_season"
df_nutrientes.columns = [col.strip().lower().replace(" ", "_") for col in df_nutrientes.columns]

# Separar los valores
nutrientes_long = []

for _ , row in df_nutrientes.iterrows():
    for season in ["cold_season", "dry_season", "rainy_season"]:
        values = [float(v.strip()) for v in str(row[season]).split(",")] # Los separa de la ',' los maximos y minimos
        if len(values) == 1:
            values = values * 2  # Si solo hay un valor, repetirlo como min=max

        nutrientes_long.append({
            "Site": row["site"],
            "Nutrient": row["nutrient"],
            "Season": season,
            "Min": values[0],
            "Max": values[1]
        })

df_nutrientes_long = pd.DataFrame(nutrientes_long)

# print(df_nutrientes_long)


# Se crean las columnas combinadas con Nutriente + tipo de valor
nutrientes_df_long = df_nutrientes_long.melt(
    id_vars=["Site", "Nutrient", "Season"],
    value_vars=["Min", "Max"],
    var_name="Stat",
    value_name="Value"
)

# Columna para pivotear
nutrientes_df_long["Nutrient_Stat"] = nutrientes_df_long["Nutrient"] + "_" + nutrientes_df_long["Stat"]


# Tabla pivote
nutrientes_pivot_stat = nutrientes_df_long.pivot_table(
    index=["Site", "Season"],
    columns="Nutrient_Stat",
    values="Value"
).reset_index()


#print(nutrientes_pivot_stat)











# ============================================== TEMPERATURAS POR SITIO Y TEMPORADAS ==============================================

temporadas = ["cold season", "dry season", "dry season", "dry season", "dry season", "rainy season", "rainy season", "rainy season", "rainy season", "cold season", "cold season"]
df_temp = pd.read_excel("Condensado de biomasa Laboratorio de Macroalgas.xlsx", sheet_name="HojaTemperaturas", engine="openpyxl")

# Escribir los meses en formato largo
df_temp_long = df_temp.melt(id_vars=['Site'], var_name="Month", value_name="Temperature")

# Se unen los meses con las temporadas
df_temporadas = pd.DataFrame({
    "Month": ["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    "Season": ["cold season", "dry season", "dry season", "dry season", "dry season", "rainy season", "rainy season", "rainy season", "rainy season", "cold season", "cold season"]
})

# Se agrega a columna 'Season' a df_temp_long
df_temp_long = df_temp_long.merge(df_temporadas, on="Month", how="left")

# Se eliminan las filas con el site NaN para limpiar la tabla.
df_temp_long = df_temp_long.dropna(subset=['Site'])

# print("\n\n")
# print(df_temp_long.head(10))






# ============================================== BIOMASA ==============================================
df_biomasa = pd.read_excel("Condensado de biomasa Laboratorio de Macroalgas.xlsx", sheet_name="HojaBiomasa", engine="openpyxl")

# Renombrar columna "Sitio" a "Site"
df_biomasa.rename(columns={"Sitio": "Site", "Fecha": "Date"}, inplace=True)

# Convertir la fecha a tipo datetime
# Asegurar que Date sea tipo datetime
df_biomasa["Date"] = pd.to_datetime(df_biomasa["Date"])

# Extraer el mes y año
df_biomasa["Month"] = df_biomasa["Date"].dt.strftime("%b")  # Ej: 'Mar'
df_biomasa["Year"] = df_biomasa["Date"].dt.year

# Definir la temporada de clima por mes
# Mapear temporada por mes
season_map = {
    'Feb': 'cold_season', 'Mar': 'dry_season', 'Apr': 'dry_season', 'May': 'dry_season',
    'Jun': 'dry_season', 'Jul': 'rainy_season', 'Aug': 'rainy_season', 'Sep': 'rainy_season',
    'Oct': 'rainy_season', 'Nov': 'cold_season', 'Dec': 'cold_season'
}

df_biomasa["Season"] = df_biomasa["Month"].map(season_map)

# Las algas aqui ya son una columna.
df_biomasa_long = df_biomasa.melt(
    id_vars=["Site", "Date", "Month", "Year", "Season"],
    var_name="Alga",
    value_name="Biomass"
)

# Si quieres eliminar valores donde la biomasa es 0
df_biomasa_long = df_biomasa_long[df_biomasa_long["Biomass"] > 0]



#df_biomasa_long.to_html("biomasa_formateada.html", index=False)
#print("✅ HTML generado en: html/biomasa_formateada.html")



# ============================================== MERGE ==============================================
df_merge = pd.merge(
    df_biomasa_long,
    nutrientes_pivot_stat,
    how="left",
    on=["Site", "Season"]
)

df_final = pd.merge(
    df_merge,
    df_temp_long[["Site", "Month", "Temperature"]],  # aseguramos que solo usemos las columnas necesarias
    how="left",
    on=["Site", "Month"]
)


df_final.to_html("html/dataset_completo.html", index=False)
print("✅ Dataset final guardado como HTML")


# ⚠️ Reemplaza los NaN por None para evitar errores de inserción
df_final = df_final.where(pd.notnull(df_final), None)

# ⚠️ Asegura que 'Date' sea tipo datetime (Mongo lo reconocerá así)
if 'Date' in df_final.columns:
    df_final['Date'] = pd.to_datetime(df_final['Date'], errors='coerce')



# Convertir a lista de diccionarios
records = df_final.to_dict(orient="records")


# Obtener colección
collection = get_collection("dataset")  # Puedes usar otro nombre si lo prefieres


#Insertar si hay registros
if records:
    collection.insert_many(records)
    print("✅ Datos insertados en MongoDB correctamente.")
else:
    print("⚠️ No hay datos para insertar.")


# df_final.to_html("html/dataset_completo.html", index=False)
# print("✅ Dataset final guardado como HTML")


