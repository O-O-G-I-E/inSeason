<script>
  import rezepteData from '$lib/data/rezepte.json';
  import RezeptCard from '$lib/components/RezeptCard.svelte';
  import { filterRezepteByMonth, filterRezepteByCategory, getAllRezeptCategories, filterRezepteByDiet } from '$lib/utils/seasonHelper.js';
  
  let selectedMonth = new Date().getMonth() + 1;
  let selectedCategory = 'Alle';
  let selectedDiet = 'alle';
  
  $: kategorien = getAllRezeptCategories(rezepteData);
  
  $: filteredRezepte = rezepteData
    .filter(r => selectedMonth === 0 || r.saison.monate.includes(selectedMonth))
    .filter(r => selectedCategory === 'Alle' || r.kategorie === selectedCategory)
    .filter(r => selectedDiet === 'alle' || r.varianten.includes(selectedDiet));
  
  const monate = [
    { value: 0, name: 'Alle' },
    { value: 1, name: 'Januar' },
    { value: 2, name: 'Februar' },
    { value: 3, name: 'März' },
    { value: 4, name: 'April' },
    { value: 5, name: 'Mai' },
    { value: 6, name: 'Juni' },
    { value: 7, name: 'Juli' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'Oktober' },
    { value: 11, name: 'November' },
    { value: 12, name: 'Dezember' }
  ];
</script>

<svelte:head>
  <title>Saisonale Rezepte - inSeason</title>
</svelte:head>

<div class="container">
  <header>
    <h1>🍳 Saisonale Rezepte</h1>
    <p>Leckere Gerichte mit regionalen Zutaten der Saison</p>
  </header>
  
  <div class="filters">
    <!-- Ernährungsform Filter -->
    <div class="filter-section">
      <h3>Ernährungsform</h3>
      <div class="filter-buttons">
        <button
          class="diet-btn"
          class:active={selectedDiet === 'alle'}
          on:click={() => selectedDiet = 'alle'}
        >
          Alle
        </button>
        <button
          class="diet-btn omnivor"
          class:active={selectedDiet === 'omnivor'}
          on:click={() => selectedDiet = 'omnivor'}
        >
          🍖 Omnivor
        </button>
        <button
          class="diet-btn vegetarisch"
          class:active={selectedDiet === 'vegetarisch'}
          on:click={() => selectedDiet = 'vegetarisch'}
        >
          🥚 Vegetarisch
        </button>
        <button
          class="diet-btn vegan"
          class:active={selectedDiet === 'vegan'}
          on:click={() => selectedDiet = 'vegan'}
        >
          🌱 Vegan
        </button>
      </div>
    </div>
    
    <!-- Monat Filter -->
    <div class="filter-section">
      <h3>Monat</h3>
      <div class="filter-buttons months">
        {#each monate as monat}
          <button
            class="filter-btn"
            class:active={selectedMonth === monat.value}
            on:click={() => selectedMonth = monat.value}
          >
            {monat.name}
          </button>
        {/each}
      </div>
    </div>
    
    <!-- Kategorie Filter -->
    <div class="filter-section">
      <h3>Kategorie</h3>
      <div class="filter-buttons">
        {#each kategorien as kategorie}
          <button
            class="filter-btn"
            class:active={selectedCategory === kategorie}
            on:click={() => selectedCategory = kategorie}
          >
            {kategorie}
          </button>
        {/each}
      </div>
    </div>
  </div>
  
  <!-- Ergebnis-Anzeige -->
  <div class="results-info">
    <p>{filteredRezepte.length} {filteredRezepte.length === 1 ? 'Rezept' : 'Rezepte'} gefunden</p>
  </div>
  
  <!-- Rezept-Grid -->
  {#if filteredRezepte.length > 0}
    <div class="rezepte-grid">
      {#each filteredRezepte as rezept (rezept.id)}
        <RezeptCard {rezept} />
      {/each}
    </div>
  {:else}
    <div class="no-results">
      <p>Keine Rezepte für diese Filter gefunden.</p>
      <button on:click={() => { selectedMonth = 0; selectedCategory = 'Alle'; selectedDiet = 'alle'; }}>
        Filter zurücksetzen
      </button>
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0;
  }
  
  header {
    text-align: center;
    margin-bottom: 3rem;
  }
  
  header h1 {
    margin: 0 0 0.5rem 0;
    color: var(--accent);
    font-size: 3rem;
  }
  
  header p {
    color: var(--text-secondary);
    font-size: 1.2rem;
  }
  
  .filters {
    background: var(--bg-secondary);
    padding: 2rem;
    border-radius: 12px;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px var(--shadow);
    border: 1px solid var(--border-color);
  }
  
  .filter-section {
    margin-bottom: 2rem;
  }
  
  .filter-section:last-child {
    margin-bottom: 0;
  }
  
  .filter-section h3 {
    margin: 0 0 1rem 0;
    color: var(--text-primary);
    font-size: 1.1rem;
  }
  
  .filter-buttons {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  
  .filter-buttons.months {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 0.5rem;
  }
  
  .filter-btn, .diet-btn {
    padding: 0.5rem 1rem;
    background: var(--bg-tertiary);
    border: 2px solid var(--border-color);
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.95rem;
    color: var(--text-primary);
    text-align: center;
  }
  
  .filter-btn:hover, .diet-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px var(--shadow-hover);
  }
  
  .filter-btn.active {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
  }
  
  /* Ernährungsform-spezifische Farben */
  .diet-btn.active {
    color: white;
  }
  
  .diet-btn.omnivor.active {
    background: #FF5722;
    border-color: #FF5722;
  }
  
  .diet-btn.vegetarisch.active {
    background: #4CAF50;
    border-color: #4CAF50;
  }
  
  .diet-btn.vegan.active {
    background: #8BC34A;
    border-color: #8BC34A;
  }
  
  .results-info {
    margin-bottom: 1.5rem;
    text-align: center;
  }
  
  .results-info p {
    color: var(--text-secondary);
    font-size: 1rem;
  }
  
  .rezepte-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2rem;
  }
  
  .no-results {
    text-align: center;
    padding: 4rem 2rem;
    background: var(--bg-secondary);
    border-radius: 12px;
    border: 1px solid var(--border-color);
  }
  
  .no-results p {
    margin: 0 0 1.5rem 0;
    color: var(--text-secondary);
    font-size: 1.2rem;
  }
  
  .no-results button {
    padding: 0.75rem 2rem;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s ease;
  }
  
  .no-results button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--shadow-hover);
  }
  
  @media (max-width: 768px) {
    header h1 {
      font-size: 2rem;
    }
    
    .filters {
      padding: 1.5rem;
    }
    
    .filter-buttons.months {
      grid-template-columns: repeat(3, 1fr);
    }
    
    .rezepte-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }
</style>
