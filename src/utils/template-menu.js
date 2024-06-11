export const templateMenu = (abrirJanelaSobre) => [
    {
        label: 'Arquivo',
        role: 'File',
        submenu: [
            {
                label: 'Fechar',
                role: 'quit'
            }
        ]
    },
    {
        label: 'Sobre',
        role: 'Help',
        click: async () => {
            abrirJanelaSobre()
        }
    }
]