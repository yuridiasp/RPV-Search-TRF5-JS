const tituloSobre = document.querySelector('#tituloSobre')
const nomeAppSpan = document.querySelectorAll('#nomeApp')
const autorSpan = document.querySelector('#autor')
const versaoSpan = document.querySelector('#versao')
const electronSpan = document.querySelector('#electron')
const nodeJsSpan = document.querySelector('#nodeJs')
const fecharSobreBtn = document.querySelector('#fecharSobre')

async function setHtmlText() {
    const { nomeapp, autor, nodejs, version, electronjs, github } = await window.API.getVersions()

    nomeAppSpan.forEach(e => {
        e.innerText = nomeapp
    })

    autorSpan.innerText = autor
    versaoSpan.innerText = version
    electronSpan.innerText = electronjs
    nodeJsSpan.innerText = nodejs
}

fecharSobreBtn.addEventListener('click', () => {
    window.API.fecharJanelaSobre()
})

autorSpan.addEventListener('click', () => {
    window.API.openGithub()
})

window.onload = setHtmlText