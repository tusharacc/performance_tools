// main.js

// Modules to control application life and create native browser window
const { rejects } = require('assert')
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')

let mainWindow;
const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('src/index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools({mode: 'bottom'})
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on('getFile',()=>{
    return new Promise((resolve,reject)=>{
        dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] })
        .then((data)=>{
            console.log("The file selected is",data)
            resolve(data)
        })
        .catch((err)=>{
            console.error("Error",err);
            reject(err)
        })
    })
})

ipcMain.handle('getFile', async (event, someArgument) => {
    return new Promise((resolve,reject)=>{
        dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] })
        .then((data)=>{
            console.log("The file selected is",data)
            resolve(data)
        })
        .catch((err)=>{
            console.error("Error",err);
            reject(err)
        })
    })
  })

ipcMain.on('performance', (event) =>{
  dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] })
  .then((data)=>{
      console.log("The file selected is",data)
      const child = new BrowserWindow({parent: mainWindow,
        webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
          nodeIntegration: true,
          contextIsolation: false
        }});
      
        // and load the index.html of the app.
      child.loadFile('src/performance/index.html')
      
  // Open the DevTools.
      child.webContents.openDevTools({mode: 'bottom'})
      child.once('ready-to-show', () => {
        child.show();
        child.webContents.send('store-data', data);
      })
  })
  .catch((err)=>{
      console.error("Error",err);
  })
})