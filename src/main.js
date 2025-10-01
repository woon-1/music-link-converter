// Main application logic
class MusicLinkConverter {
    constructor() {
        this.currentPlatform = 'spotify';
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Platform selector buttons
        document.querySelectorAll('.platform-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.platform-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentPlatform = e.target.dataset.platform;
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
                this.showSuccess(result.link, result.platform);
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
        // For now, we'll simulate the conversion
        // In a real implementation, this would call your API
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate API response
                if (targetPlatform === 'spotify') {
                    resolve({
                        success: true,
                        link: 'https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh',
                        platform: 'Spotify'
                    });
                } else {
                    resolve({
                        success: true,
                        link: 'https://music.apple.com/us/album/anti-hero/1646849437?i=1646849440',
                        platform: 'Apple Music'
                    });
                }
            }, 1500);
        });
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

    showSuccess(link, platform) {
        const result = document.getElementById('result');
        const resultText = document.getElementById('resultText');
        const resultLink = document.getElementById('resultLink');
        
        result.className = 'result success';
        resultText.textContent = `✅ Successfully converted to ${platform}:`;
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

    clearResult() {
        document.getElementById('result').style.display = 'none';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MusicLinkConverter();
});
