import { Menu, BrowserWindow } from "electron"
import { join, dirname } from "path"
import { fileURLToPath } from 'url'

import { routes } from './routes/routes.js'
import { templateMenu } from './utils/template-menu.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export class Application {
    sobreWindow = null
    loginWindow = null
    pathExportFile = null
    formAddItemWindow = null

    constructor() {
        const mainWindowPath = ['public', 'html', 'index.html']
        
        //this.setMenu()

        this.mainWindow = this.createWindow(join(__dirname, ...mainWindowPath))

        routes(this)
    }

    setMenu() {
        const template = templateMenu(this.abrirJanelaSobre)
        const menu = Menu.buildFromTemplate(template)
        Menu.setApplicationMenu(menu)
    }

    createWindow = (page, width = 600, height = 800,  webPreference = {}, props = {}) => {
        const iconPath = ['images', 'icon.png']
        const preloadFile = 'preload.js'
        const win = new BrowserWindow({
            width: width,
            height: height,
            icon: join(__dirname, ...iconPath),
            webPreferences: {
                preload: join(__dirname, preloadFile),
                ...webPreference
            },
            ...props
        })
        
        win.loadFile(page)
        return win
    }

    abrirJanelaSobre = () => {
        if (!this.sobreWindow) {
            const sobreWindowPath = ['public', 'html', 'sobre.html']
            const sobreHtml = join(__dirname, ...sobreWindowPath)
            const width = 300
            const height = 500
            this.sobreWindow = this.createWindow(sobreHtml, width, height, {}, {
                alwaysOnTop: true,
                frame: false
            })

            this.sobreWindow.on('closed', () => {
                this.sobreWindow = null
            })
        }
    }
}