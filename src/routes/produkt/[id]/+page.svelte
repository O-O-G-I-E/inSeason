<script>
  import { page } from '$app/stores';
  import lebensmittelData from '$lib/data/lebensmittel.json';
  import { getMonthName, getSeasonDisplay } from '$lib/utils/seasonHelper.js';
  
  $: id = parseInt($page.params.id);
  $: produkt = lebensmittelData.find(p => p.id === id);
  
  function getCategoryColor(kat) {
    const colors = {
      'Gemüse': '#4CAF50',
      'Obst': '#FF9800',
      'Nüsse': '#795548',
      'Fisch': '#2196F3',
      'Pilze': '#9C27B0',
      'Getreide': '#FFC107',
      'Milchprodukte': '#00BCD4',
      'Eier': '#FFEB3B',
	  'Fleisch': '#D32F2F',
      'Geflügel': '#FF5252',
      'Wildkräuter': '#8BC34A'
    };
    return colors[kat] || '#666';
  }
  
  function getMonthNames(monate) {
    return monate.map(m => getMonthName(m)).join(', ');
  }
</script>

<svelte:head>
  <title>{produkt ? produkt.name : 'Produkt'} - inSeason</title>
</svelte:head>

<div class="page-container">
  {#if produkt}
    <div class="back-link">
      <a href="/">← Zurück zur Übersicht</a>
    </div>

    <div class="product-header">
      <div class="title-section">
        <h1>{produkt.name}</h1>
        <span class="badge" style="background: {getCategoryColor(produkt.kategorie)}">
          {produkt.kategorie}
        </span>
      </div>
      <p class="subtitle">{produkt.unterkategorie}</p>
    </div>

    <div class="content-grid">
      <!-- Saison-Info -->
      <div class="info-card">
        <h2>🗓️ Saison & Herkunft</h2>
        <div class="info-row">
          <span class="label">Haupternte:</span>
          <span class="value">{produkt.saison.haupternte}</span>
        </div>
        <div class="info-row">
          <span class="label">Verfügbar:</span>
          <span class="value">{getSeasonDisplay(produkt.saison.monate)}</span>
        </div>
        <div class="info-row">
          <span class="label">Typ:</span>
          <span class="value">{produkt.saison.typ}</span>
        </div>
        <div class="info-row">
          <span class="label">Herkunft:</span>
          <span class="value">{produkt.saison.herkunft}</span>
        </div>
      </div>

      <!-- Nährwerte -->
      <div class="info-card">
        <h2>🥗 Nährwerte (pro 100g)</h2>
        <table class="nutrition-table">
          <tbody>
            <tr>
              <td>Energie</td>
              <td><strong>{produkt.naehrwerte.energie_kcal} kcal</strong> ({produkt.naehrwerte.energie_kj} kJ)</td>
            </tr>
            <tr>
              <td>Protein</td>
              <td><strong>{produkt.naehrwerte.protein_g} g</strong></td>
            </tr>
            <tr>
              <td>Fett</td>
              <td><strong>{produkt.naehrwerte.fett_g} g</strong></td>
            </tr>
            <tr>
              <td>Kohlenhydrate</td>
              <td><strong>{produkt.naehrwerte.kohlenhydrate_g} g</strong></td>
            </tr>
            <tr>
              <td>Ballaststoffe</td>
              <td><strong>{produkt.naehrwerte.ballaststoffe_g} g</strong></td>
            </tr>
            <tr>
              <td>Wasser</td>
              <td>{produkt.naehrwerte.wasser_g} g</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mineralstoffe -->
      <div class="info-card">
        <h2>⚡ Mineralstoffe (pro 100g)</h2>
        <table class="nutrition-table">
          <tbody>
            <tr>
              <td>Kalium</td>
              <td><strong>{produkt.mineralstoffe.kalium_mg} mg</strong></td>
            </tr>
            <tr>
              <td>Magnesium</td>
              <td><strong>{produkt.mineralstoffe.magnesium_mg} mg</strong></td>
            </tr>
            <tr>
              <td>Calcium</td>
              <td><strong>{produkt.mineralstoffe.calcium_mg} mg</strong></td>
            </tr>
            <tr>
              <td>Phosphor</td>
              <td><strong>{produkt.mineralstoffe.phosphor_mg} mg</strong></td>
            </tr>
            <tr>
              <td>Eisen</td>
              <td><strong>{produkt.mineralstoffe.eisen_mg} mg</strong></td>
            </tr>
            <tr>
              <td>Natrium</td>
              <td>{produkt.mineralstoffe.natrium_mg} mg</td>
            </tr>
            <tr>
              <td>Zink</td>
              <td>{produkt.mineralstoffe.zink_mg} mg</td>
            </tr>
            {#if produkt.mineralstoffe.jod_ug}
              <tr>
                <td>Jod</td>
                <td>{produkt.mineralstoffe.jod_ug} µg</td>
              </tr>
            {/if}
          </tbody>
        </table>
      </div>

      <!-- Vitamine -->
      <div class="info-card">
        <h2>🍊 Vitamine (pro 100g)</h2>
        <table class="nutrition-table">
          <tbody>
            {#if produkt.vitamine.vitamin_a_ug}
              <tr>
                <td>Vitamin A</td>
                <td><strong>{produkt.vitamine.vitamin_a_ug} µg</strong></td>
              </tr>
            {/if}
            {#if produkt.vitamine.vitamin_c_mg}
              <tr>
                <td>Vitamin C</td>
                <td><strong>{produkt.vitamine.vitamin_c_mg} mg</strong></td>
              </tr>
            {/if}
            {#if produkt.vitamine.vitamin_d_ug}
              <tr>
                <td>Vitamin D</td>
                <td><strong>{produkt.vitamine.vitamin_d_ug} µg</strong></td>
              </tr>
            {/if}
            {#if produkt.vitamine.vitamin_e_mg}
              <tr>
                <td>Vitamin E</td>
                <td><strong>{produkt.vitamine.vitamin_e_mg} mg</strong></td>
              </tr>
            {/if}
            {#if produkt.vitamine.vitamin_k_ug}
              <tr>
                <td>Vitamin K</td>
                <td><strong>{produkt.vitamine.vitamin_k_ug} µg</strong></td>
              </tr>
            {/if}
            <tr>
              <td>Vitamin B1 (Thiamin)</td>
              <td>{produkt.vitamine.vitamin_b1_mg} mg</td>
            </tr>
            <tr>
              <td>Vitamin B2 (Riboflavin)</td>
              <td>{produkt.vitamine.vitamin_b2_mg} mg</td>
            </tr>
            <tr>
              <td>Vitamin B6</td>
              <td>{produkt.vitamine.vitamin_b6_mg} mg</td>
            </tr>
            {#if produkt.vitamine.vitamin_b12_ug}
              <tr>
                <td>Vitamin B12</td>
                <td>{produkt.vitamine.vitamin_b12_ug} µg</td>
              </tr>
            {/if}
            {#if produkt.vitamine.folsaeure_ug}
              <tr>
                <td>Folsäure</td>
                <td>{produkt.vitamine.folsaeure_ug} µg</td>
              </tr>
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  {:else}
    <div class="not-found">
      <h1>404</h1>
      <p>Produkt nicht gefunden</p>
      <a href="/" class="btn-primary">Zurück zur Startseite</a>
    </div>
  {/if}
</div>

<style>
  .page-container {
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  .back-link {
    margin-bottom: 1.5rem;
  }

  .back-link a {
    color: #4CAF50;
    text-decoration: none;
    font-weight: 500;
  }

  .back-link a:hover {
    text-decoration: underline;
  }

  .product-header {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }

  .title-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  h1 {
    margin: 0;
    font-size: 2.5rem;
    color: #333;
  }

  .badge {
    padding: 0.5rem 1rem;
    border-radius: 25px;
    color: white;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .subtitle {
    margin: 0.5rem 0 0 0;
    color: #666;
    font-size: 1.1rem;
  }

  .content-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.5rem;
  }

  .info-card {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }

  .info-card h2 {
    margin: 0 0 1rem 0;
    font-size: 1.25rem;
    color: #2E7D32;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 1px solid #f0f0f0;
    gap: 1rem;
  }

  .info-row:last-child {
    border-bottom: none;
  }

  .label {
    font-weight: 500;
    color: #666;
    flex-shrink: 0;
  }

  .value {
    color: #333;
    text-align: right;
    word-break: break-word;
  }

  .nutrition-table {
    width: 100%;
    border-collapse: collapse;
  }

  .nutrition-table tr {
    border-bottom: 1px solid #f0f0f0;
  }

  .nutrition-table tr:last-child {
    border-bottom: none;
  }

  .nutrition-table td {
    padding: 0.75rem 0;
  }

  .nutrition-table td:first-child {
    color: #666;
    font-weight: 500;
    width: 60%;
  }

  .nutrition-table td:last-child {
    text-align: right;
    color: #333;
    width: 40%;
  }

  .not-found {
    text-align: center;
    padding: 4rem 2rem;
  }

  .not-found h1 {
    font-size: 5rem;
    color: #ccc;
    margin: 0;
  }

  .not-found p {
    font-size: 1.5rem;
    color: #666;
    margin: 1rem 0 2rem 0;
  }

  .btn-primary {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background: #4CAF50;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 500;
  }

  .btn-primary:hover {
    background: #45a049;
  }

  /* Tablet & Desktop */
  @media (min-width: 769px) and (max-width: 1200px) {
    .content-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* Desktop Large */
  @media (min-width: 1201px) {
    .content-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* Mobile */
  @media (max-width: 768px) {
    h1 {
      font-size: 1.75rem;
    }
    
    .content-grid {
      grid-template-columns: 1fr;
    }
    
    .product-header {
      padding: 1.5rem;
    }
    
    .info-card {
      padding: 1.25rem;
    }
  }

  /* Sehr kleine Screens */
  @media (max-width: 480px) {
    h1 {
      font-size: 1.5rem;
    }
    
    .badge {
      font-size: 0.75rem;
      padding: 0.4rem 0.8rem;
    }
  }
</style>
