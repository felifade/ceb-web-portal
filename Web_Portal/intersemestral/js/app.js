document.addEventListener('DOMContentLoaded', () => {
    // Inicializar Iconos
    lucide.createIcons();

    const fileUrl = 'datos.csv'; // Nombre del archivo que debe descargar el usuario
    let allData = []; // Guardará todos los registros parseados
    let filteredData = []; // Guardará los registros después de aplicar filtros
    
    // UI Elements
    const filterDocente = document.getElementById('filter-docente');
    const filterGrupo = document.getElementById('filter-grupo');
    const filterTurno = document.getElementById('filter-turno');
    const btnReset = document.getElementById('btn-reset');
    
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const emptyState = document.getElementById('empty-state');
    const tableContainer = document.getElementById('table-container');
    const resultsTableHead = document.querySelector('#results-table thead');
    const resultsTableBody = document.querySelector('#results-table tbody');
    const resultsCount = document.getElementById('results-count');

    // Mapeo esperado de columnas (ajustado a la hoja Intersemestrales)
    // Asumiendo que el CSV tiene: N, HORA, DOCENTE, GRUPO1, GRUPO2, GRUPO3, TURNO, FECHA
    let headers = [];

    // Iniciar carga del CSV
    loadCSV();

    function loadCSV() {
        Papa.parse(fileUrl, {
            download: true,
            header: true, // Asume que la primera fila tiene encabezados
            skipEmptyLines: true,
            complete: function(results) {
                if(results.data && results.data.length > 0) {
                    headers = results.meta.fields;
                    allData = results.data;
                    
                    hideAllStates();
                    populateFilters();
                    applyFilters(); // Mostrar todo inicialmente
                } else {
                    showError("El archivo CSV está vacío o tiene un formato incorrecto.");
                }
            },
            error: function(error) {
                console.error("Error cargando CSV:", error);
                showError("No se pudo cargar el archivo datos.csv. ¿Ya lo guardaste en la carpeta?");
            }
        });
    }

    function populateFilters() {
        const docentes = new Set();
        const grupos = new Set();

        allData.forEach(row => {
            // Asumimos que la columna se llama "DOCENTE" o "DOCENTE / MATERIA" o algo en la pos 2
            // Buscaremos dinámicamente el nombre de la columna que contenga "DOCENTE"
            const colDocente = headers.find(h => h.toUpperCase().includes('DOCENTE'));
            if(colDocente && row[colDocente]) {
                docentes.add(row[colDocente].trim());
            }

            // Para los grupos, buscaremos columnas que contengan "GRUPO"
            const colsGrupos = headers.filter(h => h.toUpperCase().includes('GRUPO'));
            colsGrupos.forEach(col => {
                if(row[col] && row[col].trim() !== '') {
                    grupos.add(row[col].trim());
                }
            });
        });

        // Llenar Select Docente
        Array.from(docentes).sort().forEach(d => {
            if(d) {
                const opt = document.createElement('option');
                opt.value = d;
                opt.textContent = d;
                filterDocente.appendChild(opt);
            }
        });

        // Llenar Select Grupo
        Array.from(grupos).sort().forEach(g => {
            if(g) {
                const opt = document.createElement('option');
                opt.value = g;
                opt.textContent = g;
                filterGrupo.appendChild(opt);
            }
        });
    }

    function applyFilters() {
        const valDocente = filterDocente.value;
        const valGrupo = filterGrupo.value;
        const valTurno = filterTurno.value;

        const colDocente = headers.find(h => h.toUpperCase().includes('DOCENTE'));
        const colsGrupos = headers.filter(h => h.toUpperCase().includes('GRUPO'));
        const colTurno = headers.find(h => h.toUpperCase().includes('TURNO'));

        filteredData = allData.filter(row => {
            let matchDocente = true;
            let matchGrupo = true;
            let matchTurno = true;

            if (valDocente && colDocente) {
                matchDocente = row[colDocente] === valDocente;
            }

            if (valGrupo && colsGrupos.length > 0) {
                // Si el grupo seleccionado está en CUALQUIERA de las columnas de grupo
                matchGrupo = colsGrupos.some(col => row[col] === valGrupo);
            }

            if (valTurno && colTurno) {
                // A veces puede venir en minúsculas, hacemos un includes seguro
                matchTurno = row[colTurno] && row[colTurno].toUpperCase().includes(valTurno.toUpperCase());
            }

            return matchDocente && matchGrupo && matchTurno;
        });

        renderTable();
    }

    function renderTable() {
        hideAllStates();

        if (filteredData.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }

        tableContainer.classList.remove('hidden');
        resultsCount.textContent = `${filteredData.length} resultados encontrados`;

        // Render Headers (solo la primera vez o si cambian)
        resultsTableHead.innerHTML = '';
        const trHead = document.createElement('tr');
        headers.forEach(h => {
            const th = document.createElement('th');
            th.textContent = h;
            trHead.appendChild(th);
        });
        resultsTableHead.appendChild(trHead);

        // Render Body
        resultsTableBody.innerHTML = '';
        filteredData.forEach(row => {
            const tr = document.createElement('tr');
            headers.forEach(h => {
                const td = document.createElement('td');
                td.textContent = row[h] || '-';
                tr.appendChild(td);
            });
            resultsTableBody.appendChild(tr);
        });
    }

    // Event Listeners para Filtros
    filterDocente.addEventListener('change', applyFilters);
    filterGrupo.addEventListener('change', applyFilters);
    filterTurno.addEventListener('change', applyFilters);

    btnReset.addEventListener('click', () => {
        filterDocente.value = '';
        filterGrupo.value = '';
        filterTurno.value = '';
        applyFilters();
    });

    // Utilidades
    function hideAllStates() {
        loadingState.classList.add('hidden');
        errorState.classList.add('hidden');
        emptyState.classList.add('hidden');
        tableContainer.classList.add('hidden');
    }

    function showError(msg) {
        hideAllStates();
        errorState.classList.remove('hidden');
        if(msg) document.getElementById('error-message').textContent = msg;
    }
});
