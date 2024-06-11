import { app, BrowserWindow } from 'electron'

import { Application } from './app.js'

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