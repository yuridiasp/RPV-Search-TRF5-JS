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
  fecharJanelaSobre: () => ipcRenderer.send('fechar-janela-sobre'),
  openGithub: () => ipcRenderer.send('open-github')
})