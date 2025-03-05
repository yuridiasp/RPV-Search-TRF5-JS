import * as x1 from "excel4node"
import { resolve } from "path"
import fs from 'fs'

const getPathToExport = (caminhoPasta, selectedSearcher) => {
    const deFormatado = selectedSearcher.busca['de'].replaceAll("/", "")
    const ateFormatado = selectedSearcher.busca['ate'].replaceAll("/", "")
    const tipo = selectedSearcher.busca.tipo.map(type => {
        if (type === "tiporpv") {
            return "RPV"
        }
        return "PREC"
    })
    
    return resolve(caminhoPasta, `${tipo}-${selectedSearcher.busca['oab']}-${deFormatado}-${ateFormatado}.xlsx`)
}

function isFileInUse(filePath) {
    try {
        const fd = fs.openSync(filePath, 'r+'); // Tenta abrir o arquivo para leitura e escrita
        fs.closeSync(fd); // Fecha o arquivo caso tenha sido aberto com sucesso
        return false; // O arquivo não está em uso
    } catch (err) {
        if (err.code === 'EBUSY' || err.code === 'EACCES' || err.code === 'EPERM') {
            return true; // O arquivo está em uso
        }
        return false; // Outro erro ocorreu, mas não indica que o arquivo está em uso
    }
}

export default function exportToExcel (caminhoPasta, searcher) {
    const wb = new x1.Workbook()
    const ws = wb.addWorksheet("Resultados")

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
    if (isFileInUse(caminho)) {
        return false
    }

    wb.write(caminho)
    return true
}