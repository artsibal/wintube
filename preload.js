const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  close: () => ipcRenderer.send('window-close'),
  quit: () => ipcRenderer.send('window-quit'),
  toggleAlwaysOnTop: () => ipcRenderer.send('window-toggle-always-on-top'),

  // Media control listeners
  onMediaControl: (callback) => {
    ipcRenderer.on('media-control', (event, action) => callback(action));
  },

  // Get audio URL via yt-dlp
  getAudioUrl: (videoId) => ipcRenderer.invoke('get-audio-url', videoId),

  // Check if yt-dlp is available
  checkYtDlp: () => ipcRenderer.invoke('check-ytdlp'),

  // Search YouTube via yt-dlp
  searchYouTube: (query) => ipcRenderer.invoke('search-youtube', query),

  // Fetch YouTube playlist videos
  getPlaylistVideos: (playlistId) => ipcRenderer.invoke('get-playlist-videos', playlistId),

  // Get single video metadata
  getVideoInfo: (videoId) => ipcRenderer.invoke('get-video-info', videoId),

  // Listen for yt-dlp status on startup
  onYtdlpStatus: (callback) => {
    ipcRenderer.on('ytdlp-status', (event, available) => callback(available));
  },

  // Open file dialog for local audio files
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog')
});
