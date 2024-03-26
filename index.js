import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron'
import { join, dirname } from "path"
import { fileURLToPath } from 'url'
import Controller from "./controller/controller.js"

let mainWindow = null, sobreWindow = null, controller = null, pathExportFile = null
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dados = {
    nomeapp: app.name,
    autor: 'Yuri Dias Pereira Gomes',
    version: '1.0.0',
    electronjs: process.versions.electron,
    nodejs: process.version,
    github: 'https://github.com/yuridiasp'
}

const templateMenu = [
    {
        label: 'Arquivo',
        role: 'File',
        submenu: [
            {
                label: 'Fechar',
                role: 'quit'
            }
        ]
    },
    {
        label: 'Sobre',
        role: 'Help',
        click: async () => {
            abrirJanelaSobre()
        }
    }
]
const menu = Menu.buildFromTemplate(templateMenu)
Menu.setApplicationMenu(menu)

const createWindow = (page, width = 600, height = 800,  webPreference = {}, props = {}) => {
    const win = new BrowserWindow({
        width: width,
        height: height,
        icon: join(__dirname,'assets', 'icon.png'),
        webPreferences: {
            preload: join(__dirname, 'preload.js'),
            ...webPreference
        },
        ...props
    })
    
    win.loadFile(page)
    return win
}

function abrirJanelaSobre() {
    if (!sobreWindow) {
        const sobreHtml = join(__dirname, 'public', 'html', 'sobre.html')
        sobreWindow = createWindow(sobreHtml, 300,500, {}, {
            alwaysOnTop: true,
            frame: false
        })
        sobreWindow.on('closed', () => {
            sobreWindow = null
        })
    }
}

app.whenReady().then(() => {
    const mainHtml = join(__dirname, 'public', 'html', 'index.html')
    mainWindow = createWindow(mainHtml)
    controller = new Controller(mainWindow)
  
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('fechar-janela-sobre', () => {
    sobreWindow.close()
})

ipcMain.handle('get-versions', async () => {
    return dados
})

ipcMain.on('open-github', async () => {
    await shell.openExternal(dados.github)
})

ipcMain.on('search-rpv',async (event, dados) => {
    
    const validarDados = () => {
        const re = /\d\d\/\d\d\/\d\d/
        const { de, ate } = dados
        return re.test(de) && re.test(ate)
    }

    const validation = validarDados()
    
    if (validation) {
        const resultados = await controller.search(dados)
        
        mainWindow.webContents.send('exibir-resultado', resultados)
    } else {
        dialog.showMessageBox(mainWindow, {
            title: "Erro",
            message: "Preenchimento inválido! Favor digitar a data no formato DD/MM/AAAA"
        })
    }
})

ipcMain.on('exportar-resultados', () => {
    let message, title
    
    if (!pathExportFile) {
        message = "Escolha a pasta onde deseja salvar!",
        title = "Pasta não selecionada"
        dialog.showErrorBox(title, message)
        
        return
    }

    const result = controller.export(pathExportFile)
    
    if (result) {
        message = "Planilha exportada com sucesso! Veja em: " + pathExportFile
        title = "Sucesso!"
        dialog.showMessageBox(mainWindow, { title, message })
    } else {
        message = "Não foi possível exportar resultado. Tente novamente mais tarde.",
        title = "Erro interno"
        dialog.showErrorBox(title, message)
    }
})

ipcMain.on('open-directory', () => {
    dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    }).then(result => {
        const { canceled, filePaths } = result
        
        if (!canceled) {
            pathExportFile = filePaths[0]
            mainWindow.webContents.send('atualizar-path', pathExportFile)
        }
    }).catch(err => {
        console.log(err)
        dialog.showErrorBox(mainWindow, { title: "Erro!", content: "Houve um erro para selecionar a pasta." })
    })
})