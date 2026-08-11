/**
 * pec_data.js — Base de datos estática del Proyecto Escolar Comunitario (PEC)
 * CEB 5/4 "Profr. Rafael Ramírez" | 13DBP0001Z
 * 
 * Para agregar un nuevo ciclo: copia la estructura de un ciclo existente,
 * cambia la clave (ej. "B.26.27") y actualiza los datos.
 * Para cambiar el ciclo activo por defecto, edita "activePecCycle" en config.json.
 */

const PEC_DATA = {

    // ══════════════════════════════════════════════════════════════
    // HISTÓRICO: Semestre B 2025-2026 (CERRADO)
    // ══════════════════════════════════════════════════════════════
    "B.25.26": {
        nombre: "Semestre B 2025-2026",
        periodo: "Febrero – Julio 2026",
        estado: "Finalizado",
        temaGeneral: "Proyecto Escolar Comunitario",
        descripcion: "Ciclo correspondiente al semestre B del ciclo escolar 2025-2026, gestionado bajo la estructura de la DGB.",
        proyectos: [
            {
                id: "1m",
                semestre: 1,
                turno: "Matutino",
                nombre: "Proyecto PEC 1° Matutino",
                objetivo: "Desarrollar habilidades para el bienestar comunitario y el crecimiento académico entre los estudiantes de primer semestre del turno matutino.",
                docentes: [],
                estado: "Finalizado",
                urlDocumento: "",
                urlPresentacion: ""
            },
            {
                id: "1v",
                semestre: 1,
                turno: "Vespertino",
                nombre: "Proyecto PEC 1° Vespertino",
                objetivo: "Desarrollar habilidades para el bienestar comunitario y el crecimiento académico entre los estudiantes de primer semestre del turno vespertino.",
                docentes: [],
                estado: "Finalizado",
                urlDocumento: "",
                urlPresentacion: ""
            },
            {
                id: "3m",
                semestre: 3,
                turno: "Matutino",
                nombre: "Proyecto PEC 3° Matutino",
                objetivo: "Fortalecer competencias transversales de investigación, análisis crítico y presentación de resultados entre los estudiantes de tercer semestre matutino.",
                docentes: [],
                estado: "Finalizado",
                urlDocumento: "",
                urlPresentacion: ""
            },
            {
                id: "3v",
                semestre: 3,
                turno: "Vespertino",
                nombre: "Proyecto PEC 3° Vespertino",
                objetivo: "Fortalecer competencias transversales de investigación, análisis crítico y presentación de resultados entre los estudiantes de tercer semestre vespertino.",
                docentes: [],
                estado: "Finalizado",
                urlDocumento: "",
                urlPresentacion: ""
            },
            {
                id: "5",
                semestre: 5,
                turno: "Ambos Turnos",
                nombre: "Proyecto PEC 5° Semestre",
                objetivo: "Consolidar la formación integral del estudiante egresante con un proyecto de impacto comunitario que integre las competencias desarrolladas a lo largo del bachillerato.",
                docentes: [],
                estado: "Finalizado",
                urlDocumento: "",
                urlPresentacion: ""
            }
        ]
    },

    // ══════════════════════════════════════════════════════════════
    // ACTIVO: Semestre A 2026-2027 (EN CURSO)
    // ══════════════════════════════════════════════════════════════
    "A.26.27": {
        nombre: "Semestre A 2026-2027",
        periodo: "Agosto 2026 – Enero 2027",
        estado: "En curso",
        temaGeneral: "Por definir con la nueva gestión directiva",
        descripcion: "Primer semestre bajo la nueva gestión de la Mtra. Maribel Alba Monroy. La disciplina institucional y el sentido de pertenencia son los ejes transversales de este ciclo.",
        proyectos: [
            {
                id: "1m",
                semestre: 1,
                turno: "Matutino",
                nombre: "Proyecto PEC 1° Matutino",
                objetivo: "Por definir — Primer parcial.",
                docentes: [],
                estado: "Planeación",
                urlDocumento: "",
                urlPresentacion: ""
            },
            {
                id: "1v",
                semestre: 1,
                turno: "Vespertino",
                nombre: "Proyecto PEC 1° Vespertino",
                objetivo: "Por definir — Primer parcial.",
                docentes: [],
                estado: "Planeación",
                urlDocumento: "",
                urlPresentacion: ""
            },
            {
                id: "3m",
                semestre: 3,
                turno: "Matutino",
                nombre: "Proyecto PEC 3° Matutino",
                objetivo: "Por definir — Primer parcial.",
                docentes: [],
                estado: "Planeación",
                urlDocumento: "",
                urlPresentacion: ""
            },
            {
                id: "3v",
                semestre: 3,
                turno: "Vespertino",
                nombre: "Proyecto PEC 3° Vespertino",
                objetivo: "Por definir — Primer parcial.",
                docentes: [],
                estado: "Planeación",
                urlDocumento: "",
                urlPresentacion: ""
            },
            {
                id: "5",
                semestre: 5,
                turno: "Ambos Turnos",
                nombre: "Proyecto PEC 5° Semestre",
                objetivo: "Por definir — Primer parcial.",
                docentes: [],
                estado: "Planeación",
                urlDocumento: "",
                urlPresentacion: ""
            }
        ]
    }


};

// Exportar para uso global
if (typeof window !== 'undefined') window.PEC_DATA = PEC_DATA;
