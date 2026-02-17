<script>
	import { resolve } from '$app/paths';
	import { getMonthRangeDisplay } from '$lib/utils/seasonHelper';

	export let produkt;

	$: ({ id, name, kategorie, saison } = produkt);

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
		return colors[kat] || '#424242';
	}

	// Formatiere Verfügbarkeit
	$: verfugbarkeit = getMonthRangeDisplay(saison.monate);
</script>

<a href={resolve('/produkt/[id]', { id: `${id}` })} class="card">
	<div class="card-header">
		<h3 class="name">{name}</h3>
		<span class="badge" style="background: {getCategoryColor(kategorie)}">
			{kategorie}
		</span>
	</div>

	<p class="season">📅 {verfugbarkeit}</p>
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
		transition: all 0.2s ease;
		cursor: pointer;
		text-decoration: none;
		color: inherit;
	}

	.card:active {
		transform: scale(0.98);
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
		margin: 0;
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--text-primary, #212121);
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

	.season {
		margin: 0;
		font-size: 0.85rem;
		color: var(--text-secondary, #999999);
		margin-top: auto;
	}

	/* Dark Mode */
	:global(.dark-mode) .card {
		background: var(--bg-secondary, #2a2a2a);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
	}

	:global(.dark-mode) .card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
	}

	:global(.dark-mode) .name {
		color: var(--text-primary, #f5f5f5);
	}

	:global(.dark-mode) .season {
		color: var(--text-secondary, #b0b0b0);
	}

	@media (max-width: 768px) {
		.name {
			font-size: 1rem;
		}

		.season {
			font-size: 0.8rem;
		}
	}
</style>
