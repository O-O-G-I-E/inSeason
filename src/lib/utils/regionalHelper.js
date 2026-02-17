// Regional Score berechnen (0-100)
export function calculateRegionalScore(produkt, currentMonth) {
	let score = 100;
	const { regional_data, saison } = produkt;

	if (!regional_data) return 50; // Fallback

	// 1. Transport-Methode (40% Gewichtung)
	const transportPenalty = {
		local: 0,
		truck: 25,
		ship: 60,
		plane: 100
	};
	score -= (transportPenalty[regional_data.transport_method] || 0) * 0.4;

	// 2. Distanz (30% Gewichtung)
	if (regional_data.distance_km > 100) {
		const distancePenalty = Math.min((regional_data.distance_km - 100) / 20, 100);
		score -= distancePenalty * 0.3;
	}

	// 3. Saisonalität (30% Gewichtung)
	const inSeason = saison.monate.includes(currentMonth);
	if (!inSeason) {
		score -= 100 * 0.3;
	}

	return Math.max(0, Math.round(score));
}

// Score-Farbe ermitteln
export function getScoreColor(score) {
	if (score >= 80) return '#4CAF50'; // Grün
	if (score >= 50) return '#FF9800'; // Orange
	return '#f44336'; // Rot
}

// Flaggen-Emoji (optional, für visuellen Effekt)
export function getFlagEmoji(countryCode) {
	const flags = {
		DE: '🇩🇪',
		ES: '🇪🇸',
		IT: '🇮🇹',
		FR: '🇫🇷',
		NL: '🇳🇱',
		EC: '🇪🇨',
		KE: '🇰🇪',
		PE: '🇵🇪',
		BR: '🇧🇷'
	};
	return flags[countryCode] || '🌍';
}
