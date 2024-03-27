import * as cheerio from "cheerio"
import axios from "axios"
import puppeteer from 'puppeteer';

export default class Searcher {
    page = 0
    pages = 0
    contagem = 0
    keys = ['Processo Originário', 'Processo do TRF5', 'Requisitório', 'Nome', 'Data do Movimento', 'Hora do Movimento', 'Última Movimentação']
    dataDict = {}

    constructor(controller) {
        this.controller =  controller
    }

    #initValuesSearch (dados) {
        const { tipo, oab, de, ate, uf } = dados
        this.busca = { tipo, oab, de, ate, uf }
        this.progresso = 0
        this.keys.forEach(key => { this.dataDict[key] = [] })
    }

    async search (dados) {
        /* let page = null, browser = null

        if (dados.cpf && !this.keys.includes("CPF")) {
            this.keys.splice(4, 0, "CPF")
            browser = await puppeteer.launch({headless: true})
            page = await browser.newPage()
            await this.login(page, "Yuri Dias", "yuri#036",)
        } */

        this.#initValuesSearch(dados)
        
        this.link = `https://cp.trf5.jus.br/processo/rpvprec/rpvPrecOAB/porData/${this.busca.tipo}/ativos/${this.busca.uf}000${this.busca.oab}/${this.busca.de}/${this.busca.ate}//`

        const promises = []

        let i = 0
        do {
            promises.push(await this.requesitar_dados(this.link, i))
            i++
        } while (i < this.pages)

        await Promise.all(promises)
        
        /* if (this.keys.includes("CPF")) {
            for (const processo of this.dataDict['Processo Originário']) {
                const cpf = await this.buscarCPF(page, processo)
                this.dataDict['CPF'].push(cpf)
            }
        }

        await browser.close() */

        return true
    }

    
    calcular_pages() {
        const span = this.$("#wrapper > table > tbody > tr > td > table.consulta_paginas > tbody > tr > td > table > tbody > tr > td:nth-child(1) > span")
        const quantidadeResultados = Number(span.text().split(" ")[1])
        const result = Math.ceil(quantidadeResultados / 10)
        this.contagem = quantidadeResultados
        return result
    }

    async requesitar_dados (link, page) {

        this.$ = await this.nextPage(link + page)

        if (page === 0) {
            this.pages = this.calcular_pages()
        }

        this.controller.atualizar_progresso(this.progresso, this.pages)

        return this.extrair_dados()
    }

    async nextPage(url) {
        const content = await axios.get(url)

        return cheerio.load(content.data)
    }

    async loadPageProcesso(processo) {
        const url = `https://cp.trf5.jus.br/processo/${processo}`
        const content = await axios.get(url)

        return cheerio.load(content.data)
    }

    async login (page, login, senha) {
        await page.goto('http://fabioribeiro.eastus.cloudapp.azure.com')

        await page.waitForSelector("#login")

        await page.type('input[name="login"]', login)
        await page.type('input[name="senha"]', senha)

        await page.keyboard.press("Enter")
        
        await page.waitForNavigation()
        
        await page.goto('http://fabioribeiro.eastus.cloudapp.azure.com/adv/processos/default.asp')
    }

    async buscarCPF(page, processo) {

        await page.waitForSelector('input[name="bsAdvProcessosTexto"]')

        await page.type('input[name="bsAdvProcessosTexto"]', processo)
        
        await page.keyboard.press("Enter")

        await page.waitForNavigation()

        const cpfHtml = "body > section > section > div.fdt-espaco > div > div.fdt-pg-conteudo > div.table-responsive > table > tbody > tr > td:nth-child(5)"
        const cpfElement = await page.waitForSelector(cpfHtml, {visible: true})
        const cpf = await cpfElement?.evaluate(el => el.textContent)

        await page.evaluate(() => {
            const processoInput = document.documentElement.querySelector('input[name="bsAdvProcessosTexto"]')
            processoInput.value = ""
        })

        return cpf
    }

    async extrair_dados() {
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
                    let $ = await this.loadPageProcesso(processo)
                    const processoOriginario = $("body > table:nth-child(7) > tbody > tr:nth-child(3) > td > u").text()
                    this.dataDict['Processo Originário'].push(processoOriginario)
                    this.dataDict['Requisitório'].push($("body > table:nth-child(7) > tbody > tr:nth-child(4) > td").text().split(":")[1].trim())
                }
            }
            catch (error) {
                console.log(error);
            }
        }
        this.progresso++
        
        this.controller.atualizar_progresso(this.progresso, this.pages)
    }
}