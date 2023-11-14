const path = require("path");
const os = require("os");
const jimp = require("jimp");
const fs = require("fs");
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const electronIsDev = require("electron-is-dev");

const isMac = process.platform === "darwin";

let mainWindow;
let aboutWindow;

// Main Window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    minWidth: 400,
    minHeight: 500,
    width: 600,
    height: 800,
    icon: path.join(__dirname, "./renderer/images/nbg.ico"),
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // mainWindow.loadURL(`file://${__dirname}/renderer/index.html`);
  mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));

  // Show devtools automatically if in development
  if (electronIsDev) {
    mainWindow.webContents.openDevTools();
  }
}

// About Window
function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    width: 400,
    height: 600,
    title: "About Electron",
    icon: `${__dirname}/renderer/images/nbg.ico`,
    parent: mainWindow,
    modal: true,
  });

  aboutWindow.setMenu(null);
  aboutWindow.loadFile(path.join(__dirname, "./renderer/about.html"));
}

// When the app is ready, create the window
app.on("ready", () => {
  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  // Remove variable from memory
  mainWindow.on("closed", () => (mainWindow = null));
});

// Menu template
const menu = [
  {
    label: "File",
    submenu: [
      { role: "reload", accelerator: "CmdOrCtrl+R" },
      { label: "Quit", click: () => app.quit(), accelerator: "CmdOrCtrl+Q" },
    ],
  },
  {
    label: "About",
    submenu: [
      {
        label: "imgsec ?",
        click: createAboutWindow,
      },
    ],
  },
];

//Catch Image through ipc renderer process
ipcMain.on("image:encrypt", (e, options) => {
  // console.log(options);
  options.dest = path.join(os.homedir(), "imgsec");
  encryptImage(options);
});

//Image Encryption and Save Encrypted Image and Key File to the Destination
async function encryptImage({ imgPath, dest }) {
  try {
    // get the base name of the file
    const fileName = path.basename(imgPath);

    // remove the extension from the file name
    const fileNameWithoutExtension = fileName.split(".")[0];

    const image = await jimp.read(imgPath);

    // get the image extension using jimp
    const extension = image.getExtension();

    // handle the outputImageFileName flag
    let outputImageFile = `${fileNameWithoutExtension}_encrypted.${extension}`;

    // get the rgba values of the image
    const rgba = image.bitmap.data;

    // get the length of the rgba array
    const length = rgba.length;

    // generate random key for encryption for each pixel between 0 and 255
    const key = [];
    for (let i = 0; i < length; i++) {
      key.push(Math.floor(Math.random() * 256));
    }

    // loop through the rgba array
    await new Promise((resolve) => {
      for (let i = 0; i < length; i++) {
        const k = key[i];
        rgba[i] = rgba[i] ^ k;
      }

      // save the image with _encrypted appended to the file name
      image.bitmap.data = rgba;
      resolve();
    });

    //Save Encrypted Image in the Destination Folder
    image.write(path.join(dest, outputImageFile));

    // Create destination folder if it doesn't exist
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    // handle outputKeyFileName flag
    let outputKeyFile = `${fileNameWithoutExtension}_key.txt`;

    //Save Encrypted Key File to the Destination Folder
    fs.writeFileSync(
      path.join(dest, outputKeyFile),
      Buffer.from(key).toString("base64")
    );

    // Open the folder in the file explorer
    shell.openPath(dest);
  } catch (err) {
    console.log(err);
  }
}

//Catch Encrypted Image and Key File through ipc renderer process
ipcMain.on("image:decrypt", (e, options) => {
  options.dest = path.join(os.homedir(), "imgsec");
  decryptImage(options);
});

async function decryptImage({ imgPath, keyPath, dest }) {
  try {
    const image = await jimp.read(imgPath);
    const extension = image.getExtension();
    const rgba = image.bitmap.data;
    const length = rgba.length;

    const key = fs.readFileSync(keyPath, "utf8");
    const keyDecoded = Buffer.from(key, "base64");
    const keyArray = Array.from(keyDecoded);

    // Handle key length if it's shorter than image data
    const repeatedKey = Array.from(
      { length },
      (_, i) => keyArray[i % keyArray.length]
    );

    for (let i = 0; i < length; i++) {
      rgba[i] = rgba[i] ^ repeatedKey[i];
    }

    const parsedPath = path.parse(imgPath);
    const decryptedFileName = `${parsedPath.name}_decrypted${parsedPath.ext}`;

    const decryptedImageFilePath = path.join(dest, decryptedFileName);

    image.bitmap.data = rgba;
    image.write(decryptedImageFilePath);

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    shell.openPath(dest);
  } catch (err) {
    console.error(err);
  }
}

ipcMain.on("reload:window", (e, options) => {
  mainWindow.reload();
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  if (!isMac) app.quit();
});

// Open a window if none are open (macOS)
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});
