<script>
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { getSeasonDisplay } from '$lib/utils/seasonHelper.js';
	import rezepte from '$lib/data/rezepte.json';
	import lebensmittel from '$lib/data/lebensmittel.json';

	let rezept = null;
	let activeIngredients = [];
	let activeInstructions = [];
	let regionalScore = 0;
	let totalCO2 = 0;
	let naehrwerteProPortion = null;

	const schwierigkeitEmoji = {
		leicht: '👍 Leicht',
		mittel: '👨‍🍳 Mittel',
		schwer: '⭐ Anspruchsvoll'
	};

	function getCategoryColor(kategorie) {
		const colors = {
			Hauptgericht: '#4CAF50',
			Suppe: '#FF9800',
			Salat: '#8BC34A',
			Aufstrich: '#9C27B0',
			Dessert: '#E91E63'
		};
		return colors[kategorie] || '#757575';
	}

	function getScoreColor(score) {
		if (score >= 9) return '#4CAF50';
		if (score >= 7) return '#FF9800';
		return '#f44336';
	}

	// Helper: Regional Score berechnen
	function calculateRegionalScore(zutaten, alleProdukte) {
		if (!zutaten || zutaten.length === 0) return 0;

		let regionalWeight = 0;
		let totalWeight = 0;

		zutaten.forEach((zutat) => {
			if (zutat.produktId) {
				const produkt = alleProdukte.find((p) => p.id === zutat.produktId);
				if (produkt && produkt.regional_data) {
					const weight = parseAmountToGrams(zutat.menge) || 100;
					totalWeight += weight;
					if (!produkt.regional_data.is_import) {
						regionalWeight += weight;
					}
				}
			}
		});

		if (totalWeight === 0) return 0;
		return Math.round((regionalWeight / totalWeight) * 10);
	}

	// Helper: CO2 berechnen
	function calculateCO2Total(zutaten, alleProdukte, portionen) {
		let total = 0;

		zutaten.forEach((zutat) => {
			if (zutat.produktId && zutat.menge) {
				const produkt = alleProdukte.find((p) => p.id === zutat.produktId);
				if (produkt && produkt.regional_data && produkt.regional_data.co2_per_kg) {
					const menge_g = parseAmountToGrams(zutat.menge);
					if (!menge_g) return;
					const menge_kg = menge_g / 1000;
					total += produkt.regional_data.co2_per_kg * menge_kg;
				}
			}
		});

		return portionen > 0 ? total / portionen : 0;
	}

	// Nährwerte berechnen
	function berechneNaehrwerte() {
		if (!rezept || !activeIngredients.length) return null;

		const gesamt = {
			energie_kcal: 0,
			protein_g: 0,
			fett_g: 0,
			kohlenhydrate_g: 0,
			ballaststoffe_g: 0
		};

		activeIngredients.forEach((zutat) => {
			if (!zutat.produktId || !zutat.menge) return;

			const produkt = lebensmittel.find((p) => p.id === zutat.produktId);
			if (!produkt || !produkt.naehrwerte) return;

			const menge_g = parseAmountToGrams(zutat.menge);
			if (!menge_g) return;
			const menge_100g = menge_g / 100;

			gesamt.energie_kcal += (produkt.naehrwerte.energie_kcal || 0) * menge_100g;
			gesamt.protein_g += (produkt.naehrwerte.protein_g || 0) * menge_100g;
			gesamt.fett_g += (produkt.naehrwerte.fett_g || 0) * menge_100g;
			gesamt.kohlenhydrate_g += (produkt.naehrwerte.kohlenhydrate_g || 0) * menge_100g;
			gesamt.ballaststoffe_g += (produkt.naehrwerte.ballaststoffe_g || 0) * menge_100g;
		});

		const portionen = rezept.portionen || 4;
		return {
			energie_kcal: Math.round(gesamt.energie_kcal / portionen),
			protein_g: Math.round((gesamt.protein_g / portionen) * 10) / 10,
			fett_g: Math.round((gesamt.fett_g / portionen) * 10) / 10,
			kohlenhydrate_g: Math.round((gesamt.kohlenhydrate_g / portionen) * 10) / 10,
			ballaststoffe_g: Math.round((gesamt.ballaststoffe_g / portionen) * 10) / 10
		};
	}

	function parseAmountToGrams(menge) {
		if (!menge) return null;
		const text = String(menge).toLowerCase();
		const match = text.match(/(\d+(?:[.,]\d+)?)/);
		if (!match) return null;
		const value = parseFloat(match[1].replace(',', '.'));
		if (Number.isNaN(value)) return null;

		if (text.includes('kg')) return value * 1000;
		if (text.includes('mg')) return value / 1000;
		if (text.includes('ml')) return value;
		if (text.includes('cl')) return value * 10;
		if (text.includes('dl')) return value * 100;
		if (text.includes('el')) return value * 15;
		if (text.includes('tl')) return value * 5;
		if (text.includes('l')) return value * 1000;
		if (text.includes('g')) return value;

		if (text.includes('zehe')) return value * 5;
		if (text.includes('stange')) return value * 150;
		if (text.includes('bund')) return value * 30;
		if (text.includes('schote')) return value * 120;
		if (text.includes('knolle')) return value * 300;
		if (text.includes('prise')) return value * 0.5;
		if (text.includes('stück') || text.includes('stueck') || text.includes('stuck')) {
			return value * 100;
		}

		if (value <= 20) return value * 100;
		return value;
	}

	$: if (rezept) {
		// Kombiniere basis_zutaten mit vegan variante
		activeIngredients = [...rezept.basis_zutaten, ...(rezept.varianten_zutaten?.vegan || [])];

		// Kombiniere basis_zubereitung mit vegan variante
		activeInstructions = [
			...(rezept.basis_zubereitung || []),
			...(rezept.varianten_zubereitung?.vegan || [])
		];

		totalCO2 = calculateCO2Total(activeIngredients, lebensmittel, rezept.portionen);
		regionalScore = calculateRegionalScore(activeIngredients, lebensmittel);
		naehrwerteProPortion = berechneNaehrwerte();
	}

	onMount(() => {
		const id = parseInt($page.params.id);
		rezept = rezepte.find((r) => r.id === id);
	});
</script>

<svelte:head>
	<title>{rezept ? rezept.name : 'Rezept'} - inSeason Rezepte</title>
</svelte:head>

{#if !rezept}
	<div class="loading">
		<p>Rezept wird geladen...</p>
	</div>
{:else}
	<div class="container">
		<!-- HERO SECTION mit Nährwerten -->
		<section class="hero">
			<div class="hero-content">
				<div class="hero-header">
					<span class="badge" style="background: {getCategoryColor(rezept.kategorie)}">
						{rezept.kategorie}
					</span>
					<h1>{rezept.name}</h1>
					<p class="description">{rezept.beschreibung}</p>
				</div>

				<div class="hero-grid">
					<div class="info-card-combined">
						<!-- Schnellinfos -->
						<div class="info-section">
							<h3>📊 Übersicht</h3>
							<div class="info-grid">
								<div class="info-item">
									<span class="icon">⏱️</span>
									<span class="value">{rezept.zeit} Min</span>
								</div>
								<div class="info-item">
									<span class="icon">👥</span>
									<span class="value">{rezept.portionen}</span>
								</div>
								<div class="info-item">
									<span class="icon">{schwierigkeitEmoji[rezept.schwierigkeit].split(' ')[0]}</span>
									<span class="value">{schwierigkeitEmoji[rezept.schwierigkeit].split(' ')[1]}</span
									>
								</div>
								<div class="info-item">
									<span class="icon">📅</span>
									<span class="value">{getSeasonDisplay(rezept.saison.monate)}</span>
								</div>
							</div>
						</div>

						<!-- Nährwerte PRO PORTION -->
						{#if naehrwerteProPortion}
							<div class="info-section">
								<h3>🍽️ Nährwerte</h3>
								<p class="section-note">pro Portion</p>
								<div class="nutrition-grid">
									<div class="nutrition-item">
										<span class="label">Kalorien</span>
										<span class="value">{naehrwerteProPortion.energie_kcal} kcal</span>
									</div>
									<div class="nutrition-item">
										<span class="label">Eiweiß</span>
										<span class="value">{naehrwerteProPortion.protein_g}g</span>
									</div>
									<div class="nutrition-item">
										<span class="label">Fett</span>
										<span class="value">{naehrwerteProPortion.fett_g}g</span>
									</div>
									<div class="nutrition-item">
										<span class="label">Kohlenhydrate</span>
										<span class="value">{naehrwerteProPortion.kohlenhydrate_g}g</span>
									</div>
									<div class="nutrition-item">
										<span class="label">Ballaststoffe</span>
										<span class="value">{naehrwerteProPortion.ballaststoffe_g}g</span>
									</div>
								</div>
							</div>
						{/if}

						<!-- Nachhaltigkeits-Score -->
						<div class="info-section score-section">
							<h3>🌱 Nachhaltigkeit</h3>
							<div class="score-display">
								<div class="score-circle" style="border-color: {getScoreColor(regionalScore)}">
									<span class="score-value">{regionalScore}/10</span>
								</div>
								<div class="score-details">
									<p class="score-label">Regional-Score</p>
									<p class="co2-value">💨 {totalCO2.toFixed(2)} kg CO₂/Portion</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<div class="content-grid">
			<!-- ZUTATEN -->
			<section class="ingredients">
				<h2>Zutaten</h2>
				<ul class="ingredient-list">
					{#each activeIngredients as zutat, index (`${zutat.name}-${zutat.menge}-${index}`)}
						<li class="ingredient-item">
							{#if zutat.produktId}
								<a
									href={resolve('/produkt/[id]', { id: `${zutat.produktId}` })}
									class="ingredient-link"
								>
									<span class="ingredient-amount">{zutat.menge}{zutat.einheit}</span>
									<span class="ingredient-name">{zutat.name}</span>
									<span class="link-icon">→</span>
								</a>
							{:else}
								<div class="ingredient-content">
									<span class="ingredient-amount">{zutat.menge}{zutat.einheit}</span>
									<span class="ingredient-name">{zutat.name}</span>
								</div>
							{/if}
						</li>
					{/each}
				</ul>
			</section>

			<!-- ZUBEREITUNG -->
			<section class="instructions">
				<h2>Zubereitung</h2>
				<ol class="instruction-list">
					{#each activeInstructions as schritt, index (`${index}-${schritt}`)}
						<li class="instruction-step">
							<span class="step-number">{index + 1}</span>
							<p>{schritt}</p>
						</li>
					{/each}
				</ol>
			</section>
		</div>

		<!-- TIPPS -->
		{#if rezept.tipps && rezept.tipps.length > 0}
			<section class="tips">
				<h2>💡 Tipps</h2>
				<ul class="tip-list">
					{#each rezept.tipps as tipp (tipp)}
						<li>{tipp}</li>
					{/each}
				</ul>
			</section>
		{/if}
	</div>
{/if}

<style>
	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
		font-size: 1.2rem;
		color: var(--text-secondary, #666666);
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0;
	}

	/* HERO SECTION */
	.hero {
		background: linear-gradient(
			135deg,
			var(--bg-primary, #ffffff) 0%,
			var(--bg-secondary, #f5f5f5) 100%
		);
		border-radius: 12px;
		margin: 1rem;
		overflow: hidden;
		padding: 2rem 0;
		border-bottom: 2px solid var(--border-color, rgba(0, 0, 0, 0.06));
	}

	.hero-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.hero-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.badge {
		display: inline-block;
		padding: 0.4rem 0.8rem;
		border-radius: 15px;
		color: white;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 1rem;
	}

	h1 {
		font-size: 2.5rem;
		font-weight: 800;
		color: var(--text-primary, #212121);
		margin: 0.5rem 0;
		line-height: 1.2;
	}

	.description {
		font-size: 1.1rem;
		color: var(--text-secondary, #666666);
		max-width: 700px;
		margin: 1rem auto 0;
		line-height: 1.6;
	}

	.hero-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
		margin-top: 2rem;
	}

	.info-card-combined {
		background: var(--bg-secondary, #ffffff);
		border-radius: 12px;
		padding: 0;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		border: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.info-section {
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.info-section:not(:last-child) {
		border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
	}

	.info-section h3 {
		display: none;
	}

	.section-note {
		margin: 0 0 0.75rem 0;
		font-size: 0.7rem;
		color: var(--text-secondary, #999999);
		text-transform: uppercase;
		letter-spacing: 0.3px;
		font-weight: 600;
	}

	.info-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		align-items: center;
		justify-content: center;
	}

	.info-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: 0 1 auto;
	}

	.info-item .icon {
		font-size: 1.2rem;
	}

	.info-item .value {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--text-primary, #212121);
	}

	/* Nährwerte */
	.nutrition-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		align-items: center;
		justify-content: center;
	}

	.nutrition-item {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		flex: 0 1 auto;
	}

	.nutrition-item .label {
		font-size: 0.75rem;
		color: var(--text-secondary, #999999);
		text-transform: uppercase;
		letter-spacing: 0.3px;
		font-weight: 600;
	}

	.nutrition-item .value {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--accent, #4caf50);
	}

	/* Score */
	.score-display {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.score-circle {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		border: 4px solid;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.score-value {
		font-size: 1.2rem;
		font-weight: 800;
	}
	.content-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 2rem;
		padding: 2rem 1rem;
	}

	.content-grid .ingredients,
	.content-grid .instructions {
		padding-top: 0;
		padding-bottom: 0;
		border-bottom: none;
	}

	.content-grid .ingredients {
		padding-right: 4rem;
	}

	.content-grid .instructions {
		border-left: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
		padding-left: 4rem;
	}

	.score-details {
		flex: 1;
	}

	.score-label {
		margin: 0 0 0.5rem 0;
		font-size: 0.85rem;
		color: var(--text-secondary, #666666);
		font-weight: 600;
	}

	.co2-value {
		margin: 0;
		font-size: 1rem;
		font-weight: 700;
		color: var(--text-primary, #212121);
	}

	.score-section .score-display {
		flex-direction: row;
		gap: 1.5rem;
		align-items: center;
	}

	.score-section .score-circle {
		width: 70px;
		height: 70px;
		flex-shrink: 0;
	}

	/* ZUTATEN */
	.ingredients {
		padding: 2rem 1rem;
		border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
	}

	.ingredients h2 {
		font-size: 1.5rem;
		font-weight: 700;
		margin-bottom: 1.5rem;
		color: var(--text-primary, #212121);
	}

	.ingredient-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 0.75rem;
	}

	.ingredient-item {
		padding: 0.75rem;
		background: var(--bg-secondary, #f9f9f9);
		border-radius: 8px;
		border-left: 3px solid var(--accent, #4caf50);
	}

	.ingredient-link,
	.ingredient-content {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.ingredient-link {
		text-decoration: none;
		color: inherit;
		transition: all 0.2s ease;
	}

	.ingredient-link:hover {
		color: var(--accent, #4caf50);
	}

	.ingredient-link:hover .link-icon {
		transform: translateX(4px);
	}

	.ingredient-amount {
		font-weight: 700;
		color: var(--accent, #4caf50);
		min-width: 80px;
	}

	.ingredient-name {
		flex: 1;
		font-weight: 500;
	}

	.link-icon {
		color: var(--accent, #4caf50);
		font-weight: 700;
		transition: transform 0.2s ease;
	}

	/* ZUBEREITUNG */
	.instructions {
		padding: 2rem 1rem;
		border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
	}

	.instructions h2 {
		font-size: 1.5rem;
		font-weight: 700;
		margin-bottom: 1.5rem;
		color: var(--text-primary, #212121);
	}

	.instruction-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 1.5rem;
	}

	.instruction-step {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
	}

	.step-number {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: var(--accent, #4caf50);
		color: white;
		border-radius: 50%;
		font-weight: 700;
		flex-shrink: 0;
	}

	.instruction-step p {
		margin: 0;
		line-height: 1.6;
		font-size: 1rem;
		color: var(--text-primary, #212121);
	}

	/* TIPPS */
	.tips {
		padding: 2rem 1rem;
	}

	.tips h2 {
		font-size: 1.5rem;
		font-weight: 700;
		margin-bottom: 1rem;
		color: var(--text-primary, #212121);
	}

	.tip-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 0.75rem;
	}

	.tip-list li {
		padding: 1rem;
		background: #fff9c4;
		border-left: 3px solid #fdd835;
		border-radius: 8px;
		font-size: 0.95rem;
		line-height: 1.5;
	}

	/* DARK MODE */
	:global(.dark-mode) .hero {
		background: linear-gradient(
			135deg,
			var(--bg-primary, #1a1a1a) 0%,
			var(--bg-secondary, #252525) 100%
		);
	}

	:global(.dark-mode) .info-card-combined {
		background: var(--bg-secondary, #2a2a2a);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
	}

	:global(.dark-mode) h1,
	:global(.dark-mode) .info-section h3,
	:global(.dark-mode) h2 {
		color: var(--text-primary, #f5f5f5);
	}

	:global(.dark-mode) .description,
	:global(.dark-mode) .score-label {
		color: var(--text-secondary, #b0b0b0);
	}

	:global(.dark-mode) .ingredient-item {
		background: var(--bg-secondary, #2a2a2a);
	}

	:global(.dark-mode) .tip-list li {
		background: #3a3a00;
		border-left-color: #fdd835;
	}

	/* RESPONSIVE */
	@media (max-width: 768px) {
		.content-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
			padding: 0;
			border-bottom: none;
		}

		.content-grid .ingredients,
		.content-grid .instructions {
			padding: 2rem 1rem;
			border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
		}

		.content-grid .instructions {
			border-left: none;
			padding-left: 1rem;
			border-bottom: none;
		}
		h1 {
			font-size: 1.8rem;
		}

		.description {
			font-size: 1rem;
		}

		.info-section {
			padding: 1rem;
		}

		.info-grid {
			gap: 0.8rem;
		}

		.info-item .icon {
			font-size: 1rem;
		}

		.info-item .value {
			font-size: 0.8rem;
		}

		.nutrition-grid {
			gap: 0.8rem;
		}

		.nutrition-item .label {
			font-size: 0.6rem;
		}

		.nutrition-item .value {
			font-size: 0.8rem;
		}

		.score-circle {
			width: 60px;
			height: 60px;
		}

		.score-value {
			font-size: 1.1rem;
		}
	}
</style>
