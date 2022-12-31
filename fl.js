const { app, BrowserWindow } = require("electron");
const { exec } = require("child_process");
const path = require("path");
const { OverlayController, OVERLAY_WINDOW_OPTS } = require("electron-overlay-window");

app.disableHardwareAcceleration();

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        resizable: false,
        autoHideMenuBar: true,
        ...OVERLAY_WINDOW_OPTS,
    });
    win.loadFile("index.html");
    win.once("ready-to-show", () => {
        win.show();
    });
    OverlayController.attachByTitle(win, "osu!beta");

    // show devtools
    //win.webContents.openDevTools({ detached: true });
}

app.whenReady().then(async () => {
    exec("tasklist", async (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return;
        }
        if (!stdout.includes("osu!.exe")) {
            // create a message box if osu! is not running
            const { dialog } = require("electron");
            await dialog.showMessageBox({
                type: "error",
                title: "osu! not running",
                message: "osu! is not running. Please start osu! and try again.",
                buttons: ["Well, I suppose I could do that..."],
            });

            app.quit();
            return;
        }

        else {
            await createWindow();

            app.on("activate", () => {
                if (BrowserWindow.getAllWindows().length === 0) {
                    createWindow();
                }
            });

        }
    });

  
});


app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
