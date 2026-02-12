import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Lese gespeicherte Präferenz oder nutze System-Präferenz
const getInitialTheme = () => {
  if (!browser) return 'light';
  
  const saved = localStorage.getItem('theme');
  if (saved) return saved;
  
  // Check System-Präferenz
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  return 'light';
};

export const theme = writable(getInitialTheme());

// Speichere Theme-Änderungen
if (browser) {
  theme.subscribe(value => {
    localStorage.setItem('theme', value);
    document.documentElement.setAttribute('data-theme', value);
  });
}
