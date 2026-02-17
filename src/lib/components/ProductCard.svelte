<script>
  import { calculateRegionalScore, getScoreColor, TRANSPORT_ICONS, getFlagEmoji } from '$lib/utils/regionalHelper';
  import { getCurrentMonth } from '$lib/utils/seasonHelper';

  export let produkt;
  
  const currentMonth = getCurrentMonth();
  $: regionalScore = produkt.regional_data 
    ? calculateRegionalScore(produkt, currentMonth) 
    : null;
  $: scoreColor = regionalScore ? getScoreColor(regionalScore) : '#666';
  
  $: ({ id, name, kategorie, unterkategorie, saison, naehrwerte, regional_data } = produkt);
  
  function getCategoryColor(kat) {
    const colors = {
      'Gemüse': '#4CAF50',
      'Obst': '#FF9800',
      'Nüsse': '#795548',
      'Pilze': '#A1887F',
      'Getreide': '#FFC107',
      'Wildkräuter': '#8BC34A',
      'Kräuter': '#66BB6A'
    };
    return colors[kat] || '#666';
  }
  
  // Smart Display: Ganzjährig = "Ganzjährig verfügbar", sonst Haupternte
  function getSeasonDisplay(saison) {
    if (saison.monate.length === 12) {
      return 'Ganzjährig verfügbar';
    }
    return saison.haupternte;
  }
  
  // Typ-Display: Entferne "(ganzjährig)" da es redundant ist
  function getTypeDisplay(typ) {
    return typ
      .replace(' (ganzjährig)', '')
      .replace(' ganzjährig', '')
      .trim();
  }
</script>

<a href={`/produkt/${id}`} class="card">
  <div class="card-header">
    <h3>{name}</h3>
    <span class="badge" style="background: {getCategoryColor(kategorie)}">
      {kategorie}
    </span>
  </div>
  
  <div class="card-body">
    <p class="subcat">{unterkategorie}</p>
    <p class="season">📅 {getSeasonDisplay(saison)}</p>
    <p class="type">🏷️ {getTypeDisplay(saison.typ)}</p>
  </div>

  <!-- NEU: Erweiterte Regional & CO2 Infos -->
  {#if regional_data}
    <div class="environmental-info">
      <!-- Herkunft & Transport -->
      <div class="origin-row">
        <span class="origin-label">
          {getFlagEmoji(regional_data.origin_country)} {regional_data.origin_region}
        </span>
        <span class="transport-badge">
          {TRANSPORT_ICONS[regional_data.transport_method]}
          {#if regional_data.transport_method === 'local'}
            Lokal
          {:else if regional_data.transport_method === 'truck'}
            LKW
          {:else if regional_data.transport_method === 'ship'}
            Schiff
          {:else if regional_data.transport_method === 'plane'}
            Flugzeug
          {/if}
        </span>
      </div>

      <!-- CO2 & Score -->
      <div class="metrics-row">
        <div class="co2-display">
          <span class="co2-icon">🌍</span>
          <span class="co2-value" class:low={regional_data.co2_per_kg < 0.3} class:medium={regional_data.co2_per_kg >= 0.3 && regional_data.co2_per_kg < 0.7} class:high={regional_data.co2_per_kg >= 0.7}>
            {regional_data.co2_per_kg} kg CO₂
          </span>
        </div>
        
        <div class="score-badge" style="background: {scoreColor}">
          {#if regional_data.is_import}
            🌍 Import
          {:else}
            🌱 Regional
          {/if}
          <span class="score-value">{regionalScore}</span>
        </div>
      </div>
    </div>
  {/if}
  
  <div class="card-footer">
    <span>{naehrwerte.energie_kcal} kcal</span>
    <span>{naehrwerte.protein_g}g Protein</span>
  </div>
</a>

<style>
  .card {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 1.25rem;
    box-shadow: 0 2px 8px var(--shadow);
    transition: all 0.3s ease;
    cursor: pointer;
    text-decoration: none;
    color: inherit;
    display: block;
    border: 2px solid transparent;
  }

  .card:hover {
    transform: translateY(-6px);
    box-shadow: 0 8px 20px var(--shadow-hover);
    border-color: var(--accent);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 0.75rem;
  }

  h3 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--text-primary);
  }

  .badge {
    padding: 0.35rem 0.75rem;
    border-radius: 20px;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .card-body p {
    margin: 0.5rem 0;
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  .subcat {
    font-weight: 500;
    color: var(--text-secondary);
  }

  /* NEU: Environmental Info Styling */
  .environmental-info {
    margin-top: 1rem;
    padding: 0.75rem;
    background: var(--bg-tertiary, #f8f9fa);
    border-radius: 8px;
    border: 1px solid var(--border-color);
  }

  .origin-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
  }

  .origin-label {
    font-weight: 600;
    color: var(--text-primary);
  }

  .transport-badge {
    padding: 0.25rem 0.6rem;
    background: var(--bg-secondary);
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
  }

  .metrics-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
  }

  .co2-display {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex: 1;
  }

  .co2-icon {
    font-size: 1rem;
  }

  .co2-value {
    font-weight: 700;
    font-size: 0.85rem;
  }

  .co2-value.low {
    color: #4CAF50; /* Grün: < 0.3 kg */
  }

  .co2-value.medium {
    color: #FF9800; /* Orange: 0.3-0.7 kg */
  }

  .co2-value.high {
    color: #f44336; /* Rot: > 0.7 kg */
  }

  .score-badge {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.75rem;
    border-radius: 16px;
    color: white;
    font-size: 0.8rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .score-value {
    font-size: 0.9rem;
    font-weight: 700;
  }

  .card-footer {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
    font-size: 0.85rem;
    color: var(--text-tertiary);
  }

  @media (max-width: 768px) {
    .metrics-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .score-badge {
      align-self: flex-start;
    }
  }
</style>
