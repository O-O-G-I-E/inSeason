<script>
  import lebensmittelData from '$lib/data/lebensmittel.json';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import { getCurrentMonth, filterByMonth, getMonthName, getAllCategories, searchProducts } from '$lib/utils/seasonHelper.js';

  let currentMonth = getCurrentMonth();
  let searchQuery = '';
  let selectedCategory = 'Alle';
  let selectedNutritionFilter = 'Alle';
  let sortBy = 'name';
  
  // NEU: Regional & Transport Filter
  let showOnlyRegional = false;
  let selectedTransport = 'Alle';
  
  $: inSaisonProdukte = filterByMonth(lebensmittelData, currentMonth);
  $: categories = ['Alle', ...getAllCategories(lebensmittelData)];
  
  // Nährwert-Filter Optionen
  const nutritionFilters = [
    { value: 'Alle', label: 'Alle' },
    { value: 'proteinreich', label: '💪 Proteinreich (>10g)' },
    { value: 'kalorienarm', label: '🍃 Kalorienarm (<50 kcal)' },
    { value: 'vitaminCreich', label: '🍊 Vitamin C-reich (>30mg)' },
    { value: 'ballaststoffreich', label: '🌾 Ballaststoffreich (>3g)' },
    { value: 'fettarm', label: '💧 Fettarm (<3g)' },
    { value: 'eisenreich', label: '⚡ Eisenreich (>2mg)' }
  ];
  
  // NEU: Transport-Filter Optionen
  const transportFilters = [
    { value: 'Alle', label: 'Alle Transportarten' },
    { value: 'local', label: '🌱 Lokal (<100km)' },
    { value: 'truck', label: '🚛 LKW (EU)' },
    { value: 'ship', label: '🚢 Schiff (Übersee)' },
    { value: 'plane', label: '✈️ Flugzeug' }
  ];
  
  // Sortier-Optionen (erweitert um CO2)
  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'co2_asc', label: '🌱 CO₂ (niedrig → hoch)' },
    { value: 'co2_desc', label: '⚠️ CO₂ (hoch → niedrig)' },
    { value: 'kalorien_asc', label: 'Kalorien (niedrig → hoch)' },
    { value: 'kalorien_desc', label: 'Kalorien (hoch → niedrig)' },
    { value: 'protein_desc', label: 'Protein (hoch → niedrig)' },
    { value: 'vitamin_c_desc', label: 'Vitamin C (hoch → niedrig)' }
  ];
  
  $: filteredProdukte = (() => {
    let results = inSaisonProdukte;
    
    // Suchfilter
    if (searchQuery) {
      results = searchProducts(results, searchQuery);
    }
    
    // Kategorie-Filter
    if (selectedCategory !== 'Alle') {
      results = results.filter(p => p.kategorie === selectedCategory);
    }
    
    // NEU: Regional-Filter
    if (showOnlyRegional) {
      results = results.filter(p => p.regional_data && !p.regional_data.is_import);
    }
    
    // NEU: Transport-Filter
    if (selectedTransport !== 'Alle') {
      results = results.filter(p => p.regional_data && p.regional_data.transport_method === selectedTransport);
    }
    
    // Nährwert-Filter
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
    
    // Sortierung (erweitert um CO2)
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
        case 'kalorien_desc':
          return b.naehrwerte.energie_kcal - a.naehrwerte.energie_kcal;
        case 'protein_desc':
          return b.naehrwerte.protein_g - a.naehrwerte.protein_g;
        case 'vitamin_c_desc':
          const vitCa = a.vitamine.vitamin_c_mg || 0;
          const vitCb = b.vitamine.vitamin_c_mg || 0;
          return vitCb - vitCa;
        default:
          return 0;
      }
    });
    
    return results;
  })();
  
  // NEU: Berechne durchschnittlichen CO2-Fußabdruck
  $: avgCO2 = filteredProdukte.length > 0
    ? (filteredProdukte.reduce((sum, p) => sum + (p.regional_data?.co2_per_kg || 0), 0) / filteredProdukte.length).toFixed(2)
    : 0;
  
  // NEU: Zähle regionale vs. Import-Produkte
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

<div class="hero">
  <h2>Jetzt in Saison: {getMonthName(currentMonth)} 2026</h2>
  <p>{inSaisonProdukte.length} regionale Lebensmittel verfügbar</p>
</div>

<!-- Monatsnavigation -->
<div class="month-navigation">
  <h3>Oder wähle einen anderen Monat:</h3>
  <div class="months-grid">
    {#each Array(12) as _, i}
      <a 
        href="/monat/{i + 1}" 
        class="month-card"
        class:current={i + 1 === currentMonth}
      >
        {getMonthName(i + 1)}
      </a>
    {/each}
  </div>
</div>

<div class="controls">
  <!-- Suche -->
  <input 
    type="text" 
    placeholder="🔍 Suche nach Lebensmittel..."
    bind:value={searchQuery}
    class="search-input"
  />
  
  <!-- Filter-Grid -->
  <div class="filter-grid">
    <!-- Kategorie-Filter -->
    <fieldset class="filter-section">
      <legend>Kategorie:</legend>
      <div class="category-filters">
        {#each categories as cat}
          <button 
            class="filter-btn"
            class:active={selectedCategory === cat}
            on:click={() => selectedCategory = cat}
          >
            {cat}
          </button>
        {/each}
      </div>
    </fieldset>
    
    <!-- NEU: Regional Toggle -->
    <div class="filter-section">
      <label class="toggle-label">
        <input 
          type="checkbox" 
          bind:checked={showOnlyRegional}
          class="toggle-checkbox"
        />
        <span class="toggle-text">🌱 Nur regionale Produkte</span>
      </label>
    </div>
    
    <!-- NEU: Transport-Filter -->
    <div class="filter-section">
      <label for="transport-filter">Transport:</label>
      <select id="transport-filter" bind:value={selectedTransport} class="select-input">
        {#each transportFilters as filter}
          <option value={filter.value}>{filter.label}</option>
        {/each}
      </select>
    </div>
    
    <!-- Nährwert-Filter -->
    <div class="filter-section">
      <label for="nutrition-filter">Nährwert-Filter:</label>
      <select id="nutrition-filter" bind:value={selectedNutritionFilter} class="select-input">
        {#each nutritionFilters as filter}
          <option value={filter.value}>{filter.label}</option>
        {/each}
      </select>
    </div>
    
    <!-- Sortierung -->
    <div class="filter-section">
      <label for="sort-by">Sortieren nach:</label>
      <select id="sort-by" bind:value={sortBy} class="select-input">
        {#each sortOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
    </div>
  </div>
  
  <!-- NEU: Erweiterte Ergebnis-Info mit CO2-Stats -->
  <div class="result-info">
    <div class="result-text">
      <strong>{filteredProdukte.length}</strong> {filteredProdukte.length === 1 ? 'Produkt' : 'Produkte'} gefunden
      {#if filteredProdukte.length > 0}
        <span class="stats-divider">|</span>
        <span class="regional-stats">
          🌱 {regionalCount} Regional · 🌍 {importCount} Import
        </span>
        <span class="stats-divider">|</span>
        <span class="co2-avg">
          Ø {avgCO2} kg CO₂
        </span>
      {/if}
    </div>
    {#if selectedNutritionFilter !== 'Alle' || selectedCategory !== 'Alle' || searchQuery || showOnlyRegional || selectedTransport !== 'Alle'}
      <button class="reset-btn" on:click={resetFilters}>
        ✕ Alle Filter zurücksetzen
      </button>
    {/if}
  </div>
</div>

<div class="products-grid">
  {#each filteredProdukte as produkt (produkt.id)}
    <ProductCard {produkt} />
  {:else}
    <p class="no-results">Keine Produkte gefunden 😔</p>
  {/each}
</div>

<style>
  .hero {
    text-align: center;
    margin-bottom: 2rem;
    padding: 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }

  .hero h2 {
    margin: 0;
    color: #2E7D32;
    font-size: 2rem;
  }

  .hero p {
    margin: 0.5rem 0 0 0;
    color: #666;
    font-size: 1.1rem;
  }

  .month-navigation {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }

  .month-navigation h3 {
    margin: 0 0 1.5rem 0;
    color: #333;
    font-size: 1.1rem;
    font-weight: 500;
  }

  .months-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 0.5rem;
  }

  .month-card {
    padding: 1rem 0.5rem;
    background: #f5f5f5;
    border-radius: 8px;
    text-align: center;
    text-decoration: none;
    color: #333;
    font-weight: 500;
    transition: all 0.2s;
    border: 2px solid transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
  }

  .month-card:hover {
    background: #4CAF50;
    color: white;
    transform: translateY(-2px);
  }

  .month-card.current {
    background: #2E7D32;
    color: white;
    border-color: #1B5E20;
  }

  .controls {
    margin-bottom: 2rem;
  }

  .search-input {
    width: 100%;
    padding: 1rem;
    font-size: 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    transition: border-color 0.2s;
  }

  .search-input:focus {
    outline: none;
    border-color: #4CAF50;
  }

  .filter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 1rem;
  }

  .filter-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    border: none;
  }

  .filter-section label {
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
  }

  /* NEU: Toggle Checkbox Styling */
  .toggle-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    padding: 0.75rem;
    background: var(--bg-secondary);
    border-radius: 8px;
    border: 2px solid var(--border-color);
    transition: all 0.2s ease;
  }

  .toggle-label:hover {
    border-color: #4CAF50;
  }

  .toggle-checkbox {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: #4CAF50;
  }

  .toggle-text {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--text-primary);
  }

  .category-filters {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    padding: 0;
    background: transparent;
  }

  .filter-btn {
    padding: 0.65rem 1.25rem;
    border: 2px solid var(--border-color);
    background: var(--bg-secondary);
    border-radius: 24px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    font-weight: 500;
    white-space: nowrap;
    color: var(--text-primary);
  }

  .filter-btn:hover {
    border-color: var(--accent);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px var(--shadow);
  }

  .filter-btn.active {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
    box-shadow: 0 4px 12px var(--shadow-hover);
  }

  .select-input {
    padding: 0.75rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 0.9rem;
    background: white;
    cursor: pointer;
    transition: border-color 0.2s;
  }

  .select-input:hover,
  .select-input:focus {
    outline: none;
    border-color: #4CAF50;
  }

  /* NEU: Erweiterte Result Info */
  .result-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.25rem;
    background: linear-gradient(135deg, #f5f5f5 0%, #e8f5e9 100%);
    border-radius: 8px;
    border-left: 4px solid #4CAF50;
  }

  .result-text {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    font-size: 0.95rem;
    color: #333;
  }

  .result-text strong {
    font-size: 1.1rem;
    color: #2E7D32;
  }

  .stats-divider {
    color: #ccc;
    font-weight: 300;
  }

  .regional-stats {
    font-weight: 500;
  }

  .co2-avg {
    font-weight: 600;
    color: #4CAF50;
  }

  .reset-btn {
    padding: 0.5rem 1rem;
    background: #ff5252;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .reset-btn:hover {
    background: #ff1744;
    transform: scale(1.05);
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .no-results {
    grid-column: 1 / -1;
    text-align: center;
    padding: 3rem;
    color: #999;
    font-size: 1.1rem;
  }

  @media (max-width: 768px) {
    .hero h2 {
      font-size: 1.5rem;
    }
    
    .months-grid {
      grid-template-columns: repeat(3, 1fr);
    }
    
    .month-card {
      padding: 0.75rem 0.25rem;
      font-size: 0.85rem;
    }

    .filter-grid {
      grid-template-columns: 1fr;
    }
    
    .result-info {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .result-text {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
    
    .products-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }
</style>
