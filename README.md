# WinTube Player

**A nostalgic Winamp-inspired YouTube audio player for the modern age**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20macOS-blue.svg)](#building)
[![Electron](https://img.shields.io/badge/Electron-28.x-47848F.svg)](https://electronjs.org/)

---

## Overview

WinTube Player brings back the classic Winamp aesthetic while harnessing the power of modern technology. Stream audio from YouTube without restrictions, manage playlists, and enjoy a real equalizer and spectrum visualizer - all wrapped in a nostalgic interface.

**Key Highlights:**
- Plays audio from **any** YouTube video (no embedding restrictions)
- SponsorBlock integration automatically skips sponsors and intros
- Real 10-band equalizer that actually affects audio
- Live spectrum visualizer showing real frequencies
- Works completely offline with local audio files

---

## Features

### Audio Playback
- **YouTube Audio Streaming** - Extract and play audio from any YouTube video via yt-dlp
- **Local File Support** - Play MP3, WAV, OGG, FLAC, M4A, AAC, and WMA files
- **SponsorBlock Integration** - Automatically skips sponsors, intros, outros, and self-promotion
- **Gapless Playback** - Preloads next track for seamless transitions
- **Smart URL Caching** - Cached audio URLs with auto-refresh on expiration
- **Real Bitrate Display** - Shows actual bitrate, sample rate, and channels from stream

### Interface
- **Classic Winamp Design** - Authentic retro look and feel
- **Shade Mode** - Compact mini-player mode (press `=` button)
- **Resizable Panels** - Drag the divider to resize search/playlist panels
- **Always-on-Top** - Pin the player above other windows
- **System Tray** - Minimize to tray, control playback from tray menu

### Audio Processing
- **10-Band Equalizer** - Adjustable frequency bands from 60Hz to 16kHz
- **EQ Presets** - Rock, Pop, Jazz, Classical, Bass Boost, and more
- **Preamp Control** - Master gain adjustment
- **Real-time Spectrum Visualizer** - Live frequency analysis with peak indicators

### Playlist Management
- **YouTube Search** - Search YouTube directly from the app
- **Playlist URL Support** - Paste a YouTube playlist URL to import all tracks
- **Drag & Drop** - Drop local files or YouTube URLs onto the player
- **Drag to Reorder** - Rearrange tracks by dragging
- **Deduplication** - Prevents adding duplicate tracks
- **Export/Import** - Save and load playlists as JSON files
- **Persistent Storage** - Playlists survive app restarts

### System Integration
- **Global Media Keys** - Control playback with keyboard media buttons
- **Single Instance** - Prevents multiple instances from running
- **Cross-Platform** - Works on Windows, Linux, and macOS

---

## Requirements

### Prerequisites
- **[Node.js](https://nodejs.org/)** v18 or later (for development/building)
- **[yt-dlp](https://github.com/yt-dlp/yt-dlp)** - Required for YouTube functionality

### Installing yt-dlp

**Windows:**
```bash
winget install yt-dlp
```

**Linux:**
```bash
# Using pip
pip install yt-dlp

# Or download binary
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

**macOS:**
```bash
brew install yt-dlp
```

Ensure `yt-dlp` is accessible from your system PATH.

---

## Installation

### From Release (Recommended)
1. Download the latest release for your platform from the [Releases](../../releases) page
2. **Windows:** Run `WinTube-Portable.exe` or use the installer
3. **Linux:** Make the AppImage executable and run it
4. **macOS:** Open the DMG and drag to Applications

### From Source
```bash
# Clone the repository
git clone https://github.com/yourusername/wintube.git
cd wintube

# Install dependencies
npm install

# Run in development mode
npm start
```

---

## Building

### Windows
```bash
# Interactive build script (recommended)
build.bat

# Or use npm directly:
npm run build              # Portable .exe
npm run build:installer    # NSIS installer
```

### Linux
```bash
npm run build:linux        # AppImage
```
> Note: Linux builds must be run on a Linux system (or via WSL/Docker)

### macOS
```bash
npm run build:mac          # DMG
```
> Note: macOS builds must be run on macOS

Built files will be in the `dist` folder.

---

## Usage

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `Left Arrow` | Previous track |
| `Right Arrow` | Next track |
| `Up Arrow` | Volume up |
| `Down Arrow` | Volume down |
| `X` | Stop playback |
| `S` | Toggle shuffle |
| `R` | Toggle repeat all |
| `O` | Toggle repeat one |
| `E` | Toggle equalizer panel |
| `T` | Toggle always-on-top |
| `1` | Toggle search panel |
| `2` | Toggle playlist panel |

### Tips & Tricks

- **Paste YouTube URLs** directly into the search box - videos and playlists are auto-detected
- **Drag & drop** local audio files or YouTube URLs onto the player
- **Click the time display** to toggle between elapsed and remaining time
- **Click the `X` button** to minimize to system tray (right-click tray for menu)
- **Double-click tray icon** to restore the window
- **Shade mode** (`=` button) provides a compact mini-player view
- **Drag the panel divider** to resize the search/playlist area

---

## Custom Icon

Replace `icon.ico` (Windows), `icon.png` (Linux), or `icon.icns` (macOS) with your own icon file:
- **Windows:** 256x256 .ico file
- **Linux:** 256x256 or larger .png file
- **macOS:** .icns file with multiple resolutions

---

## Troubleshooting

### "yt-dlp not found" warning
- Ensure yt-dlp is installed and in your system PATH
- Try running `yt-dlp --version` in a terminal to verify
- Restart the application after installing yt-dlp

### Audio not playing / "Error playing track"
- Update yt-dlp to the latest version: `yt-dlp -U`
- Check your internet connection
- Some videos may be region-locked or age-restricted

### No sound from equalizer
- Make sure the EQ panel is visible (press `E`)
- Check that the preamp isn't set too low
- Try the "Flat" preset to reset all bands

---

## Technology Stack

- **[Electron](https://electronjs.org/)** - Cross-platform desktop framework
- **[yt-dlp](https://github.com/yt-dlp/yt-dlp)** - YouTube audio extraction
- **[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)** - Real-time audio processing
- **[electron-builder](https://www.electron.build/)** - Application packaging

---

## Legal Disclaimer

**WinTube Player is provided for personal and educational use only.**

This application uses yt-dlp to stream audio from YouTube. Users are responsible for ensuring their use complies with:

- YouTube's [Terms of Service](https://www.youtube.com/t/terms)
- Applicable copyright laws in their jurisdiction
- Content creators' rights and licensing terms

**Important notices:**
- This software does not host, store, or redistribute any copyrighted content
- Audio is streamed directly from YouTube's servers via yt-dlp
- The developers are not responsible for how users choose to use this software
- Downloading or distributing copyrighted content without permission may be illegal in your country

**SponsorBlock data** is provided by the [SponsorBlock](https://sponsor.ajay.app/) community project.

---

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Acknowledgments

- Inspired by the legendary [Winamp](https://www.winamp.com/) media player
- Audio extraction powered by [yt-dlp](https://github.com/yt-dlp/yt-dlp)
- Sponsor skipping via [SponsorBlock](https://sponsor.ajay.app/)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License - Copyright (c) 2024 WinTube

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

<p align="center">
  <b>WinTube Player v4.0</b><br>
  Made with nostalgia and modern code
</p>
