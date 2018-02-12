const path = require("path")
const electron = require('electron')
const fs = require('fs')

let loadedLanguage

module.exports = i18n

function i18n() {
    try {
        const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../', 'config.json'), 'utf8'))
        loadedLanguage = JSON.parse(fs.readFileSync(path.join(__dirname, '../', 'lang',  config.language + '.json'), 'utf8'))
    } catch(e) {
        loadedLanguage = JSON.parse(fs.readFileSync(path.join(__dirname, '../', 'lang', 'zh-CN.json'), 'utf8'))
    }
}

i18n.prototype.__ = function(phrase) {
    let translation = loadedLanguage[phrase]
    if(translation === undefined) {
         translation = phrase
    }
    return translation
}