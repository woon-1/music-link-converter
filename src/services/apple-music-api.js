// Apple Music API Service
class AppleMusicAPI {
    constructor() {
        this.baseURL = 'https://api.music.apple.com/v1';
        this.teamId = process.env.APPLE_MUSIC_TEAM_ID;
        this.keyId = process.env.APPLE_MUSIC_KEY_ID;
        this.privateKey = process.env.APPLE_MUSIC_PRIVATE_KEY;
        this.storefront = 'us'; // Default to US storefront
        this.developerToken = null;
    }

    async getDeveloperToken() {
        if (this.developerToken) {
            return this.developerToken;
        }

        try {
            // Generate JWT token for Apple Music API
            const jwt = require('jsonwebtoken');
            
            const token = jwt.sign({}, this.privateKey, {
                algorithm: 'ES256',
                expiresIn: '180d',
                issuer: this.teamId,
                header: {
                    alg: 'ES256',
                    kid: this.keyId,
                },
            });

            this.developerToken = token;
            return token;
        } catch (error) {
            console.error('Apple Music token generation error:', error);
            throw new Error('Failed to generate Apple Music token');
        }
    }

    async getTrack(trackId) {
        try {
            const token = await this.getDeveloperToken();
            const response = await fetch(`${this.baseURL}/catalog/${this.storefront}/songs/${trackId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Apple Music API error: ${response.status}`);
            }

            const data = await response.json();
            return data.data[0]; // Apple Music returns array in data property
        } catch (error) {
            console.error('Error fetching Apple Music track:', error);
            throw error;
        }
    }

    async searchSongs(query, limit = 10) {
        try {
            const token = await this.getDeveloperToken();
            const response = await fetch(`${this.baseURL}/catalog/${this.storefront}/search?term=${encodeURIComponent(query)}&types=songs&limit=${limit}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Apple Music search error: ${response.status}`);
            }

            const data = await response.json();
            return data.results.songs?.data || [];
        } catch (error) {
            console.error('Error searching Apple Music:', error);
            throw error;
        }
    }

    // Extract track ID from Apple Music URL
    static extractTrackId(url) {
        try {
            const match = url.match(/i=(\d+)/);
            return match ? match[1] : null;
        } catch (error) {
            return null;
        }
    }

    // Generate Apple Music URL from track ID
    static generateUrl(trackId, storefront = 'us') {
        // Note: We need album ID for Apple Music URLs, track ID alone isn't sufficient
        // This is a simplified version - in practice, you'd need album context
        return `https://music.apple.com/${storefront}/song/${trackId}`;
    }

    // More accurate URL generation with album context
    static generateUrlWithAlbum(trackId, albumId, storefront = 'us') {
        return `https://music.apple.com/${storefront}/album/${albumId}?i=${trackId}`;
    }
}

export default AppleMusicAPI;
