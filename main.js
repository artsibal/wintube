const { app, BrowserWindow, globalShortcut, Menu, Tray, ipcMain, nativeImage, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// ===== YT-DLP VALIDATION & CHECKING =====

// Platform-specific yt-dlp command
const YTDLP_CMD = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
const YTDLP_TIMEOUT = 30000; // 30 second timeout

// Check if yt-dlp exists
function checkYtDlp() {
  return new Promise((resolve) => {
    const check = spawn(YTDLP_CMD, ['--version'], { shell: true });
    const timeout = setTimeout(() => {
      check.kill();
      resolve(false);
    }, 5000);
    check.on('error', () => { clearTimeout(timeout); resolve(false); });
    check.on('close', (code) => { clearTimeout(timeout); resolve(code === 0); });
  });
}

// Validate YouTube video ID (security: prevent command injection)
function isValidVideoId(videoId) {
  // YouTube IDs are exactly 11 characters, alphanumeric + hyphen + underscore
  return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
}

// yt-dlp helper to extract audio URL with format info
function getAudioUrl(videoId) {
  return new Promise((resolve, reject) => {
    // Security validation
    if (!isValidVideoId(videoId)) {
      reject(new Error('Invalid video ID format'));
      return;
    }

    const ytdlp = spawn(YTDLP_CMD, [
      '-f', 'bestaudio',
      '--print', '%(url)s',
      '--print', '%(abr)s|%(asr)s|%(audio_channels)s',
      '--no-warnings',
      '--sponsorblock-remove', 'sponsor,selfpromo,interaction,intro,outro',
      `https://www.youtube.com/watch?v=${videoId}`
    ], { shell: true });

    let stdout = '';
    let stderr = '';

    // Timeout handler
    const timeout = setTimeout(() => {
      ytdlp.kill();
      reject(new Error('Request timed out'));
    }, YTDLP_TIMEOUT);

    ytdlp.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    ytdlp.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ytdlp.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0 && stdout.trim()) {
        const lines = stdout.trim().split('\n');
        const url = lines[0]; // First line is URL
        const formatInfo = lines[1] || ''; // Second line is format info
        const [abr, asr, channels] = formatInfo.split('|');
        resolve({
          url,
          bitrate: abr && abr !== 'NA' ? Math.round(parseFloat(abr)) : null,
          sampleRate: asr && asr !== 'NA' ? Math.round(parseFloat(asr) / 1000) : null,
          channels: channels && channels !== 'NA' ? parseInt(channels) : null
        });
      } else {
        reject(new Error(stderr || 'Failed to get audio URL'));
      }
    });

    ytdlp.on('error', (err) => {
      clearTimeout(timeout);
      reject(new Error('yt-dlp not found. Please install it: https://github.com/yt-dlp/yt-dlp'));
    });
  });
}

let mainWindow;
let tray = null;
let isQuitting = false;
let ytdlpAvailable = false;

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    minWidth: 700,
    minHeight: 450,
    frame: false,
    transparent: false,
    backgroundColor: '#1a1a1a',
    hasShadow: true,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
    resizable: true,
  });

  mainWindow.loadFile('index.html');

  // Check for yt-dlp and notify renderer when ready
  mainWindow.once('ready-to-show', async () => {
    ytdlpAvailable = await checkYtDlp();
    mainWindow.webContents.send('ytdlp-status', ytdlpAvailable);
    mainWindow.show();
  });

  // Minimize to tray on close, unless quitting
  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
      return false;
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create system tray
  createTray();

  // Register global media key shortcuts
  registerMediaKeys();
}

function createTray() {
  // Create a simple tray icon (green circle for "playing" aesthetic)
  const iconPath = path.join(__dirname, 'icon.ico');

  try {
    tray = new Tray(iconPath);
  } catch (e) {
    // Fallback: create a simple colored icon if ico doesn't exist
    const icon = nativeImage.createEmpty();
    tray = new Tray(icon);
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show WinTube',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      }
    },
    {
      label: 'Play/Pause',
      click: () => {
        mainWindow.webContents.send('media-control', 'playpause');
      }
    },
    {
      label: 'Next Track',
      click: () => {
        mainWindow.webContents.send('media-control', 'next');
      }
    },
    {
      label: 'Previous Track',
      click: () => {
        mainWindow.webContents.send('media-control', 'prev');
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('WinTube Player');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  tray.on('double-click', () => {
    mainWindow.show();
    mainWindow.focus();
  });
}

function registerMediaKeys() {
  // Try to register global media keys
  try {
    globalShortcut.register('MediaPlayPause', () => {
      mainWindow.webContents.send('media-control', 'playpause');
    });

    globalShortcut.register('MediaNextTrack', () => {
      mainWindow.webContents.send('media-control', 'next');
    });

    globalShortcut.register('MediaPreviousTrack', () => {
      mainWindow.webContents.send('media-control', 'prev');
    });

    globalShortcut.register('MediaStop', () => {
      mainWindow.webContents.send('media-control', 'stop');
    });
  } catch (e) {
    console.log('Could not register media keys:', e);
  }
}

// IPC handlers for window controls (since we're frameless)
ipcMain.on('window-minimize', () => {
  mainWindow.minimize();
});

ipcMain.on('window-close', () => {
  mainWindow.hide();
});

ipcMain.on('window-quit', () => {
  isQuitting = true;
  app.quit();
});

ipcMain.on('window-toggle-always-on-top', () => {
  const isOnTop = mainWindow.isAlwaysOnTop();
  mainWindow.setAlwaysOnTop(!isOnTop);
});

// Handle audio URL requests from renderer
ipcMain.handle('get-audio-url', async (event, videoId) => {
  try {
    const result = await getAudioUrl(videoId);
    return {
      success: true,
      url: result.url,
      bitrate: result.bitrate,
      sampleRate: result.sampleRate,
      channels: result.channels
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Check yt-dlp status
ipcMain.handle('check-ytdlp', async () => {
  return await checkYtDlp();
});

// Search YouTube via yt-dlp
ipcMain.handle('search-youtube', async (event, query) => {
  return new Promise((resolve) => {
    // Sanitize query - remove pipe characters to prevent parsing issues
    const safeQuery = query.replace(/\|/g, ' ');

    const ytdlp = spawn(YTDLP_CMD, [
      `ytsearch25:${safeQuery}`,
      '--flat-playlist',
      '--print', '%(id)s\t%(title)s\t%(channel)s\t%(duration)s\t%(thumbnail)s',
      '--no-warnings'
    ], { shell: true });

    let stdout = '';
    let stderr = '';

    // Timeout handler
    const timeout = setTimeout(() => {
      ytdlp.kill();
      resolve({ success: false, error: 'Search timed out' });
    }, YTDLP_TIMEOUT);

    ytdlp.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    ytdlp.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ytdlp.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0 && stdout.trim()) {
        const results = stdout.trim().split('\n').map(line => {
          const [id, title, channel, duration, thumbnail] = line.split('\t');
          return {
            videoId: id,
            title: title || 'Unknown',
            author: channel || 'Unknown',
            lengthSeconds: parseInt(duration) || 0,
            thumbnail: thumbnail || ''
          };
        }).filter(r => r.videoId && r.videoId.length === 11);
        resolve({ success: true, results });
      } else {
        resolve({ success: false, error: stderr || 'Search failed' });
      }
    });

    ytdlp.on('error', () => {
      clearTimeout(timeout);
      resolve({ success: false, error: 'yt-dlp not found' });
    });
  });
});

// Fetch YouTube playlist videos
ipcMain.handle('get-playlist-videos', async (event, playlistId) => {
  return new Promise((resolve) => {
    // Validate playlist ID format
    if (!/^[a-zA-Z0-9_-]+$/.test(playlistId)) {
      resolve({ success: false, error: 'Invalid playlist ID' });
      return;
    }

    const ytdlp = spawn(YTDLP_CMD, [
      `https://www.youtube.com/playlist?list=${playlistId}`,
      '--flat-playlist',
      '--print', '%(id)s\t%(title)s\t%(channel)s\t%(duration)s\t%(thumbnail)s',
      '--no-warnings'
    ], { shell: true });

    let stdout = '';
    let stderr = '';

    const timeout = setTimeout(() => {
      ytdlp.kill();
      resolve({ success: false, error: 'Playlist fetch timed out' });
    }, 60000); // 60 seconds for playlists

    ytdlp.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    ytdlp.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ytdlp.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0 && stdout.trim()) {
        const results = stdout.trim().split('\n').map(line => {
          const [id, title, channel, duration, thumbnail] = line.split('\t');
          return {
            videoId: id,
            title: title || 'Unknown',
            author: channel || 'Unknown',
            lengthSeconds: parseInt(duration) || 0,
            thumbnail: thumbnail || ''
          };
        }).filter(r => r.videoId && r.videoId.length === 11);
        resolve({ success: true, results });
      } else {
        resolve({ success: false, error: stderr || 'Failed to fetch playlist' });
      }
    });

    ytdlp.on('error', () => {
      clearTimeout(timeout);
      resolve({ success: false, error: 'yt-dlp not found' });
    });
  });
});

// Fetch single video metadata
ipcMain.handle('get-video-info', async (event, videoId) => {
  return new Promise((resolve) => {
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      resolve({ success: false, error: 'Invalid video ID' });
      return;
    }

    const ytdlp = spawn(YTDLP_CMD, [
      `https://www.youtube.com/watch?v=${videoId}`,
      '--print', '%(title)s\t%(channel)s\t%(duration)s',
      '--no-warnings',
      '--skip-download'
    ], { shell: true });

    let stdout = '';

    const timeout = setTimeout(() => {
      ytdlp.kill();
      resolve({ success: false, error: 'Timed out' });
    }, 15000);

    ytdlp.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    ytdlp.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0 && stdout.trim()) {
        const [title, channel, duration] = stdout.trim().split('\t');
        resolve({
          success: true,
          title: title || 'Unknown',
          channel: channel || 'Unknown',
          duration: parseInt(duration) || 0
        });
      } else {
        resolve({ success: false, error: 'Failed to get video info' });
      }
    });

    ytdlp.on('error', () => {
      clearTimeout(timeout);
      resolve({ success: false, error: 'yt-dlp not found' });
    });
  });
});

// Open file dialog for local audio files
ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'wma'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (result.canceled) {
    return [];
  }

  return result.filePaths;
});

// App events
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
