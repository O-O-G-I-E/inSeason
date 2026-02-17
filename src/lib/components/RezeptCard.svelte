<script>
  import { getMonthRangeDisplay } from '$lib/utils/seasonHelper.js';
  
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
</script>

<a href={`/rezept/${rezept.id}`} class="card">
  <h3 class="name">{rezept.name}</h3>
  <span class="badge" style="background: {getCategoryColor(rezept.kategorie)}">
    {rezept.kategorie}
  </span>
  
  <div class="card-info">
    <span>⏱️ {rezept.zeit} Min</span>
    <span>{schwierigkeitEmoji[rezept.schwierigkeit]}</span>
    <span>👥 {rezept.portionen}</span>
  </div>
  
  <p class="season">📅 {getMonthRangeDisplay(rezept.saison.monate)}</p>
</a>

<style>
  .card {
    background: var(--bg-secondary, #ffffff);
    border-radius: 10px;
    padding: 0.875rem;
    box-shadow: 0 1px 4px var(--shadow, rgba(0,0,0,0.08));
    transition: all 0.25s ease;
    cursor: pointer;
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border: 2px solid transparent;
    position: relative;
    
    /* Quadratisch: 1:1 Aspect Ratio */
    aspect-ratio: 1 / 1;
    width: 100%;
  }

  .card:active {
    transform: scale(0.98);
  }

  .card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px var(--shadow-hover, rgba(0,0,0,0.12));
    border-color: var(--accent, #4CAF50);
  }

  .name {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary, #212121);
    line-height: 1.3;
    flex: 1;
    padding-right: 3.5rem;
    overflow-wrap: break-word;
    word-break: break-word;
    /* Verhindert zu lange Namen - max 3 Zeilen */
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .badge {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.25rem 0.5rem;
    border-radius: 10px;
    color: white;
    font-size: 0.6rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    line-height: 1;
    white-space: nowrap;
  }

  .card-info {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    font-size: 0.75rem;
    color: var(--text-secondary, #666666);
    font-weight: 500;
  }

  .season {
    margin: 0;
    font-size: 0.8rem;
    color: var(--text-secondary, #666666);
    font-weight: 500;
    margin-top: auto;
    padding-top: 0.5rem;
    border-top: 1px solid var(--border-color, rgba(0,0,0,0.08));
  }

  /* Dark Mode */
  :global(.dark-mode) .card {
    background: var(--bg-secondary, #2a2a2a);
    box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  }

  :global(.dark-mode) .card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  }

  :global(.dark-mode) .name {
    color: var(--text-primary, #f5f5f5);
  }

  :global(.dark-mode) .card-info,
  :global(.dark-mode) .season {
    color: var(--text-secondary, #b0b0b0);
  }

  @media (max-width: 768px) {
    .card {
      padding: 0.75rem;
    }

    .name {
      font-size: 0.9rem;
    }

    .badge {
      font-size: 0.55rem;
      padding: 0.2rem 0.45rem;
    }

    .card-info {
      font-size: 0.7rem;
    }

    .season {
      font-size: 0.75rem;
    }
  }
</style>
