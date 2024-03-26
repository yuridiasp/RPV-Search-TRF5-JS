import * as x1 from "excel4node"
import { resolve } from "path"

export default function exportToExcel (caminhoPasta, searcher) {
    const wb = new x1.Workbook()
    const ws = wb.addWorksheet("Resultados")

    const getPathToExport = (caminhoPasta, selectedSearcher) => {
        const deFormatado = selectedSearcher.busca['de'].replaceAll("/", "")
        const ateFormatado = selectedSearcher.busca['ate'].replaceAll("/", "")
        let tipo = 'PREC'

        if (selectedSearcher.busca.tipo === 'tiporpv') {
            tipo = 'RPV'
        }
        return resolve(caminhoPasta, `${tipo}-${selectedSearcher.busca['oab']}-${deFormatado}-${ateFormatado}.xlsx`)
    }

    const caminho = getPathToExport(caminhoPasta, searcher)

    const titleStyle = wb.createStyle({
        font: {
          bold: true,
          color: '#000000',
          size: 12
        }
    })

    const valueStyle = wb.createStyle({
        font: {
          bold: false,
          color: '#000000',
          size: 12
        }
    })

    for (let c = 1; c <= searcher.keys.length; c++) {
        const index = c - 1
        const value = searcher.dataDict[searcher.keys[index]]
        
        ws.cell(1, c)
            .string(searcher.keys[index])
            .style(titleStyle)

        for (let i = 1; i <= value.length; i++) {
            ws.cell(i + 1, c)
                .string(value[i - 1])
                .style(valueStyle)
        }
    }
    

    wb.write(caminho)
}