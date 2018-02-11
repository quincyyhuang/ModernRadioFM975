const {app, Menu, Tray, shell, globalShortcut, desktopCapturer, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
const fs = require('fs')

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
	var Clicked = function (menuItem, browserWindow, event) {
		switch (menuItem.label) {
			case '反馈':
				shell.openExternal('https://github.com/quincyyhuang/ModernRadioFM975/issues')
				break
			case '更多':
				shell.openExternal('https://github.com/quincyyhuang/ModernRadioFM975')
				break
			case '更新':
				shell.openExternal('https://github.com/quincyyhuang/ModernRadioFM975/releases')
				break
			default:
				break
		}
	}
	const template = [
		{
			label: '听歌识曲',
			click: captureAudio
		},
		{
			label: '关于',
			submenu: [
				{ label: 'Quincy Huang', enabled: false },
				{ label: 'Version 1.0.0', enabled: false },
				{ label: '反馈', click: Clicked },
				{ label: '更多', click: Clicked },
				{ label: '更新', click: Clicked }
			]
		}
	]
	const menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu)
}

function createTray() {
	tray = new Tray(path.join(__dirname, 'app', 'resources', 'img', 'logo.png'))
	const contextMenu = Menu.buildFromTemplate([
		{ label: '显示', click() { win.show() } },
		{ label: '退出', role: 'quit' }
	])
	tray.on('click', (event) => {
		event.preventDefault()
		win.show()
	})
	tray.setToolTip('摩登音乐台 FM975')
	tray.setContextMenu(contextMenu)
}

app.on('ready', () => {
	globalShortcut.register('CommandOrControl+I', () => {
		BrowserWindow.getFocusedWindow().webContents.openDevTools({ mode: 'detach' })
	})
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