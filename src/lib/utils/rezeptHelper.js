// Hilfsfunktionen für Rezepte

/**
 * Berechnet CO2-Fußabdruck und Regional-Score eines Rezepts
 */
export function calculateRezeptCO2(rezept, produkte) {
  let totalCO2 = 0;
  let regionalCount = 0;
  let importCount = 0;
  let zutatenMitDaten = 0;
  
  const alleZutaten = [
    ...rezept.basis_zutaten,
    ...(rezept.varianten_zutaten?.vegan || [])
  ];
  
  alleZutaten.forEach(zutat => {
    if (zutat.produktId) {
      const produkt = produkte.find(p => p.id === zutat.produktId);
      if (produkt?.regional_data) {
        const mengeKg = parseMenge(zutat.menge);
        totalCO2 += produkt.regional_data.co2_per_kg * mengeKg;
        zutatenMitDaten++;
        
        if (produkt.regional_data.is_import) {
          importCount++;
        } else {
          regionalCount++;
        }
      }
    }
  });
  
  const regionalScore = zutatenMitDaten > 0 
    ? Math.round((regionalCount / zutatenMitDaten) * 10) 
    : null;
  
  return {
    totalCO2: totalCO2.toFixed(2),
    co2PerPortion: (totalCO2 / rezept.portionen).toFixed(2),
    regionalScore,
    regionalCount,
    importCount,
    totalZutaten: zutatenMitDaten
  };
}

/**
 * Extrahiert Kilogramm aus Mengenangaben
 */
function parseMenge(mengeStr) {
  if (!mengeStr) return 0.1;
  
  // Entferne alles außer Zahlen und Einheiten
  const str = mengeStr.toLowerCase().trim();
  
  // Kg-Angaben
  const kgMatch = str.match(/(\d+(?:[.,]\d+)?)\s*kg/);
  if (kgMatch) {
    return parseFloat(kgMatch[1].replace(',', '.'));
  }
  
  // Gramm-Angaben
  const gMatch = str.match(/(\d+(?:[.,]\d+)?)\s*g/);
  if (gMatch) {
    return parseFloat(gMatch[1].replace(',', '.')) / 1000;
  }
  
  // ml/L (als Gewichtsäquivalent)
  const mlMatch = str.match(/(\d+(?:[.,]\d+)?)\s*ml/);
  if (mlMatch) {
    return parseFloat(mlMatch[1].replace(',', '.')) / 1000;
  }
  
  const lMatch = str.match(/(\d+(?:[.,]\d+)?)\s*l/);
  if (lMatch) {
    return parseFloat(lMatch[1].replace(',', '.'));
  }
  
  // Stück/Bund - Schätzung
  const stueckMatch = str.match(/(\d+)\s*(stück|bund|el|tl)/);
  if (stueckMatch) {
    const anzahl = parseInt(stueckMatch[1]);
    return anzahl * 0.1; // ~100g pro Stück/Bund/EL
  }
  
  // Fallback
  return 0.1; // 100g Standard
}

/**
 * Berechnet Gesamt-Nährwerte eines Rezepts
 */
export function calculateRezeptNaehrwerte(rezept, produkte) {
  const naehrwerte = {
    energie_kcal: 0,
    protein_g: 0,
    fett_g: 0,
    kohlenhydrate_g: 0,
    ballaststoffe_g: 0
  };
  
  const alleZutaten = [
    ...rezept.basis_zutaten,
    ...(rezept.varianten_zutaten?.vegan || [])
  ];
  
  alleZutaten.forEach(zutat => {
    if (zutat.produktId) {
      const produkt = produkte.find(p => p.id === zutat.produktId);
      if (produkt?.naehrwerte) {
        const mengeKg = parseMenge(zutat.menge);
        const faktor = mengeKg * 10; // Nährwerte sind pro 100g
        
        naehrwerte.energie_kcal += produkt.naehrwerte.energie_kcal * faktor;
        naehrwerte.protein_g += produkt.naehrwerte.protein_g * faktor;
        naehrwerte.fett_g += produkt.naehrwerte.fett_g * faktor;
        naehrwerte.kohlenhydrate_g += produkt.naehrwerte.kohlenhydrate_g * faktor;
        naehrwerte.ballaststoffe_g += produkt.naehrwerte.ballaststoffe_g * faktor;
      }
    }
  });
  
  // Gerundet zurückgeben
  return {
    gesamt: {
      energie_kcal: Math.round(naehrwerte.energie_kcal),
      protein_g: Math.round(naehrwerte.protein_g * 10) / 10,
      fett_g: Math.round(naehrwerte.fett_g * 10) / 10,
      kohlenhydrate_g: Math.round(naehrwerte.kohlenhydrate_g * 10) / 10,
      ballaststoffe_g: Math.round(naehrwerte.ballaststoffe_g * 10) / 10
    },
    proPortion: {
      energie_kcal: Math.round(naehrwerte.energie_kcal / rezept.portionen),
      protein_g: Math.round((naehrwerte.protein_g / rezept.portionen) * 10) / 10,
      fett_g: Math.round((naehrwerte.fett_g / rezept.portionen) * 10) / 10,
      kohlenhydrate_g: Math.round((naehrwerte.kohlenhydrate_g / rezept.portionen) * 10) / 10,
      ballaststoffe_g: Math.round((naehrwerte.ballaststoffe_g / rezept.portionen) * 10) / 10
    }
  };
}

/**
 * Reichert Zutaten mit Produkt-Daten an
 */
export function enrichZutaten(rezept, produkte) {
  const alleZutaten = [
    ...rezept.basis_zutaten,
    ...(rezept.varianten_zutaten?.vegan || [])
  ];
  
  return alleZutaten.map(zutat => ({
    ...zutat,
    produkt: zutat.produktId ? produkte.find(p => p.id === zutat.produktId) : null
  }));
}
