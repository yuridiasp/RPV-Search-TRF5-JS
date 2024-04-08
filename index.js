import { app, BrowserWindow, ipcMain, dialog, Menu, shell } from 'electron'
import { join, dirname } from "path"
import { fileURLToPath } from 'url'
import Controller from "./controller/controller.js"

let mainWindow = null, sobreWindow = null, loginWindow = null, controller = null, pathExportFile = null
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dados = {
    nomeapp: app.name.toUpperCase().replace("-", " "),
    autor: 'Yuri Dias Pereira Gomes',
    version: '1.0.1',
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
        icon: join(__dirname,'images', 'icon.png'),
        webPreferences: {
            preload: join(__dirname, 'preload.js'),
            ...webPreference
        },
        ...props
    })
    
    win.loadFile(page)
    return win
}

ipcMain.on('abrir-janela-login', () => {
    if (!loginWindow) {
        const loginHtml = join(__dirname, 'public', 'html', 'login.html')
        loginWindow = createWindow(loginHtml, 400, 500, {}, {
            alwaysOnTop: true,
            frame: false
        })
        loginWindow.on('closed', () => {
            loginWindow = null
        })
    }
})

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
      if (BrowserWindow.getAllWindows().length === 0)
        createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('fechar-janela-sobre', () => {
    sobreWindow.close()
})

ipcMain.on('fechar-janela-login', () => {
    loginWindow.close()
    mainWindow.webContents.send('habilitar-form')
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
        dialog.showErrorBox("Erro", "Preenchimento inválido! Favor digitar a data no formato DD/MM/AAAA")
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

ipcMain.on('realizar-login', async (event, dados) => {
    try {
        const resultado = await controller.searcher.login(dados)

        if (!resultado)
            dialog.showErrorBox("Dados não encontrados.", "Verifique as informações fornecidas e tente novamente")
    
        mainWindow.webContents.send('is-logado', resultado)
    } catch (error) {
        console.log(error)
        dialog.showErrorBox("Erro no Login", "Tente novamente mais tarde.")
    }
})

ipcMain.on('show-message-error', (event, msg) => {
    const { titulo, mensagem } = msg
    dialog.showErrorBox(titulo, mensagem)
})