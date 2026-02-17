<script>
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { getMonthName } from '$lib/utils/seasonHelper.js';
	import rezepte from '$lib/data/rezepte.json';
	import lebensmittel from '$lib/data/lebensmittel.json';

	let rezept = null;
	let selectedVariant = 'standard';
	let activeIngredients = [];
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

		let regionalCount = 0;
		let totalCount = 0;

		zutaten.forEach((zutat) => {
			if (zutat.produktId) {
				const produkt = alleProdukte.find((p) => p.id === zutat.produktId);
				if (produkt && produkt.regional_data) {
					totalCount++;
					if (!produkt.regional_data.is_import) {
						regionalCount++;
					}
				}
			}
		});

		if (totalCount === 0) return 0;
		return Math.round((regionalCount / totalCount) * 10);
	}

	// Helper: CO2 berechnen
	function calculateCO2Total(zutaten, alleProdukte, portionen) {
		let total = 0;

		zutaten.forEach((zutat) => {
			if (zutat.produktId && zutat.menge) {
				const produkt = alleProdukte.find((p) => p.id === zutat.produktId);
				if (produkt && produkt.regional_data && produkt.regional_data.co2_per_kg) {
					// Extrahiere Gramm aus String wie "800g"
					const mengeMatch = zutat.menge.match(/(\d+)/);
					if (mengeMatch) {
						const menge_g = parseInt(mengeMatch[1]);
						const menge_kg = menge_g / 1000;
						total += produkt.regional_data.co2_per_kg * menge_kg;
					}
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

			const mengeMatch = zutat.menge.match(/(\d+)/);
			if (!mengeMatch) return;

			const menge_g = parseInt(mengeMatch[1]);
			const menge_kg = menge_g / 1000;

			gesamt.energie_kcal += (produkt.naehrwerte.energie_kcal || 0) * menge_kg;
			gesamt.protein_g += (produkt.naehrwerte.protein_g || 0) * menge_kg;
			gesamt.fett_g += (produkt.naehrwerte.fett_g || 0) * menge_kg;
			gesamt.kohlenhydrate_g += (produkt.naehrwerte.kohlenhydrate_g || 0) * menge_kg;
			gesamt.ballaststoffe_g += (produkt.naehrwerte.ballaststoffe_g || 0) * menge_kg;
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

	$: if (rezept && selectedVariant) {
		activeIngredients =
			selectedVariant === 'standard'
				? rezept.basis_zutaten
				: [...rezept.basis_zutaten, ...(rezept.varianten_zutaten[selectedVariant] || [])];

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
					<!-- Schnellinfos -->
					<div class="info-card">
						<h3>📊 Übersicht</h3>
						<div class="info-grid">
							<div class="info-item">
								<span class="icon">⏱️</span>
								<div>
									<span class="label">Zeit</span>
									<span class="value">{rezept.zeit} Min</span>
								</div>
							</div>
							<div class="info-item">
								<span class="icon">👥</span>
								<div>
									<span class="label">Portionen</span>
									<span class="value">{rezept.portionen}</span>
								</div>
							</div>
							<div class="info-item">
								<span class="icon">{schwierigkeitEmoji[rezept.schwierigkeit].split(' ')[0]}</span>
								<div>
									<span class="label">Schwierigkeit</span>
									<span class="value">{schwierigkeitEmoji[rezept.schwierigkeit].split(' ')[1]}</span
									>
								</div>
							</div>
							<div class="info-item">
								<span class="icon">📅</span>
								<div>
									<span class="label">Saison</span>
									<span class="value"
										>{rezept.saison.monate
											.map((m) => getMonthName(m))
											.slice(0, 3)
											.join(', ')}</span
									>
								</div>
							</div>
						</div>
					</div>

					<!-- Nährwerte PRO PORTION -->
					{#if naehrwerteProPortion}
						<div class="info-card nutrition">
							<h3>🍽️ Nährwerte pro Portion</h3>
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
					<div class="info-card score">
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
		</section>

		<!-- VARIANTEN -->
		{#if rezept.varianten_zutaten && Object.keys(rezept.varianten_zutaten).length > 0}
			<section class="variants">
				<h2>Variante wählen</h2>
				<div class="variant-buttons">
					<button
						class="variant-btn"
						class:active={selectedVariant === 'standard'}
						on:click={() => (selectedVariant = 'standard')}
					>
						Standard
					</button>
					{#each Object.keys(rezept.varianten_zutaten) as variant (variant)}
						<button
							class="variant-btn"
							class:active={selectedVariant === variant}
							on:click={() => (selectedVariant = variant)}
						>
							{variant}
						</button>
					{/each}
				</div>
			</section>
		{/if}

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
							<span class="ingredient-amount">{zutat.menge}{zutat.einheit}</span>
							<span class="ingredient-name">{zutat.name}</span>
						{/if}
					</li>
				{/each}
			</ul>
		</section>

		<!-- ZUBEREITUNG -->
		<section class="instructions">
			<h2>Zubereitung</h2>
			<ol class="instruction-list">
				{#each rezept.basis_zubereitung as schritt, index (`${index}-${schritt}`)}
					<li class="instruction-step">
						<span class="step-number">{index + 1}</span>
						<p>{schritt}</p>
					</li>
				{/each}
			</ol>
		</section>

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
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-top: 2rem;
	}

	.info-card {
		background: var(--bg-secondary, #ffffff);
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		border: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
	}

	.info-card h3 {
		margin: 0 0 1rem 0;
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--text-primary, #212121);
	}

	.info-grid {
		display: grid;
		gap: 1rem;
	}

	.info-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.info-item .icon {
		font-size: 1.5rem;
	}

	.info-item .label {
		display: block;
		font-size: 0.75rem;
		color: var(--text-secondary, #999999);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		font-weight: 600;
	}

	.info-item .value {
		display: block;
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-primary, #212121);
	}

	/* Nährwerte */
	.nutrition-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.nutrition-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.nutrition-item .label {
		font-size: 0.75rem;
		color: var(--text-secondary, #999999);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		font-weight: 600;
	}

	.nutrition-item .value {
		font-size: 1.3rem;
		font-weight: 700;
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
		font-size: 1.5rem;
		font-weight: 800;
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

	/* VARIANTEN */
	.variants {
		padding: 2rem 1rem;
		border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
	}

	.variants h2 {
		font-size: 1.5rem;
		font-weight: 700;
		margin-bottom: 1rem;
		color: var(--text-primary, #212121);
	}

	.variant-buttons {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.variant-btn {
		padding: 0.75rem 1.5rem;
		border: 2px solid var(--border-color, rgba(0, 0, 0, 0.2));
		border-radius: 25px;
		background: var(--bg-secondary, #ffffff);
		color: var(--text-primary, #212121);
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		text-transform: capitalize;
	}

	.variant-btn:hover {
		border-color: var(--accent, #4caf50);
		transform: translateY(-2px);
	}

	.variant-btn.active {
		background: var(--accent, #4caf50);
		color: white;
		border-color: var(--accent, #4caf50);
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

	.ingredient-link {
		display: flex;
		align-items: center;
		gap: 0.75rem;
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

	:global(.dark-mode) .info-card {
		background: var(--bg-secondary, #2a2a2a);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
	}

	:global(.dark-mode) h1,
	:global(.dark-mode) .info-card h3,
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

	:global(.dark-mode) .variant-btn {
		background: var(--bg-secondary, #2a2a2a);
		color: var(--text-primary, #f5f5f5);
	}

	:global(.dark-mode) .tip-list li {
		background: #3a3a00;
		border-left-color: #fdd835;
	}

	/* RESPONSIVE */
	@media (max-width: 768px) {
		h1 {
			font-size: 1.8rem;
		}

		.description {
			font-size: 1rem;
		}

		.hero-grid {
			grid-template-columns: 1fr;
		}

		.nutrition-grid {
			grid-template-columns: 1fr;
		}

		.score-circle {
			width: 70px;
			height: 70px;
		}

		.score-value {
			font-size: 1.3rem;
		}
	}
</style>
