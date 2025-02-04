import exportToExcel from "../repositories/repository.js"
import * as cheerio from "cheerio"
import axios from "axios"
import puppeteer from 'puppeteer';

export default class Service {
    keys = ['Tipo', 'OAB/CPF', 'Processo Originário', 'Processo do TRF5', 'Requisitório', 'Nome', 'Data do Movimento', 'Hora do Movimento', 'Última Movimentação']
    
    async search(dados) {
        try {
                /* if (dados.cpf && !this.keys.includes("CPF")) {
                this.keys.splice(4, 0, "CPF")
            } */

            this.#initValuesSearch(dados)

            const promises = []

            for (let j = 0; j < this.busca.tipo.length; j++) {

                this.tipo = this.busca.tipo[j]

                for (let c = 0; c < this.busca.oab.length; c++) {
                    
                    this.title = this.busca.oab[c]
                    this.progresso = 0
                    
                    this.link = `https://cp.trf5.jus.br/processo/rpvprec/rpvPrecOAB/porData/${this.tipo}/ativos/${this.busca.oab[c]}/${this.busca.de}/${this.busca.ate}//`
                    
                    let i = 0

                    do {
                        promises.push(await this.#requesitar_dados(this.link, i))
                        i++
                    } while (i < this.pages)
                }

                if (this.busca.cpf) {
                    this.title = this.busca.cpf
                    this.progresso = 0
                    
                    this.link = `https://cp.trf5.jus.br/processo/rpvprec/filtroRPVPrec/cpfcnpj/porData/${this.tipo}/ativos/${this.busca.cpf}/${this.busca.de}/${this.busca.ate}//`
                    
                    let i = 0
    
                    do {
                        promises.push(await this.#requesitar_dados(this.link, i))
                        i++
                    } while (i < this.pages)
                }

            }
            

            await Promise.all(promises)
            
            /* if (this.keys.includes("CPF")) {
                for (const processo of this.dataDict['Processo Originário']) {
                    const cpf = await this.#buscarCPF(processo)
                    this.dataDict['CPF'].push(cpf)
                }
            }

            await this.browser.close() */

            return {'resultado': true, 'contagem': this.contagem}
        }
        catch(error) {
            console.log(error)
            return {'resultado': false, 'contagem': 0}
        }
    }

    #initValuesSearch (dados) {
        const { tipo, oab, de, ate, uf, cpf } = dados
        this.page = 0
        this.pages = 0
        this.contagem = 0
        this.dataDict = {}
        this.busca = { tipo, oab, de, ate, uf, cpf }
        this.keys.forEach(key => { this.dataDict[key] = [] })
    }

    #calcular_pages() {
        const span = this.$("#wrapper > table > tbody > tr > td > table.consulta_paginas > tbody > tr > td > table > tbody > tr > td:nth-child(1) > span")
        let quantidadeResultados = Number(span.text().split(" ")[1])

        if (!quantidadeResultados) {
            quantidadeResultados = 0
        }
        const result = Math.ceil((quantidadeResultados) / 10)
        this.contagem += quantidadeResultados
        return result
    }

    async #requesitar_dados (link, page) {

        this.$ = await this.#nextPage(link + page)

        if (page === 0) {
            this.pages = this.#calcular_pages()
        }

        this.#atualizar_progresso(this.progresso, this.pages, this.title, this.tipo)

        return this.#extrair_dados()
    }

    async #nextPage(url) {
        const content = await axios.get(url)

        return cheerio.load(content.data)
    }

    async #loadPageProcesso(processo) {
        const url = `https://cp.trf5.jus.br/processo/${processo}`
        const content = await axios.get(url)

        return cheerio.load(content.data)
    }

    async login (login, senha) {
        this.browser = await puppeteer.launch({headless: true})
        this.page = await browser.newPage()

        await this.page.goto('http://fabioribeiro.eastus.cloudapp.azure.com')

        await this.page.waitForSelector("#login")

        await this.page.type('input[name="login"]', login)
        await this.page.type('input[name="senha"]', senha)

        await this.page.keyboard.press("Enter")
        
        await this.page.waitForNavigation()

        if (this.page.url() === "http://fabioribeiro.eastus.cloudapp.azure.com/default.asp?msg=falhaLogin") {
            return false
        }
        
        await this.page.goto('http://fabioribeiro.eastus.cloudapp.azure.com/adv/processos/default.asp')

        return true
    }

    async #buscarCPF(processo) {

        await this.page.waitForSelector('input[name="bsAdvProcessosTexto"]')

        await this.page.type('input[name="bsAdvProcessosTexto"]', processo)
        
        await this.page.keyboard.press("Enter")

        await this.page.waitForNavigation()

        const cpfHtml = "body > section > section > div.fdt-espaco > div > div.fdt-pg-conteudo > div.table-responsive > table > tbody > tr > td:nth-child(5)"
        const cpfElement = await this.page.waitForSelector(cpfHtml, {visible: true})
        const cpf = await cpfElement?.evaluate(el => el.textContent)

        await this.page.evaluate(() => {
            const processoInput = document.documentElement.querySelector('input[name="bsAdvProcessosTexto"]')
            processoInput.value = ""
        })

        return cpf
    }

    async #extrair_dados() {
        const trs = this.$('table.consulta_resultados > tbody > tr')

        for (let index = 0; index < trs.length; index++) {
            try {
                if (!this.$(trs[index]).attr().id) {
                    const tds = this.$(trs[index]).find("td")
                    const tdId = this.$(trs[index+1]).find("td")
                    const processo = this.$(tds[1]).text()

                    this.dataDict['Nome'].push(this.$(tdId[2]).text())
                    this.dataDict['Processo do TRF5'].push(processo)
                    this.dataDict['Data do Movimento'].push(this.$(tds[3]).text())
                    this.dataDict['Hora do Movimento'].push(this.$(tds[4]).text())
                    this.dataDict['Última Movimentação'].push(this.$(tds[5]).text())

                    let $ = await this.#loadPageProcesso(processo)
                    const processoOriginario = $("body > table:nth-child(7) > tbody > tr:nth-child(3) > td > u").text()
                    this.dataDict['Processo Originário'].push(processoOriginario)
                    this.dataDict['Requisitório'].push($("body > table:nth-child(7) > tbody > tr:nth-child(4) > td").text().split(":")[1].trim())
                    this.dataDict['OAB/CPF'].push(this.title)

                    const tipoBusca = this.tipo === "tiporpv" ? "RPV" : "Precatório"
                    this.dataDict['Tipo'].push(tipoBusca)
                }
            }
            catch (error) {
                console.log(error);
            }
        }

        if (trs.length) {
            this.progresso++
        }
        
        this.#atualizar_progresso(this.progresso, this.pages, this.title, this.tipo)
    }

    export(path) {
        return exportToExcel(path, this)
    }

    #atualizar_progresso(atual, final, oab, tipo) {
        this.mainWindow.webContents.send('atualizar-progresso', [atual, final, oab, tipo])
    }
}