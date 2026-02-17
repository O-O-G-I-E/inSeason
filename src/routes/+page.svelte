<script>
  import lebensmittelData from '$lib/data/lebensmittel.json';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import { getCurrentMonth, filterByMonth, getMonthName, getShortMonthName, getAllCategories, searchProducts } from '$lib/utils/seasonHelper.js';

  let currentMonth = getCurrentMonth();
  let searchQuery = '';
  let selectedCategory = 'Alle';
  let selectedNutritionFilter = 'Alle';
  let sortBy = 'name';
  
  // Regional & Transport Filter
  let showOnlyRegional = false;
  let selectedTransport = 'Alle';
  
  $: inSaisonProdukte = filterByMonth(lebensmittelData, currentMonth);
  
  // Kategorien ALPHABETISCH sortiert
  $: categories = ['Alle', ...getAllCategories(lebensmittelData).sort()];
  
  // Nährwert-Filter Optionen
  const nutritionFilters = [
    { value: 'Alle', label: 'Alle' },
    { value: 'proteinreich', label: '💪 Proteinreich' },
    { value: 'kalorienarm', label: '🍃 Kalorienarm' },
    { value: 'vitaminCreich', label: '🍊 Vitamin C' },
    { value: 'ballaststoffreich', label: '🌾 Ballaststoffe' },
    { value: 'fettarm', label: '💧 Fettarm' },
    { value: 'eisenreich', label: '⚡ Eisenreich' }
  ];
  
  // Transport-Filter Optionen
  const transportFilters = [
    { value: 'Alle', label: 'Alle' },
    { value: 'local', label: '🌱 Lokal' },
    { value: 'truck', label: '🚛 LKW' },
    { value: 'ship', label: '🚢 Schiff' },
    { value: 'plane', label: '✈️ Flug' }
  ];
  
  // Sortier-Optionen
  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'co2_asc', label: '🌱 CO₂ ↑' },
    { value: 'co2_desc', label: '⚠️ CO₂ ↓' },
    { value: 'kalorien_asc', label: 'Kcal ↑' },
    { value: 'protein_desc', label: 'Protein ↓' }
  ];
  
  $: filteredProdukte = (() => {
    let results = inSaisonProdukte;
    
    if (searchQuery) {
      results = searchProducts(results, searchQuery);
    }
    
    if (selectedCategory !== 'Alle') {
      results = results.filter(p => p.kategorie === selectedCategory);
    }
    
    if (showOnlyRegional) {
      results = results.filter(p => p.regional_data && !p.regional_data.is_import);
    }
    
    if (selectedTransport !== 'Alle') {
      results = results.filter(p => p.regional_data && p.regional_data.transport_method === selectedTransport);
    }
    
    if (selectedNutritionFilter !== 'Alle') {
      results = results.filter(p => {
        switch(selectedNutritionFilter) {
          case 'proteinreich':
            return p.naehrwerte.protein_g > 10;
          case 'kalorienarm':
            return p.naehrwerte.energie_kcal < 50;
          case 'vitaminCreich':
            return p.vitamine.vitamin_c_mg && p.vitamine.vitamin_c_mg > 30;
          case 'ballaststoffreich':
            return p.naehrwerte.ballaststoffe_g > 3;
          case 'fettarm':
            return p.naehrwerte.fett_g < 3;
          case 'eisenreich':
            return p.mineralstoffe.eisen_mg > 2;
          default:
            return true;
        }
      });
    }
    
    results = [...results].sort((a, b) => {
      switch(sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'co2_asc':
          return (a.regional_data?.co2_per_kg || 999) - (b.regional_data?.co2_per_kg || 999);
        case 'co2_desc':
          return (b.regional_data?.co2_per_kg || 0) - (a.regional_data?.co2_per_kg || 0);
        case 'kalorien_asc':
          return a.naehrwerte.energie_kcal - b.naehrwerte.energie_kcal;
        case 'protein_desc':
          return b.naehrwerte.protein_g - a.naehrwerte.protein_g;
        default:
          return 0;
      }
    });
    
    return results;
  })();
  
  $: avgCO2 = filteredProdukte.length > 0
    ? (filteredProdukte.reduce((sum, p) => sum + (p.regional_data?.co2_per_kg || 0), 0) / filteredProdukte.length).toFixed(2)
    : 0;
  
  $: regionalCount = filteredProdukte.filter(p => p.regional_data && !p.regional_data.is_import).length;
  $: importCount = filteredProdukte.filter(p => p.regional_data && p.regional_data.is_import).length;
  
  function resetFilters() {
    selectedNutritionFilter = 'Alle';
    selectedCategory = 'Alle';
    selectedTransport = 'Alle';
    showOnlyRegional = false;
    searchQuery = '';
  }
</script>

<svelte:head>
  <title>inSeason - Saisonkalender für regionale Lebensmittel</title>
</svelte:head>

<!-- Kompakte Hero -->
<div class="hero">
  <h1>{getMonthName(currentMonth)} 2026</h1>
  <p class="stats-line">
    <span class="stat">{inSaisonProdukte.length} 🌱</span>
    <span class="divider">|</span>
    <span class="stat">Ø {avgCO2} kg CO₂</span>
  </p>
</div>

<!-- Suche direkt unter Hero -->
<div class="search-container">
  <input 
    type="search" 
    placeholder="🔍 Suchen..."
    bind:value={searchQuery}
    class="search-input"
  />
</div>

<!-- Kompakte Monatsnavigation: 2×6 Grid -->
<div class="month-section">
  <h2 class="section-title">Andere Monate</h2>
  <div class="months-grid-compact">
    {#each Array(12) as _, i}
      <a 
        href="/monat/{i + 1}" 
        class="month-btn"
        class:current={i + 1 === currentMonth}
      >
        {getShortMonthName(i + 1)}
      </a>
    {/each}
  </div>
</div>

<!-- Horizontale Kategorie-Filter -->
<div class="categories-section">
  <h2 class="section-title">Kategorien</h2>
  <div class="categories-scroll">
    {#each categories as cat}
      <button 
        class="cat-pill"
        class:active={selectedCategory === cat}
        on:click={() => selectedCategory = cat}
      >
        {cat}
      </button>
    {/each}
  </div>
</div>

<!-- Erweiterte Filter (kollapsierbar auf Mobile) -->
<details class="advanced-filters">
  <summary class="filter-toggle">⚙️ Filter & Sortierung</summary>
  
  <div class="filter-content">
    <!-- Regional Toggle -->
    <label class="toggle-label">
      <input 
        type="checkbox" 
        bind:checked={showOnlyRegional}
        class="toggle-check"
      />
      <span>🌱 Nur Regional</span>
    </label>
    
    <!-- Transport -->
    <div class="filter-group">
      <label for="transport-select">Transport:</label>
      <select id="transport-select" bind:value={selectedTransport} class="select">
        {#each transportFilters as f}
          <option value={f.value}>{f.label}</option>
        {/each}
      </select>
    </div>
    
    <!-- Nährwerte -->
    <div class="filter-group">
      <label for="nutrition-select">Nährwerte:</label>
      <select id="nutrition-select" bind:value={selectedNutritionFilter} class="select">
        {#each nutritionFilters as f}
          <option value={f.value}>{f.label}</option>
        {/each}
      </select>
    </div>
    
    <!-- Sortierung -->
    <div class="filter-group">
      <label for="sort-select">Sortierung:</label>
      <select id="sort-select" bind:value={sortBy} class="select">
        {#each sortOptions as o}
          <option value={o.value}>{o.label}</option>
        {/each}
      </select>
    </div>
  </div>
</details>

<!-- Kompakte Ergebnis-Info -->
<div class="result-bar">
  <span class="result-count">{filteredProdukte.length}</span>
  {#if filteredProdukte.length > 0}
    <span class="result-stats">
      🌱 {regionalCount} · 🌍 {importCount}
    </span>
  {/if}
  {#if selectedCategory !== 'Alle' || showOnlyRegional || searchQuery}
    <button class="reset-btn" on:click={resetFilters}>✕</button>
  {/if}
</div>

<!-- 2-spaltiges Produkt-Grid auf Mobile -->
<div class="products-grid">
  {#each filteredProdukte as produkt (produkt.id)}
    <ProductCard {produkt} />
  {:else}
    <p class="no-results">Keine Produkte gefunden 😔</p>
  {/each}
</div>

<style>
    /* Global Box-Sizing Fix */
  * {
    box-sizing: border-box;
  }

  /* Verhindere Overflow */
  :global(body) {
    overflow-x: hidden;
  }
  /* CSS Variables für Light & Dark Mode */
  :global(:root) {
    --bg-primary: #f5f5f5;
    --bg-secondary: #ffffff;
    --bg-tertiary: #fafafa;
    --env-bg: rgba(76, 175, 80, 0.08);
    --text-primary: #212121;
    --text-secondary: #666666;
    --text-tertiary: #999999;
    --accent: #4CAF50;
    --border-color: rgba(0,0,0,0.08);
    --shadow: rgba(0,0,0,0.1);
    --shadow-hover: rgba(0,0,0,0.15);
  }

  :global(.dark-mode) {
    --bg-primary: #121212;
    --bg-secondary: #1e1e1e;
    --bg-tertiary: #2a2a2a;
    --env-bg: rgba(76, 175, 80, 0.15);
    --text-primary: #f5f5f5;
    --text-secondary: #b0b0b0;
    --text-tertiary: #888888;
    --accent: #66BB6A;
    --border-color: rgba(255,255,255,0.1);
    --shadow: rgba(0,0,0,0.3);
    --shadow-hover: rgba(0,0,0,0.4);
  }

  /* Hero kompakt */
  .hero {
    text-align: center;
    padding: 1.5rem 1rem 1rem;
    background: var(--bg-secondary);
    border-radius: 12px;
    margin-bottom: 1rem;
    box-shadow: 0 2px 8px var(--shadow);
  }

  .hero h1 {
    margin: 0 0 0.5rem 0;
    color: var(--accent);
    font-size: 1.75rem;
    font-weight: 700;
  }

  .stats-line {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.95rem;
    color: var(--text-secondary);
  }

  .stat {
    font-weight: 600;
    color: var(--text-primary);
  }

  .divider {
    color: var(--border-color);
  }

  /* Suche */
  .search-container {
    margin-bottom: 1rem;
  }

  .search-input {
    width: 100%;
    padding: 0.875rem 1rem;
    font-size: 1rem;
    border: 2px solid var(--border-color);
    border-radius: 12px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    transition: border-color 0.2s;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--accent);
  }

  /* Section Titles */
  .section-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin: 0 0 0.75rem 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Monate: 2×6 Grid kompakt */
  .month-section {
    margin-bottom: 1rem;
  }

  .months-grid-compact {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 0.5rem;
  }

  .month-btn {
    padding: 0.65rem 0.25rem;
    background: var(--bg-secondary);
    border: 2px solid var(--border-color);
    border-radius: 8px;
    text-align: center;
    text-decoration: none;
    color: var(--text-primary);
    font-weight: 600;
    font-size: 0.8rem;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .month-btn:hover {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
    transform: translateY(-2px);
  }

  .month-btn.current {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
    box-shadow: 0 2px 8px var(--shadow-hover);
  }

  /* Kategorien: Horizontal Scroll */
  .categories-section {
    margin-bottom: 1rem;
  }

  .categories-scroll {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }

  .categories-scroll::-webkit-scrollbar {
    height: 4px;
  }

  .categories-scroll::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 2px;
  }

  .cat-pill {
    padding: 0.5rem 1rem;
    background: var(--bg-secondary);
    border: 2px solid var(--border-color);
    border-radius: 20px;
    color: var(--text-primary);
    font-size: 0.85rem;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .cat-pill:hover {
    border-color: var(--accent);
  }

  .cat-pill.active {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
  }

  /* Erweiterte Filter (kollapsierbar) */
  .advanced-filters {
    margin-bottom: 1rem;
    background: var(--bg-secondary);
    border-radius: 12px;
    border: 2px solid var(--border-color);
  }

  .filter-toggle {
    padding: 0.875rem 1rem;
    font-weight: 600;
    color: var(--text-primary);
    cursor: pointer;
    list-style: none;
    user-select: none;
  }

  .filter-toggle::-webkit-details-marker {
    display: none;
  }

  .filter-content {
    padding: 0 1rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }

  .toggle-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: var(--bg-tertiary);
    border-radius: 8px;
    cursor: pointer;
  }

  .toggle-check {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: var(--accent);
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .filter-group label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .select {
    padding: 0.75rem;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-size: 0.9rem;
    cursor: pointer;
  }

  .select:focus {
    outline: none;
    border-color: var(--accent);
  }

  /* Ergebnis-Bar kompakt */
  .result-bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: var(--env-bg);
    border-radius: 8px;
    margin-bottom: 1rem;
    border-left: 3px solid var(--accent);
  }

  .result-count {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--accent);
  }

  .result-stats {
    font-size: 0.85rem;
    color: var(--text-secondary);
    flex: 1;
  }

  .reset-btn {
    padding: 0.5rem 0.75rem;
    background: #f44336;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .reset-btn:hover {
    background: #d32f2f;
  }

  /* Produkt-Grid: 2 Spalten auf Mobile */
  .products-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    margin-bottom: 2rem;
    width: 100%;
    max-width: 100%;
  }

  .no-results {
    grid-column: 1 / -1;
    text-align: center;
    padding: 2rem;
    color: var(--text-tertiary);
  }

  /* Desktop: Mehr Spalten */
  @media (min-width: 769px) {
    .hero h1 {
      font-size: 2.5rem;
    }

    .months-grid-compact {
      grid-template-columns: repeat(12, 1fr);
    }

    .month-btn {
      font-size: 0.9rem;
      padding: 0.75rem 0.5rem;
    }

    .products-grid {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
    }

    .filter-content {
      flex-direction: row;
      flex-wrap: wrap;
    }

    .filter-group {
      flex: 1;
      min-width: 200px;
    }
  }

  @media (max-width: 400px) {
    .months-grid-compact {
      gap: 0.35rem;
    }

    .month-btn {
      font-size: 0.7rem;
      padding: 0.5rem 0.15rem;
    }

    .products-grid {
      gap: 0.5rem;
    }
  }
</style>
