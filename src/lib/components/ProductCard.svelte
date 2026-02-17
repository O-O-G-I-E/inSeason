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
      'Gemüse': '#2E7D32',
      'Obst': '#F57C00',
      'Nüsse': '#5D4037',
      'Pilze': '#6D4C41',
      'Getreide': '#9E7B3A',
      'Wildkräuter': '#558B2F',
      'Kräuter': '#388E3C'
    };
    return colors[kat] || '#424242';
  }
  
  // Smart Display: Ganzjährig = "Ganzjährig", sonst Haupternte
  function getSeasonDisplay(saison) {
    if (saison.monate.length === 12) {
      return 'Ganzjährig';
    }
    return saison.haupternte;
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
  </div>

  <!-- Kompakte Environmental Info -->
  {#if regional_data}
    <div class="env-compact">
      <div class="origin-line">
        {getFlagEmoji(regional_data.origin_country)} {regional_data.origin_region}
      </div>
      <div class="metrics-line">
        <span class="co2-compact" class:low={regional_data.co2_per_kg < 0.3} class:medium={regional_data.co2_per_kg >= 0.3 && regional_data.co2_per_kg < 0.7} class:high={regional_data.co2_per_kg >= 0.7}>
          {regional_data.co2_per_kg} kg
        </span>
        <span class="score-compact" style="color: {scoreColor}">
          {regional_data.is_import ? '🌍' : '🌱'} {regionalScore}
        </span>
      </div>
    </div>
  {/if}
  
  <div class="card-footer">
    <span>{naehrwerte.energie_kcal} kcal</span>
    <span>{naehrwerte.protein_g}g</span>
  </div>
</a>

<style>
  .card {
    background: var(--bg-secondary, #ffffff);
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 2px 8px var(--shadow, rgba(0,0,0,0.1));
    transition: all 0.3s ease;
    cursor: pointer;
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    border: 2px solid transparent;
    min-height: 180px;
  }

  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px var(--shadow-hover, rgba(0,0,0,0.15));
    border-color: var(--accent, #4CAF50);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 0.5rem;
    gap: 0.5rem;
  }

  h3 {
    margin: 0;
    font-size: 1.1rem;
    color: var(--text-primary, #212121);
    line-height: 1.3;
    flex: 1;
  }

  .badge {
    padding: 0.25rem 0.6rem;
    border-radius: 12px;
    color: white;
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .card-body {
    flex: 1;
    margin-bottom: 0.5rem;
  }

  .card-body p {
    margin: 0.25rem 0;
    font-size: 0.8rem;
    color: var(--text-secondary, #666666);
    line-height: 1.4;
  }

  .subcat {
    font-weight: 500;
    color: var(--text-secondary, #666666);
  }

  .season {
    font-size: 0.75rem !important;
  }

  /* Kompakte Environmental Info */
  .env-compact {
    padding: 0.5rem;
    background: var(--env-bg, rgba(76, 175, 80, 0.08));
    border-radius: 6px;
    margin-bottom: 0.5rem;
    border: 1px solid var(--border-color, rgba(0,0,0,0.08));
  }

  .origin-line {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-primary, #212121);
    margin-bottom: 0.25rem;
  }

  .metrics-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .co2-compact.low {
    color: #4CAF50;
  }

  .co2-compact.medium {
    color: #FF9800;
  }

  .co2-compact.high {
    color: #f44336;
  }

  .score-compact {
    font-weight: 700;
  }

  .card-footer {
    display: flex;
    gap: 0.75rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--border-color, rgba(0,0,0,0.08));
    font-size: 0.75rem;
    color: var(--text-tertiary, #999999);
    font-weight: 500;
  }

  /* Dark Mode */
  :global(.dark-mode) .card {
    background: var(--bg-secondary, #2a2a2a);
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }

  :global(.dark-mode) .card:hover {
    box-shadow: 0 6px 16px rgba(0,0,0,0.4);
  }

  :global(.dark-mode) h3 {
    color: var(--text-primary, #f5f5f5);
  }

  :global(.dark-mode) .subcat,
  :global(.dark-mode) .card-body p {
    color: var(--text-secondary, #b0b0b0);
  }

  :global(.dark-mode) .env-compact {
    background: rgba(76, 175, 80, 0.15);
    border-color: rgba(76, 175, 80, 0.3);
  }

  :global(.dark-mode) .origin-line {
    color: var(--text-primary, #f5f5f5);
  }

  :global(.dark-mode) .card-footer {
    border-top-color: rgba(255,255,255,0.1);
    color: var(--text-tertiary, #888888);
  }

  @media (max-width: 768px) {
    .card {
      padding: 0.75rem;
      min-height: 160px;
    }

    h3 {
      font-size: 1rem;
    }

    .badge {
      font-size: 0.6rem;
      padding: 0.2rem 0.5rem;
    }
  }
</style>
