<script>
  export let produkt;
  
  const { id, name, kategorie, unterkategorie, saison, naehrwerte } = produkt;
  
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
    // Entferne " (ganzjährig)" und " ganzjährig"
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

  .card-footer {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
    font-size: 0.85rem;
    color: var(--text-tertiary);
  }
</style>
