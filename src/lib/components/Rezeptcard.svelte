<script>
  export let rezept;
  import { getMonthRangeDisplay } from '$lib/utils/seasonHelper.js';
  
  const schwierigkeitEmoji = {
    'leicht': '👍',
    'mittel': '👨‍🍳',
    'schwer': '⭐'
  };
  
  const variantenEmoji = {
    'omnivor': '🍖',
    'vegetarisch': '🥚',
    'vegan': '🌱'
  };
</script>

<a href="/rezept/{rezept.id}" class="rezept-card">
  <div class="card-header">
    <h3>{rezept.name}</h3>
    <span class="kategorie">{rezept.kategorie}</span>
  </div>
  
  <!-- Varianten Badges -->
  <div class="varianten-badges">
    {#each rezept.varianten as variante}
      <span class="variante-badge {variante}">
        {variantenEmoji[variante]} {variante}
      </span>
    {/each}
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
    background: var(--card-bg);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px var(--shadow);
    transition: all 0.3s ease;
    text-decoration: none;
    color: var(--text);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .rezept-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px var(--shadow-hover);
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
    background: #FF9800;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    white-space: nowrap;
  }
  
  .varianten-badges {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  
  .variante-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 15px;
    font-size: 0.85rem;
    font-weight: 500;
    text-transform: capitalize;
  }
  
  .variante-badge.omnivor {
    background: #FFEBEE;
    color: #C62828;
  }
  
  .variante-badge.vegetarisch {
    background: #E8F5E9;
    color: #2E7D32;
  }
  
  .variante-badge.vegan {
    background: #F1F8E9;
    color: #558B2F;
  }
  
  :global(.dark-mode) .variante-badge.omnivor {
    background: #B71C1C;
    color: #FFCDD2;
  }
  
  :global(.dark-mode) .variante-badge.vegetarisch {
    background: #1B5E20;
    color: #A5D6A7;
  }
  
  :global(.dark-mode) .variante-badge.vegan {
    background: #33691E;
    color: #C5E1A5;
  }
  
  .card-info {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    font-size: 0.9rem;
    color: var(--text-muted);
  }
  
  .card-footer {
    padding-top: 0.5rem;
    border-top: 1px solid var(--border);
  }
  
  .saison {
    font-size: 0.9rem;
    color: var(--text-muted);
  }
  
  .tags {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  
  .tag {
    background: #E8F5E9;
    color: #2E7D32;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
  }
  
  :global(.dark-mode) .tag {
    background: #1B5E20;
    color: #A5D6A7;
  }
</style>
