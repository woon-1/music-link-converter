// Main application logic
class MusicLinkConverter {
    constructor() {
        this.currentPlatform = 'apple'; // Default: Spotify → Apple Music
        this.initializeEventListeners();
        this.updatePlaceholder(); // Set initial placeholder
    }

    initializeEventListeners() {
        // Platform selector buttons
        document.querySelectorAll('.platform-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.platform-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentPlatform = e.target.dataset.platform;
                this.updatePlaceholder();
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
        
        let confidenceText = '';
        if (confidence) {
            confidenceText = ` (${Math.round(confidence)}% match)`;
        }
        
        let trackInfo = '';
        if (track) {
            trackInfo = `\n🎵 ${track.title} by ${track.artist}`;
        }
        
        resultText.textContent = `✅ Successfully converted to ${platform}${confidenceText}${trackInfo}`;
        resultLink.href = link;
        resultLink.textContent = link;
        result.style.display = 'block';
    }

    showError(message) {
        const result = document.getElementById('result');
        const resultText = document.getElementById('resultText');
        const resultLink = document.getElementById('resultLink');
        
        result.className = 'result error';
        resultText.textContent = `❌ ${message}`;
        resultLink.href = '#';
        resultLink.textContent = '';
        result.style.display = 'block';
    }

    updatePlaceholder() {
        const input = document.getElementById('musicUrl');
        if (this.currentPlatform === 'apple') {
            // Spotify → Apple Music
            input.placeholder = 'https://open.spotify.com/track/...';
        } else {
            // Apple Music → Spotify
            input.placeholder = 'https://music.apple.com/us/song/...';
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
