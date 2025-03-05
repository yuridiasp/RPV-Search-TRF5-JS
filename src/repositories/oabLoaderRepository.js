import fs from'fs'
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import ItemParamData from '../model/itemParamData.js'

const filePath = path.join(__dirname, "..", "data", "itemsParams.json")

function readData() {
    try {
        const data = fs.readFileSync(filePath, 'utf8')
        return JSON.parse(data)
    } catch (error) {
        return []
    }
}

function writeData(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
}

function createItem({ name, label, value }) {
    const data = readData()
    const newItem = new ItemParamData(name, label, value)
    data.push(newItem)
    writeData(data)
    
    return newItem
}

function readItems() {
    const data = readData()
    
    return data
}

function getItemById(id) {
    const data = readData()

    const found = data.find(item => item.id = id)

    return found
}

function updateItem(id, updatedItem) {
    let data = readData()
    data = data.map(item => item.id === id ? { ...item, ...updatedItem } : item)
    writeData(data)
}

function deleteItem(id) {
    let data = readData()
    data = data.filter(item => item.id !== id)
    writeData(data)
}

export default { deleteItem, updateItem, readItems, getItemById, createItem }