// Main application logic
class MusicLinkConverter {
    constructor() {
        this.currentPlatform = 'apple'; // Default: Spotify → Apple Music
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Direction toggle button
        const directionToggle = document.getElementById('directionToggle');
        const rightArrow = document.getElementById('rightArrow');
        const leftArrow = document.getElementById('leftArrow');

        directionToggle.addEventListener('click', () => {
            this.toggleDirection();
        });

        // Keyboard support for direction toggle
        directionToggle.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleDirection();
            }
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

        // Copy button
        document.getElementById('copyBtn').addEventListener('click', () => {
            this.copyToClipboard();
        });
    }

    toggleDirection() {
        const rightArrow = document.getElementById('rightArrow');
        const leftArrow = document.getElementById('leftArrow');

        // Toggle platform
        this.currentPlatform = this.currentPlatform === 'apple' ? 'spotify' : 'apple';

        // Toggle arrow styles
        if (this.currentPlatform === 'apple') {
            // Spotify → Apple Music
            rightArrow.classList.remove('inactive');
            rightArrow.classList.add('active');
            leftArrow.classList.remove('active');
            leftArrow.classList.add('inactive');
        } else {
            // Apple Music → Spotify
            leftArrow.classList.remove('inactive');
            leftArrow.classList.add('active');
            rightArrow.classList.remove('active');
            rightArrow.classList.add('inactive');
        }

        this.clearResult();
    }

    async convertLink() {
        const url = document.getElementById('musicUrl').value.trim();
        
        if (!url) {
            this.showError('enter a link, dummy');
            return;
        }

        if (!this.isValidUrl(url)) {
            this.showError('that\'s not a valid link, dummy');
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
        const copyBtn = document.getElementById('copyBtn');
        
        result.className = 'result success';
        
        let trackInfo = '';
        if (track) {
            trackInfo = `🎵 ${track.title} - ${track.artist}\n`;
        }
        
        resultText.textContent = `${trackInfo}✓ Link ready`;
        resultLink.href = link;
        resultLink.textContent = link;
        copyBtn.style.display = 'inline-block';
        result.style.display = 'block';
        
        // Store the link for copying
        this.currentLink = link;
    }

    showError(message) {
        const result = document.getElementById('result');
        const resultText = document.getElementById('resultText');
        const resultLink = document.getElementById('resultLink');
        const copyBtn = document.getElementById('copyBtn');
        
        result.className = 'result error';
        resultText.textContent = `✗ ${message}`;
        resultLink.href = '#';
        resultLink.textContent = '';
        copyBtn.style.display = 'none';
        result.style.display = 'block';
    }

    async copyToClipboard() {
        const copyBtn = document.getElementById('copyBtn');
        
        try {
            await navigator.clipboard.writeText(this.currentLink);
            // Brief visual feedback
            copyBtn.textContent = '✓';
            setTimeout(() => {
                copyBtn.textContent = '📋';
            }, 1000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }

    clearResult() {
        const copyBtn = document.getElementById('copyBtn');
        document.getElementById('result').style.display = 'none';
        copyBtn.style.display = 'none';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MusicLinkConverter();
});
