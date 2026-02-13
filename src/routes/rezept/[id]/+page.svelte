<script>
  import { page } from '$app/stores';
  import rezepteData from '$lib/data/rezepte.json';
  
  $: rezeptId = parseInt($page.params.id);
  $: rezept = rezepteData.find(r => r.id === rezeptId);
  $: isVegan = rezept && rezept.varianten && rezept.varianten.includes('vegan');
  
  $: alleZutaten = rezept ? [
    ...rezept.basis_zutaten,
    ...(rezept.varianten_zutaten?.vegan || [])
  ] : [];
  
  $: alleSchritte = rezept ? [
    ...rezept.basis_zubereitung,
    ...(rezept.varianten_zubereitung?.vegan || [])
  ] : [];
</script>

<svelte:head>
  <title>{rezept ? `${rezept.name} - inSeason Rezepte` : 'Rezept nicht gefunden - inSeason'}</title>
</svelte:head>

{#if rezept && isVegan}
  <div class="container">
    <div class="back-link">
      <a href="/rezepte">← Zurück zu Rezepten</a>
    </div>
    
    <header class="rezept-header">
      <h1>{rezept.name}</h1>
      <div class="meta">
        <span class="kategorie">{rezept.kategorie}</span>
        <span>⏱️ {rezept.zeit} Min</span>
        <span>👥 {rezept.portionen} Personen</span>
        <span>📊 {rezept.schwierigkeit}</span>
      </div>
    </header>
    
    <div class="rezept-content">
      <!-- Zutaten -->
      <section class="zutaten-section">
        <h2>🛒 Zutaten</h2>
        <ul class="zutaten-liste">
          {#each alleZutaten as zutat}
            <li>
              <span class="menge">{zutat.menge}</span>
              {#if zutat.produktId}
                <a href={`/produkt/${zutat.produktId}`} class="zutat-link">
                  {zutat.name}
                </a>
              {:else}
                <span class="zutat-name">{zutat.name}</span>
              {/if}
              {#if zutat.optional}
                <span class="optional">(optional)</span>
              {/if}
            </li>
          {/each}
        </ul>
      </section>
      
      <!-- Zubereitung -->
      <section class="zubereitung-section">
        <h2>👨‍🍳 Zubereitung</h2>
        <ol class="schritte-liste">
          {#each alleSchritte as schritt, index}
            <li>
              <span class="schritt-nummer">{index + 1}</span>
              <p>{schritt}</p>
            </li>
          {/each}
        </ol>
      </section>
    </div>
    
    <!-- Tags -->
    {#if rezept.tags && rezept.tags.length > 0}
      <div class="tags-section">
        {#each rezept.tags as tag}
          <span class="tag">{tag}</span>
        {/each}
      </div>
    {/if}
  </div>
{:else}
  <div class="container">
    <p>Rezept nicht gefunden</p>
    <a href="/rezepte">← Zurück zu Rezepten</a>
  </div>
{/if}

<style>
  .container {
    max-width: 900px;
    margin: 0 auto;
    padding: 0;
  }
  
  .back-link {
    margin-bottom: 1.5rem;
  }
  
  .back-link a {
    color: var(--accent);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }
  
  .back-link a:hover {
    text-decoration: underline;
  }
  
  .rezept-header {
    margin-bottom: 2rem;
  }
  
  .rezept-header h1 {
    margin: 0 0 1rem 0;
    color: var(--accent);
    font-size: 2.5rem;
  }
  
  .meta {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    font-size: 1rem;
    color: var(--text-secondary);
  }
  
  .kategorie {
    background: #FF9800;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
  }
  
  /* Content Grid */
  .rezept-content {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 2rem;
    margin-bottom: 2rem;
  }
  
  @media (max-width: 768px) {
    .rezept-content {
      grid-template-columns: 1fr;
    }
  }
  
  section {
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 4px var(--shadow);
    border: 1px solid var(--border-color);
  }
  
  section h2 {
    margin: 0 0 1rem 0;
    color: var(--accent);
    font-size: 1.5rem;
  }
  
  /* Zutaten */
  .zutaten-liste {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .zutaten-liste li {
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    gap: 0.75rem;
    align-items: baseline;
  }
  
  .zutaten-liste li:last-child {
    border-bottom: none;
  }
  
  .menge {
    font-weight: 600;
    color: var(--accent);
    min-width: 80px;
  }
  
  .zutat-link {
    color: var(--text-primary);
    text-decoration: none;
    border-bottom: 1px dashed var(--accent);
    transition: all 0.2s;
  }
  
  .zutat-link:hover {
    color: var(--accent);
    border-bottom-style: solid;
  }
  
  .zutat-name {
    color: var(--text-primary);
  }
  
  .optional {
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-style: italic;
  }
  
  /* Zubereitung */
  .schritte-liste {
    list-style: none;
    padding: 0;
    margin: 0;
    counter-reset: step-counter;
  }
  
  .schritte-liste li {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    counter-increment: step-counter;
  }
  
  .schritte-liste li:last-child {
    margin-bottom: 0;
  }
  
  .schritt-nummer {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    background: var(--accent);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1rem;
  }
  
  .schritte-liste p {
    margin: 0;
    line-height: 1.6;
    color: var(--text-primary);
  }
  
  /* Tags */
  .tags-section {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  
  .tag {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    border: 1px solid var(--border-color);
  }
  
  @media (max-width: 768px) {
    .rezept-header h1 {
      font-size: 2rem;
    }
    
    
  }
</style>
