<script>
	import { resolve } from '$app/paths';
	import { getMonthRangeDisplay } from '$lib/utils/seasonHelper.js';

	export let rezept;

	const schwierigkeitEmoji = {
		leicht: '👍',
		mittel: '👨‍🍳',
		schwer: '⭐'
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
</script>

<a href={resolve('/rezept/[id]', { id: `${rezept.id}` })} class="card">
	<div class="card-header">
		<h3 class="name">{rezept.name}</h3>
		<span class="badge" style="background: {getCategoryColor(rezept.kategorie)}">
			{rezept.kategorie}
		</span>
	</div>

	<div class="card-info">
		<span>⏱️ {rezept.zeit} Min</span>
		<span>{schwierigkeitEmoji[rezept.schwierigkeit]}</span>
		<span>👥 {rezept.portionen}</span>
	</div>

	<p class="season">📅 {getMonthRangeDisplay(rezept.saison.monate)}</p>
</a>

<style>
	.card {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
		border-radius: 12px;
		background: var(--bg-secondary, #f9f9f9);
		border: 1px solid var(--border-color, #e0e0e0);
		text-decoration: none;
		color: inherit;
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.card:hover {
		background: var(--bg-tertiary, #f0f0f0);
		border-color: var(--accent, #4caf50);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		transform: translateY(-2px);
	}

	.card-header {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.name {
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--text-primary, #212121);
		margin: 0;
		line-height: 1.3;
		word-break: break-word;
	}

	.badge {
		display: inline-block;
		padding: 0.3rem 0.6rem;
		border-radius: 8px;
		color: white;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.3px;
		width: fit-content;
	}

	.card-info {
		display: flex;
		gap: 0.75rem;
		font-size: 0.9rem;
		color: var(--text-secondary, #666666);
		flex-wrap: wrap;
		margin-top: auto;
	}

	.card-info span {
		display: inline-block;
	}

	.season {
		font-size: 0.85rem;
		color: var(--text-secondary, #999999);
		margin: 0;
		margin-top: 0.5rem;
		padding-top: 0.5rem;
		border-top: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
	}

	@media (max-width: 640px) {
		.name {
			font-size: 1rem;
		}

		.card-info {
			font-size: 0.85rem;
			gap: 0.5rem;
		}
	}
</style>
