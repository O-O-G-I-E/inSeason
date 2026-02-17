<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import lebensmittelData from '$lib/data/lebensmittel.json';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import { filterByMonth, getMonthName, getShortMonthName, getAllCategories, searchProducts } from '$lib/utils/seasonHelper.js';
  import { swipe } from '$lib/utils/swipe.js';

  $: month = parseInt($page.params.month);
  $: monthName = getMonthName(month);
  $: produkte = filterByMonth(lebensmittelData, month);
  
  let searchQuery = '';
  let selectedCategory = 'Alle';
  let selectedNutritionFilter = 'Alle';
  let sortBy = 'name';
  
  // Regional & Transport Filter
  let showOnlyRegional = false;
  let selectedTransport = 'Alle';
  
  $: categories = ['Alle', ...getAllCategories(produkte).sort()];
  
  const nutritionFilters = [
    { value: 'Alle', label: 'Alle' },
    { value: 'proteinreich', label: '💪 Proteinreich' },
    { value: 'kalorienarm', label: '🍃 Kalorienarm' },
    { value: 'vitaminCreich', label: '🍊 Vitamin C' },
    { value: 'ballaststoffreich', label: '🌾 Ballaststoffe' },
    { value: 'fettarm', label: '💧 Fettarm' },
    { value: 'eisenreich', label: '⚡ Eisenreich' }
  ];
  
  const transportFilters = [
    { value: 'Alle', label: 'Alle' },
    { value: 'local', label: '🌱 Lokal' },
    { value: 'truck', label: '🚛 LKW' },
    { value: 'ship', label: '🚢 Schiff' },
    { value: 'plane', label: '✈️ Flug' }
  ];
  
  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'co2_asc', label: '🌱 CO₂ ↑' },
    { value: 'co2_desc', label: '⚠️ CO₂ ↓' },
    { value: 'kalorien_asc', label: 'Kcal ↑' },
    { value: 'protein_desc', label: 'Protein ↓' }
  ];
  
  $: filteredProdukte = (() => {
    let results = produkte;
    
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
  
  // Navigation
  $: prevMonth = month === 1 ? 12 : month - 1;
  $: nextMonth = month === 12 ? 1 : month + 1;
  
  function resetFilters() {
    selectedNutritionFilter = 'Alle';
    selectedCategory = 'Alle';
    selectedTransport = 'Alle';
    showOnlyRegional = false;
    searchQuery = '';
  }
  
  // Swipe Handlers
  function handleSwipeLeft() {
    goto(`/monat/${nextMonth}`);
  }
  
  function handleSwipeRight() {
    goto(`/monat/${prevMonth}`);
  }
</script>

<svelte:head>
  <title>{monthName} - inSeason Saisonkalender</title>
</svelte:head>

<div class="back-link">
  <a href="/">← Übersicht</a>
</div>

<!-- Swipeable Month Header -->
<div 
  class="month-header" 
  use:swipe={{ onSwipeLeft: handleSwipeLeft, onSwipeRight: handleSwipeRight }}
>
  <div class="swipe-indicator">👈 Swipe 👉</div>
  
  <div class="month-nav-compact">
    <a href="/monat/{prevMonth}" class="nav-arrow">
      ← {getShortMonthName(prevMonth)}
    </a>
    
    <div class="current-month">
      <h1>{monthName}</h1>
      <div class="month-stats">
        <span class="stat-item">
          <span class="stat-value">{filteredProdukte.length}</span>
          <span class="stat-label">Produkte</span>
        </span>
        <span class="stat-divider">•</span>
        <span class="stat-item">
          <span class="stat-value">{regionalCount}</span>
          <span class="stat-label">🌱</span>
        </span>
        <span class="stat-divider">•</span>
        <span class="stat-item">
          <span class="stat-value">Ø {avgCO2}</span>
          <span class="stat-label">CO₂</span>
        </span>
      </div>
    </div>
    
    <a href="/monat/{nextMonth}" class="nav-arrow">
      {getShortMonthName(nextMonth)} →
    </a>
  </div>
  
  {#if selectedCategory !== 'Alle' || showOnlyRegional || searchQuery}
    <button class="reset-btn-hero" on:click={resetFilters}>✕ Filter zurücksetzen</button>
  {/if}
</div>

<!-- Suche -->
<div class="search-container">
  <input 
    type="search" 
    placeholder="🔍 Suchen..."
    bind:value={searchQuery}
    class="search-input"
  />
</div>

<!-- Alle 12 Monate zum schnellen Springen -->
<div class="month-selector">
  <h2 class="section-title">Schnellwahl</h2>
  <div class="months-grid-compact">
    {#each Array(12) as _, i}
      <a 
        href="/monat/{i + 1}" 
        class="month-btn"
        class:current={i + 1 === month}
      >
        {getShortMonthName(i + 1)}
      </a>
    {/each}
  </div>
</div>

<!-- Kategorien horizontal -->
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

<!-- Filter kollapsierbar -->
<details class="advanced-filters">
  <summary class="filter-toggle">⚙️ Filter & Sortierung</summary>
  
  <div class="filter-content">
    <label class="toggle-label">
      <input 
        type="checkbox" 
        bind:checked={showOnlyRegional}
        class="toggle-check"
      />
      <span>🌱 Nur Regional</span>
    </label>
    
    <div class="filter-group">
      <label for="transport-select">Transport:</label>
      <select id="transport-select" bind:value={selectedTransport} class="select">
        {#each transportFilters as f}
          <option value={f.value}>{f.label}</option>
        {/each}
      </select>
    </div>
    
    <div class="filter-group">
      <label for="nutrition-select">Nährwerte:</label>
      <select id="nutrition-select" bind:value={selectedNutritionFilter} class="select">
        {#each nutritionFilters as f}
          <option value={f.value}>{f.label}</option>
        {/each}
      </select>
    </div>
    
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

<!-- 2-Spalten Grid -->
<div class="products-grid">
  {#each filteredProdukte as produkt (produkt.id)}
    <ProductCard {produkt} />
  {:else}
    <p class="no-results">Keine Produkte gefunden 😔</p>
  {/each}
</div>

<style>
  * {
    box-sizing: border-box;
  }

  :global(body) {
    overflow-x: hidden;
  }

  :global(:root) {
    --bg-primary: #f5f5f5;
    --bg-secondary: #ffffff;
    --bg-tertiary: #fafafa;
    --text-primary: #212121;
    --text-secondary: #666666;
    --text-tertiary: #999999;
    --accent: #4CAF50;
    --border-color: rgba(0,0,0,0.08);
    --shadow: rgba(0,0,0,0.08);
    --shadow-hover: rgba(0,0,0,0.12);
  }

  :global(.dark-mode) {
    --bg-primary: #121212;
    --bg-secondary: #1e1e1e;
    --bg-tertiary: #2a2a2a;
    --text-primary: #f5f5f5;
    --text-secondary: #b0b0b0;
    --text-tertiary: #888888;
    --accent: #66BB6A;
    --border-color: rgba(255,255,255,0.1);
    --shadow: rgba(0,0,0,0.3);
    --shadow-hover: rgba(0,0,0,0.4);
  }

  .back-link {
    margin-bottom: 1rem;
  }

  .back-link a {
    color: var(--accent);
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .back-link a:hover {
    text-decoration: underline;
  }

  /* Swipeable Month Header */
  .month-header {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 1.25rem 1rem 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 6px var(--shadow);
    position: relative;
    touch-action: pan-y;
  }

  .swipe-indicator {
    text-align: center;
    font-size: 0.75rem;
    color: var(--text-tertiary);
    margin-bottom: 0.5rem;
    opacity: 0.7;
  }

  .month-nav-compact {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
  }

  .current-month {
    text-align: center;
    flex: 1;
    min-width: 0;
  }

  .current-month h1 {
    margin: 0 0 0.5rem 0;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--accent);
  }

  .month-stats {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  .stat-value {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .stat-label {
    font-size: 0.65rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .stat-divider {
    color: var(--border-color);
    font-size: 0.7rem;
  }

  .nav-arrow {
    padding: 0.5rem 0.75rem;
    background: var(--bg-tertiary);
    border: 2px solid var(--border-color);
    border-radius: 8px;
    text-decoration: none;
    color: var(--text-primary);
    font-weight: 600;
    font-size: 0.8rem;
    transition: all 0.2s;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .nav-arrow:active {
    transform: scale(0.95);
  }

  .nav-arrow:hover {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
  }

  .reset-btn-hero {
    margin-top: 0.75rem;
    padding: 0.5rem 1rem;
    background: #f44336;
    color: white;
    border: none;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
  }

  .reset-btn-hero:hover {
    background: #d32f2f;
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

  .section-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin: 0 0 0.75rem 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Month Selector */
  .month-selector {
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

  .month-btn:active {
    transform: scale(0.95);
  }

  .month-btn.current {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
  }

  /* Kategorien */
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

  .cat-pill:active {
    transform: scale(0.95);
  }

  .cat-pill.active {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
  }

  /* Filter */
  .advanced-filters {
    margin-bottom: 1rem;
    background: var(--bg-secondary);
    border-radius: 12px;
    border: 2px solid var(--border-color);
  }

  .filter-toggle {
    padding: 0.875rem 1rem;
    font-weight: 600;
    font-size: 0.9rem;
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

  /* 2-Spalten Grid */
  .products-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.625rem;
    margin-bottom: 2rem;
  }

  .no-results {
    grid-column: 1 / -1;
    text-align: center;
    padding: 2rem 1rem;
    color: var(--text-tertiary);
    font-size: 0.95rem;
  }

  /* Desktop */
  @media (min-width: 769px) {
    .swipe-indicator {
      display: none;
    }

    .current-month h1 {
      font-size: 2.5rem;
    }

    .month-stats {
      font-size: 1.1rem;
    }

    .nav-arrow {
      font-size: 0.95rem;
      padding: 0.75rem 1.5rem;
    }

    .months-grid-compact {
      grid-template-columns: repeat(12, 1fr);
    }

    .month-btn {
      font-size: 0.9rem;
      padding: 0.75rem 0.5rem;
    }

    .products-grid {
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem;
    }

    .filter-content {
      flex-direction: row;
      flex-wrap: wrap;
    }

    .filter-group {
      flex: 1;
      min-width: 200px;
    }

    .reset-btn-hero {
      width: auto;
      margin-left: auto;
      margin-right: auto;
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

    .nav-arrow {
      font-size: 0.7rem;
      padding: 0.4rem 0.5rem;
    }
  }
</style>
