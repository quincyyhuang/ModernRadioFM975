const {globalShortcut, BrowserWindow} = require('electron')
const { execFile } = require('child_process')
var regedit = require('regedit')

// New soundhound
function test() {
	const regLocation = 'HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\QQMusic'
	// execFile('G:\\Tencent\\QQMusic\\QQMusic.exe', ['-songrecognition'])
	regedit.list(regLocation, function(err, result) {
		var exe = path.join(result[regLocation].values['InstallLocation'].value, 'QQMusic.exe')
		execFile(exe, ['-songrecognition'])
	})
}

// Register Dev Tool
function registerDevShortcut() {
    globalShortcut.register('CommandOrControl+I', () => {
		BrowserWindow.getFocusedWindow().webContents.openDevTools({ mode: 'detach' })
	})
}

// Exports
exports.test = test
exports.registerDevShortcut = registerDevShortcut