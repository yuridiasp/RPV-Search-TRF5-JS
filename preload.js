const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('API', {
  searchRPV: dados => ipcRenderer.send('search-rpv', dados),
  atualizarProgresso: (calback) => ipcRenderer.on('atualizar-progresso', (event, value) => calback(value)),
  exibirResultado: (calback) => ipcRenderer.on('exibir-resultado', (event, value) => calback(value)),
  exportarResultados: () => ipcRenderer.send('exportar-resultados'),
  openDirectory: () => ipcRenderer.send('open-directory'),
  atualizarPath: (calback) => ipcRenderer.on('atualizar-path', (event, value) => calback(value)),
  getVersions: async () => {
      const result = await ipcRenderer.invoke('get-versions')
      return result
  },
  abrirJanelaLogin: () => ipcRenderer.send('abrir-janela-login'),
  realizarLogin: dados => ipcRenderer.send('realizar-login', dados),
  isLogado: (calback) => ipcRenderer.on('is-logado', (event, value) => calback(value)),
  fecharJanelaLogin: () => ipcRenderer.send('fechar-janela-login'),
  fecharJanelaSobre: () => ipcRenderer.send('fechar-janela-sobre'),
  openGithub: () => ipcRenderer.send('open-github'),
  fecharJanelaLogin: () => ipcRenderer.send('fechar-janela-login'),
  habilitarForm: (calback) => ipcRenderer.on('habilitar-form', (event, value) => calback(value)),
  showMessageError: msg => ipcRenderer.send('show-message-error', msg)
})