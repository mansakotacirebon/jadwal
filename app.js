document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeToggleBtn = document.getElementById('toggle-theme');
    const html = document.documentElement;
    const THEME_KEY = 'theme-preference';

    // Initialize theme
    function initTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY);
        let currentTheme = savedTheme;

        // If no saved theme, check system preference
        if (!currentTheme) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            currentTheme = prefersDark ? 'dark' : 'light';
        }

        applyTheme(currentTheme);
    }

    // Apply theme
    function applyTheme(theme) {
        if (theme === 'light') {
            html.setAttribute('data-theme', 'light');
            themeToggleBtn.textContent = '🌙';
            themeToggleBtn.title = 'Switch to Dark Mode';
        } else {
            html.removeAttribute('data-theme');
            themeToggleBtn.textContent = '☀️';
            themeToggleBtn.title = 'Switch to Light Mode';
        }
        localStorage.setItem(THEME_KEY, theme);
    }

    // Toggle theme
    function toggleTheme() {
        const currentTheme = html.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
    }

    // Theme toggle event listener
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Initialize theme on page load
    initTheme();

    // Mobile Sidebar Toggle
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.getElementById('toggle-sidebar');

    // Helper function to close sidebar
    function closeSidebar() {
        sidebar.classList.remove('active');
    }

    // Toggle sidebar visibility
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });

        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            // Check if sidebar is open
            if (sidebar.classList.contains('active')) {
                // If click is outside sidebar and not on toggle button
                if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
                    closeSidebar();
                }
            }
        });

        // Close sidebar with ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('active')) {
                closeSidebar();
            }
        });

        // Close sidebar when window resizes to desktop size
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                closeSidebar();
            }
        });
    }


    // Check if data is loaded
    if (typeof dataJadwal === 'undefined') {
        console.error('Data jadwal tidak ditemukan. Pastikan datajadwal.js dimuat.');
        return;
    }

    // State
    const state = {
        data: dataJadwal,
        filters: {
            hari: '',
            kelas: '',
            mapel: '',
            guru: '',
            search: ''
        }
    };

    // DOM Elements
    const elements = {
        grid: document.getElementById('schedule-grid'),
        emptyState: document.getElementById('empty-state'),
        totalCount: document.getElementById('total-count'),
        inputs: {
            hari: document.getElementById('filter-hari'),
            kelas: document.getElementById('filter-kelas'),
            mapel: document.getElementById('filter-mapel'),
            guru: document.getElementById('filter-guru'),
            search: document.getElementById('search-input')
        },
        resetBtn: document.getElementById('reset-filters')
    };

    // Initialize
    function init() {
        updateDropdowns(); // Initial population
        renderCards(state.data); // Initial render
        setupEventListeners();
    }

    /**
     * Get valid options for a specific key based on OTHER current filters.
     * Use this to implement dependent dropdowns.
     */
    function getValidOptions(targetKey) {
        // Filter the main data using all active filters EXCEPT the targetKey itself.
        // This ensures that selecting 'Senin' doesn't hide 'Senin' from the Hari dropdown,
        // but it DOES hide 'Classes' that don't have schedules on 'Senin'.
        const filteredData = state.data.filter(item => {
            const matchesHari = targetKey === 'hari' || !state.filters.hari || item.hari === state.filters.hari;
            const matchesKelas = targetKey === 'kelas' || !state.filters.kelas || item.kelas === state.filters.kelas;
            const matchesMapel = targetKey === 'mapel' || !state.filters.mapel || item.mapel === state.filters.mapel;
            const matchesGuru = targetKey === 'guru' || !state.filters.guru || item.guru === state.filters.guru;

            // We do NOT use search text to filter dropdown options, only the grid.
            return matchesHari && matchesKelas && matchesMapel && matchesGuru;
        });

        // Extract unique values and sort them
        return [...new Set(filteredData.map(item => item[targetKey]))].sort();
    }

    // Update all dropdowns options based on current state
    function updateDropdowns() {
        const keys = ['hari', 'kelas', 'mapel', 'guru'];

        // Default placeholder texts
        const defaultLabels = {
            hari: 'Semua Hari',
            kelas: 'Semua Kelas',
            mapel: 'Semua Mapel',
            guru: 'Semua Guru'
        };

        keys.forEach(key => {
            const select = elements.inputs[key];
            const validValues = getValidOptions(key);
            const currentValue = state.filters[key];

            // 1. Clear existing options
            select.innerHTML = '';

            // 2. Add Default Option
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = defaultLabels[key];
            select.appendChild(defaultOption);

            // 3. Add Valid Options
            validValues.forEach(val => {
                const option = document.createElement('option');
                option.value = val;
                option.textContent = val;
                select.appendChild(option);
            });

            // 4. Restore Selection or Reset
            // If the previously selected value is still valid in the new context, keep it.
            if (currentValue && validValues.includes(currentValue)) {
                select.value = currentValue;
            } else if (currentValue) {
                // If the selected value is no longer valid (e.g. that Teacher doesn't teach on the new Day),
                // we must deselect it to reflect reality.
                state.filters[key] = '';
                select.value = '';
                // Since we changed the state 'silently' here, we should technically re-filter the grid.
                // applyFilters will be called by the event listener that triggered this update, 
                // but if we are in a chain reaction, we might need to ensure consistency.
                // However, applyFilters uses state.filters, so updating state.filters[key] here is correct.
            }
        });
    }

    // Filter Logic for GRID
    function applyFilters() {
        const filtered = state.data.filter(item => {
            const matchesHari = !state.filters.hari || item.hari === state.filters.hari;
            const matchesKelas = !state.filters.kelas || item.kelas === state.filters.kelas;
            const matchesMapel = !state.filters.mapel || item.mapel === state.filters.mapel;
            const matchesGuru = !state.filters.guru || item.guru === state.filters.guru;

            const searchTerm = state.filters.search.toLowerCase();
            const matchesSearch = !searchTerm ||
                item.mapel.toLowerCase().includes(searchTerm) ||
                item.guru.toLowerCase().includes(searchTerm) ||
                item.kelas.toLowerCase().includes(searchTerm);

            return matchesHari && matchesKelas && matchesMapel && matchesGuru && matchesSearch;
        });

        renderCards(filtered);
    }

    // Render Cards
    function renderCards(data) {
        elements.grid.innerHTML = '';
        elements.totalCount.textContent = data.length;

        if (data.length === 0) {
            elements.emptyState.classList.remove('hidden');
            return;
        }

        elements.emptyState.classList.add('hidden');

        // Limit rendering for performance if needed, but 1600 is okay for modern browsers.
        // Adding a simple max cap for initial render could be good if it's too slow, but let's stick to full render for now.

        data.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            // Stagger animation with a cap to prevent 5-second delays on the last items
            const delay = Math.min(index * 30, 1000);
            card.style.animationDelay = `${delay}ms`;

            card.innerHTML = `
                <div class="card-header">
                    <div>
                        <h3 class="card-mapel">${item.mapel}</h3>
                        <p class="card-guru">${item.guru}</p>
                    </div>
                    <span class="tag tag-kelas">${item.kelas}</span>
                </div>
                <div class="card-body">
                    <div class="info-row">
                        <span>🗓️</span>
                        <span class="info-val">${item.hari}</span>
                    </div>
                    <div class="info-row">
                        <span>⏰</span>
                        <span class="info-val">${item.jam}</span>
                    </div>
                </div>
            `;
            elements.grid.appendChild(card);
        });
    }

    // Event Listeners
    function setupEventListeners() {
        const handleFilterChange = (key) => (e) => {
            state.filters[key] = e.target.value;
            // 1. Update dependent dropdowns based on the new change
            updateDropdowns();
            // 2. Filter the grid
            applyFilters();
        };

        elements.inputs.hari.addEventListener('change', handleFilterChange('hari'));
        elements.inputs.kelas.addEventListener('change', handleFilterChange('kelas'));
        elements.inputs.mapel.addEventListener('change', handleFilterChange('mapel'));
        elements.inputs.guru.addEventListener('change', handleFilterChange('guru'));

        elements.inputs.search.addEventListener('input', (e) => {
            state.filters.search = e.target.value;
            applyFilters();
        });

        elements.resetBtn.addEventListener('click', () => {
            state.filters = {
                hari: '',
                kelas: '',
                mapel: '',
                guru: '',
                search: state.filters.search // Keep search text? User usually expects full reset.
            };

            // To be thorough, you might want to clear search too if it's a "Reset All" button.
            state.filters.search = '';
            elements.inputs.search.value = '';

            updateDropdowns(); // Reset options to full lists
            applyFilters();
        });
    }

    init();
});
