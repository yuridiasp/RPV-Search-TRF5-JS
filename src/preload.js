const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('API', {
  searchRPV: dados => ipcRenderer.send('search-rpv', dados),
  atualizarProgresso: (callback) => ipcRenderer.on('atualizar-progresso', (event, value) => callback(value)),
  exibirResultado: (callback) => ipcRenderer.on('exibir-resultado', (event, value) => callback(value)),
  exportarResultados: () => ipcRenderer.send('exportar-resultados'),
  openDirectory: () => ipcRenderer.send('open-directory'),
  atualizarPath: (callback) => ipcRenderer.on('atualizar-path', (event, value) => callback(value)),
  getVersions: async () => await ipcRenderer.invoke('get-versions'),
  abrirJanelaLogin: () => ipcRenderer.send('abrir-janela-login'),
  realizarLogin: dados => ipcRenderer.send('realizar-login', dados),
  isLogado: (callback) => ipcRenderer.on('is-logado', (event, value) => callback(value)),
  fecharJanelaLogin: () => ipcRenderer.send('fechar-janela-login'),
  fecharJanelaSobre: () => ipcRenderer.send('fechar-janela-sobre'),
  openGithub: () => ipcRenderer.send('open-github'),
  fecharJanelaLogin: () => ipcRenderer.send('fechar-janela-login'),
  habilitarForm: (callback) => ipcRenderer.on('habilitar-form', (event, value) => callback(value)),
  showMessageError: msg => ipcRenderer.send('show-message-error', msg),
  abrirJanelaFormAddItem: (type) => ipcRenderer.send('abrir-janela-form-add-item', type),
  atualizarForm: (callback) => ipcRenderer.on('atualizar-form', (event, value) => callback(value)),
})