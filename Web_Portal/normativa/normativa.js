// ============================================
// THEME TOGGLE
// ============================================
function initThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('ceb-portal-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme === 'dark' ? 'dark' : '');
    
    if (toggle) {
        toggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? '' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('ceb-portal-theme', next === 'dark' ? 'dark' : 'light');
        });
    }
}

// ============================================
// ICONS
// ============================================
const ICONS = {
    scale: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/><path d="M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>`,
    book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>`,
    shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>`,
    compass: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
    warn: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`
};

// ============================================
// STATE
// ============================================
let isDataLoaded = false;
let CATALOG = null;
let MS = null;
let RECORDS_BY_ID = {};

// NOTE: MiniSearch must be loaded in the HTML via CDN:
// <script src="https://cdn.jsdelivr.net/npm/minisearch@6.3.0/dist/minisearch.min.js"></script>

// ============================================
// HELPERS
// ============================================
function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
}

function normalize(s) {
    return String(s)
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// ============================================
// SUB-TAB NAVIGATION
// ============================================
function switchNormativaSubTab(tabId) {
    const tabs = document.querySelectorAll('.normativa-subtab');
    const contents = document.querySelectorAll('.normativa-subcontent');
    
    tabs.forEach(t => {
        if (t.dataset.target === tabId) {
            t.classList.add('active');
        } else {
            t.classList.remove('active');
        }
    });
    
    contents.forEach(c => {
        if (c.id === `norma-${tabId}`) {
            c.style.display = 'block';
        } else {
            c.style.display = 'none';
        }
    });
}

// ============================================
// CATALOG (Catálogo)
// ============================================
async function initCatalog() {
    try {
        const res = await fetch('normativa/data/catalog.json');
        if (!res.ok) throw new Error("No se pudo cargar el catálogo de normativa");
        CATALOG = await res.json();
        
        setupCategoryFilters();
        renderCatalog();
    } catch (e) {
        console.error("Error cargando catálogo:", e);
        const grid = document.getElementById('norma-catalog-grid');
        if (grid) grid.innerHTML = `<p style="color:red">Error al cargar el catálogo: ${e.message}</p>`;
    }
}

function setupCategoryFilters() {
    const filterContainer = document.getElementById('norma-category-filters');
    if (!filterContainer || !CATALOG) return;
    
    const chips = [
        `<button class="chip active" data-cat="all">Todas</button>`,
        ...Object.entries(CATALOG.categories).map(([key, cat]) => 
            `<button class="chip" data-cat="${key}">${escapeHtml(cat.short)}</button>`
        )
    ];
    
    filterContainer.innerHTML = chips.join('');
    
    filterContainer.querySelectorAll('.chip').forEach(btn => {
        btn.addEventListener('click', () => {
            filterContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            renderCatalog(btn.dataset.cat);
        });
    });
}

function renderCatalog(filterCategory = 'all') {
    const grid = document.getElementById('norma-catalog-grid');
    if (!grid || !CATALOG) return;
    
    let docs = CATALOG.documents;
    if (filterCategory !== 'all') {
        docs = docs.filter(d => d.category === filterCategory);
    }
    
    if (docs.length === 0) {
        grid.innerHTML = '<p>No hay documentos en esta categoría.</p>';
        return;
    }
    
    grid.innerHTML = docs.map(doc => {
        const cat = CATALOG.categories[doc.category] || {};
        return `
            <div class="doc-card" style="cursor: pointer; --cat-color:${cat.color || '#333'};" onclick="openReader(${doc.id})">
                <div class="doc-card-head" style="background-color: ${cat.tint || '#eee'}; padding: 0.5rem; display: flex; justify-content: space-between; align-items: center; border-radius: 4px 4px 0 0;">
                    <span class="doc-abbr" style="font-weight: bold; color: ${cat.color || '#333'};">${escapeHtml(doc.abbr)}</span>
                    <span class="doc-icon" style="color: #666; width: 1.2rem; height: 1.2rem;">${ICONS[cat.icon] || ICONS.book}</span>
                </div>
                <div class="doc-card-body" style="padding: 1rem; border: 1px solid #ddd; border-top: none; border-radius: 0 0 4px 4px;">
                    <h3 class="doc-title" style="margin: 0 0 0.5rem 0; font-size: 1rem;">${escapeHtml(doc.short || doc.title)}</h3>
                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #666;">
                        <span>${doc.pages} páginas</span>
                        <span>${doc.year || ''}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// PDF READER (Lector)
// ============================================
function openReader(docId, page = 1) {
    if (!CATALOG) return;
    const doc = CATALOG.documents.find(d => d.id === docId);
    if (!doc) return;
    
    const container = document.getElementById('norma-reader-container');
    if (!container) return;
    
    const driveId = doc.drive_id || doc.driveFileId;
    
    // Google Drive embed link: support '#page=X' appending
    const url = driveId 
        ? `https://drive.google.com/file/d/${driveId}/preview${page > 1 ? `#page=${page}` : ''}`
        : '';
        
    container.innerHTML = `
        <div class="reader-header" style="display: flex; align-items: center; padding: 1rem; background: #f9f9f9; border-bottom: 1px solid #ccc;">
            <button class="btn" onclick="switchNormativaSubTab('catalogo')" style="margin-right: 1rem; cursor: pointer;">← Volver</button>
            <h2 style="margin: 0; font-size: 1.2rem;">${escapeHtml(doc.abbr)}: ${escapeHtml(doc.title)}</h2>
        </div>
        ${driveId 
            ? `<iframe src="${url}" width="100%" height="80vh" style="border:none; min-height: 600px;"></iframe>`
            : `<div style="padding: 2rem; text-align: center;">El PDF de este documento aún no está disponible.</div>`
        }
    `;
    
    switchNormativaSubTab('lector');
}

// ============================================
// SEARCH (Buscador)
// ============================================
const STOPWORDS = new Set([
    "el","la","los","las","un","una","unos","unas","de","del","y","o","u","en","a","al","con","por","para",
    "que","se","es","sus","su","lo","como","más","pero","no","sí","ni","ya","muy","fue","ser","han",
    "hay","entre","sobre","cuando","donde","cuyo","cuya","esta","este","estos","estas","esa","ese","esos","esas",
    "ha","he","si","ello","ella","él"
]);

async function initSearch() {
    if (typeof MiniSearch === 'undefined') {
        console.warn("MiniSearch no está cargado. Asegúrate de incluir el script de CDN.");
        return;
    }
    
    try {
        const res = await fetch('normativa/data/search-index.json');
        if (!res.ok) throw new Error("No se pudo cargar el índice");
        const data = await res.json();
        
        MS = new MiniSearch({
            fields: ["text", "title", "abbr"],
            storeFields: ["doc", "abbr", "title", "page", "category"],
            idField: "id",
            processTerm: (term) => {
                const n = normalize(term);
                if (STOPWORDS.has(n)) return null;
                if (n.length < 2) return null;
                return n;
            },
            searchOptions: {
                boost: { title: 3, abbr: 5 },
                prefix: true,
                fuzzy: 0.15,
                combineWith: "AND",
            },
        });
        
        // Add all documents to the index
        MS.addAll(data.records);
        
        // Save the raw text for building snippets
        data.records.forEach(r => { RECORDS_BY_ID[r.id] = r.text; });
        
        setupSearchUI();
    } catch (e) {
        console.error("Error al inicializar buscador:", e);
    }
}

function makeSnippet(fullText, queryTerms) {
    if (!fullText) return "";
    const norm = normalize(fullText);
    const terms = queryTerms.map(normalize).filter(t => t.length >= 2);
    
    let bestIdx = -1;
    for (const t of terms) {
        const i = norm.indexOf(t);
        if (i !== -1 && (bestIdx === -1 || i < bestIdx)) {
            bestIdx = i;
        }
    }
    
    if (bestIdx === -1) {
        return escapeHtml(fullText.slice(0, 200)) + "...";
    }
    
    const start = Math.max(0, bestIdx - 70);
    const end = Math.min(fullText.length, bestIdx + 170);
    let snippet = fullText.slice(start, end);
    let highlighted = escapeHtml(snippet);
    
    for (const t of terms) {
        const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        highlighted = highlighted.replace(
            new RegExp(`([\\wáéíóúñü]*${escaped}[\\wáéíóúñü]*)`, "giu"),
            "<mark>$1</mark>"
        );
    }
    
    return (start > 0 ? "..." : "") + highlighted + (end < fullText.length ? "..." : "");
}

function setupSearchUI() {
    const input = document.getElementById('norma-search-input');
    const resultsContainer = document.getElementById('norma-search-results');
    
    if (!input || !resultsContainer) return;
    
    let debounceTimer;
    
    input.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        
        debounceTimer = setTimeout(() => {
            const query = e.target.value.trim();
            if (query.length < 2) {
                resultsContainer.innerHTML = '<div style="padding:1rem; color:#666;">Escribe para buscar (mínimo 2 caracteres)...</div>';
                return;
            }
            
            const hits = MS.search(query).slice(0, 50); // Limit to 50 results
            
            if (hits.length === 0) {
                resultsContainer.innerHTML = '<div style="padding:1rem; color:#666;">No se encontraron resultados para tu búsqueda.</div>';
                return;
            }
            
            const queryTerms = query.split(/\s+/).filter(Boolean);
            
            resultsContainer.innerHTML = hits.map(h => {
                const snippet = makeSnippet(RECORDS_BY_ID[h.id] || "", queryTerms);
                return `
                    <div class="search-result" style="padding: 1rem; border-bottom: 1px solid #eee; cursor: pointer; transition: background 0.2s;" onclick="openReader(${h.doc}, ${h.page})" onmouseover="this.style.backgroundColor='#f5f5f5'" onmouseout="this.style.backgroundColor='transparent'">
                        <div style="font-size: 0.85rem; color: #0056b3; margin-bottom: 0.3rem;">
                            <strong>${escapeHtml(h.abbr)}</strong> • Página ${h.page}
                        </div>
                        <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem;">${escapeHtml(h.title)}</h4>
                        <p style="margin: 0; font-size: 0.9rem; color: #444; line-height: 1.4;">${snippet}</p>
                    </div>
                `;
            }).join('');
            
        }, 250);
    });
}

// ============================================
// INTEGRATION & INITIALIZATION
// ============================================
async function loadNormativaData() {
    if (isDataLoaded) return;
    isDataLoaded = true;
    
    // Fetch JSONs in parallel
    await Promise.all([
        initCatalog(),
        initSearch()
    ]);
}

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    
    // Sub-tab click listeners
    const subtabs = document.querySelectorAll('.normativa-subtab');
    subtabs.forEach(t => {
        t.addEventListener('click', () => {
            switchNormativaSubTab(t.dataset.target);
        });
    });
    
    // Lazy Load integration
    // Si la función switchTab del portal ya existe, la decoramos (override)
    if (typeof window.switchTab === 'function') {
        const originalSwitchTab = window.switchTab;
        window.switchTab = function(tabId) {
            originalSwitchTab(tabId);
            if (tabId === 'normativa') {
                loadNormativaData();
            }
        };
    } else {
        // Fallback: escuchar clicks generales e intentar inicializar si la pestaña se activa
        const checkTab = () => {
            // Verificar si el contenedor de normativa se hace visible
            const normativaContainer = document.getElementById('tab-normativa');
            if (normativaContainer && !normativaContainer.classList.contains('hidden') && normativaContainer.style.display !== 'none') {
                loadNormativaData();
            }
        };
        
        document.addEventListener('click', () => setTimeout(checkTab, 50));
        // Check once right away in case it's the active default tab
        setTimeout(checkTab, 100);
    }
});
