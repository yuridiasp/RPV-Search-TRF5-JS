import { shell, dialog } from "electron"

import Service from '../service/service.js'

const service = new Service()

export const openLoginWindow = ({ loginWindow }) => {
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
}

export const closeSobreWindow = ({ sobreWindow }) => {
    sobreWindow.close()
}

export const closeLoginWindow = ({ loginWindow, mainWindow }) => {
    loginWindow.close()
    mainWindow.webContents.send('habilitar-form')
}

export const getVersions = async (app) => {
    return {
        nomeapp: app.name.toUpperCase().replace("-", " "),
        autor: 'Yuri Dias Pereira Gomes',
        version: app.getVersion(),
        electronjs: process.versions.electron,
        nodejs: process.version
    }
}

export const openGithub = async () => {
    await shell.openExternal('https://github.com/yuridiasp')
}

export const searchRPV = async (dados, { mainWindow }) => {

    service.mainWindow = mainWindow
    
    const validarDados = () => {
        const re = /\d\d\/\d\d\/\d\d/
        const { de, ate } = dados
        return re.test(de) && re.test(ate)
    }

    const validation = validarDados()
    
    if (validation) {
        const resultados = await service.search(dados)
        
        mainWindow.webContents.send('exibir-resultado', resultados)
    } else {
        dialog.showErrorBox("Erro", "Preenchimento inválido! Favor digitar a data no formato DD/MM/AAAA")
    }
}

export const exportarResultados = ({ pathExportFile, mainWindow }) => {
    let message, title
    
    if (!pathExportFile) {
        message = "Escolha a pasta onde deseja salvar!",
        title = "Pasta não selecionada"
        dialog.showErrorBox(title, message)
        
        return
    }

    const result = service.export(pathExportFile)
    
    if (result) {
        message = "Planilha exportada com sucesso! Veja em: " + pathExportFile
        title = "Sucesso!"
        dialog.showMessageBox(mainWindow, { title, message })
    } else {
        message = "Feche o processo que está fazendo uso do arquivo ou salve em uma pasta diferente."
        title = "O arquivo está sendo usado por outro processo"
        dialog.showErrorBox(title, message)
    }
}

export const openDirectory = (application) => {
    dialog.showOpenDialog(application.mainWindow, {
        properties: ['openDirectory']
    }).then(result => {
        const { canceled, filePaths } = result
        
        if (!canceled) {
            application.pathExportFile = filePaths[0]
            application.mainWindow.webContents.send('atualizar-path', application.pathExportFile)
        }
    }).catch(err => {
        console.log(err)
        dialog.showErrorBox(mainWindow, { title: "Erro!", content: "Houve um erro para selecionar a pasta." })
    })
}

export const realizarLogin = async (dados, { mainWindow }) => {
    try {
        const resultado = await service.login(dados)

        if (!resultado)
            dialog.showErrorBox("Dados não encontrados.", "Verifique as informações fornecidas e tente novamente")
    
        mainWindow.webContents.send('is-logado', resultado)
    } catch (error) {
        console.log(error)
        dialog.showErrorBox("Erro no Login", "Tente novamente mais tarde.")
    }
}

export const showMessage = (msg) => {
    const { titulo, mensagem } = msg
    dialog.showErrorBox(titulo, mensagem)
}