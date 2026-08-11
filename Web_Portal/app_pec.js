/**
 * app_pec.js — Módulo del Proyecto Escolar Comunitario (PEC)
 * Portal de Gestión Directiva | CEB 5/4 "Profr. Rafael Ramírez"
 *
 * Responsabilidades:
 *  - Leer PEC_DATA (pec_data.js) para obtener ciclos e histórico
 *  - Leer config.json para saber cuál es el ciclo activo por default
 *  - Renderizar el selector de ciclo y las tarjetas de proyectos
 *  - Gestionar el cambio de ciclo en la UI sin recargar la página
 */

const AppPEC = (() => {

    // ── Estado interno ────────────────────────────────────────────
    let _activeCycleKey = null;
    let _config = null;

    // ── Constantes de color por semestre ─────────────────────────
    const SEMESTRE_COLORS = {
        2: { accent: 'var(--accent-cyan)',   bg: 'var(--accent-cyan)',   icon: 'fa-seedling' },
        4: { accent: 'var(--accent-purple)', bg: 'var(--accent-purple)', icon: 'fa-rocket' },
        6: { accent: 'var(--accent-gold)',   bg: 'var(--accent-gold)',   icon: 'fa-star' }
    };

    const ESTADO_CONFIG = {
        'Finalizado':  { badge: 'badge-finalizado',  icon: 'fa-check-circle',  label: 'Finalizado'  },
        'En curso':    { badge: 'badge-en-curso',     icon: 'fa-play-circle',   label: 'En Curso'    },
        'Planeación':  { badge: 'badge-planeacion',   icon: 'fa-clock',         label: 'Planeación'  }
    };

    // ── Inicialización ────────────────────────────────────────────
    async function init() {
        try {
            // Cargar config para obtener el ciclo activo default
            const res = await fetch('./config.json');
            _config = await res.json();
        } catch (e) {
            _config = {};
        }

        // Leer ciclo activo desde config, fallback al último disponible
        const data = window.PEC_DATA || {};
        const ciclosDisponibles = Object.keys(data);

        _activeCycleKey = _config.activePecCycle
            || ciclosDisponibles[ciclosDisponibles.length - 1]
            || null;

        renderSelectorCiclos();
        renderCiclo(_activeCycleKey);
    }

    // ── Renderizar selector de ciclos (tabs) ──────────────────────
    function renderSelectorCiclos() {
        const data = window.PEC_DATA || {};
        const container = document.getElementById('pec-cycle-selector');
        if (!container) return;

        const ciclos = Object.entries(data);

        container.innerHTML = ciclos.map(([key, ciclo]) => {
            const isActive  = key === _activeCycleKey;
            const isDefault = key === (_config.activePecCycle || key);
            const isHistory = ciclo.estado === 'Finalizado';

            return `
            <button
                class="pec-cycle-tab ${isActive ? 'active' : ''} ${isHistory ? 'historico' : 'vigente'}"
                onclick="AppPEC.cambiarCiclo('${key}')"
                id="pec-tab-${key}"
                title="${ciclo.nombre}"
            >
                <i class="fa-solid ${isHistory ? 'fa-box-archive' : 'fa-circle-dot'}"></i>
                <span>${ciclo.nombre}</span>
                ${isDefault ? '<span class="pec-default-badge">DEFAULT</span>' : ''}
            </button>`;
        }).join('');
    }

    // ── Renderizar ciclo seleccionado ─────────────────────────────
    function renderCiclo(cycleKey) {
        const data = window.PEC_DATA || {};
        const ciclo = data[cycleKey];
        if (!ciclo) return;

        // Actualizar tab activo
        document.querySelectorAll('.pec-cycle-tab').forEach(btn => {
            btn.classList.toggle('active', btn.id === `pec-tab-${cycleKey}`);
        });

        // Renderizar cabecera del ciclo
        const header = document.getElementById('pec-cycle-header');
        if (header) {
            const isHistory = ciclo.estado === 'Finalizado';
            const estadoConf = ESTADO_CONFIG[ciclo.estado] || ESTADO_CONFIG['Planeación'];
            header.innerHTML = `
            <div class="pec-header-info">
                <div class="pec-header-main">
                    <h2><i class="fa-solid fa-leaf"></i> ${ciclo.nombre}</h2>
                    <span class="badge-tag ${estadoConf.badge}">
                        <i class="fa-solid ${estadoConf.icon}"></i> ${estadoConf.label}
                    </span>
                </div>
                <p class="pec-periodo"><i class="fa-regular fa-calendar"></i> ${ciclo.periodo}</p>
                <p class="pec-descripcion">${ciclo.descripcion}</p>
                ${ciclo.temaGeneral ? `<div class="pec-tema-general"><i class="fa-solid fa-compass"></i> <strong>Eje Transversal:</strong> ${ciclo.temaGeneral}</div>` : ''}
                ${isHistory ? `<div class="pec-archive-banner"><i class="fa-solid fa-box-archive"></i> Estás viendo el <strong>Histórico del ${ciclo.nombre}</strong>. Este ciclo ya concluyó.</div>` : ''}
            </div>`;
        }

        // Renderizar tarjetas de proyectos
        const grid = document.getElementById('pec-proyectos-grid');
        if (!grid) return;

        const isHistory = ciclo.estado === 'Finalizado';

        grid.innerHTML = (ciclo.proyectos || []).map(proy => {
            const colores = SEMESTRE_COLORS[proy.semestre] || SEMESTRE_COLORS[2];
            const estadoConf = ESTADO_CONFIG[proy.estado] || ESTADO_CONFIG['Planeación'];
            const tieneDocentes = proy.docentes && proy.docentes.length > 0;
            const tieneDoc = proy.urlDocumento && proy.urlDocumento.trim() !== '';
            const tienePresent = proy.urlPresentacion && proy.urlPresentacion.trim() !== '';

            const docentesList = tieneDocentes
                ? proy.docentes.map(d => {
                    const initials = d.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    return `<div class="pec-teacher-chip"><span class="pec-avatar">${initials}</span><span>${d}</span></div>`;
                }).join('')
                : `<p class="pec-sin-docentes"><i class="fa-solid fa-user-clock"></i> Pendiente de asignar</p>`;

            return `
            <div class="pec-project-card ${isHistory ? 'historico' : ''}">
                <div class="pec-card-header" style="border-left: 4px solid ${colores.accent};">
                    <div class="pec-card-title-row">
                        <div class="pec-card-icon" style="background: color-mix(in srgb, ${colores.accent} 15%, var(--bg-card));">
                            <i class="fa-solid ${colores.icon}" style="color: ${colores.accent};"></i>
                        </div>
                        <div>
                            <h3 class="pec-card-title">${proy.nombre}</h3>
                            <span class="pec-turno-badge">${proy.turno}</span>
                        </div>
                        <span class="badge-tag ${estadoConf.badge} ml-auto">
                            <i class="fa-solid ${estadoConf.icon}"></i> ${estadoConf.label}
                        </span>
                    </div>
                </div>
                <div class="pec-card-body">
                    <p class="pec-objetivo"><strong>Objetivo:</strong> ${proy.objetivo}</p>
                    
                    <div class="pec-docentes-section">
                        <h4><i class="fa-solid fa-users-gear"></i> Equipo Docente</h4>
                        <div class="pec-teachers-list">${docentesList}</div>
                    </div>

                    ${(tieneDoc || tienePresent) ? `
                    <div class="pec-links-row">
                        ${tieneDoc ? `<a href="${proy.urlDocumento}" target="_blank" class="pec-link-btn doc-btn"><i class="fa-solid fa-file-lines"></i> Rúbrica / Doc</a>` : ''}
                        ${tienePresent ? `<a href="${proy.urlPresentacion}" target="_blank" class="pec-link-btn present-btn"><i class="fa-solid fa-presentation-screen"></i> Presentación Final</a>` : ''}
                    </div>` : ''}
                </div>
            </div>`;
        }).join('');
    }

    // ── API pública ───────────────────────────────────────────────
    function cambiarCiclo(cycleKey) {
        _activeCycleKey = cycleKey;
        renderCiclo(cycleKey);
    }

    return { init, cambiarCiclo };

})();

// Auto-inicializar cuando la sección PEC sea visible
window.initPEC = function() {
    if (window.PEC_DATA) {
        AppPEC.init();
    } else {
        // PEC_DATA no cargó aún, reintentar
        setTimeout(window.initPEC, 200);
    }
};
