const inputPath = document.querySelector("#path")
const formBusca = document.querySelector("#formulario-busca")
const resultsSection = document.querySelector("#results")
const btnExportToExcel = document.querySelector("#export-to-excel")
const resultadoMessage = document.querySelector("#results-message")
const progressoMessage = document.querySelector("#progresso")
const btnPath = document.querySelector("#path")
const btnBuscar = document.querySelector("#btn-buscar")

let busca = null

function formatarData(e) {
    let input = e.value.replace(/\D/g, ''); // Remove tudo o que não é dígito
    if (input.length >= 2) input = input.slice(0, 2) + '/' + input.slice(2);
    if (input.length >= 5) input = input.slice(0, 5) + '/' + input.slice(5, 9);
    e.value = input.slice(0, 10); // Limita o tamanho máximo e atualiza o valor
}

function validarDataFinal(e) {
    const valor =  e.value;
    
    if (isValid(valor)) {
        // Exemplo de feedback: alterar a cor de fundo para vermelho claro e exibir uma mensagem de erro.
        e.style.backgroundColor = '#ffdddd';
        window.API.showMessageError({titulo: "Data informada não é válida", mensagem: "Insira uma data válida com o formato DD/MM/AAAA"})

        return false
    }

    e.style.backgroundColor = ''; // Resetar a cor de fundo se a data for válida ou o campo estiver vazio.

    return true
}

function verificaData(data) {
    const [dia, mes, ano] = data.split('/').map(num => parseInt(num, 10));
    const date = new Date(ano, mes - 1, dia);
    return date.getFullYear() === ano && date.getMonth() === mes - 1 && date.getDate() === dia;
}

function isValid(data) {
    const isValidDate = data.length === 10 && verificaData(data);

    return !isValidDate && data.length > 0
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
    const { dataDe, dataAte, oab, tipo } = formBusca
    const elements = [dataDe, dataAte, oab, tipo]
    
    //const { dataDe, dataAte, oab, tipo, cpf } = formBusca
    //const elements = [dataDe, dataAte, oab, tipo, cpf]

    elements.forEach(e => {
        if (value)
            e.setAttribute("disabled", value)
        else
            e.removeAttribute("disabled")
    })
}

formBusca.dataDe.addEventListener('input', event => formatarData(event.target));
formBusca.dataDe.addEventListener('blur', event => validarDataFinal(event.target));
formBusca.dataAte.addEventListener('input', event => formatarData(event.target));
formBusca.dataAte.addEventListener('blur', event => validarDataFinal(event.target));

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
    const { dataDe, dataAte, oab, tipo, uf } = formBusca
    //const { dataDe, dataAte, oab, tipo, uf, cpf } = formBusca
    //busca = { de: dataDe.value, ate: dataAte.value, oab: oab.value, tipo: tipo.value, uf: uf.value, cpf: (cpf.value === "on") }
    changeDisabledInputs(true)

    if (validarDataFinal(dataDe) && validarDataFinal(dataAte)) {
        exibirProgresso()
        window.API.searchRPV({ de: dataDe.value, ate: dataAte.value, oab: oab.value, tipo: tipo.value, uf: uf.value })
    } else {
        changeDisabledInputs(false)
    }
    /* if (!busca.cpf)
        window.API.searchRPV(busca)
    else
        window.API.abrirJanelaLogin() */
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

/* (() => {
    const { dataDe, dataAte } = formBusca

    dataDe.value = "28/02/2024"
    dataAte.value = "01/03/2024"
})() */