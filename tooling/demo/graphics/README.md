# TortoiseOS Graphics for Twitter

Beautiful, ready-to-use graphics for your Twitter thread about TortoiseOS and Carapace.

## 📁 Files

### 00-hero.html
**Main announcement card**
- Use for: First tweet / Pin post
- Features: Animated logo, gradient background, 4 key features
- Color: Dark theme with purple gradient
- Dimensions: 1200x1200 recommended

### 01-architecture.html
**System architecture diagram**
- Use for: Technical overview tweet
- Shows: Frontend, Backend, Blockchain, AI Layer, Monitoring
- Color: White background with purple accents
- Dimensions: 1200x900 recommended

### 02-roadmap.html
**4-phase roadmap timeline**
- Use for: Roadmap tweet thread
- Shows: All 4 phases with deliverables and timelines
- Color: White background with colorful timeline
- Dimensions: 1400x1200 recommended

### 03-tech-stack.html
**Technology stack visualization**
- Use for: Tech stack tweet
- Shows: 6 categories (Blockchain, Frontend, Backend, Data, AI/ML, DevOps)
- Color: Dark theme with stats at bottom
- Dimensions: 1200x1000 recommended

### 04-features.html
**Feature comparison card**
- Use for: Why TortoiseOS tweet
- Shows: 4 feature cards + Traditional vs TortoiseOS comparison
- Color: White background with green theme
- Dimensions: 1300x1200 recommended

### 05-stats.html
**Project statistics dashboard**
- Use for: Progress update tweet
- Shows: Key metrics, development progress, milestones
- Color: White background with purple accents
- Dimensions: 1200x1200 recommended

---

## 🎨 How to Use

### Option 1: Browser Screenshots (Recommended)

1. **Open the HTML file in your browser:**
   ```bash
   open graphics/00-hero.html
   ```

2. **Take a screenshot:**
   - **Mac:** Cmd + Shift + 4, then Space (to capture window)
   - **Windows:** Snipping Tool or Win + Shift + S
   - **Linux:** Screenshot tool or `gnome-screenshot`

3. **Or use browser DevTools for exact dimensions:**
   - Press F12 to open DevTools
   - Click the device toolbar (Cmd/Ctrl + Shift + M)
   - Set custom dimensions (e.g., 1200x1200)
   - Right-click on page → "Capture screenshot"

### Option 2: Automated Screenshot Tool

Using Playwright or Puppeteer to automate:

```bash
# Install playwright
bun add -D playwright

# Create screenshot script
bunx playwright screenshot graphics/00-hero.html 00-hero.png --viewport-size=1200,1200
```

### Option 3: Online Converter

1. Upload HTML files to services like:
   - [HTML to Image API](https://htmlcsstoimage.com/)
   - [CloudConvert](https://cloudconvert.com/html-to-png)
   - [Vercel OG Image](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation)

---

## 🐦 Twitter Best Practices

### Image Dimensions
- **Single image:** 1200x675 (16:9) or 1200x1200 (1:1)
- **Multiple images:** 1200x675 per image
- **Max file size:** 5MB per image
- **Formats:** JPG, PNG, GIF, WebP

### Posting Tips
1. **Use 1 image per tweet** for maximum impact
2. **Pin the hero graphic** (00-hero.html) to your profile
3. **Post during peak hours:** 9-11 AM or 6-8 PM ET
4. **Add alt text** to images for accessibility
5. **Include hashtags:** #Sui #DeFi #AI #BuildOnSui

### Suggested Tweet + Image Pairing

| Tweet Topic | Use Graphic |
|-------------|-------------|
| Main announcement | 00-hero.html |
| Architecture/Tech overview | 01-architecture.html |
| Roadmap reveal | 02-roadmap.html |
| Tech stack details | 03-tech-stack.html |
| Feature highlights | 04-features.html |
| Progress update | 05-stats.html |

---

## 🎨 Customization

All graphics are pure HTML/CSS with no external dependencies. To customize:

1. Open the HTML file in your favorite editor
2. Modify colors, text, or layout in the `<style>` section
3. Save and refresh in browser
4. Take new screenshot

### Quick Color Changes

Find and replace hex colors:
- Purple theme: `#667eea`, `#764ba2`
- Blue theme: `#3b82f6`, `#1e3a8a`
- Green theme: `#10b981`, `#059669`
- Orange theme: `#f59e0b`, `#ea580c`

---

## 📱 Social Media Sizes

Export in these sizes for different platforms:

| Platform | Dimensions | Use |
|----------|-----------|-----|
| Twitter (post) | 1200x675 | Standard tweet |
| Twitter (card) | 1200x628 | Link preview |
| LinkedIn | 1200x627 | Post image |
| Facebook | 1200x630 | Post image |
| Instagram (square) | 1080x1080 | Feed post |
| Instagram (story) | 1080x1920 | Story |

---

## 🚀 Quick Export Script

Create `export-graphics.sh`:

```bash
#!/bin/bash

# Export all graphics using headless browser
for file in graphics/*.html; do
    name=$(basename "$file" .html)
    echo "Exporting $name..."
    bunx playwright screenshot "$file" "exports/${name}.png" --viewport-size=1200,1200
done

echo "✅ All graphics exported to exports/ folder"
```

Run it:
```bash
chmod +x export-graphics.sh
./export-graphics.sh
```

---

## 🎯 Examples

### Tweet 1: Announcement
**Image:** 00-hero.html
**Text:**
```
🐢 Introducing TortoiseOS - AI-Native DeFi on @SuiNetwork

✅ TortoiseSwap AMM LIVE on testnet
🏦 TortoiseVault with RL in TEE
🤖 First-class AI/ML integration
⚡ 95% complete, shipping fast

Let me show you what we're building 🧵👇
```

### Tweet 2: Technical Details
**Image:** 01-architecture.html
**Text:**
```
🏗️ Here's our full-stack architecture:

• Next.js 14 frontend with Magic UI
• Express API + Event Indexer
• Sui Move smart contracts
• AI optimizer with Walrus + Nautilus TEE
• Complete monitoring stack

All services running, all tests passing ✅
```

### Tweet 3: Roadmap
**Image:** 02-roadmap.html
**Text:**
```
🗺️ The TortoiseOS Roadmap

Phase 1 (NOW): AMM + Vault 🟢
Phase 2: Stablecoin + Arb Bot
Phase 3: Bridge + RWA + BTCfi
Phase 4: Privacy + Predictions

4 phases. Infinite possibilities. 🌟
```

---

## 💡 Tips

1. **Optimize file size:** Use online tools like TinyPNG to compress
2. **Test on mobile:** Preview how images look on small screens
3. **A/B test:** Try different graphics to see what resonates
4. **Engage quickly:** Reply to comments within first 30 minutes
5. **Cross-post:** Share on Discord, Telegram, Reddit too

---

## 📞 Need Help?

- Graphics not displaying? Check browser console (F12)
- Colors look wrong? Try a different browser (Chrome recommended)
- Need custom sizes? Edit viewport dimensions in export script

---

**Happy tweeting! 🐢🚀**

*Slow and steady wins the race.*
