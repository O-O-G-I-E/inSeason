<script>
	import { onMount } from 'svelte';

	let deferredPrompt = null;
	let showInstallButton = false;
	let showIOSInstructions = false;
	let showSafariInstructions = false;
	let isInstalled = false;
	let debugInfo = '';
	let alwaysShowForTesting = false; // TEST: Deaktiviert
	let detectedBrowser = 'unknown'; // Für Debug

	onMount(() => {
		console.log('🔍 InstallPrompt mounted');
		console.log('User-Agent:', navigator.userAgent);

		// Prüfe ob bereits installiert
		const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
		console.log('📱 Standalone mode:', isStandalone);

		if (isStandalone) {
			isInstalled = true;
			debugInfo = 'App ist bereits installiert';
			detectedBrowser = 'installed';
			console.log('✅ App bereits installiert');
			return;
		}

		// iOS Detection
		const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
		const isInStandaloneMode = 'standalone' in window.navigator && window.navigator.standalone;
		console.log('🍎 iOS detected:', isIOS, 'Standalone:', isInStandaloneMode);

		if (isIOS && !isInStandaloneMode) {
			showIOSInstructions = true;
			detectedBrowser = 'ios-safari';
			debugInfo = 'iOS erkannt';
			console.log('📱 iOS Anleitung, State:', { showIOSInstructions, showSafariInstructions, showInstallButton });
			return;
		}

		// Safari Desktop Detection
		const hasChrome = /Chrome/.test(navigator.userAgent);
		const hasSafari = /Safari/.test(navigator.userAgent);
		const isSafariDesktop = hasSafari && !hasChrome && !isIOS;
		
		console.log('Browser check:', { hasChrome, hasSafari, isSafariDesktop });

		if (isSafariDesktop) {
			showSafariInstructions = true;
			detectedBrowser = 'safari-desktop';
			debugInfo = 'Safari Desktop';
			console.log('🦁 Safari Desktop erkannt, State:', { showIOSInstructions, showSafariInstructions, showInstallButton });
			return;
		}

		if (hasChrome) {
			detectedBrowser = 'chrome-waiting';
			debugInfo = 'Chrome - zeige Installations-Info';
			console.log('🌐 Chrome erkannt, zeige Info-Banner');
			// In Chrome zeigen wir immer einen Info-Banner, da beforeinstallprompt nicht zuverlässig ist
			showInstallButton = true; // Zeige Info-Banner
		}

		// beforeinstallprompt Event für Chrome/Edge/Android
		window.addEventListener('beforeinstallprompt', (e) => {
			console.log('🎯 beforeinstallprompt event ausgelöst!');
			e.preventDefault();
			deferredPrompt = e;
			showInstallButton = true;
			debugInfo = 'Install-Button bereit';
		});

		// Prüfe ob App installiert wurde
		window.addEventListener('appinstalled', () => {
			console.log('✅ App wurde installiert');
			showInstallButton = false;
			showIOSInstructions = false;
			isInstalled = true;
		});

		// Timeout für Debugging - zeige nach 2 Sekunden Info wenn kein Event kam
		setTimeout(() => {
			if (!showInstallButton && !showIOSInstructions && !isInstalled) {
				debugInfo = 'Kein Install-Event empfangen. Browser: ' + navigator.userAgent.split(' ').pop();
				console.log('⚠️ Kein beforeinstallprompt empfangen nach 2s');
				console.log('Browser:', navigator.userAgent);
				console.log('Protocol:', window.location.protocol);
				console.log('Host:', window.location.host);
			}
		}, 2000);
	});

	async function handleInstallClick() {
		if (!deferredPrompt) return;

		deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;

		if (outcome === 'accepted') {
			showInstallButton = false;
		}

		deferredPrompt = null;
	}

	function dismissIOSInstructions() {
		showIOSInstructions = false;
	}

	function dismissSafariInstructions() {
		showSafariInstructions = false;
	}

	function dismissInstallButton() {
		showInstallButton = false;
	}
</script>

<!-- TEST: Immer sichtbarer Button zum Testen -->
{#if alwaysShowForTesting}
	<div class="install-prompt test">
		<div class="install-content">
			<span class="install-icon">🌱</span>
			<div class="install-text">
				<strong>TEST: {detectedBrowser}</strong>
				<span
					>Safari: {showSafariInstructions}, iOS: {showIOSInstructions}, Chrome: {showInstallButton}</span
				>
			</div>
		</div>
		<button class="install-button" on:click={() => (alwaysShowForTesting = false)}>OK</button>
	</div>
{/if}

{#if showInstallButton}
	<div class="install-prompt chrome">
		<button class="close-button" on:click={dismissInstallButton}>✕</button>
		<div class="install-content">
			<span class="install-icon">📱</span>
			<div class="install-text">
				{#if deferredPrompt}
					<strong>App installieren</strong>
					<span>Schneller Zugriff ohne Browser</span>
				{:else}
					<strong>App installieren</strong>
					<span
						>Klicke auf <strong>⋯</strong> (Menü) → <strong>"App installieren"</strong> oder <strong
							>"Verknüpfung erstellen"</strong
						></span
					>
				{/if}
			</div>
		</div>
		{#if deferredPrompt}
			<button class="install-button" on:click={handleInstallClick}>Installieren</button>
		{/if}
	</div>
{/if}

{#if showIOSInstructions}
	<div class="install-prompt ios">
		<button class="close-button" on:click={dismissIOSInstructions}>✕</button>
		<div class="install-content">
			<span class="install-icon">📱</span>
			<div class="install-text">
				<strong>App zum Homescreen hinzufügen</strong>
				<span>Tippe auf <strong>Teilen</strong> <svg
						width="12"
						height="16"
						viewBox="0 0 12 16"
						fill="currentColor"
					>
						<path
							d="M6 0L4.59 1.41L8.17 5H0v2h8.17l-3.58 3.59L6 12l6-6z"
							transform="rotate(-90 6 6)"
						/>
					</svg> und dann <strong>"Zum Home-Bildschirm"</strong></span>
			</div>
		</div>
	</div>
{/if}

{#if showSafariInstructions}
	<div class="install-prompt safari">
		<button class="close-button" on:click={dismissSafariInstructions}>✕</button>
		<div class="install-content">
			<span class="install-icon">🌱</span>
			<div class="install-text">
				<strong>App zum Dock hinzufügen</strong>
				<span
					>Klicke in der Adressleiste auf <strong>Teilen</strong> (oder Datei → Teilen) und
					wähle <strong>"Zum Dock hinzufügen"</strong></span
				>
			</div>
		</div>
	</div>
{/if}

<!-- Debug-Info für Entwicklung -->
{#if debugInfo && !showInstallButton && !showIOSInstructions && !showSafariInstructions}
	<div class="debug-info">
		<small>{debugInfo}</small>
	</div>
{/if}

<style>
	.install-prompt {
		position: fixed;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
		max-width: 500px;
		width: calc(100% - 32px);
		background: var(--bg-secondary, #ffffff);
		border: 2px solid var(--accent, #2e7d32);
		border-radius: 16px;
		padding: 16px;
		box-shadow:
			0 4px 12px rgba(0, 0, 0, 0.15),
			0 0 0 1px rgba(0, 0, 0, 0.05);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		z-index: 1000;
		animation: slideUp 0.3s ease-out;
	}

	.install-prompt.ios {
		flex-direction: column;
		gap: 12px;
		padding: 20px;
	}

	.install-prompt.safari {
		flex-direction: column;
		gap: 12px;
		padding: 20px;
	}

	.install-prompt.chrome {
		flex-direction: column;
		gap: 12px;
		padding: 20px;
	}

	.install-prompt.test {
		flex-direction: column;
		gap: 12px;
		padding: 20px;
		background: #fffacd;
		border-color: #ffa500;
	}

	@keyframes slideUp {
		from {
			transform: translateX(-50%) translateY(100px);
			opacity: 0;
		}
		to {
			transform: translateX(-50%) translateY(0);
			opacity: 1;
		}
	}

	.install-content {
		display: flex;
		align-items: center;
		gap: 12px;
		flex: 1;
	}

	.install-icon {
		font-size: 32px;
		flex-shrink: 0;
	}

	.install-text {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 14px;
		color: var(--text-primary, #333);
	}

	.install-text strong {
		font-weight: 600;
		font-size: 15px;
	}

	.install-text span {
		color: var(--text-secondary, #666);
		font-size: 13px;
	}

	.install-text span svg {
		display: inline-block;
		vertical-align: middle;
		margin: 0 2px;
	}

	.install-button {
		background: var(--accent, #2e7d32);
		color: white;
		border: none;
		border-radius: 12px;
		padding: 12px 24px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.install-button:hover {
		background: #256029;
		transform: scale(1.05);
	}

	.install-button:active {
		transform: scale(0.98);
	}

	.close-button {
		position: absolute;
		top: 12px;
		right: 12px;
		background: transparent;
		border: none;
		font-size: 20px;
		color: var(--text-secondary, #666);
		cursor: pointer;
		padding: 4px;
		line-height: 1;
		transition: color 0.2s ease;
	}

	.close-button:hover {
		color: var(--text-primary, #333);
	}

	@media (max-width: 640px) {
		.install-prompt {
			bottom: 16px;
			width: calc(100% - 24px);
			padding: 14px;
		}

		.install-icon {
			font-size: 28px;
		}

		.install-text {
			font-size: 13px;
		}

		.install-text strong {
			font-size: 14px;
		}

		.install-button {
			padding: 10px 20px;

	.debug-info {
		position: fixed;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 8px 16px;
		border-radius: 8px;
		font-size: 11px;
		z-index: 999;
		max-width: 90%;
		text-align: center;
	}
			font-size: 13px;
		}

		.install-prompt.ios {
			padding: 16px;
		}
	}
</style>
