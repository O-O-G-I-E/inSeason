<script>
  import { page } from '$app/stores';
  import rezepteData from '$lib/data/rezepte.json';
  import lebensmittelData from '$lib/data/lebensmittel.json';
  import { getMonthRangeDisplay } from '$lib/utils/seasonHelper.js';
  import { calculateRezeptCO2, calculateRezeptNaehrwerte, enrichZutaten } from '$lib/utils/rezeptHelper.js';
  import { getScoreColor, getFlagEmoji } from '$lib/utils/regionalHelper.js';
  
  $: rezeptId = parseInt($page.params.id);
  $: rezept = rezepteData.find(r => r.id === rezeptId);
  $: isVegan = rezept && rezept.varianten && rezept.varianten.includes('vegan');
  
  $: zutatenMitProdukten = rezept ? enrichZutaten(rezept, lebensmittelData) : [];
  
  $: alleSchritte = rezept ? [
    ...rezept.basis_zubereitung,
    ...(rezept.varianten_zubereitung?.vegan || [])
  ] : [];
  
  $: co2Data = rezept ? calculateRezeptCO2(rezept, lebensmittelData) : null;
  $: naehrwerte = rezept ? calculateRezeptNaehrwerte(rezept, lebensmittelData) : null;
  
  const schwierigkeitEmoji = {
    'leicht': '👍',
    'mittel': '👨‍🍳',
    'schwer': '⭐'
  };
  
  function getCategoryColor(kategorie) {
    const colors = {
      'Hauptgericht': '#4CAF50',
      'Suppe': '#FF9800',
      'Salat': '#8BC34A',
      'Aufstrich': '#9C27B0',
      'Dessert': '#E91E63'
    };
    return colors[kategorie] || '#757575';
  }
</script>

<svelte:head>
  <title>{rezept ? `${rezept.name} - inSeason Rezepte` : 'Rezept nicht gefunden'}</title>
</svelte:head>

<div class="page-container">
  {#if rezept && isVegan}
    <div class="back-link">
      <a href="/rezepte">← Zurück zu Rezepten</a>
    </div>

    <!-- Header: Name + Meta + Nachhaltigkeit -->
    <div class="rezept-header">
      <div class="title-row">
        <h1>{rezept.name}</h1>
        <span class="badge" style="background: {getCategoryColor(rezept.kategorie)}">
          {rezept.kategorie}
        </span>
      </div>
      
      <!-- Meta Info + Nachhaltigkeit Grid -->
      <div class="hero-grid">
        <!-- Meta Info -->
        <div class="hero-section">
          <div class="meta-item">
            <span class="m-icon">⏱️</span>
            <span class="m-text">{rezept.zeit} Minuten</span>
          </div>
          <div class="meta-item">
            <span class="m-icon">{schwierigkeitEmoji[rezept.schwierigkeit]}</span>
            <span class="m-text">{rezept.schwierigkeit}</span>
          </div>
          <div class="meta-item">
            <span class="m-icon">👥</span>
            <span class="m-text">{rezept.portionen} Portionen</span>
          </div>
          <div class="meta-item">
            <span class="m-icon">📅</span>
            <span class="m-text">{getMonthRangeDisplay(rezept.saison.monate)}</span>
          </div>
        </div>
        
        <!-- Nachhaltigkeit -->
        {#if co2Data && co2Data.regionalScore !== null}
          <div class="hero-section sustainability">
            <div class="sus-row">
              <div class="score-large" style="border-color: {getScoreColor(co2Data.regionalScore)}; color: {getScoreColor(co2Data.regionalScore)}">
                {co2Data.regionalScore}<span class="score-max">/10</span>
              </div>
              <div class="co2-info">
                <div class="co2-total">🌍 {co2Data.totalCO2} kg CO₂</div>
                <div class="co2-portion">({co2Data.co2PerPortion} kg/Portion)</div>
              </div>
            </div>
            <div class="regional-info">
              <span class="regional-text">
                {co2Data.regionalCount} von {co2Data.totalZutaten} Zutaten regional
              </span>
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- 2-Spalten Grid -->
    <div class="details-grid">
      
      <!-- Zutaten -->
      <div class="info-card">
        <h2>🛒 Zutaten</h2>
        <p class="card-subtitle">für {rezept.portionen} Portionen</p>
        <ul class="zutaten-liste">
          {#each zutatenMitProdukten as zutat}
            <li>
              <span class="menge">{zutat.menge}</span>
              {#if zutat.produktId && zutat.produkt}
                <a href={`/produkt/${zutat.produktId}`} class="zutat-link">
                  {zutat.name}
                </a>
                {#if zutat.produkt.regional_data}
                  <span class="zutat-flag">
                    {getFlagEmoji(zutat.produkt.regional_data.origin_country)}
                  </span>
                {/if}
              {:else}
                <span class="zutat-name">{zutat.name}</span>
              {/if}
            </li>
          {/each}
        </ul>
      </div>

      <!-- Zubereitung -->
      <div class="info-card zubereitung">
        <h2>👨‍🍳 Zubereitung</h2>
        <ol class="schritte-liste">
          {#each alleSchritte as schritt, index}
            <li>
              <span class="schritt-nummer">{index + 1}</span>
              <p>{schritt}</p>
            </li>
          {/each}
        </ol>
      </div>

      <!-- Nährwerte Gesamt -->
      {#if naehrwerte}
        <div class="info-card">
          <h2>🥗 Nährwerte (Gesamt)</h2>
          <p class="card-subtitle">für alle {rezept.portionen} Portionen</p>
          <div class="nutrition-grid">
            <div class="nutrition-item highlight">
              <span class="n-value">{naehrwerte.gesamt.energie_kcal}</span>
              <span class="n-label">kcal</span>
            </div>
            <div class="nutrition-item highlight">
              <span class="n-value">{naehrwerte.gesamt.protein_g}g</span>
              <span class="n-label">Protein</span>
            </div>
            <div class="nutrition-item">
              <span class="n-value">{naehrwerte.gesamt.kohlenhydrate_g}g</span>
              <span class="n-label">Kohlenhydrate</span>
            </div>
            <div class="nutrition-item">
              <span class="n-value">{naehrwerte.gesamt.fett_g}g</span>
              <span class="n-label">Fett</span>
            </div>
            <div class="nutrition-item">
              <span class="n-value">{naehrwerte.gesamt.ballaststoffe_g}g</span>
              <span class="n-label">Ballaststoffe</span>
            </div>
          </div>
        </div>

        <!-- Nährwerte pro Portion -->
        <div class="info-card">
          <h2>🍽️ Nährwerte (pro Portion)</h2>
          <p class="card-subtitle">bei {rezept.portionen} Portionen</p>
          <div class="nutrition-grid">
            <div class="nutrition-item highlight">
              <span class="n-value">{naehrwerte.proPortion.energie_kcal}</span>
              <span class="n-label">kcal</span>
            </div>
            <div class="nutrition-item highlight">
              <span class="n-value">{naehrwerte.proPortion.protein_g}g</span>
              <span class="n-label">Protein</span>
            </div>
            <div class="nutrition-item">
              <span class="n-value">{naehrwerte.proPortion.kohlenhydrate_g}g</span>
              <span class="n-label">Kohlenhydrate</span>
            </div>
            <div class="nutrition-item">
              <span class="n-value">{naehrwerte.proPortion.fett_g}g</span>
              <span class="n-label">Fett</span>
            </div>
            <div class="nutrition-item">
              <span class="n-value">{naehrwerte.proPortion.ballaststoffe_g}g</span>
              <span class="n-label">Ballaststoffe</span>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Tags -->
    {#if rezept.tags && rezept.tags.length > 0}
      <div class="tags-section">
        {#each rezept.tags as tag}
          <span class="tag">#{tag}</span>
        {/each}
      </div>
    {/if}

  {:else}
    <div class="not-found">
      <h1>404</h1>
      <p>Rezept nicht gefunden</p>
      <a href="/rezepte" class="btn-primary">← Zurück zu Rezepten</a>
    </div>
  {/if}
</div>

<style>
  * {
    box-sizing: border-box;
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
  }

  .page-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 0 2rem 0;
  }

  .back-link {
    margin-bottom: 1rem;
    padding: 0 0.5rem;
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

  /* Header */
  .rezept-header {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 8px var(--shadow);
  }

  .title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .title-row h1 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
    flex: 1;
  }

  .badge {
    padding: 0.4rem 0.8rem;
    border-radius: 12px;
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }

  .hero-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .hero-section {
    background: var(--bg-tertiary);
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid var(--border-color);
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0;
    font-size: 0.9rem;
  }

  .m-icon {
    font-size: 1.1rem;
  }

  .m-text {
    color: var(--text-primary);
    font-weight: 500;
  }

  /* Nachhaltigkeit */
  .sustainability {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .sus-row {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .score-large {
    font-size: 2rem;
    font-weight: 800;
    border: 3px solid;
    border-radius: 12px;
    padding: 0.5rem 0.75rem;
    line-height: 1;
  }

  .score-max {
    font-size: 1.2rem;
    opacity: 0.6;
  }

  .co2-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .co2-total {
    font-weight: 700;
    font-size: 1rem;
    color: var(--text-primary);
  }

  .co2-portion {
    font-size: 0.8rem;
    color: var(--text-secondary);
  }

  .regional-info {
    padding-top: 0.5rem;
    border-top: 1px solid var(--border-color);
  }

  .regional-text {
    font-size: 0.85rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  /* Details Grid */
  .details-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .info-card {
    background: var(--bg-secondary);
    padding: 1.25rem;
    border-radius: 12px;
    box-shadow: 0 2px 4px var(--shadow);
    border: 1px solid var(--border-color);
  }

  .info-card h2 {
    margin: 0 0 0.25rem 0;
    font-size: 1.3rem;
    color: var(--accent);
    font-weight: 700;
  }

  .card-subtitle {
    margin: 0 0 1rem 0;
    font-size: 0.85rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  /* Zutaten */
  .zutaten-liste {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .zutaten-liste li {
    padding: 0.6rem 0;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    font-size: 0.9rem;
  }

  .zutaten-liste li:last-child {
    border-bottom: none;
  }

  .menge {
    font-weight: 700;
    color: var(--accent);
    min-width: 70px;
    font-size: 0.85rem;
  }

  .zutat-link {
    color: var(--text-primary);
    text-decoration: none;
    border-bottom: 1px dashed var(--accent);
    transition: all 0.2s;
    flex: 1;
  }

  .zutat-link:hover {
    color: var(--accent);
    border-bottom-style: solid;
  }

  .zutat-name {
    color: var(--text-primary);
    flex: 1;
  }

  .zutat-flag {
    font-size: 1rem;
  }

  /* Zubereitung */
  .zubereitung {
    grid-column: 1;
  }

  .schritte-liste {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .schritte-liste li {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .schritte-liste li:last-child {
    margin-bottom: 0;
  }

  .schritt-nummer {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    background: var(--accent);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.85rem;
  }

  .schritte-liste p {
    margin: 0;
    line-height: 1.6;
    color: var(--text-primary);
    font-size: 0.9rem;
  }

  /* Nährwerte */
  .nutrition-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .nutrition-item {
    background: var(--bg-tertiary);
    padding: 0.75rem;
    border-radius: 8px;
    text-align: center;
    border: 1px solid var(--border-color);
  }

  .nutrition-item.highlight {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
  }

  .n-value {
    display: block;
    font-size: 1.3rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
  }

  .nutrition-item.highlight .n-value {
    color: white;
  }

  .n-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-secondary);
  }

  .nutrition-item.highlight .n-label {
    color: rgba(255,255,255,0.9);
  }

  /* Tags */
  .tags-section {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    padding: 0 0.5rem;
  }

  .tag {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    border: 1px solid var(--border-color);
  }

  /* Not Found */
  .not-found {
    text-align: center;
    padding: 4rem 2rem;
    background: var(--bg-secondary);
    border-radius: 12px;
  }

  .not-found h1 {
    font-size: 4rem;
    margin: 0 0 1rem 0;
    color: var(--accent);
  }

  .not-found p {
    font-size: 1.2rem;
    color: var(--text-secondary);
    margin: 0 0 2rem 0;
  }

  .btn-primary {
    display: inline-block;
    padding: 0.75rem 2rem;
    background: var(--accent);
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.2s;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--shadow);
  }

  /* Responsive */
  @media (min-width: 769px) {
    .title-row h1 {
      font-size: 2.25rem;
    }

    .details-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .zubereitung {
      grid-column: 1 / -1;
    }

    .nutrition-grid {
      grid-template-columns: repeat(5, 1fr);
    }
  }

  @media (max-width: 768px) {
    .hero-grid {
      grid-template-columns: 1fr;
    }

    .rezept-header {
      padding: 1rem;
    }

    .title-row h1 {
      font-size: 1.5rem;
    }

    .badge {
      font-size: 0.65rem;
      padding: 0.3rem 0.6rem;
    }

    .score-large {
      font-size: 1.5rem;
      padding: 0.4rem 0.6rem;
    }

    .nutrition-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
