import os
import zipfile
import tempfile
import re
import pytesseract
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from PIL import Image

INPUT_DIR = "/Users/felipelopezsalazar/Library/Mobile Documents/com~apple~CloudDocs/School/CEB/01_Academico_y_Clases/Ciclo_2025-2026/Semestre_B_Feb-Jun/Material_2025-2026/Consulta Express"
OUTPUT_PDF = os.path.join(INPUT_DIR, "Reporte_X-Press_Grupo_210.pdf")

def extract_last_image_from_docx(docx_path, temp_dir):
    """
    Extrae la imagen del .docx que contenga texto relacionado con 'Consulta X-Press'.
    Si ninguna imagen hace match con el OCR, devuelve la última imagen por defecto.
    """
    try:
        with zipfile.ZipFile(docx_path, 'r') as docx_zip:
            # Buscar todos los archivos en word/media/
            media_files = [f for f in docx_zip.namelist() if f.startswith('word/media/') and f.lower().endswith(('.png', '.jpeg', '.jpg'))]
            
            if not media_files:
                return None
                
            # Ordenar por el número en el nombre del archivo (ej. image1.jpeg, image10.jpeg)
            def extract_num(filename):
                match = re.search(r'\d+', filename)
                return int(match.group()) if match else 0
                
            media_files.sort(key=extract_num)
            
            # Recorrer las imágenes de atrás hacia adelante
            for image_file in reversed(media_files):
                extracted_path = docx_zip.extract(image_file, temp_dir)
                try:
                    # Aplicar OCR para buscar palabras clave
                    text = pytesseract.image_to_string(Image.open(extracted_path)).lower()
                    if "x-press" in text or "express" in text or "consulta" in text or "participación" in text:
                        print(f"    -> Se encontró imagen correcta con OCR: {image_file}")
                        return extracted_path
                except Exception as e:
                    print(f"    -> Error en OCR para {image_file}: {e}")
                    pass
            
            # Si no encontró ninguna con las palabras clave, devuelve la última (por defecto)
            print("    -> No se encontró coincidencia por OCR, se usa la última imagen.")
            last_image = media_files[-1]
            return docx_zip.extract(last_image, temp_dir)
            
    except Exception as e:
        print(f"Error procesando {docx_path}: {e}")
        return None

def build_pdf_report(students_data):
    doc = SimpleDocTemplate(OUTPUT_PDF, pagesize=letter,
                            rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        alignment=1,
        fontSize=18,
        spaceAfter=10,
        textColor=colors.HexColor("#0f172a")
    )
    student_style = ParagraphStyle(
        'StudentStyle',
        parent=styles['Heading2'],
        alignment=0,
        fontSize=14,
        spaceAfter=10,
        textColor=colors.HexColor("#0f172a")
    )
    
    elements = []
    
    # Portada del reporte
    elements.append(Paragraph("<b>CENTRO DE ESTUDIOS DE BACHILLERATO 5/4</b>", title_style))
    elements.append(Paragraph("<b>REPORTE DE PARTICIPACIÓN: CONSULTA X-PRESS</b>", title_style))
    elements.append(Paragraph("Grupo: 210 | Asignatura: Cultura Digital II", styles['Normal']))
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("Este documento contiene las capturas de pantalla de la finalización de la encuesta X-Press extraídas de los portafolios de los alumnos (Semana 9).", styles['Normal']))
    elements.append(PageBreak())
    
    # Procesar cada estudiante
    for data in sorted(students_data, key=lambda x: x['name']):
        elements.append(Paragraph(f"<b>Alumno(a):</b> {data['name']}", student_style))
        elements.append(Spacer(1, 10))
        
        if data['image_path']:
            try:
                # Redimensionar la imagen para que quepa en la página
                img = Image.open(data['image_path'])
                w, h = img.size
                
                # Max width/height for letter page with margins
                max_width = 500
                max_height = 600
                
                ratio = min(max_width/w, max_height/h)
                
                new_w = w * ratio
                new_h = h * ratio
                
                rl_img = RLImage(data['image_path'], width=new_w, height=new_h)
                elements.append(rl_img)
            except Exception as e:
                elements.append(Paragraph(f"<i>Error al cargar la imagen: {str(e)}</i>", styles['Normal']))
        else:
            elements.append(Paragraph("<i>No se encontró ninguna imagen en el portafolio de este estudiante.</i>", styles['Normal']))
            
        elements.append(PageBreak())
        
    doc.build(elements)
    print(f"✅ Reporte PDF generado exitosamente en: {OUTPUT_PDF}")

def main():
    if not os.path.exists(INPUT_DIR):
        os.makedirs(INPUT_DIR)
        print(f"📁 Se creó la carpeta {INPUT_DIR}.")
        print("Por favor, coloca los archivos .docx ahí y vuelve a ejecutar.")
        return

    docx_files = []
    for root, dirs, files in os.walk(INPUT_DIR):
        for file in files:
            if file.endswith('.docx') and not file.startswith('~'):
                docx_files.append(os.path.join(root, file))
    
    if not docx_files:
        print(f"⚠️ No hay archivos .docx en la carpeta {INPUT_DIR}.")
        return
        
    students_data = []
    
    # Crear un directorio temporal para las imágenes
    with tempfile.TemporaryDirectory() as temp_dir:
        for docx_path in docx_files:
            print(f"Procesando: {docx_path}")
            
            # Obtener solo el nombre del archivo
            filename = os.path.basename(docx_path)
            # Limpiar nombre del alumno (quitar "- Portafolio 2o. Parcial")
            name = filename.replace("- Portafolio 2o. Parcial", "").replace(".docx", "").replace(" (1)", "").replace(" (2)", "").strip()
            
            image_path = extract_last_image_from_docx(docx_path, temp_dir)
            
            students_data.append({
                'name': name,
                'image_path': image_path
            })
            
        print("Generando PDF...")
        build_pdf_report(students_data)

if __name__ == "__main__":
    main()
