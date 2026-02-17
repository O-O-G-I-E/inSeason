<script>
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
	import lebensmittelData from '$lib/data/lebensmittel.json';
	import { getSeasonDisplay, getCurrentMonth } from '$lib/utils/seasonHelper.js';
	import { calculateRegionalScore, getScoreColor, getFlagEmoji } from '$lib/utils/regionalHelper';

	$: id = parseInt($page.params.id);
	$: produkt = lebensmittelData.find((p) => p.id === id);

	const currentMonth = getCurrentMonth();
	$: regionalScore = produkt?.regional_data ? calculateRegionalScore(produkt, currentMonth) : null;

	function getCategoryColor(kat) {
		const colors = {
			Gemüse: '#2E7D32',
			Obst: '#F57C00',
			Nüsse: '#5D4037',
			Pilze: '#6D4C41',
			Getreide: '#9E7B3A',
			Wildkräuter: '#558B2F',
			Kräuter: '#388E3C'
		};
		return colors[kat] || '#666';
	}
</script>

<svelte:head>
	<title>{produkt ? produkt.name : 'Produkt'} - inSeason</title>
</svelte:head>

<div class="page-container">
	{#if produkt}
		<div class="back-link">
			<a href={resolve('/')}>← Zurück</a>
		</div>

		<!-- Header: Name + Kategorie + Saison + Nachhaltigkeit -->
		<div class="product-header">
			<div class="title-row">
				<h1>{produkt.name}</h1>
				<span class="badge" style="background: {getCategoryColor(produkt.kategorie)}">
					{produkt.kategorie}
				</span>
			</div>
			{#if produkt.unterkategorie}
				<p class="subtitle">{produkt.unterkategorie}</p>
			{/if}

			<!-- Saison + Nachhaltigkeit Grid -->
			<div class="hero-grid">
				<!-- Saison -->
				<div class="hero-section">
					<div class="season-item">
						<span class="s-icon">📅</span>
						<span class="s-text">{produkt.saison.haupternte}</span>
					</div>
					<div class="season-item">
						<span class="s-icon">🗓️</span>
						<span class="s-text">{getSeasonDisplay(produkt.saison.monate)}</span>
					</div>
					<div class="season-item">
						<span class="s-icon">🏷️</span>
						<span class="s-text">{produkt.saison.typ}</span>
					</div>
				</div>

				<!-- Nachhaltigkeit -->
				{#if produkt.regional_data}
					<div class="hero-section sustainability">
						<div class="sus-row">
							<div
								class="score-mini"
								style="border-color: {getScoreColor(regionalScore)}; color: {getScoreColor(
									regionalScore
								)}"
							>
								{regionalScore}
							</div>
							<span class="sus-icon">{getFlagEmoji(produkt.regional_data.origin_country)}</span>
						</div>
						<div class="sus-row">
							<span class="co2-mini">
								🌍 <strong>{produkt.regional_data.co2_per_kg.toFixed(2)}</strong> kg CO₂
							</span>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- 2-Spalten Grid -->
		<div class="details-grid">
			<!-- Nährwerte Kompakt -->
			<div class="info-card">
				<h2>🥗 Nährwerte</h2>
				<p class="card-subtitle">pro 100g</p>
				<div class="nutrition-grid">
					<div class="nutrition-item highlight">
						<span class="n-value">{produkt.naehrwerte.energie_kcal}</span>
						<span class="n-label">kcal</span>
					</div>
					<div class="nutrition-item highlight">
						<span class="n-value">{produkt.naehrwerte.protein_g}g</span>
						<span class="n-label">Protein</span>
					</div>
					<div class="nutrition-item">
						<span class="n-value">{produkt.naehrwerte.kohlenhydrate_g}g</span>
						<span class="n-label">Kohlenhydrate</span>
					</div>
					<div class="nutrition-item">
						<span class="n-value">{produkt.naehrwerte.fett_g}g</span>
						<span class="n-label">Fett</span>
					</div>
					<div class="nutrition-item">
						<span class="n-value">{produkt.naehrwerte.ballaststoffe_g}g</span>
						<span class="n-label">Ballaststoffe</span>
					</div>
					<div class="nutrition-item">
						<span class="n-value">{produkt.naehrwerte.wasser_g}g</span>
						<span class="n-label">Wasser</span>
					</div>
				</div>
			</div>

			<!-- Mineralstoffe Kompakt -->
			<div class="info-card">
				<h2>⚡ Mineralstoffe</h2>
				<p class="card-subtitle">pro 100g</p>
				<div class="compact-table">
					<div class="ct-row">
						<span class="ct-label">Kalium</span>
						<span class="ct-value">{produkt.mineralstoffe.kalium_mg} mg</span>
					</div>
					<div class="ct-row">
						<span class="ct-label">Magnesium</span>
						<span class="ct-value">{produkt.mineralstoffe.magnesium_mg} mg</span>
					</div>
					<div class="ct-row">
						<span class="ct-label">Calcium</span>
						<span class="ct-value">{produkt.mineralstoffe.calcium_mg} mg</span>
					</div>
					<div class="ct-row">
						<span class="ct-label">Phosphor</span>
						<span class="ct-value">{produkt.mineralstoffe.phosphor_mg} mg</span>
					</div>
					<div class="ct-row">
						<span class="ct-label">Eisen</span>
						<span class="ct-value">{produkt.mineralstoffe.eisen_mg} mg</span>
					</div>
					<div class="ct-row">
						<span class="ct-label">Zink</span>
						<span class="ct-value">{produkt.mineralstoffe.zink_mg} mg</span>
					</div>
				</div>
			</div>

			<!-- Vitamine Kompakt -->
			<div class="info-card">
				<h2>🍊 Vitamine</h2>
				<p class="card-subtitle">pro 100g</p>
				<div class="compact-table">
					{#if produkt.vitamine.vitamin_c_mg}
						<div class="ct-row highlight">
							<span class="ct-label">Vitamin C</span>
							<span class="ct-value">{produkt.vitamine.vitamin_c_mg} mg</span>
						</div>
					{/if}
					{#if produkt.vitamine.vitamin_a_ug}
						<div class="ct-row">
							<span class="ct-label">Vitamin A</span>
							<span class="ct-value">{produkt.vitamine.vitamin_a_ug} µg</span>
						</div>
					{/if}
					{#if produkt.vitamine.vitamin_e_mg}
						<div class="ct-row">
							<span class="ct-label">Vitamin E</span>
							<span class="ct-value">{produkt.vitamine.vitamin_e_mg} mg</span>
						</div>
					{/if}
					{#if produkt.vitamine.vitamin_k_ug}
						<div class="ct-row">
							<span class="ct-label">Vitamin K</span>
							<span class="ct-value">{produkt.vitamine.vitamin_k_ug} µg</span>
						</div>
					{/if}
					<div class="ct-row">
						<span class="ct-label">Vitamin B1</span>
						<span class="ct-value">{produkt.vitamine.vitamin_b1_mg} mg</span>
					</div>
					<div class="ct-row">
						<span class="ct-label">Vitamin B2</span>
						<span class="ct-value">{produkt.vitamine.vitamin_b2_mg} mg</span>
					</div>
					<div class="ct-row">
						<span class="ct-label">Vitamin B6</span>
						<span class="ct-value">{produkt.vitamine.vitamin_b6_mg} mg</span>
					</div>
					{#if produkt.vitamine.folsaeure_ug}
						<div class="ct-row">
							<span class="ct-label">Folsäure</span>
							<span class="ct-value">{produkt.vitamine.folsaeure_ug} µg</span>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{:else}
		<div class="not-found">
			<h1>404</h1>
			<p>Produkt nicht gefunden</p>
			<a href={resolve('/')} class="btn-primary">← Zurück zur Startseite</a>
		</div>
	{/if}
</div>

<style>
	* {
		box-sizing: border-box;
	}

	:global(:root) {
		--bg-primary: #f5f5f5;
		--bg-secondary: #ffffff;
		--bg-tertiary: #fafafa;
		--text-primary: #212121;
		--text-secondary: #666666;
		--text-tertiary: #999999;
		--accent: #4caf50;
		--border-color: rgba(0, 0, 0, 0.08);
		--shadow: rgba(0, 0, 0, 0.08);
	}

	:global(.dark-mode) {
		--bg-primary: #121212;
		--bg-secondary: #1e1e1e;
		--bg-tertiary: #2a2a2a;
		--text-primary: #f5f5f5;
		--text-secondary: #b0b0b0;
		--text-tertiary: #888888;
		--accent: #66bb6a;
		--border-color: rgba(255, 255, 255, 0.1);
		--shadow: rgba(0, 0, 0, 0.3);
	}

	.page-container {
		max-width: 1000px;
		margin: 0 auto;
		padding: 0 0 2rem 0;
	}

	.back-link {
		margin-bottom: 1rem;
		padding: 0 0.5rem;
	}

	.back-link a {
		color: var(--accent);
		text-decoration: none;
		font-weight: 600;
		font-size: 0.9rem;
	}

	.back-link a:hover {
		text-decoration: underline;
	}

	/* Header */
	.product-header {
		background: var(--bg-secondary);
		padding: 1.25rem;
		border-radius: 12px;
		margin-bottom: 1rem;
		box-shadow: 0 2px 6px var(--shadow);
	}

	.title-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-bottom: 0.5rem;
	}

	h1 {
		margin: 0;
		font-size: 1.75rem;
		color: var(--text-primary);
		font-weight: 700;
	}

	.badge {
		display: inline-block;
		padding: 0.4rem 0.8rem;
		border-radius: 16px;
		color: white;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.subtitle {
		margin: 0 0 0.75rem 0;
		color: var(--text-secondary);
		font-size: 0.9rem;
	}

	/* Hero Grid - Saison + Nachhaltigkeit */
	.hero-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--border-color);
	}

	.hero-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.season-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.85rem;
	}

	.s-icon {
		font-size: 1rem;
		width: 24px;
		text-align: center;
	}

	.s-text {
		color: var(--text-secondary);
		font-weight: 500;
	}

	/* Sustainability Mini */
	.hero-section.sustainability {
		align-items: flex-end;
		justify-content: center;
	}

	.sus-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		justify-content: flex-end;
	}

	.score-mini {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		border: 3px solid;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25rem;
		font-weight: 700;
		background: var(--bg-tertiary);
	}

	.sus-icon {
		font-size: 1.75rem;
	}

	.co2-mini {
		font-size: 0.85rem;
		color: var(--text-secondary);
		padding: 0.4rem 0.8rem;
		background: var(--bg-tertiary);
		border-radius: 8px;
	}

	.co2-mini strong {
		font-size: 1rem;
		color: var(--text-primary);
		font-weight: 700;
	}

	/* 2-Spalten Grid IMMER */
	.details-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.5rem;
	}

	/* Info Cards */
	.info-card {
		background: var(--bg-secondary);
		padding: 1rem;
		border-radius: 12px;
		box-shadow: 0 2px 6px var(--shadow);
	}

	.info-card h2 {
		margin: 0 0 0.75rem 0;
		font-size: 0.95rem;
		color: var(--accent);
		font-weight: 600;
	}

	.card-subtitle {
		margin: -0.5rem 0 0.75rem 0;
		font-size: 0.75rem;
		color: var(--text-tertiary);
	}

	/* Nutrition Grid - 2×3 */
	.nutrition-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
	}

	.nutrition-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.75rem;
		background: var(--bg-tertiary);
		border-radius: 8px;
		border: 2px solid var(--border-color);
	}

	.nutrition-item.highlight {
		border-color: var(--accent);
		background: rgba(76, 175, 80, 0.05);
	}

	.n-value {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--text-primary);
		line-height: 1.2;
	}

	.n-label {
		font-size: 0.75rem;
		color: var(--text-secondary);
		margin-top: 0.25rem;
	}

	/* Compact Table */
	.compact-table {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.ct-row {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem;
		background: var(--bg-tertiary);
		border-radius: 6px;
		font-size: 0.85rem;
	}

	.ct-row.highlight {
		background: rgba(76, 175, 80, 0.1);
		border: 1px solid rgba(76, 175, 80, 0.3);
	}

	.ct-label {
		color: var(--text-secondary);
		font-weight: 500;
	}

	.ct-value {
		color: var(--text-primary);
		font-weight: 600;
	}

	/* Not Found */
	.not-found {
		text-align: center;
		padding: 4rem 2rem;
	}

	.not-found h1 {
		font-size: 4rem;
		color: var(--text-tertiary);
		margin: 0;
	}

	.not-found p {
		font-size: 1.25rem;
		color: var(--text-secondary);
		margin: 1rem 0 2rem 0;
	}

	.btn-primary {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: var(--accent);
		color: white;
		text-decoration: none;
		border-radius: 8px;
		font-weight: 600;
	}

	.btn-primary:hover {
		opacity: 0.9;
	}

	/* Tablet & Desktop */
	@media (min-width: 769px) {
		h1 {
			font-size: 2.25rem;
		}

		.hero-grid {
			gap: 2rem;
		}

		.score-mini {
			width: 54px;
			height: 54px;
			font-size: 1.5rem;
		}

		.details-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 1rem;
		}

		.product-header {
			padding: 1.75rem;
		}

		.info-card {
			padding: 1.5rem;
		}
	}

	/* Sehr kleine Screens */
	@media (max-width: 400px) {
		h1 {
			font-size: 1.5rem;
		}

		.hero-grid {
			grid-template-columns: 1fr;
			gap: 0.75rem;
		}

		.hero-section.sustainability {
			align-items: flex-start;
		}

		.sus-row {
			justify-content: flex-start;
		}

		.details-grid {
			gap: 0.4rem;
		}

		.info-card {
			padding: 0.875rem;
		}
	}
</style>
