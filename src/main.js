// Main application logic
class MusicLinkConverter {
    constructor() {
        this.currentPlatform = 'apple'; // Default: Spotify → Apple Music
        this.initializeEventListeners();
        this.updateUI(); // Set initial UI state
    }

    initializeEventListeners() {
        // Platform selector buttons
        document.querySelectorAll('.platform-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const button = e.target.closest('.platform-btn');
                if (!button) return;
                
                document.querySelectorAll('.platform-btn').forEach(b => b.classList.remove('active'));
                button.classList.add('active');
                this.currentPlatform = button.dataset.platform;
                this.updateUI();
                this.clearResult();
            });
        });

        // Convert button
        document.getElementById('convertBtn').addEventListener('click', () => {
            this.convertLink();
        });

        // Enter key support
        document.getElementById('musicUrl').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.convertLink();
            }
        });
    }

    async convertLink() {
        const url = document.getElementById('musicUrl').value.trim();
        
        if (!url) {
            this.showError('Please enter a music link');
            return;
        }

        if (!this.isValidUrl(url)) {
            this.showError('Please enter a valid URL');
            return;
        }

        this.showLoading(true);
        this.clearResult();

        try {
            const result = await this.fetchConvertedLink(url, this.currentPlatform);
            
            if (result.success) {
                this.showSuccess(result.link, result.platform, result.confidence, result.track);
            } else {
                this.showError(result.error || 'Failed to convert link');
            }
        } catch (error) {
            console.error('Conversion error:', error);
            this.showError('Network error. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    async fetchConvertedLink(url, targetPlatform) {
        try {
            const response = await fetch('/api/converter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: url,
                    targetPlatform: targetPlatform
                })
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('API call failed:', error);
            return {
                success: false,
                error: 'Network error. Please try again.'
            };
        }
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        const convertBtn = document.getElementById('convertBtn');
        
        loading.style.display = show ? 'block' : 'none';
        convertBtn.disabled = show;
    }

    showSuccess(link, platform, confidence, track) {
        const result = document.getElementById('result');
        const resultText = document.getElementById('resultText');
        const resultLink = document.getElementById('resultLink');
        
        result.className = 'result success';
        
        let trackInfo = '';
        if (track) {
            trackInfo = `🎵 ${track.title} - ${track.artist}\n`;
        }
        
        resultText.textContent = `${trackInfo}✓ Link ready`;
        resultLink.href = link;
        resultLink.textContent = link;
        result.style.display = 'block';
    }

    showError(message) {
        const result = document.getElementById('result');
        const resultText = document.getElementById('resultText');
        const resultLink = document.getElementById('resultLink');
        
        result.className = 'result error';
        resultText.textContent = `✗ ${message}`;
        resultLink.href = '#';
        resultLink.textContent = '';
        result.style.display = 'block';
    }

    updateUI() {
        const input = document.getElementById('musicUrl');
        const sourceLogo = document.getElementById('sourceLogo').querySelector('img');
        const targetLogo = document.getElementById('targetLogo').querySelector('img');
        
        if (this.currentPlatform === 'apple') {
            // Spotify → Apple Music
            input.placeholder = 'Paste link here...';
            sourceLogo.src = '/Spotify_icon.svg';
            sourceLogo.alt = 'Spotify';
            targetLogo.src = '/Apple_Music_icon.svg';
            targetLogo.alt = 'Apple Music';
        } else {
            // Apple Music → Spotify
            input.placeholder = 'Paste link here...';
            sourceLogo.src = '/Apple_Music_icon.svg';
            sourceLogo.alt = 'Apple Music';
            targetLogo.src = '/Spotify_icon.svg';
            targetLogo.alt = 'Spotify';
        }
    }

    clearResult() {
        document.getElementById('result').style.display = 'none';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MusicLinkConverter();
});
