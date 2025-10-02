// Main application logic
class MusicLinkConverter {
    constructor() {
        this.platformLogos = {
            'spotify': '/Spotify_icon.svg',
            'apple': '/Apple_Music_icon.svg',
            'youtube': '/YouTube_icon.svg',
            'youtubeMusic': '/YouTube_Music_icon.svg'
        };
        this.initializeEventListeners();
        this.updateLogos(); // Set initial logos
    }

    initializeEventListeners() {
        const sourcePlatform = document.getElementById('sourcePlatform');
        const targetPlatform = document.getElementById('targetPlatform');
        const directionToggle = document.getElementById('directionToggle');

        // Platform dropdown changes
        sourcePlatform.addEventListener('change', () => {
            this.updateLogos();
            this.clearResult();
        });

        targetPlatform.addEventListener('change', () => {
            this.updateLogos();
            this.clearResult();
        });

        // Direction toggle button - swaps source and target
        directionToggle.addEventListener('click', () => {
            this.swapPlatforms();
        });

        // Keyboard support for direction toggle
        directionToggle.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.swapPlatforms();
            }
        });

        // Convert button
        document.getElementById('convertBtn').addEventListener('click', () => {
            this.convertLink();
        });

        // Input field changes
        const musicUrl = document.getElementById('musicUrl');
        const clearBtn = document.getElementById('clearBtn');
        const inputWrapper = document.querySelector('.input-wrapper');

        const checkOverflow = () => {
            // Check if text is overflowing AND not scrolled to the end
            const isOverflowing = musicUrl.scrollWidth > musicUrl.clientWidth;
            const isAtEnd = musicUrl.scrollLeft + musicUrl.clientWidth >= musicUrl.scrollWidth - 1;
            
            if (isOverflowing && !isAtEnd) {
                inputWrapper.classList.add('has-overflow');
            } else {
                inputWrapper.classList.remove('has-overflow');
            }
        };

        musicUrl.addEventListener('input', () => {
            clearBtn.style.display = musicUrl.value ? 'block' : 'none';
            checkOverflow();
        });

        musicUrl.addEventListener('blur', () => {
            checkOverflow();
        });

        musicUrl.addEventListener('focus', () => {
            checkOverflow();
        });

        musicUrl.addEventListener('scroll', () => {
            checkOverflow();
        });

        // Enter key support
        musicUrl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.convertLink();
            }
        });

        // Clear button
        clearBtn.addEventListener('click', () => {
            musicUrl.value = '';
            clearBtn.style.display = 'none';
            inputWrapper.classList.remove('has-overflow');
            musicUrl.focus();
            this.clearResult();
        });

        // Copy button
        document.getElementById('copyBtn').addEventListener('click', () => {
            this.copyToClipboard();
        });
    }

    updateLogos() {
        const sourcePlatform = document.getElementById('sourcePlatform').value;
        const targetPlatform = document.getElementById('targetPlatform').value;
        const sourceLogoImg = document.getElementById('sourceLogoImg');
        const targetLogoImg = document.getElementById('targetLogoImg');

        sourceLogoImg.src = this.platformLogos[sourcePlatform];
        targetLogoImg.src = this.platformLogos[targetPlatform];
    }

    swapPlatforms() {
        const sourcePlatform = document.getElementById('sourcePlatform');
        const targetPlatform = document.getElementById('targetPlatform');

        // Swap the selected values
        const temp = sourcePlatform.value;
        sourcePlatform.value = targetPlatform.value;
        targetPlatform.value = temp;

        // Update logos
        this.updateLogos();
        this.clearResult();
    }

    async convertLink() {
        const url = document.getElementById('musicUrl').value.trim();
        const targetPlatform = document.getElementById('targetPlatform').value;
        
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
            const result = await this.fetchConvertedLink(url, targetPlatform);
            
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
            trackInfo = `${track.title} - ${track.artist}`;
        }
        
        resultText.textContent = trackInfo;
        resultLink.href = link;
        resultLink.textContent = link;
        copyBtn.style.display = 'block';
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
        const copyIcon = document.getElementById('copyIcon');
        
        try {
            await navigator.clipboard.writeText(this.currentLink);
            // Brief visual feedback - show checkmark
            copyIcon.classList.add('copied');
            setTimeout(() => {
                copyIcon.classList.remove('copied');
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
