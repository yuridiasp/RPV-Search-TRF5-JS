import { app, BrowserWindow } from 'electron'
import pkg from 'electron-updater'

import { Application } from './app.js'

const { autoUpdater } = pkg

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

autoUpdater.on('update-available', () => {
    console.log('Nova atualização disponível!')
})
  
autoUpdater.on('update-downloaded', () => {
    console.log('Atualização baixada, reiniciando...')
    autoUpdater.quitAndInstall()
})