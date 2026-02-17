<script>
  import { getMonthRangeDisplay } from '$lib/utils/seasonHelper.js';
  import { calculateRezeptCO2 } from '$lib/utils/rezeptHelper.js';
  import lebensmittelData from '$lib/data/lebensmittel.json';
  import { getScoreColor } from '$lib/utils/regionalHelper.js';
  
  export let rezept;
  
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
  
  $: co2Data = calculateRezeptCO2(rezept, lebensmittelData);
</script>

<a href={`/rezept/${rezept.id}`} class="rezept-card">
  <div class="card-header">
    <h3>{rezept.name}</h3>
    <span class="kategorie" style="background: {getCategoryColor(rezept.kategorie)}">
      {rezept.kategorie}
    </span>
  </div>
  
  <div class="card-info">
    <span>⏱️ {rezept.zeit} Min</span>
    <span>{schwierigkeitEmoji[rezept.schwierigkeit]} {rezept.schwierigkeit}</span>
    <span>👥 {rezept.portionen} Pers.</span>
  </div>
  
  <!-- CO2 Badge -->
  {#if co2Data.regionalScore !== null}
    <div class="sustainability-row">
      <div class="co2-badge">
        🌍 {co2Data.co2PerPortion} kg CO₂
      </div>
      <div class="score-badge" style="color: {getScoreColor(co2Data.regionalScore)}; border-color: {getScoreColor(co2Data.regionalScore)}">
        {co2Data.regionalScore}/10
      </div>
    </div>
  {/if}
  
  <div class="card-footer">
    <span class="saison">📅 {getMonthRangeDisplay(rezept.saison.monate)}</span>
  </div>
</a>

<style>
  .rezept-card {
    background: var(--bg-secondary);
    border-radius: 10px;
    padding: 0.875rem;
    box-shadow: 0 1px 4px var(--shadow);
    transition: all 0.25s ease;
    cursor: pointer;
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border: 2px solid transparent;
    position: relative;
    aspect-ratio: 1 / 1;
    width: 100%;
  }

  .rezept-card:active {
    transform: scale(0.98);
  }

  .rezept-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px var(--shadow-hover);
    border-color: var(--accent);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .card-header h3 {
    margin: 0;
    font-size: 1rem;
    color: var(--text-primary);
    font-weight: 600;
    line-height: 1.3;
    flex: 1;
    padding-right: 0.5rem;
    overflow-wrap: break-word;
    word-break: break-word;
  }

  .kategorie {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 10px;
    font-size: 0.6rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    line-height: 1;
  }

  .card-info {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .sustainability-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    font-size: 0.7rem;
    font-weight: 600;
  }

  .co2-badge {
    background: var(--bg-tertiary);
    padding: 0.25rem 0.5rem;
    border-radius: 8px;
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
  }

  .score-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 8px;
    border: 2px solid;
    font-weight: 700;
  }

  .card-footer {
    padding-top: 0.5rem;
    border-top: 1px solid var(--border-color);
    margin-top: auto;
  }

  .saison {
    font-size: 0.8rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  :global(.dark-mode) .rezept-card {
    background: var(--bg-secondary);
    box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  }

  :global(.dark-mode) .rezept-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  }

  @media (max-width: 768px) {
    .rezept-card {
      padding: 0.75rem;
    }

    .card-header h3 {
      font-size: 0.9rem;
    }

    .kategorie {
      font-size: 0.55rem;
      padding: 0.2rem 0.45rem;
    }

    .card-info {
      font-size: 0.7rem;
    }

    .sustainability-row {
      font-size: 0.65rem;
    }

    .saison {
      font-size: 0.75rem;
    }
  }
</style>
