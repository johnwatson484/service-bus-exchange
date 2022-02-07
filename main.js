const { app, BrowserWindow, ipcMain, Notification } = require('electron')
const Store = require('electron-store')
const nunjucks = require('electron-nunjucks')
const { v4: uuidv4 } = require('uuid')

nunjucks.install(app, {
  path: 'views/',
  autoescape: true,
  watch: false
})

const settingStore = new Store({
  configName: 'settings',
  defaults: {
    windowBounds: { width: 1200, height: 600 }
  }
})

const connectionStore = new Store({
  configName: 'connections',
  defaults: {
    connections: [{
      id: uuidv4(),
      name: 'FFC Service Bus',
      connectionString: 'my-connection-string'
    }]
  }
})

const createWindow = () => {
  const { width, height } = settingStore.get('windowBounds')

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width,
    height,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  mainWindow.on('resize', () => {
    const { width: newWidth, height: newHeight } = mainWindow.getBounds()
    // Now that we have them, save them using the `set` method.
    settingStore.set('windowBounds', { width: newWidth, height: newHeight })
  })

  const { connections } = connectionStore.get('connections')

  nunjucks.setContext('views/index.njk', {
    connections
  })

  // and load the index.html of the app.
  mainWindow.loadFile('views/index.njk')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.handle('show-notification', (event, ...args) => {
  const notification = {
    title: 'New Task',
    body: `Added: ${args[0]}`
  }

  new Notification(notification).show()
})
