import os
import re
import pdfplumber
import pandas as pd
from reportlab.lib.pagesizes import landscape, letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

INPUT_DIR = "Listas_Originales"
OUTPUT_DIR = "Listas_Mejoradas"

# Create directories if they don't exist
os.makedirs(INPUT_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

def parse_pdf(pdf_path):
    print(f"📄 Procesando: {os.path.basename(pdf_path)}")
    students = []
    metadata = {"materia": "Materia Desconocida", "docente": "Docente Desconocido", "grupo": "Grupo Desconocido"}
    
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if not text:
                continue
                
            lines = text.split("\n")
            for line in lines:
                line = line.strip()
                
                # Intentar extraer metadatos simples si están presentes en la cabecera
                if "Cultura Digital" in line or "Ciclo" in line:
                    metadata["materia"] = line.split("·")[0].strip()
                    
                # Expresión regular robusta para detectar la fila de un alumno
                # Busca: [Numero] [CURP 18 caracteres] [Nombre con espacios]
                match = re.match(r'^(\d+)\s+([A-Z0-9]{18})\s+([A-ZÑÁÉÍÓÚ\s]+?)(?=\s+\d|\s+100%|$)', line)
                
                if match:
                    numero = match.group(1).strip()
                    curp = match.group(2).strip()
                    nombre = match.group(3).strip()
                    
                    # Evitar duplicados por múltiples páginas
                    if not any(s['curp'] == curp for s in students):
                        students.append({
                            "numero": numero,
                            "curp": curp,
                            "nombre": nombre
                        })
                        
    return students, metadata

def export_to_excel(students, metadata, base_name):
    df = pd.DataFrame(students)
    df.columns = ["No.", "CURP", "Nombre Completo"]
    
    output_path = os.path.join(OUTPUT_DIR, f"{base_name}_Optimizada.xlsx")
    
    with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name="Asistencia")
        # Ajustar ancho de columnas
        worksheet = writer.sheets["Asistencia"]
        worksheet.column_dimensions['A'].width = 5
        worksheet.column_dimensions['B'].width = 22
        worksheet.column_dimensions['C'].width = 45
        
    print(f"✅ Excel guardado: {output_path}")

def export_to_pdf(students, metadata, base_name):
    output_path = os.path.join(OUTPUT_DIR, f"{base_name}_Optimizada.pdf")
    doc = SimpleDocTemplate(output_path, pagesize=landscape(letter),
                            rightMargin=20, leftMargin=20, topMargin=20, bottomMargin=20)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        alignment=1, # Center
        fontSize=14,
        spaceAfter=6
    )
    subtitle_style = ParagraphStyle(
        'SubtitleStyle',
        parent=styles['Normal'],
        alignment=1,
        fontSize=11,
        spaceAfter=15
    )
    
    elements = []
    
    elements.append(Paragraph("<b>CENTRO DE ESTUDIOS DE BACHILLERATO 5/4</b>", title_style))
    elements.append(Paragraph('"Profr. Rafael Ramírez" C.C.T. 13DBP0001Z', subtitle_style))
    elements.append(Paragraph(f"<b>Materia:</b> {metadata['materia']} | <b>Lista de Asistencia Rediseñada</b>", subtitle_style))
    
    # Preparar datos de la tabla
    # Agregamos 15 columnas vacías para firmas
    col_width_num = 25
    col_width_curp = 100
    col_width_name = 200
    col_width_empty = 25
    num_empty = 15
    
    data = [["No.", "CURP", "NOMBRE DEL ALUMNO(A)"] + ["" for _ in range(num_empty)]]
    
    for s in students:
        data.append([s['numero'], s['curp'], s['nombre']] + ["" for _ in range(num_empty)])
        
    table = Table(data, colWidths=[col_width_num, col_width_curp, col_width_name] + [col_width_empty]*num_empty)
    
    # Estilo de la tabla
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0f172a")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        
        # Estilos del cuerpo
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),  # ¡Letra más grande y legible!
        ('ALIGN', (0, 1), (0, -1), 'CENTER'), # Centrar número
        ('ALIGN', (1, 1), (1, -1), 'CENTER'), # Centrar CURP
        ('ALIGN', (2, 1), (2, -1), 'LEFT'),   # Alinear nombre a la izquierda
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        
        # Bordes de la cuadrícula
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    
    elements.append(table)
    doc.build(elements)
    print(f"✅ PDF guardado: {output_path}")

def main():
    pdfs = [f for f in os.listdir(INPUT_DIR) if f.lower().endswith(".pdf")]
    
    if not pdfs:
        print("⚠️ No hay archivos PDF en la carpeta 'Listas_Originales'.")
        print("Coloca los archivos que descargaste de la plataforma externa ahí y vuelve a ejecutar este script.")
        return
        
    for pdf_file in pdfs:
        pdf_path = os.path.join(INPUT_DIR, pdf_file)
        base_name = os.path.splitext(pdf_file)[0]
        
        students, metadata = parse_pdf(pdf_path)
        
        if not students:
            print(f"❌ No se pudo extraer a los alumnos de {pdf_file}. Revisa el formato.")
            continue
            
        print(f"   Encontrados {len(students)} alumnos.")
        export_to_excel(students, metadata, base_name)
        export_to_pdf(students, metadata, base_name)

if __name__ == "__main__":
    main()
