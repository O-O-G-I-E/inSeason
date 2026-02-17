<script>
  import { getCurrentMonth } from '$lib/utils/seasonHelper';

  export let produkt;
  
  $: ({ id, name, kategorie, saison } = produkt);
  
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
  
  function getSeasonDisplay(saison) {
    if (saison.monate.length === 12) {
      return '📅 Ganzjährig';
    }
    return `📅 ${saison.haupternte}`;
  }
</script>

<a href={`/produkt/${id}`} class="card">
  <h3 class="name">{name}</h3>
  <span class="badge" style="background: {getCategoryColor(kategorie)}">
    {kategorie}
  </span>
  <p class="season">{getSeasonDisplay(saison)}</p>
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
    min-height: 110px;
    position: relative;
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
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--text-primary, #212121);
    line-height: 1.3;
    flex: 1;
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
  }

  .season {
    margin: 0;
    font-size: 0.8rem;
    color: var(--text-secondary, #666666);
    font-weight: 500;
    margin-top: auto;
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

  :global(.dark-mode) .season {
    color: var(--text-secondary, #b0b0b0);
  }

  @media (max-width: 768px) {
    .card {
      padding: 0.75rem;
      min-height: 100px;
    }

    .name {
      font-size: 0.95rem;
      padding-right: 3.5rem;
    }

    .badge {
      font-size: 0.55rem;
      padding: 0.2rem 0.45rem;
    }

    .season {
      font-size: 0.75rem;
    }
  }
</style>
