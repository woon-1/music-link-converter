// Music Link Converter API
// Vercel serverless function

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { url, targetPlatform } = req.body;

        if (!url || !targetPlatform) {
            return res.status(400).json({ 
                success: false, 
                error: 'URL and target platform are required' 
            });
        }

        // Extract metadata from the source URL
        const metadata = extractMetadata(url);
        
        if (!metadata) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid music URL format' 
            });
        }

        // Convert to target platform
        const convertedLink = await convertToPlatform(metadata, targetPlatform);

        if (!convertedLink) {
            return res.status(404).json({ 
                success: false, 
                error: 'Could not find matching track on target platform' 
            });
        }

        return res.status(200).json({
            success: true,
            link: convertedLink,
            platform: targetPlatform,
            metadata: metadata
        });

    } catch (error) {
        console.error('Conversion error:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
}

function extractMetadata(url) {
    try {
        const urlObj = new URL(url);
        
        // Spotify URL parsing
        if (urlObj.hostname.includes('spotify.com')) {
            const trackId = extractSpotifyTrackId(url);
            if (trackId) {
                return {
                    platform: 'spotify',
                    trackId: trackId,
                    type: 'track'
                };
            }
        }
        
        // Apple Music URL parsing
        if (urlObj.hostname.includes('music.apple.com')) {
            const trackId = extractAppleMusicTrackId(url);
            if (trackId) {
                return {
                    platform: 'apple',
                    trackId: trackId,
                    type: 'track'
                };
            }
        }
        
        return null;
    } catch (error) {
        return null;
    }
}

function extractSpotifyTrackId(url) {
    const match = url.match(/\/track\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
}

function extractAppleMusicTrackId(url) {
    const match = url.match(/i=(\d+)/);
    return match ? match[1] : null;
}

async function convertToPlatform(metadata, targetPlatform) {
    // This is where you'd implement the actual conversion logic
    // For now, we'll return a mock response
    
    if (metadata.platform === targetPlatform) {
        return null; // Already on target platform
    }
    
    // Mock conversion - in reality, you'd:
    // 1. Fetch track details from source platform API
    // 2. Search for matching track on target platform
    // 3. Return the best match URL
    
    if (targetPlatform === 'spotify') {
        return 'https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh';
    } else if (targetPlatform === 'apple') {
        return 'https://music.apple.com/us/album/anti-hero/1646849437?i=1646849440';
    }
    
    return null;
}
