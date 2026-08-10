import os
import sys
import re

def generar_presentacion(markdown_path):
    # Rutas
    template_path = os.path.join(os.path.dirname(__file__), "reveal_template.html")
    drive_folder = "/Users/felipelopezsalazar/Library/CloudStorage/GoogleDrive-d.flopez54@dgb.edu.mx/Mi unidad/01_Trabajo_Academico/Ciclo_2026-2027/Semestre_A/Cultura_Digital_I/Presentaciones/Semana_1"
    
    # Asegurar que exista la carpeta en Drive
    if not os.path.exists(drive_folder):
        os.makedirs(drive_folder)
        
    # Leer el Markdown
    with open(markdown_path, 'r', encoding='utf-8') as f:
        md_content = f.read()
        
    # Limpiar Frontmatter YAML (--- ... ---) al inicio del archivo
    md_content = re.sub(r'^---\n.*?\n---\n', '', md_content, flags=re.DOTALL)
    
    # Limpiar los '---' sueltos que usa el usuario como separadores para que no causen dobles saltos
    md_content = re.sub(r'\n---\n', '\n\n', md_content)
    
    # Limpiar Callouts de Obsidian (ej. > [!info])
    md_content = re.sub(r'> \[!.*?\] (.*?)\n', r'> **\1**\n>\n', md_content)
    md_content = re.sub(r'> \[!.*?\]\n', r'> \n', md_content)

    # Reemplazar SOLO encabezados principales (# ) con un separador de diapositiva.
    # Dejamos los (## y ###) intactos para que se agrupen en la misma diapositiva.
    md_content = re.sub(r'\n(# )', r'\n\n---\n\n\1', md_content)

    # Eliminar cualquier separador vacío al principio
    md_content = re.sub(r'^\s*---\s*', '', md_content)

    # Preparar el bloque Reveal.js Markdown
    # data-separator captura '---'
    reveal_block = f"""
<section data-markdown data-separator="^\\n---\\n$">
<textarea data-template>
{md_content.strip()}
</textarea>
</section>
"""

    # Leer la plantilla HTML
    with open(template_path, 'r', encoding='utf-8') as f:
        html_template = f.read()
        
    # Inyectar el contenido
    final_html = html_template.replace("<!-- CONTENT_PLACEHOLDER -->", reveal_block)
    
    # Escribir el archivo final en Drive
    base_name = os.path.basename(markdown_path).replace(".md", ".html")
    output_path = os.path.join(drive_folder, base_name)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(final_html)
        
    print(f"✅ ¡Éxito! Presentación lineal generada en:\n{output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python generar_reveal.py /ruta/a/la/nota.md")
    else:
        generar_presentacion(sys.argv[1])
