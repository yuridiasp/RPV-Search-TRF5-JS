const fecharSobre = document.querySelector("#fecharSobre")
const btnSubmit = document.querySelector("#btn-submit")
const fdtForm = document.querySelector("#fdt-form")

fdtForm.addEventListener("submit", event => {
    event.preventDefault()

    const erros = []
    const { login, senha } = fdtForm

    if (!login.length) {
        erros.push('Insira o nome de usuário!')
    }

    if (!senha.length) {
        erros.push('Insira a sua senha!')
    }

    if (erros.length) {
        
    } else {
        window.API.fecharJanelaLogin()
        window.API.realizarLogin({ login, senha })
    }

})

fecharSobre.addEventListener('click', () => {
    window.API.fecharJanelaLogin()
})