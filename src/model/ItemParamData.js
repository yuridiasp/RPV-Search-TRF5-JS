import crypto from 'crypto'

export default class ItemParamData {
    constructor(name, label, value) {
        this.id = crypto.randomUUID()
        this.name = name
        this.label = label
        this.value = value
    }
}