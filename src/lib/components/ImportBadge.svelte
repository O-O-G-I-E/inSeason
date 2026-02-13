<script>
  import { calculateRegionalScore, getScoreColor, TRANSPORT_ICONS, getFlagEmoji } from '$lib/utils/regionalHelper';
  import { getCurrentMonth } from '$lib/utils/seasonHelper';
  
  export let produkt;
  export let compact = false;  // Für Zutatenliste
  
  const { regional_data } = produkt;
  
  // Berechnungen
  const currentMonth = getCurrentMonth();
  const regionalScore = calculateRegionalScore(produkt, currentMonth);
  const scoreColor = getScoreColor(regionalScore);
  const transportIcon = TRANSPORT_ICONS[regional_data?.transport_method] || '🌍';
  const flag = getFlagEmoji(regional_data?.origin_country);
</script>

{#if regional_data}
  <div class="import-badge" class:compact style="--score-color: {scoreColor}">
    {#if regional_data.is_import}
      <span class="import-label">
        {flag} Import: {regional_data.origin_region}
      </span>
    {/if}
    
    <span class="transport">{transportIcon}</span>
    
    {#if !compact}
      <span class="co2">{regional_data.co2_per_kg.toFixed(2)} kg CO₂/kg</span>
    {/if}
    
    <span class="score" style="color: var(--score-color)">
      {regionalScore}/100
    </span>
  </div>
{/if}

<style>
  .import-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 0.75rem;
    background: var(--bg-tertiary);
    border-radius: 8px;
    font-size: 0.85rem;
    border: 1px solid var(--border-color);
  }
  
  .compact {
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
    gap: 0.35rem;
  }
  
  .import-label {
    color: var(--text-secondary);
    font-weight: 500;
  }
  
  .transport {
    font-size: 1.1rem;
  }
  
  .co2 {
    color: var(--text-tertiary);
    font-size: 0.8rem;
  }
  
  .score {
    font-weight: 700;
    font-size: 0.9rem;
  }
</style>
