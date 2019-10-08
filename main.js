const electron = require('electron')
const url = require('url')
const path = require('path')
const SerialPort = require('@serialport/stream');
const Readline = require('@serialport/parser-readline');

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
var port;
const parser = new Readline();
//Listen for the app to be ready

app.on('ready',() =>{
    mainWindow = new BrowserWindow({
        webPreferences:{
            nodeIntegration: true
        }
    })
    //Load html file into windows
    mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindow.html'),
    protocol: 'file:',
    slashes: true
    }));
    //Quit app when closed
    mainWindow.on('closed', () => {
        app.quit()
    })
    //build menu from template

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert Menu
    Menu.setApplicationMenu(mainMenu);
});

//
ipcMain.on("set-port", (e, item) =>{
    port = new SerialPort(item, {baudRate: 9600});
    port.pipe(parser)
});

ipcMain.on('read-switch-0', () => {
    port.write('R,S0');
    parser.on('data', line => console.log(`> ${line}`));
});

ipcMain.on('read-switch-1', () => {
    port.write('R,S1');
    parser.on('data', line => console.log(`> ${line}`));
});

ipcMain.on('turn-on-led-1', () => {
    port.write('W,L1,1');
});
ipcMain.on('turn-on-led-2', () => {
    port.write('W,L2,1');
});

ipcMain.on('turn-off-led-1', () => {
    port.write('W,L1,0');
});

ipcMain.on('turn-off-led-2', () => {
    port.write('W,L2,0');
});

ipcMain.on('turn-on-led-1-analogic', (e, item) => {
    port.write(`A,L1,${item}`)
})

ipcMain.on('turn-on-led-1-analogic', (e, item) => {
    port.write(`A,L2,${item}`)
})

ipcMain.on('frequency-pulses-led-1', (e, item) => {
    port.write(`B,L1,${item}`)
})

ipcMain.on('frequency-pulses-led-2', (e, item) => {
    port.write(`B,L2,${item}`)
})

ipcMain.on('turn-off-all', () =>{
    port.write('O')
})

//create main menu

const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Quit',
                //Shortcut for quitting the application
                accelerator: process.platform == 'darwin' ? 'Command+Q': //process.platform makes possible to detect the actual OS
                'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

//Add developer tools if not in production

if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu:[{
            label: 'Toggle DevTools',
            accelerator: process.platform == 'darwin' ? 'Command+I': 
                'Ctrl+I',
            click(item, focusedWindow){
                focusedWindow.toggleDevTools();
            }
        },
        {
            role: 'reload'
        }
    ]
    })
}