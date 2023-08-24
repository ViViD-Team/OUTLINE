const { app, BrowserWindow, ipcMain, dialog, nativeTheme} = require('electron');
const path = require('path');
const fs = require("fs");


// Live Reload
require('electron-reload')(__dirname, {
  electron: path.join(__dirname, '../node_modules', '.bin', 'electron'),
  awaitWriteFinish: true
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

let mainWindow;

const createWindow = () => {

  const fileOpenPath = process.argv[1];

  //TODO: Add logic for splash screen

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minHeight: 150,
    minWidth: 200,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../public/index.html'));
  if (fileOpenPath) mainWindow.webContents.once("dom-ready", () => {
    mainWindow.webContents.send("openFile", fileOpenPath)
  })
  
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

//! Safe Filepath
const app_data = path.join(process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share"), "OUTLINE");


ipcMain.on("getSaveFilePath", (event, data) => {
  let path = dialog.showSaveDialogSync({filters: [{name: "Outline Files", extensions: ["ols"]}]});
  event.returnValue = path;
});

ipcMain.on("getOpenFilePath", (event, data) => {
  let path = dialog.showOpenDialogSync({properties: ['openFile'], filters: [{name: "Outline Files", extensions: ["ols"]}]});
  event.returnValue = path;
});

ipcMain.on("sysDarkmode", (event, data) => {
  event.returnValue = nativeTheme.shouldUseDarkColors;
});

ipcMain.on("getSaveLocation", (event, data) => {
  event.returnValue = app_data;
});


//* Plugin Loading

/**
 * Holds the installed plugins as keys with information
 * about them as the values in an object.
 */
let pluginsConfig;

scanPlugins();


/**
 * Scans the .plugins directory and constructs
 * a new pluginsConfig object while keeping the
 * config of unchanged plugins.
 * 
 * @returns {object} The new pluginsConfig
 */
function scanPlugins() {
  // Check existance of dir
  if (!fs.existsSync(path.join(app_data, ".plugins"))) {
    fs.mkdirSync(path.join(app_data, ".plugins"));
    return [];
  }

  // Generate Map
  const installed = fs.readdirSync(path.join(app_data, ".plugins"), {withFileTypes: true})
    .filter(x => x.isDirectory() && x.name != ".dependencies")
    .map(x => x.name);

  let rawPluginConfig = {};
  if (fs.existsSync(path.join(app_data, ".plugins", "pluginsConfig.json"))) rawPluginConfig = JSON.parse(fs.readFileSync(path.join(app_data, ".plugins", "pluginsConfig.json")));
  
  // Push newly installed
  installed.forEach((plugin) => {
    if (plugin in rawPluginConfig) return;

    const pluginInfo = JSON.parse(fs.readFileSync(path.join(app_data, ".plugins", plugin, "plugin.json")));
    rawPluginConfig[plugin] = {
      "enabled": true,
      "name": pluginInfo.pluginName,
      "description": pluginInfo.pluginDescription,
      "version": pluginInfo.pluginVersion,
      "author": pluginInfo.pluginAuthor,
      "categoryLabel": pluginInfo.pluginCategoryLabel,
      "widgets": pluginInfo.widgets,
      "nodes": pluginInfo.nodes
    }
  });

  // Delete uninstalled
  Object.keys(rawPluginConfig).forEach(key => {
    if (!installed.includes(key)) delete rawPluginConfig[key];
  });

  pluginsConfig = rawPluginConfig;

  fs.writeFileSync(path.join(app_data, ".plugins", "pluginsConfig.json"), JSON.stringify(rawPluginConfig))

  return rawPluginConfig;
}


ipcMain.on("scanPlugins", (event, data) => {
  event.returnValue = scanPlugins();
});

ipcMain.on("getActivatedPlugins", (event, data) => {
  event.returnValue = Object.keys(pluginsConfig)
    .map(x => Object.assign(pluginsConfig[x], {"pluginID": x}))
    .filter(y => y.enabled);
});

ipcMain.on("getPluginMap", (event, data) => {
  event.returnValue = pluginsConfig;
});


ipcMain.on("setPluginActiveState", (event, data) => {
  if (!data.pluginID in pluginsConfig) {event.returnValue = null; return;}

  pluginsConfig[data.pluginID].enabled = data.state;
  fs.writeFileSync(path.join(app_data, ".plugins", "pluginsConfig.json"), JSON.stringify(pluginsConfig))

  mainWindow.webContents.send("refreshPlugins");

  event.returnValue = null;
});