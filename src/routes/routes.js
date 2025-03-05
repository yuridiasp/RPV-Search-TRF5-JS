import { app, ipcMain } from 'electron'

import { openLoginWindow,
    closeLoginWindow,
    closeSobreWindow,
    getVersions,
    openGithub,
    searchRPV,
    exportarResultados,
    openDirectory,
    realizarLogin,
    openFormAddItemWindow,
    createItemParamData,
    deleteItemParamData,
    getItemParamDataById,
    readItemsParamData,
    updateItemParamData
 } from '../controller/controller.js'

export const routes = (application) => {

    ipcMain.on('abrir-janela-login', () => openLoginWindow(application))
    
    ipcMain.on('fechar-janela-login', () => closeLoginWindow(application))
    
    ipcMain.on('fechar-janela-sobre', () => closeSobreWindow(application))

    ipcMain.on('abrir-janela-form-add-item', (event, type) => openFormAddItemWindow(application, type))
    
    ipcMain.handle('get-versions', () => getVersions(app))
    
    ipcMain.on('open-github', openGithub)
    
    ipcMain.on('search-rpv', (event, dados) => searchRPV(dados, application))
    
    ipcMain.on('exportar-resultados', () => exportarResultados(application))
    
    ipcMain.on('open-directory', () => openDirectory(application))
    
    ipcMain.on('realizar-login', (event, dados) => realizarLogin(dados, application))
    
    ipcMain.on('show-message-error', (event, message) => dialog.showMessageBox(application.mainWindow, { message }))
}