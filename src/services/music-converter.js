// Music Link Converter Service
import SpotifyAPI from './spotify-api.js';
import AppleMusicAPI from './apple-music-api.js';

class MusicConverter {
    constructor() {
        this.spotify = new SpotifyAPI();
        this.appleMusic = new AppleMusicAPI();
    }

    // Normalize track data for comparison
    normalizeTrackData(track, platform) {
        if (platform === 'spotify') {
            return {
                title: track.name,
                artist: track.artists[0]?.name,
                album: track.album?.name,
                duration: track.duration_ms,
                platform: 'spotify',
                id: track.id
            };
        } else if (platform === 'apple') {
            return {
                title: track.attributes?.name,
                artist: track.attributes?.artistName,
                album: track.attributes?.albumName,
                duration: track.attributes?.durationInMillis,
                platform: 'apple',
                id: track.id
            };
        }
        return null;
    }

    // Calculate similarity score between two tracks
    calculateSimilarity(track1, track2) {
        let score = 0;
        
        // Title similarity (most important)
        if (track1.title && track2.title) {
            const title1 = track1.title.toLowerCase().trim();
            const title2 = track2.title.toLowerCase().trim();
            if (title1 === title2) {
                score += 40;
            } else if (title1.includes(title2) || title2.includes(title1)) {
                score += 30;
            } else {
                // Simple word overlap check
                const words1 = title1.split(/\s+/);
                const words2 = title2.split(/\s+/);
                const commonWords = words1.filter(word => words2.includes(word));
                score += (commonWords.length / Math.max(words1.length, words2.length)) * 25;
            }
        }

        // Artist similarity
        if (track1.artist && track2.artist) {
            const artist1 = track1.artist.toLowerCase().trim();
            const artist2 = track2.artist.toLowerCase().trim();
            if (artist1 === artist2) {
                score += 35;
            } else if (artist1.includes(artist2) || artist2.includes(artist1)) {
                score += 25;
            }
        }

        // Album similarity
        if (track1.album && track2.album) {
            const album1 = track1.album.toLowerCase().trim();
            const album2 = track2.album.toLowerCase().trim();
            if (album1 === album2) {
                score += 20;
            } else if (album1.includes(album2) || album2.includes(album1)) {
                score += 10;
            }
        }

        // Duration similarity (within 5 seconds)
        if (track1.duration && track2.duration) {
            const duration1 = track1.duration;
            const duration2 = track2.duration;
            const diff = Math.abs(duration1 - duration2);
            if (diff < 5000) { // 5 seconds
                score += 5;
            }
        }

        return Math.min(score, 100); // Cap at 100
    }

    // Convert Spotify track to Apple Music
    async convertSpotifyToApple(spotifyUrl) {
        try {
            // Extract track ID
            const trackId = SpotifyAPI.extractTrackId(spotifyUrl);
            if (!trackId) {
                throw new Error('Invalid Spotify URL');
            }

            // Get track details from Spotify
            const spotifyTrack = await this.spotify.getTrack(trackId);
            const normalizedSpotify = this.normalizeTrackData(spotifyTrack, 'spotify');

            // Search for matching track on Apple Music
            const searchQuery = `${normalizedSpotify.title} ${normalizedSpotify.artist}`;
            const appleResults = await this.appleMusic.searchSongs(searchQuery, 20);

            if (appleResults.length === 0) {
                throw new Error('No matching track found on Apple Music');
            }

            // Find best match
            let bestMatch = null;
            let bestScore = 0;

            for (const appleTrack of appleResults) {
                const normalizedApple = this.normalizeTrackData(appleTrack, 'apple');
                const score = this.calculateSimilarity(normalizedSpotify, normalizedApple);
                
                if (score > bestScore && score > 60) { // Minimum 60% similarity
                    bestScore = score;
                    bestMatch = appleTrack;
                }
            }

            if (!bestMatch) {
                throw new Error('No sufficiently similar track found on Apple Music');
            }

            // Generate Apple Music URL
            console.log('Apple Music track data:', JSON.stringify(bestMatch, null, 2));
            const albumId = bestMatch.attributes?.albumId || bestMatch.relationships?.albums?.data?.[0]?.id;
            console.log('Album ID found:', albumId);
            
            const appleUrl = AppleMusicAPI.generateUrlWithAlbum(
                bestMatch.id,
                albumId,
                'us'
            );

            return {
                success: true,
                originalUrl: spotifyUrl,
                convertedUrl: appleUrl,
                originalPlatform: 'Spotify',
                targetPlatform: 'Apple Music',
                confidence: bestScore,
                track: {
                    title: normalizedSpotify.title,
                    artist: normalizedSpotify.artist,
                    album: normalizedSpotify.album
                }
            };

        } catch (error) {
            console.error('Spotify to Apple Music conversion error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Convert Apple Music track to Spotify
    async convertAppleToSpotify(appleUrl) {
        try {
            // Extract track ID
            const trackId = AppleMusicAPI.extractTrackId(appleUrl);
            if (!trackId) {
                throw new Error('Invalid Apple Music URL');
            }

            // Get track details from Apple Music
            const appleTrack = await this.appleMusic.getTrack(trackId);
            const normalizedApple = this.normalizeTrackData(appleTrack, 'apple');

            // Search for matching track on Spotify
            const searchQuery = `${normalizedApple.title} ${normalizedApple.artist}`;
            const spotifyResults = await this.spotify.searchTracks(searchQuery, 20);

            if (spotifyResults.length === 0) {
                throw new Error('No matching track found on Spotify');
            }

            // Find best match
            let bestMatch = null;
            let bestScore = 0;

            for (const spotifyTrack of spotifyResults) {
                const normalizedSpotify = this.normalizeTrackData(spotifyTrack, 'spotify');
                const score = this.calculateSimilarity(normalizedApple, normalizedSpotify);
                
                if (score > bestScore && score > 60) { // Minimum 60% similarity
                    bestScore = score;
                    bestMatch = spotifyTrack;
                }
            }

            if (!bestMatch) {
                throw new Error('No sufficiently similar track found on Spotify');
            }

            // Generate Spotify URL
            const spotifyUrl = SpotifyAPI.generateUrl(bestMatch.id);

            return {
                success: true,
                originalUrl: appleUrl,
                convertedUrl: spotifyUrl,
                originalPlatform: 'Apple Music',
                targetPlatform: 'Spotify',
                confidence: bestScore,
                track: {
                    title: normalizedApple.title,
                    artist: normalizedApple.artist,
                    album: normalizedApple.album
                }
            };

        } catch (error) {
            console.error('Apple Music to Spotify conversion error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Main conversion method
    async convert(url, targetPlatform) {
        try {
            // Detect source platform
            const sourcePlatform = this.detectPlatform(url);
            
            if (!sourcePlatform) {
                throw new Error('Unsupported music platform URL');
            }

            if (sourcePlatform === targetPlatform) {
                throw new Error('Source and target platforms are the same');
            }

            // Perform conversion
            if (sourcePlatform === 'spotify' && targetPlatform === 'apple') {
                return await this.convertSpotifyToApple(url);
            } else if (sourcePlatform === 'apple' && targetPlatform === 'spotify') {
                return await this.convertAppleToSpotify(url);
            } else {
                throw new Error('Unsupported conversion direction');
            }

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Detect platform from URL
    detectPlatform(url) {
        if (url.includes('spotify.com')) {
            return 'spotify';
        } else if (url.includes('music.apple.com')) {
            return 'apple';
        }
        return null;
    }
}

export default MusicConverter;
