import xlsxwriter
from datetime import date, timedelta

OUTPUT_PATH = "/Users/felipelopezsalazar/Library/CloudStorage/GoogleDrive-d.flopez54@dgb.edu.mx/Mi unidad/01_Trabajo_Academico/Ciclo_2026-2027/Semestre_A/Cultura_Digital_I/Administrativo/Propuesta_Calendario_Semestre_A.xlsx"

def generate_calendar():
    workbook = xlsxwriter.Workbook(OUTPUT_PATH)
    
    # --- Estilos (Formatos) compartidos ---
    title_format = workbook.add_format({'bold': True, 'font_size': 14, 'align': 'center', 'valign': 'vcenter', 'font_color': '#1C3144'})
    subtitle_format = workbook.add_format({'bold': True, 'font_size': 12, 'align': 'center', 'valign': 'vcenter', 'font_color': '#3F88C5'})
    header_format = workbook.add_format({'bold': True, 'bg_color': '#1C3144', 'font_color': 'white', 'align': 'center', 'valign': 'vcenter', 'border': 1})
    week_format = workbook.add_format({'align': 'center', 'valign': 'vcenter', 'border': 1, 'bg_color': '#F0F4F8', 'bold': True})
    date_format = workbook.add_format({'align': 'center', 'valign': 'vcenter', 'border': 1, 'bg_color': '#F0F4F8'})
    dropdown_format = workbook.add_format({'align': 'left', 'valign': 'vcenter', 'border': 1})
    nota_format = workbook.add_format({'italic': True, 'font_size': 10, 'font_color': '#555555', 'align': 'left'})
    
    block_colors = {
        "Inicio": '#E3F2FD', "Parcial_1": '#E8F5E9', "Parcial_2": '#FFF3E0',
        "Parcial_3": '#F3E5F5', "Cierre": '#FFEBEE', "Suspensiones": '#ECEFF1'
    }
    
    cell_formats = {k: workbook.add_format({'align': 'left', 'valign': 'vcenter', 'border': 1, 'text_wrap': True, 'bg_color': v}) for k, v in block_colors.items()}
    center_formats = {k: workbook.add_format({'align': 'center', 'valign': 'vcenter', 'border': 1, 'text_wrap': True, 'bg_color': v}) for k, v in block_colors.items()}
    
    meses_es = {1: "Ene", 2: "Feb", 3: "Mar", 4: "Abr", 5: "May", 6: "Jun", 7: "Jul", 8: "Ago", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dic"}
    areas = ["Dirección", "Subdirección", "Docentes", "Alumnos", "Control Escolar", "Administrativo"]

    def create_sheet(sheet_name, title_period, start_date, actividades, is_semestre_b=False):
        worksheet = workbook.add_worksheet(sheet_name)
        
        # Configuracion de anchos de columna
        worksheet.set_column('A:A', 50)
        worksheet.set_column('B:B', 20)
        worksheet.set_column('C:C', 30)
        worksheet.set_column('D:D', 2)
        worksheet.set_column('E:E', 15)
        worksheet.set_column('F:F', 25)
        worksheet.set_column('G:G', 20)
        
        # --- Títulos ---
        worksheet.merge_range('A1:G1', 'Subsecretaría de Educación Media Superior', title_format)
        worksheet.merge_range('A2:G2', 'Dirección General de Bachillerato', title_format)
        worksheet.merge_range('A3:G3', 'Centro de Estudios de Bachillerato 5/4 "Profr. Rafael Ramírez"', title_format)
        worksheet.merge_range('A4:G4', 'C.C.T. 13DBP0001Z', subtitle_format)
        worksheet.merge_range('A6:G6', f'CALENDARIO DE ACTIVIDADES {title_period}', title_format)
        worksheet.merge_range('A7:G7', 'CICLO ESCOLAR 2026-2027', subtitle_format)
        
        # --- Encabezados ---
        row = 8
        worksheet.write(row, 0, 'ACTIVIDADES', header_format)
        worksheet.write(row, 1, 'RESPONSABLE', header_format)
        worksheet.write(row, 2, 'FECHA', header_format)
        worksheet.write(row, 3, '', workbook.add_format({'bg_color': '#FFFFFF'}))
        worksheet.write(row, 4, 'SEMANA', header_format)
        worksheet.write(row, 5, 'RANGO DE FECHAS', header_format)
        worksheet.write(row, 6, 'ÁREAS', header_format)
        row += 1
        
        worksheet.freeze_panes(9, 1)
        
        # Escribir filas de actividades
        for act, resp, fecha, bloque in actividades:
            worksheet.write(row, 0, act, cell_formats[bloque])
            worksheet.write(row, 1, resp, center_formats[bloque])
            worksheet.write(row, 2, fecha, center_formats[bloque])
            
            worksheet.write(row, 6, "", dropdown_format)
            worksheet.data_validation(row, 6, row, 6, {'validate': 'list', 'source': areas})
            row += 1
            
        # Escribir semanas y fechas a la derecha
        week_row = 9
        current_date = start_date
        
        # Para Semestre B, Semana Santa (dos semanas de vacaciones) interrumpe las clases,
        # así que la lógica de 16 semanas efectivas requiere saltar 2 semanas.
        total_weeks = 22 if is_semestre_b else 20
        
        semana_clase = 1
        for w in range(total_weeks):
            end_date = current_date + timedelta(days=4)
            mes_str = meses_es[current_date.month]
            date_str = f"{current_date.day} al {end_date.day} de {mes_str}"
            
            if w < 2:
                semana_label = f"Gestión {w+1}"
            else:
                if is_semestre_b and current_date >= date(2027, 3, 22) and current_date <= date(2027, 4, 4):
                    semana_label = "Semana Santa (Vacaciones)"
                elif semana_clase <= 16:
                    semana_label = f"Semana {semana_clase:02d}."
                    semana_clase += 1
                else:
                    semana_label = "Cierre"
                
            worksheet.write(week_row, 4, semana_label, week_format)
            worksheet.write(week_row, 5, date_str, date_format)
            
            current_date += timedelta(days=7)
            week_row += 1
            
        worksheet.merge_range(f'A{row+1}:G{row+1}', 'NOTA: ENTREGA DE CALIFICACIONES GLOBALES A CONTROL ESCOLAR SERA AL DIA SIGUIENTE DE CONCLUIR EL CURSO', nota_format)

    # ==========================
    # DATOS SEMESTRE A
    # ==========================
    actividades_a = [
        # --- Inicio de Semestre ---
        ("📝 Reinscripción Tercer Semestre", "Control escolar", "", "Inicio"),
        ("📝 Reinscripción Quinto Semestre", "Control escolar", "", "Inicio"),
        ("📝 Reinscripción Primer Semestre", "Control escolar", "", "Inicio"),
        ("👨‍🏫 Actualización docente", "Subdirección", "", "Inicio"),
        ("🤝 Primer Reunión de Trabajo Colegiado (MCCEMS)", "Subdirección", "", "Inicio"),
        ("🚀 Inicio de clases del semestre A", "", "31 de Ago", "Inicio"),
        ("🙋 Solicitud de Cursos Intrasemestrales", "Estudiantes", "", "Inicio"),
        ("📚 Curso Intrasemestral", "Estudiantes", "", "Inicio"),
        ("🧠 Examen Diagnóstico de nuevo ingreso", "Docentes", "", "Inicio"),
        
        # --- Primer Parcial ---
        ("📅 Periodo del primer parcial", "Docentes", "", "Parcial_1"),
        ("📝 Primera Evaluación parcial", "Docentes", "", "Parcial_1"),
        ("✅ Entrega de Calificaciones a Control Escolar", "Docentes", "", "Parcial_1"),
        ("📄 Entrega de Boletas a padres de familia", "Tutor de Grupo", "", "Parcial_1"),
        ("🤝 Segunda Reunión de Academia", "Subdirección", "", "Parcial_1"),
        
        # --- Segundo Parcial ---
        ("📅 Periodo del segundo parcial", "Docentes", "", "Parcial_2"),
        ("📝 Segunda Evaluación parcial", "Docentes", "", "Parcial_2"),
        ("✅ Entrega de Calificaciones a Control Escolar", "Docentes", "", "Parcial_2"),
        ("📄 Entrega de Boletas a padres de familia", "Tutor de Grupo", "", "Parcial_2"),
        ("🌍 Proyectos Transversales", "Docentes", "", "Parcial_2"),
        
        # --- Tercer Parcial y Finales ---
        ("📅 Periodo del tercer parcial", "Docentes", "", "Parcial_3"),
        ("📝 Tercer evaluación parcial", "Docentes", "", "Parcial_3"),
        ("🎯 Periodo de evaluación final", "Docentes", "", "Parcial_3"),
        
        # --- Cierre de Semestre ---
        ("🛑 Fin de clases para listas de asistencia", "Docentes", "18 de Dic", "Cierre"),
        ("📑 Entrega de listas y calificaciones semestrales", "Docentes", "", "Cierre"),
        ("🤝 Tercer Reunión de Academia", "Subdirección", "", "Cierre"),
        ("💾 Captura de actas finales", "Docentes", "", "Cierre"),
        ("🗣️ Reunión previa a intersemestrales", "Estudiantes", "", "Cierre"),
        ("🙋 Solicitudes de Intersemestral", "Estudiantes", "", "Cierre"),
        ("📚 Periodo de Curso intersemestral", "Docentes", "", "Cierre"),
        ("🧹 Labor social", "Docentes", "", "Cierre"),
        ("✅ Entrega de calificaciones de intersemestral", "Docentes", "", "Cierre"),
        # NOTA: Se eliminó CLAUSURA del semestre A
        
        # --- Suspensiones ---
        ("🇲🇽 Aniversario de la Independencia", "", "16 de Sep", "Suspensiones"),
        ("💀 Día de Muertos", "", "2 de Nov", "Suspensiones"),
        ("🐎 Revolución Mexicana", "", "16 de Nov", "Suspensiones"),
        ("🎄 Periodo Vacacional (Invierno)", "", "21 Dic - 6 Ene", "Suspensiones"),
    ]
    
    # ==========================
    # DATOS SEMESTRE B
    # ==========================
    actividades_b = [
        # --- Inicio de Semestre ---
        ("📝 Reinscripción Segundo Semestre", "Control escolar", "", "Inicio"),
        ("📝 Reinscripción Cuarto Semestre", "Control escolar", "", "Inicio"),
        ("📝 Reinscripción Sexto Semestre", "Control escolar", "", "Inicio"),
        ("👨‍🏫 Actualización docente", "Subdirección", "", "Inicio"),
        ("🤝 Primer Reunión de Trabajo Colegiado (MCCEMS)", "Subdirección", "", "Inicio"),
        ("🚀 Inicio de clases del semestre B", "", "1 de Feb", "Inicio"),
        ("🙋 Solicitud de Cursos Intrasemestrales", "Estudiantes", "", "Inicio"),
        ("📚 Curso Intrasemestral", "Estudiantes", "", "Inicio"),
        
        # --- Primer Parcial ---
        ("📅 Periodo del primer parcial", "Docentes", "", "Parcial_1"),
        ("📝 Primera Evaluación parcial", "Docentes", "", "Parcial_1"),
        ("✅ Entrega de Calificaciones a Control Escolar", "Docentes", "", "Parcial_1"),
        ("📄 Entrega de Boletas a padres de familia", "Tutor de Grupo", "", "Parcial_1"),
        ("🤝 Segunda Reunión de Academia", "Subdirección", "", "Parcial_1"),
        
        # --- Segundo Parcial ---
        ("📅 Periodo del segundo parcial", "Docentes", "", "Parcial_2"),
        ("📝 Segunda Evaluación parcial", "Docentes", "", "Parcial_2"),
        ("✅ Entrega de Calificaciones a Control Escolar", "Docentes", "", "Parcial_2"),
        ("📄 Entrega de Boletas a padres de familia", "Tutor de Grupo", "", "Parcial_2"),
        ("🌍 Proyectos Transversales", "Docentes", "", "Parcial_2"),
        
        # --- Tercer Parcial y Finales ---
        ("📅 Periodo del tercer parcial", "Docentes", "", "Parcial_3"),
        ("📝 Tercer evaluación parcial", "Docentes", "", "Parcial_3"),
        ("🎯 Periodo de evaluación final", "Docentes", "", "Parcial_3"),
        
        # --- Cierre de Semestre ---
        ("🛑 Fin de clases para listas de asistencia", "Docentes", "", "Cierre"),
        ("📑 Entrega de listas y calificaciones semestrales", "Docentes", "", "Cierre"),
        ("🤝 Tercer Reunión de Academia", "Subdirección", "", "Cierre"),
        ("💾 Captura de actas finales", "Docentes", "", "Cierre"),
        ("🗣️ Reunión previa a intersemestrales", "Estudiantes", "", "Cierre"),
        ("🙋 Solicitudes de Intersemestral", "Estudiantes", "", "Cierre"),
        ("📚 Periodo de Curso intersemestral", "Docentes", "", "Cierre"),
        ("🧹 Labor social", "Docentes", "", "Cierre"),
        ("✅ Entrega de calificaciones de intersemestral", "Docentes", "", "Cierre"),
        ("🎓 CLAUSURA", "Docentes", "", "Cierre"),
        
        # --- Suspensiones ---
        ("📜 Aniversario de la Constitución", "", "1 de Feb", "Suspensiones"),
        ("⚖️ Natalicio de Benito Juárez", "", "15 de Mar", "Suspensiones"),
        ("🏖️ Semana Santa (Vacaciones)", "", "Marzo - Abril", "Suspensiones"),
        ("🎖️ Batalla de Puebla", "", "5 de May", "Suspensiones"),
        ("👩‍🏫 Día del Maestro", "", "15 de May", "Suspensiones"),
    ]

    create_sheet('Semestre A (2026)', 'SEMESTRE "A" AGOSTO - DICIEMBRE 2026', date(2026, 8, 17), actividades_a, is_semestre_b=False)
    create_sheet('Semestre B (2027)', 'SEMESTRE "B" FEBRERO - JUNIO 2027', date(2027, 1, 18), actividades_b, is_semestre_b=True)

    workbook.close()
    print(f"Propuesta generada en: {OUTPUT_PATH}")

if __name__ == '__main__':
    generate_calendar()
