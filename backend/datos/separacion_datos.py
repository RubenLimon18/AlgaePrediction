import pandas as pd
import webbrowser
import os


# Cargar hojas por índice: 0 = Hoja1, 2 = Hoja3, 3 = Hoja4
hojas = pd.read_excel("Condensado de biomasa Laboratorio de Macroalgas.xlsx", sheet_name=['Hoja1', 'Hoja3', 'Hoja4'], engine="openpyxl")
df = pd.read_excel("Condensado de biomasa Laboratorio de Macroalgas.xlsx", sheet_name="Hoja1", engine="openpyxl")

# Acceder a las hojas
df_hoja1 = hojas['Hoja1']
df_hoja3 = hojas['Hoja3']
df_hoja4 = hojas['Hoja4']

# HTML HOJA 1
html_table = df.to_html(index=False)

# Guardar el archivo HTML
with open("Datos_tabla_1.html", "w", encoding="utf-8") as f:
    f.write(html_table)

# Abrirlo automaticamente en el navegador
ruta_html = os.path.abspath("Datos_tabla_1.html")
# webbrowser.open(f"file://{ruta_html}")







# ORGANIZACIÓN DE LOS DATOS POR AÑOS HOJA 1
df["Fecha"] = pd.to_datetime(df["Fecha"], dayfirst=True)  # Asegúrate de usar el nombre real de la columna

# Extraer el año
df["Año"] = df["Fecha"].dt.year




# Filtar datos por cada sitio
for sitio, grupo in df.groupby("Sitio"):
    os.makedirs(sitio, exist_ok=True)
    
    nombre_archivo = f"{sitio.replace(' ', '_').lower()}.html"
    ruta_completa = os.path.join(sitio, nombre_archivo)

    html_table = grupo.to_html(index=False)

    with open(ruta_completa, "w", encoding="utf-8") as f:
        f.write(html_table)

    print(f"Archivo completo creado en: {ruta_completa}")



# Agrupar por la columna 'Sitio' y luego por 'Año'
for (sitio, año), grupo in df.groupby(["Sitio", "Año"]):
    archivo = f"{año}.html"
    ruta_archivo_año = os.path.join(sitio, archivo)

    html_table = grupo.to_html(index=False)

    with open(ruta_archivo_año, "w", encoding="utf-8") as f:
        f.write(html_table)

    print(f"Archivo por año creado en: {ruta_archivo_año}")







