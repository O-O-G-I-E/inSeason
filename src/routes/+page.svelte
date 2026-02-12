<script>
  import lebensmittelData from '$lib/data/lebensmittel.json';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import { getCurrentMonth, filterByMonth, getMonthName, getAllCategories, searchProducts } from '$lib/utils/seasonHelper.js';
  
  let currentMonth = getCurrentMonth();
  let searchQuery = '';
  let selectedCategory = 'Alle';
  let selectedNutritionFilter = 'Alle';
  let sortBy = 'name';
  
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
  
  // Sortier-Optionen
  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
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
    
    // Sortierung
    results = [...results].sort((a, b) => {
      switch(sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
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
  
  <!-- Ergebnis-Info -->
  <div class="result-info">
    {filteredProdukte.length} {filteredProdukte.length === 1 ? 'Produkt' : 'Produkte'} gefunden
    {#if selectedNutritionFilter !== 'Alle' || selectedCategory !== 'Alle' || searchQuery}
      <button class="reset-btn" on:click={() => { selectedNutritionFilter = 'Alle'; selectedCategory = 'Alle'; searchQuery = ''; }}>
        ✕ Filter zurücksetzen
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
    grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
    gap: 0.5rem;
  }

  .month-card {
    padding: 1rem;
    background: #f5f5f5;
    border-radius: 8px;
    text-align: center;
    text-decoration: none;
    color: #333;
    font-weight: 500;
    transition: all 0.2s;
    border: 2px solid transparent;
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

  .category-filters {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    padding: 0.5rem;
    background: var(--bg-tertiary);
    border-radius: 12px;
  }

  .filter-btn {
    padding: 0.65rem 1.25rem;
    border: 2px solid var(--border-color);
    background: var(--bg-secondary);
    border-radius: 24px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9rem;
    font-weight: 500;
    white-space: nowrap;
  }

  .filter-btn:hover {
    border-color: var(--accent);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px var(--shadow);
    background-color: var(--accent);
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

  .result-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f5f5f5;
    border-radius: 8px;
    font-weight: 500;
    color: #555;
  }

  .reset-btn {
    padding: 0.5rem 1rem;
    background: #ff5252;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
  }

  .reset-btn:hover {
    background: #ff1744;
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
      grid-template-columns: repeat(3, minmax(0,1fr));
    }
    
    .month-card {
      padding: 0.75rem 0.25rem;
      font-size: 0.85rem;
    }

    .filter-grid {
      grid-template-columns: 1fr;
    }
    
    .products-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }
</style>
