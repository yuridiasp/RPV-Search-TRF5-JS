const inputPath = document.querySelector("#path")
const formBusca = document.querySelector("#formulario-busca")
const resultsSection = document.querySelector("#results")
const btnExportToExcel = document.querySelector("#export-to-excel")
const resultadoMessage = document.querySelector("#results-message")
const progressoMessage = document.querySelector("#progresso")
const btnPath = document.querySelector("#path")

let busca = null

function patternDateInput(value) {
    const regex = /\d{2}\/\d{2}\/\d{2}/

    if (!regex.test(value)) {
        "".substring()
    }

    return value
}

function exibirProgresso() {
    resultadoMessage.innerHTML = ""
    resultsSection.style.display = "flex"
}

function ocultarProgresso() {
    progressoMessage.innerHTML = ""
    resultsSection.style.display = "none"
}


function changeDisabledInputs (value) {
    //const { dataDe, dataAte, oab, tipo } = formBusca
    //const elements = [dataDe, dataAte, oab, tipo]
    
    const { dataDe, dataAte, oab, tipo, cpf } = formBusca
    const elements = [dataDe, dataAte, oab, tipo, cpf]

    elements.forEach(e => {
        if (value)
            e.setAttribute("disabled", value)
        else
            e.removeAttribute("disabled")
    })
}

btnPath.addEventListener('click', () => {
    window.API.openDirectory()
})

btnExportToExcel.addEventListener('click', () =>  {
    window.API.exportarResultados()
})

inputPath.addEventListener('input', event => {
    event.preventDefault()
})

formBusca.addEventListener('submit', event => {
    event.preventDefault()
    btnExportToExcel.style.display = "none"
    //const { dataDe, dataAte, oab, tipo, uf } = formBusca
    const { dataDe, dataAte, oab, tipo, uf, cpf } = formBusca
    busca = { de: dataDe.value, ate: dataAte.value, oab: oab.value, tipo: tipo.value, uf: uf.value, cpf: (cpf.value === "on") }
    changeDisabledInputs(true)
    exibirProgresso()
    //window.API.searchRPV({ de: dataDe.value, ate: dataAte.value, oab: oab.value, tipo: tipo.value, uf: uf.value })
    if (!busca.cpf)
        window.API.searchRPV(busca)
    else
        window.API.abrirJanelaLogin()
})

window.API.atualizarProgresso((resposta) => {
    const [atual, final] = resposta
    const progresso = `${atual} de ${final} páginas.`
    
    progressoMessage.innerHTML = progresso
})

window.API.atualizarPath((path) => {
    const displayedPath = document.querySelector("#displayedPath")

    displayedPath.innerHTML = path
})

window.API.isLogado((resposta) => {
    if (resposta) {
        window.API.searchRPV(busca)
    } else {
        
    }
})

window.API.habilitarForm(() => {
    changeDisabledInputs(false)
    ocultarProgresso()
})

window.API.exibirResultado((resposta) => {
    const { contagem, resultado } = resposta

    let texto = `Busca realizada com sucesso! Encontrado um total de ${contagem} resultados.`
    
    changeDisabledInputs(false)

    if (!resultado) {
        texto = "Nenhum resultado encontrado."
    }

    resultadoMessage.innerHTML = texto
    btnExportToExcel.style.display = "block"
    ocultarProgresso()
});

/* (() => {
    window.API.abrirJanelaLogin()
})() */

(() => {
    const { dataDe, dataAte } = formBusca

    dataDe.value = "28/02/2024"
    dataAte.value = "01/03/2024"
})()