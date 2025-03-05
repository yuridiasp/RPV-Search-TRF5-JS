const btnGravar = document.querySelector("#btn-gravar")
const form = document.querySelector("#addUpdateOAB")
const { idOABForm, idCPFForm, labelForm, valueForm } = form
const titleForm = document.querySelector("#titleForm")

btnGravar.addEventListener("click", event => {
    event.preventDefault()

    if (idOABForm.value.length) {
        console.log(idOABForm.value)
    } else if (idCPFForm.value.length) {
        console.log(idCPFForm.value)
    } else {
        alert("ID da OAB ou CPF não informado!")
    }

    window.API.enviarForm({ idOAB: idOABForm.value, idCPF: idCPFForm.value, label: labelForm.value, value: valueForm.value })
})

window.API.atualizarForm(({ isOAB, id, label, value }) => {
    const descriptionValueParagraph = document.querySelector("#descriptionValue")
    
    if (isOAB) {
        titleForm.innerHTML = "Opção de OAB"
        descriptionValueParagraph.innerHTML = "* Informe o valor da OAB (Estado e Número) conforme é buscado no TRF5"
    } else {
        titleForm.innerHTML = "Opção de CPF"
        descriptionValueParagraph.innerHTML = "* Informe o número do CPF conforme é buscado no TRF5 (somente números)"
    }

    if (id) {
        labelForm.value = label
        valueForm.value = value
    }
})