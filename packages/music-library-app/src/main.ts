import path from "node:path";

import { cyan } from "ansis";
import { app, BrowserWindow, ipcMain, shell, UtilityProcess, utilityProcess } from "electron";

import { DEBUG } from "./common/constants";
import { ClientEventChannel, isServerEventChannel, OpenFileLocationOptions } from "./common/events";
import { createScopedLogger } from "./common/logUtils";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

// see https://www.electronforge.io/config/plugins/vite#hot-module-replacement-hmr
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

export const log = createScopedLogger("main", cyan);

let mainWindow: BrowserWindow | null = null;
let serverProcess: UtilityProcess | null = null;

const createWindow = async () => {
  // if (INSTALL_REACT_DEVELOPER_TOOLS) {
  //     await installReactDevTools();
  // }

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
      webSecurity: false,
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    await mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  log.debug(`initializing server process...`);
  // Note that server.ts must be configured as an electron-forge Vite entry point to get transpiled adjacent to this module
  serverProcess = utilityProcess.fork(path.resolve(__dirname, "./server.js"), [], {
    serviceName: "server",
    stdio: "inherit",
  });

  const clientEventsToHandleInMainProcess: ClientEventChannel[] = [
    ClientEventChannel.OPEN_FILE_LOCATION,
  ];

  for (const channel of Object.values(ClientEventChannel)) {
    ipcMain.on(channel, (_mainEvent, data: object) => {
      if (clientEventsToHandleInMainProcess.includes(channel)) {
        switch (channel) {
          case ClientEventChannel.OPEN_FILE_LOCATION:
            // N.B. this call happens _extremely slowly_ and hangs the Finder process on macOS if we
            // expose the method directly to the renderer process, so we need this level of
            // indirection to avoid that issue - see https://github.com/electron/electron/issues/17835
            shell.showItemInFolder((data as OpenFileLocationOptions).filepath);
            break;
        }
      } else {
        // forward to utility server process
        const messageToForward = {
          channel,
          data,
        };

        log.trace(`received "${channel}" event from renderer, forwarding to utility process`);

        serverProcess?.postMessage(messageToForward);
      }
    });
  }

  serverProcess.on("message", ({ channel, data }: { channel: string; data: object }) => {
    if (!isServerEventChannel(channel)) {
      return;
    }

    log.trace(`received "${channel}" message from server, forwarding to renderer process`);

    mainWindow?.webContents.send(channel, data);
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    void shell.openExternal(details.url); // Open URL in user's browser.
    return { action: "deny" }; // Prevent the app from opening the URL.
  });

  if (DEBUG) {
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  void createWindow();
});

app.on("will-quit", () => {
  // TODO: fix this, currently getting an error about the utility process being destroyed already
  // serverProcess?.postMessage({ channel: ClientEventChannel.AUDIO_FILES_SERVER_STOP });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    void createWindow();
  }
});
