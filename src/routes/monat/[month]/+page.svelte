<script>
  import { page } from '$app/stores';
  import lebensmittelData from '$lib/data/lebensmittel.json';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import { filterByMonth, getMonthName, getAllCategories, searchProducts } from '$lib/utils/seasonHelper.js';

  $: month = parseInt($page.params.month);
  $: monthName = getMonthName(month);
  $: produkte = filterByMonth(lebensmittelData, month);
  
  let searchQuery = '';
  let selectedCategory = 'Alle';
  let selectedNutritionFilter = 'Alle';
  let sortBy = 'name';
  
  $: categories = ['Alle', ...getAllCategories(produkte)];
  
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
    let results = produkte;
    
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
  
  // Navigation
  $: prevMonth = month === 1 ? 12 : month - 1;
  $: nextMonth = month === 12 ? 1 : month + 1;
</script>

<svelte:head>
  <title>{monthName} - inSeason Saisonkalender</title>
</svelte:head>

<div class="back-link">
  <a href="/">← Zurück zur Übersicht</a>
</div>

<div class="month-header">
  <div class="month-nav">
    <a href="/monat/{prevMonth}" class="nav-btn">
      ← {getMonthName(prevMonth)}
    </a>
    
    <div class="current-month">
      <h1>🗓️ {monthName}</h1>
      <p>{produkte.length} Lebensmittel in Saison</p>
    </div>
    
    <a href="/monat/{nextMonth}" class="nav-btn">
      {getMonthName(nextMonth)} →
    </a>
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
  .back-link {
    margin-bottom: 1.5rem;
  }

  .back-link a {
    color: #4CAF50;
    text-decoration: none;
    font-weight: 500;
  }

  .back-link a:hover {
    text-decoration: underline;
  }

  .month-header {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }

  .month-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
  }

  .current-month {
    text-align: center;
    flex: 1;
	min-width: 0;
  }

  .current-month h1 {
    margin: 0;
    font-size: 2.5rem;
    color: #2E7D32;
	word-wrap: break-word;
  }

  .current-month p {
    margin: 0.5rem 0 0 0;
    color: #666;
    font-size: 1.1rem;
  }

  .nav-btn {
    padding: 0.75rem 1.5rem;
    background: #f5f5f5;
    border-radius: 8px;
    text-decoration: none;
    color: #333;
    font-weight: 500;
    transition: all 0.2s;
    white-space: nowrap;
	min-width: 180px;
	text-align: center;
  }

  .nav-btn:hover {
    background: #4CAF50;
    color: white;
    transform: translateY(-2px);
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
	color: white;
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
    .month-nav {
      flex-direction: column;
      gap: 1rem;
    }
    
    .current-month h1 {
      font-size: 1.75rem;
    }
    
    .nav-btn {
      width: 100%;
      text-align: center;
	  min-width: auto;
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
