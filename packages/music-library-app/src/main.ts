import { app, BrowserWindow, utilityProcess, ipcMain, UtilityProcess } from "electron";
import path from "node:path";
import { ClientEventChannel, ServerEventChannel, isServerEventChannel } from "./events";
import { DEBUG } from "./common/constants";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
    app.quit();
}

// see https://www.electronforge.io/config/plugins/vite#hot-module-replacement-hmr
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

let mainWindow: BrowserWindow | null = null;
let serverProcess: UtilityProcess | null = null;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, "preload.js"),
            webSecurity: false,
        },
    });

    // and load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(
            path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
        );
    }

    // Note that server.ts must be configured as an electron-forge Vite entry point to get transpiled adjacent to this module
    serverProcess = utilityProcess.fork(path.resolve(__dirname, "./server.js"), [], {
        serviceName: "server",
        stdio: "inherit",
    });

    for (const channel of Object.values(ClientEventChannel)) {
        ipcMain.on(channel, (_mainEvent, data) => {
            const messageToForward = {
                channel,
                data,
            };

            if (DEBUG) {
                console.log(
                    `[main] received "${channel}" event from renderer, forwarding to utility process`,
                    messageToForward,
                );
            }

            serverProcess?.postMessage(messageToForward);
        });
    }

    serverProcess.on("message", ({ channel, data }) => {
        if (!isServerEventChannel(channel)) {
            return;
        }

        if (DEBUG) {
            console.log(
                `[main] received "${channel}" message from server, forwarding to renderer process`,
            );
        }

        mainWindow?.webContents.send(channel, data);
    });

    mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

app.on("will-quit", () => {
    serverProcess?.postMessage({ channel: ClientEventChannel.AUDIO_FILES_SERVER_STOP });
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
        createWindow();
    }
});
