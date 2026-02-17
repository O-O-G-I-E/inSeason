<script>
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
	import lebensmittelData from '$lib/data/lebensmittel.json';
	import { getSeasonDisplay, getCurrentMonth } from '$lib/utils/seasonHelper.js';
	import { calculateRegionalScore, getScoreColor, getFlagEmoji } from '$lib/utils/regionalHelper';

	$: id = parseInt($page.params.id);
	$: produkt = lebensmittelData.find((p) => p.id === id);
	$: saisonMonate = produkt?.saison?.monate || [];
	$: naehrwerte = produkt?.naehrwerte || {};
	$: mineralstoffe = produkt?.mineralstoffe || {};
	$: vitamine = produkt?.vitamine || {};

	const currentMonth = getCurrentMonth();
	$: regionalScore = produkt?.regional_data ? calculateRegionalScore(produkt, currentMonth) : null;
	$: regionalScoreDisplay = regionalScore === null ? null : Math.round(regionalScore / 10);

	function displayValue(value, unit = '') {
		if (value === undefined || value === null || value === '') return '-';
		return `${value}${unit}`;
	}

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

		<section class="hero">
			<div class="hero-content">
				<div class="hero-header">
					<span class="badge" style="background: {getCategoryColor(produkt.kategorie)}">
						{produkt.kategorie}
					</span>
					<h1>{produkt.name}</h1>
					{#if produkt.unterkategorie}
						<p class="description">{produkt.unterkategorie}</p>
					{/if}
				</div>

				<div class="hero-grid">
					<div class="info-card-combined">
						<div class="info-section">
							<div class="info-grid">
								<div class="info-item">
									<span class="icon">📅</span>
									<span class="value"
										>{saisonMonate.length
											? getSeasonDisplay(saisonMonate)
											: 'Keine Saisondaten'}</span
									>
								</div>
								<div class="info-item">
									<span class="icon">🌱</span>
									<span class="value">{produkt.saison?.haupternte || '-'}</span>
								</div>
								<div class="info-item">
									<span class="icon">🏷️</span>
									<span class="value">{produkt.saison?.typ || '-'}</span>
								</div>
							</div>
						</div>

						<div class="info-section nutrient-section">
							<p class="section-note">pro 100 g</p>
							<div class="nutrient-columns">
								<div class="nutrient-column">
									<h4 class="nutrient-heading">Nährwerte</h4>
									<div class="nutrition-grid">
										<div class="nutrition-item">
											<span class="label">Kalorien</span>
											<span class="value">{displayValue(naehrwerte.energie_kcal, ' kcal')}</span>
										</div>
										<div class="nutrition-item">
											<span class="label">Protein</span>
											<span class="value">{displayValue(naehrwerte.protein_g, 'g')}</span>
										</div>
										<div class="nutrition-item">
											<span class="label">Fett</span>
											<span class="value">{displayValue(naehrwerte.fett_g, 'g')}</span>
										</div>
										<div class="nutrition-item">
											<span class="label">Kohlenhydrate</span>
											<span class="value">{displayValue(naehrwerte.kohlenhydrate_g, 'g')}</span>
										</div>
										<div class="nutrition-item">
											<span class="label">Ballaststoffe</span>
											<span class="value">{displayValue(naehrwerte.ballaststoffe_g, 'g')}</span>
										</div>
									</div>
								</div>
								<div class="nutrient-column">
									<h4 class="nutrient-heading">Mineralstoffe</h4>
									<div class="nutrition-grid">
										<div class="nutrition-item">
											<span class="label">Kalium</span>
											<span class="value">{displayValue(mineralstoffe.kalium_mg, ' mg')}</span>
										</div>
										<div class="nutrition-item">
											<span class="label">Magnesium</span>
											<span class="value">{displayValue(mineralstoffe.magnesium_mg, ' mg')}</span>
										</div>
										<div class="nutrition-item">
											<span class="label">Calcium</span>
											<span class="value">{displayValue(mineralstoffe.calcium_mg, ' mg')}</span>
										</div>
										<div class="nutrition-item">
											<span class="label">Phosphor</span>
											<span class="value">{displayValue(mineralstoffe.phosphor_mg, ' mg')}</span>
										</div>
										<div class="nutrition-item">
											<span class="label">Eisen</span>
											<span class="value">{displayValue(mineralstoffe.eisen_mg, ' mg')}</span>
										</div>
										<div class="nutrition-item">
											<span class="label">Zink</span>
											<span class="value">{displayValue(mineralstoffe.zink_mg, ' mg')}</span>
										</div>
									</div>
								</div>
								<div class="nutrient-column">
									<h4 class="nutrient-heading">Vitamine</h4>
									<div class="nutrition-grid">
										{#if vitamine.vitamin_c_mg}
											<div class="nutrition-item">
												<span class="label">Vitamin C</span>
												<span class="value">{vitamine.vitamin_c_mg} mg</span>
											</div>
										{/if}
										{#if vitamine.vitamin_a_ug}
											<div class="nutrition-item">
												<span class="label">Vitamin A</span>
												<span class="value">{vitamine.vitamin_a_ug} µg</span>
											</div>
										{/if}
										{#if vitamine.vitamin_e_mg}
											<div class="nutrition-item">
												<span class="label">Vitamin E</span>
												<span class="value">{vitamine.vitamin_e_mg} mg</span>
											</div>
										{/if}
										{#if vitamine.vitamin_k_ug}
											<div class="nutrition-item">
												<span class="label">Vitamin K</span>
												<span class="value">{vitamine.vitamin_k_ug} µg</span>
											</div>
										{/if}
										<div class="nutrition-item">
											<span class="label">Vitamin B1</span>
											<span class="value">{displayValue(vitamine.vitamin_b1_mg, ' mg')}</span>
										</div>
										<div class="nutrition-item">
											<span class="label">Vitamin B2</span>
											<span class="value">{displayValue(vitamine.vitamin_b2_mg, ' mg')}</span>
										</div>
										<div class="nutrition-item">
											<span class="label">Vitamin B6</span>
											<span class="value">{displayValue(vitamine.vitamin_b6_mg, ' mg')}</span>
										</div>
										{#if vitamine.folsaeure_ug}
											<div class="nutrition-item">
												<span class="label">Folsaeure</span>
												<span class="value">{vitamine.folsaeure_ug} µg</span>
											</div>
										{/if}
									</div>
								</div>
							</div>
						</div>

						{#if produkt.regional_data}
							<div class="info-section score-section">
								<div class="score-display">
									<div class="score-circle" style="border-color: {getScoreColor(regionalScore)}">
										<span class="score-value">{regionalScoreDisplay}/10</span>
									</div>
									<div class="score-details">
										<p class="score-label">
											Regional-Score {getFlagEmoji(produkt.regional_data.origin_country)}
										</p>
										<p class="co2-value">
											💨 {produkt.regional_data.co2_per_kg.toFixed(2)} kg CO₂/kg
										</p>
									</div>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</section>
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
		max-width: 1200px;
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

	/* HERO */
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

	.nutrient-section {
		align-items: stretch;
	}

	.section-note {
		margin: 0 0 0.75rem 0;
		font-size: 0.7rem;
		color: var(--text-secondary, #999999);
		text-transform: uppercase;
		letter-spacing: 0.3px;
		font-weight: 600;
		text-align: center;
		align-self: center;
	}

	.nutrient-columns {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0;
		width: 100%;
	}

	.nutrient-column {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.75rem;
		text-align: left;
		padding: 0 1.5rem;
	}

	.nutrient-column:not(:last-child) {
		border-right: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
	}

	.nutrient-heading {
		margin: 0;
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--text-primary, #212121);
		text-transform: uppercase;
		letter-spacing: 0.3px;
	}

	.info-section:not(:last-child) {
		border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
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

	.nutrition-grid {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: stretch;
		width: 100%;
	}

	.nutrition-item {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.35rem;
		width: 100%;
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

	/* RESPONSIVE */
	@media (max-width: 768px) {
		.nutrient-columns {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.nutrient-column {
			padding: 0;
		}

		.nutrient-column:not(:last-child) {
			border-right: none;
			border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
			padding-bottom: 1rem;
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

		.nutrient-columns {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.nutrient-heading {
			font-size: 0.75rem;
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
