# 🎵 Music Link Converter

Convert music links between Spotify and Apple Music seamlessly.

## 🚀 Features

- **Spotify → Apple Music** conversion
- **Apple Music → Spotify** conversion
- Clean, modern web interface
- Real-time link validation
- Mobile responsive design

## 🛠️ Tech Stack

- **Frontend:** Vanilla JavaScript + HTML/CSS
- **Build Tool:** Vite
- **Deployment:** Vercel (with serverless functions)
- **APIs:** Spotify Web API + Apple Music API

## 📋 Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Development
```bash
npm run dev
```
Opens at `http://localhost:3000`

### 3. Build
```bash
npm run build
```

## 🔑 API Keys Setup

### Spotify Web API
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Get your **Client ID** and **Client Secret**
4. Add to environment variables:
   ```
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   ```

### Apple Music API
1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Create a new app
3. Enable MusicKit
4. Get your **Team ID** and **Key ID**
5. Generate a **Private Key**
6. Add to environment variables:
   ```
   APPLE_MUSIC_TEAM_ID=your_team_id
   APPLE_MUSIC_KEY_ID=your_key_id
   APPLE_MUSIC_PRIVATE_KEY=your_private_key
   ```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically

### Other Platforms
- **Netlify:** Works with serverless functions
- **Railway:** Good for Node.js apps
- **Heroku:** Traditional deployment

## 📱 Usage

1. **Select conversion direction:**
   - Spotify → Apple Music
   - Apple Music → Spotify

2. **Paste your music link:**
   - Spotify: `https://open.spotify.com/track/...`
   - Apple Music: `https://music.apple.com/...`

3. **Click "Convert Link"**
   - Get your converted link instantly!

## 🔧 Implementation Status

### ✅ Completed
- [x] Project structure
- [x] Frontend UI
- [x] Basic URL parsing
- [x] Mock conversion logic

### 🚧 In Progress
- [ ] Spotify API integration
- [ ] Apple Music API integration
- [ ] Real conversion logic
- [ ] Error handling
- [ ] Rate limiting

### 📋 Todo
- [ ] Caching system
- [ ] Analytics
- [ ] Mobile app (React Native)
- [ ] Browser extension
- [ ] API documentation

## 🧪 Testing

```bash
# Run tests
npm test

# Test specific functionality
node test.js
```

## 📊 API Endpoints

### POST `/api/converter`
Convert a music link between platforms.

**Request:**
```json
{
  "url": "https://open.spotify.com/track/...",
  "targetPlatform": "apple"
}
```

**Response:**
```json
{
  "success": true,
  "link": "https://music.apple.com/...",
  "platform": "apple",
  "metadata": {
    "platform": "spotify",
    "trackId": "4iV5W9uYEdYUVa79Axb7Rh",
    "type": "track"
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Links

- **Live Demo:** [Coming Soon]
- **API Docs:** [Coming Soon]
- **GitHub:** [Your Repo URL]
