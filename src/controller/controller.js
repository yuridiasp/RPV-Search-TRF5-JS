import { shell, dialog } from "electron"
import { join, dirname } from "path"
import { fileURLToPath } from 'url'

import Service from '../service/service.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)


const service = new Service()

export const openLoginWindow = (application) => {
    if (!application.loginWindow) {
        const loginHtml = join(__dirname, "..", 'public', 'html', 'login.html')
        application.loginWindow = application.createWindow(loginHtml, 400, 500, {}, {
            alwaysOnTop: true,
            frame: false
        })
        application.loginWindow.on('closed', () => {
            application.loginWindow = null
        })
    }
}

export const openFormAddItemWindow = (application, type) => {
    if (!application.formAddItemWindow) {
        const formAddItemWindow = join(__dirname, "..", 'public', 'html', 'formAddItem.html')
        application.formAddItemWindow = application.createWindow(formAddItemWindow, 400, 500, {}, {
            frame: false,
            parent: application.mainWindow,
            modal: true,
            show: false
        })
        application.formAddItemWindow.on('closed', () => {
            application.formAddItemWindow = null
        })
        
        application.formAddItemWindow.webContents.send("atualizar-form", { isOAB: true, id: 1, label: "Teste", value: "Teste" })
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

export const deleteItemParamData = (id) => {

    if (!id) {
        let message = "ID do item buscado não foi passado na requisição.",
            title = "ID não informado!"
        dialog.showErrorBox(title, message)
        
        return
    }

    return service.deleteItemParamData(id)
}
    
export const updateItemParamData = (updatedItem) => {
    const { id, name, label, value } = newItem

    if (!id) {
        errors.push("id")
    }

    if (!name) {
        errors.push("name")
    }

    if (!label) {
        errors.push("label")
    }

    if (!value) {
        errors.push("value")
    }

    if (errors.length) {
        let message = "Informações faltantes: " + errors.join(", "),
            title = "Error: Campos obrigatórios não informados!"
        dialog.showErrorBox(title, message)
        
        return
    }

    return service.updateItemParamData(updatedItem.id, updatedItem)
}

export const readItemsParamData = () => {
    return service.readItemsParamData()
}

export const getItemParamDataById = (id) => {

    if (!id) {
        let message = "ID do item buscado não foi passado na requisição.",
            title = "ID não informado!"
        dialog.showErrorBox(title, message)
        
        return
    }

    return service.getItemParamDataById(id)
}

export const createItemParamData = (newItem) => {
    const errors = []
    const { name, label, value } = newItem

    if (!name) {
        errors.push("name")
    }

    if (!label) {
        errors.push("label")
    }

    if (!value) {
        errors.push("value")
    }

    if (errors.length) {
        let message = "Informações faltantes: " + errors.join(", "),
            title = "Error: Campos obrigatórios não informados!"
        dialog.showErrorBox(title, message)
        
        return
    }

    return service.createItemParamData(newItem)
}