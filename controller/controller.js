import exportToExcel from "../utils/exporter.js"
import Searcher from "../model/searcher.js"

export default class Controller {
    constructor (window) {
        this.searcher = new Searcher(this)
        this.mainWindow = window
    }
    
    async search(dados) {
        try {
            const resultBusca = await this.searcher.search(dados)
            return {'resultado': resultBusca, 'contagem': this.searcher.contagem}
        }
        catch(error) {
            console.log(error)
            return {'resultado': false, 'contagem': 0}
        }
    }

    export(path) {
        try {
            exportToExcel(path, this.searcher)
            
            return true
        }
        catch (error) {
            console.log(error)
            return false
        }
    }

    atualizar_progresso(atual, final) {
        this.mainWindow.webContents.send('atualizar-progresso', [atual, final])
    }
}