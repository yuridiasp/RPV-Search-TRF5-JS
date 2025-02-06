import { app, BrowserWindow } from 'electron'
import { updateElectronApp } from 'update-electron-app'
import electronSquirrelStartup from 'electron-squirrel-startup'

import { Application } from './app.js'

if (electronSquirrelStartup) app.quit()

app.whenReady().then(() => {
    
    const application = new Application()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0)
        application.createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

updateElectronApp()