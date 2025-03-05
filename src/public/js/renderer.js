const inputPath = document.querySelector("#path")
const formBusca = document.querySelector("#formulario-busca")
const resultsSection = document.querySelector("#results")
const btnExportToExcel = document.querySelector("#export-to-excel")
const resultadoMessage = document.querySelector("#results-message")
const progressoMessage = document.querySelector("#progresso")
const btnPath = document.querySelector("#path")
const btnBuscar = document.querySelector("#btn-buscar")
const addItemParamsBTN = document.querySelectorAll(".addItemParamsBTN")

addItemParamsBTN.forEach(btn => btn.addEventListener("click", event => {
    const addType = event.target.dataset.type
    console.log(event.target)
    switch(addType) {
        case "oab": window.API.abrirJanelaFormAddItem("oab"); break;
        case "cpf": window.API.abrirJanelaFormAddItem("cpf"); break;
        default: return;
    }
}))

let busca = null

function formatarData(e) {
    let input = e.value.replace(/\D/g, ''); // Remove tudo o que não é dígito
    if (input.length >= 2) input = input.slice(0, 2) + '/' + input.slice(2);
    if (input.length >= 5) input = input.slice(0, 5) + '/' + input.slice(5, 9);
    e.value = input.slice(0, 10); // Limita o tamanho máximo e atualiza o valor
}

function validarTipo(tipo) {
    const optionNotSelected = !tipo.length
    console.log(optionNotSelected);
    if (optionNotSelected) {
        window.API.showMessageError({titulo: "Tipo não selecionado", mensagem: "Selecione ao menos um Tipo para realizar a busca"})

        return false
    }
    
    return true
}

function validarOAB(oab) {
    const optionNotSelected = !oab.length
    
    if (optionNotSelected) {
        return false
    }
    
    return true
}

function validarCPF(cpf) {
    return cpf.checked
}
    

function validarOABOrCPF(oab, cpf) {
    const optionNotSelected = validarCPF(cpf) && validarOAB(oab)
    
    if (!optionNotSelected) {
        window.API.showMessageError({titulo: "OAB ou CPF não selecionado", mensagem: "Selecione ao menos uma OAB ou Busca por CPF para continuar."})

        return false
    }
    
    return true
}

function validarDataFinal(e) {
    const valor =  e.value;
    let resultado = true
    
    if (!isValid(valor)) {
        // Exemplo de feedback: alterar a cor de fundo para vermelho claro e exibir uma mensagem de erro.
        e.style.backgroundColor = '#ffdddd';
        resultado = false
        window.API.showMessageError({titulo: "Data informada não é válida", mensagem: "Insira uma data válida com o formato DD/MM/AAAA"})
    }

    e.style.backgroundColor = ''; // Resetar a cor de fundo se a data for válida ou o campo estiver vazio.
    
    return resultado
}

function verificaData(data) {
    const [dia, mes, ano] = data.split('/').map(num => parseInt(num, 10));
    const date = new Date(ano, mes - 1, dia);

    return date.getFullYear() === ano && date.getMonth() === mes - 1 && date.getDate() === dia;
}

function isValid(data) {
    const isValidDate = (data.length === 10 && verificaData(data));
    
    return isValidDate
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
    const { dataDe, dataAte, oab, tipo, cpf } = formBusca
    const elements = [dataDe, dataAte, oab, tipo, cpf]

    elements.forEach(e => {
        if (value) {
            if (e === oab || e === tipo) {
                e.forEach(item => {
                    item.setAttribute("disabled", value)
                })
            } else
                e.setAttribute("disabled", value)
        }
        else {
            if (e === oab || e === tipo) {
                e.forEach(item => {
                    item.removeAttribute("disabled")
                })
            } else
                e.removeAttribute("disabled")
        }
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
    const { dataDe, dataAte, oab, tipo, uf, cpf } = formBusca
    const oabs = Array.from(oab).filter(node => node.checked).map(node => node.value)
    const tipos = Array.from(tipo).filter(node => node.checked).map(node => node.value)

    changeDisabledInputs(true)

    const isValidForm = (validarDataFinal(dataDe) && validarDataFinal(dataAte) && validarOABOrCPF(oab, cpf) && validarTipo(tipos))

    if (isValidForm) {
        exibirProgresso()
        window.API.searchRPV({ de: dataDe.value, ate: dataAte.value, oab: oabs, tipo: tipos, uf: uf.value, cpf: cpf.checked ? cpf.value : undefined })
    } else {
        changeDisabledInputs(false)
    }
})

window.API.atualizarProgresso((resposta) => {
    const progressoOABAndTipo = document.querySelector("#progresso-oab-tipo")
    const [atual, final, oab, tipo] = resposta
    const progresso = `${atual} de ${final} páginas.`
    const tipoBusca = tipo === "tiporpv" ? "RPV" : "Precatório"
    
    progressoOABAndTipo.innerHTML = `${tipoBusca} | ${oab}`
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
    if (contagem > 0)
        btnExportToExcel.style.display = "block"
    ocultarProgresso()
});

/* (() => {
    window.API.abrirJanelaLogin()
})() */

/* (() => {
    const { dataDe, dataAte } = formBusca

    dataDe.value = "01/01/2025"
    dataAte.value = "04/02/2025"
})() */