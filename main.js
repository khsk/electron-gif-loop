'use strict'

var Electron = require('electron')
var BrowserWindow = Electron.BrowserWindow;

Electron.crashReporter.start({
	companyName:'khsk',
	submitURL: 'https://github.com/khsk/jenkins-websocket-notifier',
})

var mainWindow = null

Electron.app.on('window-allclosed', function(){
	if (process.platoform != 'darwin') {
		Electron.app.quit()
	}
})
// GC対策 http://eye4brain.sakura.ne.jp/wp/blog/2016/02/23/google-apps-script%E3%81%A8%E9%80%A3%E6%90%BA%E3%81%99%E3%82%8Belectron%E3%82%A2%E3%83%97%E3%83%AA%E3%82%92%E4%BD%9C%E3%82%8B-%E5%BF%9C%E7%94%A8%E7%B7%A8/
var tray = null;
Electron.app.on('ready', function() {

	var ipcMain = Electron.ipcMain;
	ipcMain.on('operation-tray', function(event, method, arg) {
	})

	var Tray = Electron.Tray;
	tray = new Tray(__dirname + '/src/images/giphy-logo1-64px-alpha.png')

	var Menu = Electron.Menu;
	var contextMenu = Menu.buildFromTemplate([
		{ label: 'Show', click: function() { mainWindow.show() } },
		{ label: 'Settings',  click: function() {
			mainWindow.webContents.send('settings')
			mainWindow.loadURL('file://' + __dirname + '/settings.html')
		}},
		{ label: 'Change on top', click: function(){ mainWindow.setAlwaysOnTop(!mainWindow.isAlwaysOnTop());
		}},
		{ label: 'Exit', click: function() { Electron.app.quit() } },
	]);
	tray.setContextMenu(contextMenu);

	tray.on('click', function() {
		// TODO フォーカス時は隠す、非フォーカス時はフォーカス、としたいが、トレイクリック時にフォーカスが外れるみたいで難しい
		if (mainWindow.isVisible()) {
			mainWindow.hide()
		} else {
			mainWindow.show()
		}
		
	})

	mainWindow = new BrowserWindow({'width': 800, 'height': 600, 'frame': false, 'show': false, 'skipTaskbar': true})

	mainWindow.loadURL('file://' + __dirname + '/index.html')

	mainWindow.on('closed', function() {
		mainWindow = null
	})

})
