import { app, BrowserWindow, globalShortcut, Tray, Menu } from 'electron';

var mainWindow: BrowserWindow|null;

const installExtensions = async () => {
	const installer = require('electron-devtools-installer');
	const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
	const extensions = [
		'REACT_DEVELOPER_TOOLS',
		'REDUX_DEVTOOLS',
	];

	return Promise
	.all(extensions.map(name => {
		console.log('Install Devtoos ', name);
		installer.default(installer[name], forceDownload)
	}))
	.catch(console.error);
}

console.log();

const createWindow = async () => {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
		},
		show: false,
	});

	if (process.env.NODE_ENV === 'development') {
		process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1'; // eslint-disable-line require-atomic-updates
		mainWindow.loadURL('http://localhost:3000/');

		mainWindow.webContents.once('dom-ready', () => {
			mainWindow!.webContents.openDevTools();
		});
	} else {
		mainWindow.loadFile('./dist/index.html');
	}

	mainWindow.once('ready-to-show', mainWindow.show);
	mainWindow.on('close', () => mainWindow = null);
};

app.on('ready', async () => {
	if ( process.env.NODE_ENV === 'development' ) {
		await installExtensions();
	}
	globalShortcut.register('Ctrl+1', () => {
		console.log('Ctrl + 1 pressed');
	});

	const tray = new Tray(__dirname + '/icon.png');
	tray.on('click', () => {
		console.log('tray click');
	});
	tray.setContextMenu(null);

	createWindow();
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (!mainWindow) {
		createWindow();
	}
});
