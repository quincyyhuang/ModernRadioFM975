const {app, dialog, Menu, Tray, shell, globalShortcut, desktopCapturer, BrowserWindow} = require('electron')
const { execFile } = require('child_process')
const path = require('path')
const url = require('url')
const fs = require('fs')
var regedit = require('regedit')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

// Keep reference of windows
let win
let soundhound
let tray

function captureAudio() {
	soundhound = new BrowserWindow({
		width: 200,
		height: 280,
		resizable: false,
		parent: win,
		minimizable: false,
		show: false,
		icon: path.join(__dirname, 'app', 'resources', 'img', 'logo.png'),
	})

	soundhound.setMenu(null)
	soundhound.loadURL(url.format({
		pathname: path.join(__dirname, 'app', 'html', 'soundhound.html'),
		protocol: 'file:',
		slashes: true
	}))

	soundhound.once('ready-to-show', () => {
		soundhound.show()
	})

	soundhound.on('closed', () => {
		soundhound = null
	})
}

function test() {
	const regLocation = 'HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\QQMusic'
	// execFile('G:\\Tencent\\QQMusic\\QQMusic.exe', ['-songrecognition'])
	regedit.list(regLocation, function(err, result) {
		var exe = path.join(result[regLocation].values['InstallLocation'].value, 'QQMusic.exe')
		execFile(exe, ['-songrecognition'])
	})
}

function createWindow () {
	win = new BrowserWindow({
		width: 300,
		height: 400,
		resizable: false,
		icon: path.join(__dirname, 'app', 'resources', 'img', 'logo.png'),
		show: false
	})

	win.loadURL(url.format({
		pathname: path.join(__dirname, 'app', 'html', 'index.html'),
		protocol: 'file:',
		slashes: true
	}))

	win.once('ready-to-show', () => {
		win.show()
	})

	win.on('minimize', (event) => {
		event.preventDefault()
		win.hide()
	})

	win.on('closed', () => {
		win = null
	})
}

function createMenu() {
	var i18n = new(require('./app/module/i18n'))
	var currentLocale = app.db.get('language').value()
	var autoplayStatus = app.db.get('autoplay').value()
	var Clicked = function(menuItem, browserWindow, event) {
		switch (menuItem.label) {
			case i18n.__('Feedback'):
				shell.openExternal('https://github.com/quincyyhuang/ModernRadioFM975/issues')
				break
			case i18n.__('More'):
				shell.openExternal('https://github.com/quincyyhuang/ModernRadioFM975')
				break
			case i18n.__('Update'):
				shell.openExternal('https://github.com/quincyyhuang/ModernRadioFM975/releases')
				break
			case i18n.__('Donate'):
				shell.openExternal('https://github.com/quincyyhuang/ModernRadioFM975#donations-%E6%8D%90%E5%8A%A9')
			default:
				break
		}
	}

	var languageClicked = function(menuItem, browserWindow, event) {
		var languageSelected
		switch (menuItem.label) {
			case 'English':
				languageSelected = 'en-US'
				break
			case '中文（简体）':
				languageSelected = 'zh-CN'
				break
			case '中文（繁體）':
				languageSelected = 'zh-TW'
				break
			case '日本語':
				languageSelected = 'ja'
				break
		}
		app.db.set('language', languageSelected).write()
		dialog.showMessageBox({
			type: 'info',
			title: i18n.__('ConfigSavedNeedRestartTitle'),
			message: i18n.__('ConfigSavedNeedRestart')
		})
	}

	var autoplayClicked = function(menuItem, browserWindow, event) {
		app.db.set('autoplay', menuItem.checked).write()
		dialog.showMessageBox({
			type: 'info',
			title: i18n.__('ConfigSavedNeedRestartTitle'),
			message: i18n.__('ConfigSavedNeedRestart')
		})
	}

	const template = [
		{
			label: i18n.__('Song Recognition'),
			click: captureAudio
		},
		{
			label: i18n.__('About'),
			submenu: [
				{ label: 'Quincy Huang', enabled: false },
				{ label: 'Version 1.0.0', enabled: false },
				{ label: i18n.__('Feedback'), click: Clicked },
				{ label: i18n.__('More'), click: Clicked },
				{ label: i18n.__('Update'), click: Clicked },
				{ label: i18n.__('Donate'), click: Clicked }
			]
		},
		{
			label: i18n.__('Settings'),
			submenu: [
				{
					label: i18n.__('Language'),
					submenu: [
						{ label: 'English', type: 'radio', checked: currentLocale == 'en-US' ? true : false, click: languageClicked },
						{ label: '中文（简体）', type: 'radio', checked: currentLocale == 'zh-CN' ? true : false, click: languageClicked },
						{ label: '中文（繁體）', type: 'radio', checked: currentLocale == 'zh-TW' ? true : false, click: languageClicked },
						{ label: '日本語', type: 'radio', checked: currentLocale == 'ja' ? true : false, click: languageClicked }
					]
				},
				{
					label: i18n.__('Autoplay'),
					type: 'checkbox',
					checked: autoplayStatus,
					click: autoplayClicked
				}
			]
		}
		// {
		// 	label: 'TEST',
		// 	click: test
		// }
	]
	const menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu)
}

function createTray() {
	var i18n = new(require('./app/module/i18n'))
	tray = new Tray(path.join(__dirname, 'app', 'resources', 'img', 'logo.png'))
	const contextMenu = Menu.buildFromTemplate([
		{ label: i18n.__('Show'), click() { win.show() } },
		{ label: i18n.__('Exit'), role: 'quit' }
	])
	tray.on('click', (event) => {
		event.preventDefault()
		win.show()
	})
	tray.setToolTip(i18n.__('ToolTipText'))
	tray.setContextMenu(contextMenu)
}

app.on('ready', () => {
	globalShortcut.register('CommandOrControl+I', () => {
		BrowserWindow.getFocusedWindow().webContents.openDevTools({ mode: 'detach' })
	})
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
	createMenu()
	createWindow()
	createTray()
	
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (win === null) {
		createWindow()
	}
})