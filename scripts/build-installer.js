var electronInstaller = require('electron-winstaller');

var resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: './build/ModernMusicRadioFM975-win32-x64',
    outputDirectory: './build/installer',
    authors: 'Quincy Huang',
    exe: 'ModernMusicRadioFM975.exe'
});

resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));
