<script>
  import { injectAnalytics } from '@vercel/analytics/sveltekit';

  injectAnalytics();
  
  import { onMount } from 'svelte';
  import { theme } from '$lib/stores/theme.js';
  import '../app.css';
  
  function toggleTheme() {
    theme.update(current => current === 'light' ? 'dark' : 'light');
  }
  
  onMount(() => {
    // Service Worker registrieren
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(() => console.log('✅ Service Worker registriert'))
        .catch((err) => console.error('❌ Service Worker Fehler:', err));
    }
    
    // Setze initiales Theme
    document.documentElement.setAttribute('data-theme', $theme);
  });
</script>

<svelte:head>
  <meta name="description" content="Regionaler Saisonkalender für Deutschland mit vollständigen Nährwertangaben" />
  <meta name="theme-color" content={$theme === 'dark' ? '#1a1a1a' : '#2E7D32'} />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  
  <!-- PWA Tags -->
  <link rel="manifest" href="/manifest.json" />
  <link rel="icon" type="image/png" href="/favicon.png" />
  <link rel="apple-touch-icon" href="/icon-192.png" />
  
  <!-- iOS Meta Tags -->
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="inSeason" />
</svelte:head>

<div class="app">
  <header>
    <div class="container">
      <a href="/" class="logo">
        <span class="logo-icon">🌱</span>
        <span class="logo-text">inSeason</span>
      </a>
      <nav>
        <div class="nav-links">
          <a href="/">Produkte</a>
          <a href="/rezepte">Rezepte</a>
        </div>
        <button class="theme-toggle" on:click={toggleTheme} title="Theme wechseln">
          {#if $theme === 'light'}
            🌙
          {:else}
            ☀️
          {/if}
        </button>
      </nav>
    </div>
  </header>

  <main class="container">
    <slot />
  </main>

  <footer>
    <div class="container">
      <p>© 2026 inSeason - Regionaler Saisonkalender für Deutschland</p>
    </div>
  </footer>
</div>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  /* CSS Variables für Themes */
  :global(:root[data-theme="light"]) {
    --bg-primary: #f5f5f5;
    --bg-secondary: #ffffff;
    --bg-tertiary: #fafafa;
    --text-primary: #333333;
    --text-secondary: #666666;
    --text-tertiary: #999999;
    --border-color: #e0e0e0;
    --shadow: rgba(0, 0, 0, 0.08);
    --shadow-hover: rgba(0, 0, 0, 0.12);
    --accent: #2E7D32;
    --accent-hover: #1B5E20;
    --accent-light: #4CAF50;
  }

  :global(:root[data-theme="dark"]) {
    --bg-primary: #121212;
    --bg-secondary: #1e1e1e;
    --bg-tertiary: #2a2a2a;
    --text-primary: #e0e0e0;
    --text-secondary: #b0b0b0;
    --text-tertiary: #808080;
    --border-color: #333333;
    --shadow: rgba(0, 0, 0, 0.3);
    --shadow-hover: rgba(0, 0, 0, 0.5);
    --accent: #4CAF50;
    --accent-hover: #66BB6A;
    --accent-light: #81C784;
  }

  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.6;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  header {
    background: var(--bg-secondary);
    box-shadow: 0 2px 8px var(--shadow);
    position: sticky;
    top: 0;
    z-index: 100;
    transition: background-color 0.3s ease;
  }

  header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
    color: var(--accent);
    font-weight: 700;
    font-size: 1.5rem;
    transition: transform 0.2s ease;
  }

  .logo:hover {
    transform: scale(1.05);
  }

  .logo-icon {
    font-size: 2rem;
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }

  nav {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .nav-links {
    display: flex;
    gap: 1.5rem;
    align-items: center;
  }

  .nav-links a {
    color: var(--text-primary);
    text-decoration: none;
    font-weight: 500;
    font-size: 1rem;
    transition: color 0.2s ease;
    position: relative;
  }

  .nav-links a::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--accent);
    transition: width 0.3s ease;
  }

  .nav-links a:hover {
    color: var(--accent);
  }

  .nav-links a:hover::after {
    width: 100%;
  }

  .theme-toggle {
    background: var(--bg-tertiary);
    border: 2px solid var(--border-color);
    border-radius: 50%;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .theme-toggle:hover {
    transform: rotate(20deg) scale(1.1);
    background: var(--accent);
  }

  main {
    flex: 1;
    padding: 2rem 1.5rem;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
  }

  .container {
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  footer {
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-color);
    margin-top: 4rem;
    padding: 2rem 1.5rem;
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.9rem;
    transition: background-color 0.3s ease;
  }

  @media (max-width: 768px) {
    .logo-text {
      display: none;
    }

    .nav-links {
      gap: 1rem;
    }

    .nav-links a {
      font-size: 0.9rem;
    }

    main {
      padding: 1.5rem 1rem;
    }
    
    .theme-toggle {
      width: 40px;
      height: 40px;
      font-size: 1.25rem;
    }
  }
</style>
