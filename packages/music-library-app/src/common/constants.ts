export const DEBUG = true;

// HACKHACK: this is currently not working, tried various packages (electron-devtools-installer,
// electron-devtools-vendor, and standalone react-devtools), and nothing seems to work with the current combination of
// Chromium, Electron, React, and the devtools extension. Likely due to https://github.com/facebook/react/issues/25939.
export const INSTALL_REACT_DEVELOPER_TOOLS = false;

export const LOCAL_STORAGE_KEY = "music-library-app";
export const AUTO_LOAD_LIBRARY = true;
// HACKHACK: need a better default
export const DEFAULT_AUDIO_FILES_ROOT_FOLDER = "/Volumes/CZSSD/music/tracks";
export const DEFAULT_AUDIO_FILES_SERVER_PORT = 8457;

export const LOAD_SWINSIAN_LIBRARY_TIMEOUT = 10000;
export const WRITE_AUDIO_FILE_TAG_TIMEOUT = 2000;
export const WRITE_MODIFIED_LIBRARY_TIMEOUT = 20000;
export const ANALYZE_AUDIO_FILE_TIMEOUT = 4000;
