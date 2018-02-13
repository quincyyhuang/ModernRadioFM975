const {app, dialog} = require('electron')
const path = require('path')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

// App function modules
var UI = require('./app/module/UI')
var background = require('./app/module/background')

app.on('ready', () => {
	background.registerDevShortcut()
	try {
		const adapter = new FileSync(path.join(app.getAppPath(), '../', 'config.json'))
		const db = low(adapter)
		// Set default config
		db.defaults({
			"language": "zh-CN",
			"autoplay": false
		}).write()
		app.db = db
	} catch(e) {
		dialog.showErrorBox('Error', 'Your config file is damaged. You may re-install to fix this issue.')
		app.quit()
	}
	UI.createMenu()
	UI.createWindow()
	UI.createTray()
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (win === null) {
		UI.createWindow()
	}
})