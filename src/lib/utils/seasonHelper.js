// Hilfsfunktionen für Saison-Logik
export function getCurrentMonth() {
  return new Date().getMonth() + 1; // 1-12
}

export function isInSeason(produkt, monat = getCurrentMonth()) {
  return produkt.saison.monate.includes(monat);
}

export function filterByMonth(produkte, monat) {
  return produkte.filter(p => isInSeason(p, monat));
}

export function filterByCategory(produkte, kategorie) {
  return produkte.filter(p => p.kategorie === kategorie);
}

export function searchProducts(produkte, query) {
  const q = query.toLowerCase();
  return produkte.filter(p => 
    p.name.toLowerCase().includes(q) ||
    p.kategorie.toLowerCase().includes(q) ||
    p.unterkategorie.toLowerCase().includes(q)
  );
}

export function getMonthName(monat) {
  const monate = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];
  return monate[monat - 1];
}

export function getAllCategories(produkte) {
  return [...new Set(produkte.map(p => p.kategorie))];
}

export function getSeasonDisplay(monate) {
  // Wenn alle 12 Monate verfügbar
  if (monate.length === 12) {
    return 'Ganzjährig verfügbar';
  }
  
  // Sortiere Monate
  const sorted = [...monate].sort((a, b) => a - b);
  
  // Gruppiere zusammenhängende Monate
  const ranges = [];
  let start = sorted[0];
  let end = sorted[0];
  
  for (let i = 1; i < sorted.length; i++) {
    // Wenn nächster Monat direkt folgt, erweitere den Bereich
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      // Speichere aktuellen Bereich und starte neuen
      ranges.push([start, end]);
      start = sorted[i];
      end = sorted[i];
    }
  }
  // Letzten Bereich speichern
  ranges.push([start, end]);
  
  // Handle wrap-around (z.B. Dezember-Januar)
  if (ranges.length > 1) {
    const first = ranges[0];
    const last = ranges[ranges.length - 1];
    if (first[0] === 1 && last[1] === 12) {
      // Verbinde Dezember mit Januar (Winter-Wrap)
      ranges.pop();
      ranges[0] = [last[0], first[1]];
    }
  }
  
  // Formatiere Bereiche
  return ranges.map(([start, end]) => {
    if (start === end) {
      return getMonthName(start);
    } else {
      return `${getMonthName(start)} - ${getMonthName(end)}`;
    }
  }).join(', ');
}
// Alias für Rezept-Cards (nutzt die bestehende getSeasonDisplay Funktion)
export function getMonthRangeDisplay(monate) {
  return getSeasonDisplay(monate);
}

// Rezepte nach Monat filtern
export function filterRezepteByMonth(rezepte, month) {
  return rezepte.filter(rezept => rezept.saison.monate.includes(month));
}

// Rezepte nach Kategorie filtern
export function filterRezepteByCategory(rezepte, category) {
  if (category === 'Alle') return rezepte;
  return rezepte.filter(rezept => rezept.kategorie === category);
}

// Alle Rezept-Kategorien extrahieren
export function getAllRezeptCategories(rezepte) {
  const categories = rezepte.map(r => r.kategorie);
  return ['Alle', ...new Set(categories)];
}

// Zutaten mit Produkt-Daten anreichern (für Verlinkung auf Rezept-Seite)
export function enrichRezeptZutaten(rezept, produkte) {
  if (!rezept.zutaten) return [];
  
  return rezept.zutaten.map(zutat => {
    if (zutat.produktId) {
      const produkt = produkte.find(p => p.id === zutat.produktId);
      return { ...zutat, produkt };
    }
    return zutat;
  });
}