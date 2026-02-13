<script>
  export let rezept;
  import { getMonthRangeDisplay } from '$lib/utils/seasonHelper.js';
  
  const schwierigkeitEmoji = {
    'leicht': '👍',
    'mittel': '👨‍🍳',
    'schwer': '⭐'
  };
  
  // Kategorie-spezifische Farben
  function getCategoryColor(kategorie) {
    const colors = {
      'Hauptgericht': '#4CAF50',    // Grün
      'Suppe': '#FF9800',           // Orange
      'Salat': '#8BC34A',           // Hellgrün
      'Aufstrich': '#9C27B0',       // Lila
      'Dessert': '#E91E63'          // Pink
    };
    return colors[kategorie] || '#757575';
  }
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
  
  <div class="card-footer">
    <span class="saison">📅 {getMonthRangeDisplay(rezept.saison.monate)}</span>
  </div>
  
  <div class="tags">
    {#each rezept.tags as tag}
      <span class="tag">{tag}</span>
    {/each}
  </div>
</a>

<style>
  .rezept-card {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px var(--shadow);
    transition: all 0.3s ease;
    text-decoration: none;
    color: var(--text-primary);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border: 1px solid var(--border-color);
  }
  
  .rezept-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px var(--shadow-hover);
    border-color: var(--accent);
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .card-header h3 {
    margin: 0;
    font-size: 1.3rem;
    color: var(--accent);
    flex: 1;
  }
  
  .kategorie {
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    white-space: nowrap;
    font-weight: 600;
  }
  
  .card-info {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    font-size: 0.9rem;
    color: var(--text-secondary);
  }
  
  .card-footer {
    padding-top: 0.5rem;
    border-top: 1px solid var(--border-color);
  }
  
  .saison {
    font-size: 0.9rem;
    color: var(--text-secondary);
  }
  
  .tags {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  
  .tag {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    border: 1px solid var(--border-color);
  }
</style>
