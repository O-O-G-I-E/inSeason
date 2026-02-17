<script>
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
	import rezepteData from '$lib/data/rezepte.json';
	import RezeptCard from '$lib/components/RezeptCard.svelte';
	import {
		getAllRezeptCategories,
		getCurrentMonth,
		getShortMonthName
	} from '$lib/utils/seasonHelper.js';

	const currentMonth = getCurrentMonth();
	const kategorien = getAllRezeptCategories(rezepteData);
	const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1);

	// Filter aus URL laden
	let selectedMonth = 0;
	let selectedCategory = 'Alle';
	let sortBy = 'name';

	// URL-Params in lokale Variablen laden
	$: {
		const monthParam = $page.url.searchParams.get('month');
		selectedMonth = monthParam ? parseInt(monthParam) : 0;
		selectedCategory = $page.url.searchParams.get('cat') || 'Alle';
		sortBy = $page.url.searchParams.get('sort') || 'name';
	}

	const sortOptions = [
		{ value: 'name', label: 'Name (A-Z)' },
		{ value: 'zeit_asc', label: '⏱️ Zeit ↑' },
		{ value: 'zeit_desc', label: '⏱️ Zeit ↓' },
		{ value: 'portionen_desc', label: '👥 Portionen ↓' }
	];

	// Filter in URL speichern
	function updateFilters() {
		const params = [];
		if (selectedMonth !== 0) params.push(`month=${encodeURIComponent(selectedMonth.toString())}`);
		if (selectedCategory !== 'Alle') params.push(`cat=${encodeURIComponent(selectedCategory)}`);
		if (sortBy !== 'name') params.push(`sort=${encodeURIComponent(sortBy)}`);

		const target = resolve('/rezepte') + (params.length > 0 ? `?${params.join('&')}` : '');
		history.replaceState(history.state, '', target);
	}

	$: filteredRezepte = (() => {
		let results = rezepteData.filter((r) => r.varianten.includes('vegan'));

		// Monatsfilter
		if (selectedMonth !== 0) {
			results = results.filter((r) => r.saison.monate.includes(selectedMonth));
		}

		// Kategoriefilter
		if (selectedCategory !== 'Alle') {
			results = results.filter((r) => r.kategorie === selectedCategory);
		}

		// Sortierung
		results = [...results].sort((a, b) => {
			switch (sortBy) {
				case 'name':
					return a.name.localeCompare(b.name);
				case 'zeit_asc':
					return a.zeit - b.zeit;
				case 'zeit_desc':
					return b.zeit - a.zeit;
				case 'portionen_desc':
					return b.portionen - a.portionen;
				default:
					return 0;
			}
		});

		return results;
	})();

	function resetFilters() {
		history.replaceState(history.state, '', resolve('/rezepte'));
	}
</script>

<svelte:head>
	<title>Saisonale Rezepte - inSeason</title>
</svelte:head>

<!-- Hero -->
<div class="hero">
	<h1>🥗 Saisonale Rezepte</h1>
	<p class="count">{filteredRezepte.length} Rezepte</p>
</div>

<!-- Schnellwahl Monate -->
<div class="month-section">
	<h2 class="section-title">Schnellwahl</h2>
	<div class="months-grid">
		<button
			class="month-btn"
			class:current={selectedMonth === 0}
			on:click={() => {
				selectedMonth = 0;
				updateFilters();
			}}
		>
			Alle
		</button>
		{#each monthOptions as month (month)}
			<button
				class="month-btn"
				class:current={selectedMonth === month}
				class:today={month === currentMonth && selectedMonth !== month}
				on:click={() => {
					selectedMonth = month;
					updateFilters();
				}}
			>
				{getShortMonthName(month)}
			</button>
		{/each}
	</div>
</div>

<!-- Kategorien -->
<div class="categories-section">
	<h2 class="section-title">Kategorien</h2>
	<div class="categories-scroll">
		{#each kategorien as cat (cat)}
			<button
				class="cat-pill"
				class:active={selectedCategory === cat}
				on:click={() => {
					selectedCategory = cat;
					updateFilters();
				}}
			>
				{cat}
			</button>
		{/each}
	</div>
</div>

<!-- Sortierung -->
<details class="advanced-filters">
	<summary class="filter-toggle">⚙️ Sortierung</summary>

	<div class="filter-content">
		<div class="filter-group">
			<label for="sort-select">Sortierung:</label>
			<select
				id="sort-select"
				value={sortBy}
				on:change={(e) => {
					sortBy = e.target.value;
					updateFilters();
				}}
				class="select"
			>
				{#each sortOptions as o (o.value)}
					<option value={o.value}>{o.label}</option>
				{/each}
			</select>
		</div>

		{#if selectedMonth !== 0 || selectedCategory !== 'Alle' || sortBy !== 'name'}
			<button class="reset-btn" on:click={resetFilters}>✕ Zurücksetzen</button>
		{/if}
	</div>
</details>

<!-- Rezept Grid -->
<div class="products-grid">
	{#each filteredRezepte as rezept (rezept.id)}
		<RezeptCard {rezept} />
	{:else}
		<p class="no-results">Keine Rezepte gefunden 😔</p>
	{/each}
</div>

<style>
	* {
		box-sizing: border-box;
	}

	:global(body) {
		overflow-x: hidden;
		padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom)
			env(safe-area-inset-left);
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
		--shadow-hover: rgba(0, 0, 0, 0.12);
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
		--shadow-hover: rgba(0, 0, 0, 0.4);
	}

	.hero {
		text-align: center;
		padding: 1rem;
		background: var(--bg-secondary);
		border-radius: 12px;
		margin-bottom: 1rem;
		box-shadow: 0 2px 6px var(--shadow);
	}

	.hero h1 {
		margin: 0 0 0.25rem 0;
		color: var(--accent);
		font-size: 1.75rem;
		font-weight: 700;
	}

	.count {
		margin: 0;
		font-size: 0.9rem;
		color: var(--text-secondary);
		font-weight: 500;
	}

	.section-title {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text-secondary);
		margin: 0 0 0.75rem 0;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.month-section {
		margin-bottom: 1rem;
	}

	.months-grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 0.5rem;
	}

	.month-btn {
		padding: 0.65rem 0.25rem;
		background: var(--bg-secondary);
		border: 2px solid var(--border-color);
		border-radius: 8px;
		text-align: center;
		color: var(--text-primary);
		font-weight: 600;
		font-size: 0.8rem;
		transition: all 0.2s;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.month-btn:active {
		transform: scale(0.95);
	}

	.month-btn.current {
		background: var(--accent);
		color: white;
		border-color: var(--accent);
	}

	.month-btn.today:not(.current) {
		border-color: var(--accent);
		border-width: 3px;
	}

	.categories-section {
		margin-bottom: 1rem;
	}

	.categories-scroll {
		display: flex;
		gap: 0.5rem;
		overflow-x: auto;
		padding-bottom: 0.5rem;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: thin;
	}

	.categories-scroll::-webkit-scrollbar {
		height: 4px;
	}

	.categories-scroll::-webkit-scrollbar-thumb {
		background: var(--border-color);
		border-radius: 2px;
	}

	.cat-pill {
		padding: 0.5rem 1rem;
		background: var(--bg-secondary);
		border: 2px solid var(--border-color);
		border-radius: 20px;
		color: var(--text-primary);
		font-size: 0.85rem;
		font-weight: 600;
		white-space: nowrap;
		cursor: pointer;
		transition: all 0.2s;
		flex-shrink: 0;
	}

	.cat-pill:active {
		transform: scale(0.95);
	}

	.cat-pill.active {
		background: var(--accent);
		color: white;
		border-color: var(--accent);
	}

	.advanced-filters {
		margin-bottom: 1rem;
		background: var(--bg-secondary);
		border-radius: 12px;
		border: 2px solid var(--border-color);
	}

	.filter-toggle {
		padding: 0.875rem 1rem;
		font-weight: 600;
		font-size: 0.9rem;
		color: var(--text-primary);
		cursor: pointer;
		list-style: none;
		user-select: none;
	}

	.filter-toggle::-webkit-details-marker {
		display: none;
	}

	.filter-content {
		padding: 0 1rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.filter-group label {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--text-secondary);
	}

	.select {
		padding: 0.75rem;
		border: 2px solid var(--border-color);
		border-radius: 8px;
		background: var(--bg-secondary);
		color: var(--text-primary);
		font-size: 0.9rem;
		cursor: pointer;
	}

	.select:focus {
		outline: none;
		border-color: var(--accent);
	}

	.reset-btn {
		padding: 0.65rem 1rem;
		background: #f44336;
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		font-size: 0.85rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.reset-btn:hover {
		background: #d32f2f;
	}

	.products-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.5rem;
		margin-bottom: 2rem;
	}

	.no-results {
		grid-column: 1 / -1;
		text-align: center;
		padding: 2rem 1rem;
		color: var(--text-tertiary);
		font-size: 0.95rem;
	}

	@media (min-width: 769px) {
		.hero h1 {
			font-size: 2.5rem;
		}

		.count {
			font-size: 1.1rem;
		}

		.months-grid {
			grid-template-columns: repeat(13, 1fr);
		}

		.month-btn {
			font-size: 0.9rem;
			padding: 0.75rem 0.5rem;
		}

		.products-grid {
			grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
			gap: 1rem;
		}

		.filter-content {
			flex-direction: row;
			flex-wrap: wrap;
		}

		.filter-group {
			flex: 1;
			min-width: 200px;
		}
	}

	@media (max-width: 400px) {
		.months-grid {
			gap: 0.4rem;
		}

		.month-btn {
			font-size: 0.72rem;
			padding: 0.55rem 0.15rem;
		}

		.products-grid {
			gap: 0.4rem;
		}
	}
</style>
