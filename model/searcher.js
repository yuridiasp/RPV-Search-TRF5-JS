import * as cheerio from "cheerio"
import axios from "axios"

export default class Searcher {
    page = 0
    pages = 0
    progresso = 0
    contagem = 0
    keys = ['Processo Originário', 'Processo do TRF5', 'Nome', 'Data do Movimento', 'Hora do Movimento', 'Última Movimentação']
    dataDict = {}

    constructor(controller) {
        this.controller =  controller
    }

    #initValuesSearch (dados) {
        const { tipo, oab, de, ate, uf } = dados
        this.busca = { tipo, oab, de, ate, uf }
        this.keys.forEach(key => { this.dataDict[key] = [] })
    }

    async search (dados) {
        this.#initValuesSearch(dados)
        
        this.link = `https://cp.trf5.jus.br/processo/rpvprec/rpvPrecOAB/porData/${this.busca.tipo}/ativos/${this.busca.uf}000${this.busca.oab}/${this.busca.de}/${this.busca.ate}//`

        const promises = []

        let i = 0
        do {
            promises.push(await this.requesitar_dados(this.link, i))
            i++
        } while (i < this.pages)

        await Promise.all(promises)

        return true
    }

    
    calcular_pages() {
        const span = this.$(".texto_consulta")
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

    async extrair_dados() {
        const trs = this.$('table.consulta_resultados > tbody > tr')

        for (let index = 0; index < trs.length; index++) {
            try {
                if (!this.$(trs[index]).attr().id) {
                    const tds = this.$(trs[index]).find("td")
                    const tdId = this.$(trs[index+1]).find("td")
                    this.dataDict['Nome'].push(this.$(tdId[2]).text())
                    const processo = this.$(tds[1]).text() 
                    this.dataDict['Processo do TRF5'].push(processo)
                    this.dataDict['Data do Movimento'].push(this.$(tds[3]).text())
                    this.dataDict['Hora do Movimento'].push(this.$(tds[4]).text())
                    this.dataDict['Última Movimentação'].push(this.$(tds[5]).text())
                    const $ = await this.loadPageProcesso(processo)
                    this.dataDict['Processo Originário'].push($("body > table:nth-child(7) > tbody > tr:nth-child(3) > td > u").text())
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