const electron = require('electron')
const url = require('url')
const path = require('path')
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let port;
const parser = new Readline();
//Listen for the app to be ready

app.on('ready',() => {
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
    console.log("Boton apretado")
    SerialPort.list((err, ports) => {
        ports.forEach((eachPort) => {
            if (eachPort.manufacturer.includes('Arduino')){
                if (port){
                    port.close();
                }
                port = new SerialPort(eachPort.comName, {baudRate: 9600});
                port.pipe(parser);
            }
        })
    });

    
});

ipcMain.on('read-switch-0', () => {
    console.log("Entra en el s0");
    if(port){
        port.write('R,S0', (err) => {
            if(err){
                console.log("Error:", err.message)
            }
        });
        parser.on('data', line => console.log(`> ${line}`));
        mainWindow.webContents.send('success', {status:200});
    }else{
        console.log('nope')
        mainWindow.webContents.send('not-found-port', {status:404});
    }
});

ipcMain.on('read-switch-1', () => {
    if(port){
        port.write('R,S1', (err) => {
            if(err){
                console.log("Error:", err.message)
            }
        });
        parser.on('data', line => console.log(`> ${line}`));
        mainWindow.webContents.send('success', {status:200});

    }else{
        mainWindow.webContents.send("not-found-port", {status:404})
    }
    
});

ipcMain.on('turn-on-led-1', () => {
    if(port){
        port.write('W,L0,1', (err) => {
            if(err){
                console.log("Error:", err.message)
            }
        });
        mainWindow.webContents.send('success', {status:200});
    }else{
        mainWindow.webContents.send('not-found-port', {status:404});
    }
});
ipcMain.on('turn-on-led-2', () => {
    if(port){
        port.write('W,L1,1', (err) => {
            if(err){
                console.log("Error:", err.message)
            }
        });
        mainWindow.webContents.send('success', {status:200});
    }else{
        mainWindow.webContents.send('not-found-port', {status:404});
    }
});

ipcMain.on('turn-off-led-1', () => {
    if(port){
        port.write('W,L0,0', (err) => {
            if(err){
                console.log("Error:", err.message)
            }
        });
        mainWindow.webContents.send('success', {status:200});
    }else{
        mainWindow.webContents.send('not-found-port', {status:404});
    }
});

ipcMain.on('turn-off-led-2', () => {
    if(port){
        port.write('W,L1,0', (err) => {
            if(err){
                console.log("Error:", err.message)
            }
        });
        mainWindow.webContents.send('success', {status:200});
    }else{
        mainWindow.webContents.send('not-found-port', {status:404});
    }
});

ipcMain.on('turn-on-led-1-analogic', (e, item) => {
    if(port){
        port.write(`A,L0,${item}`, (err) => {
            if(err){
                console.log("Error:", err.message)
            }
        });
        mainWindow.webContents.send('success', {status:200});
    }else{
        mainWindow.webContents.send('not-found-port', {status:404});
    }
})

ipcMain.on('turn-on-led-2-analogic', (e, item) => {
    if(port){
        port.write(`A,L1,${item}`, (err) => {
            if(err){
                console.log("Error:", err.message)
            }
        });
        mainWindow.webContents.send('success', {status:200});
    }else{
        mainWindow.webContents.send('not-found-port', {status:404});
    }
})

ipcMain.on('frequency-pulses-led-1', (e, item) => {
    if(port){
        port.write(`B,L0,${item}`, (err) => {
            if(err){
                console.log("Error:", err.message)
            }
        });
        mainWindow.webContents.send('success', {status:200});
    }else{
        mainWindow.webContents.send('not-found-port', {status:404});
    }
})

ipcMain.on('frequency-pulses-led-2', (e, item) => {
    if(port){
        port.write(`B,L1,${item}`, (err) => {
            if(err){
                console.log("Error:", err.message)
            }
        });
        mainWindow.webContents.send('success', {status:200});
    }else{
        mainWindow.webContents.send('not-found-port', {status:404});
    }
})

ipcMain.on('turn-off-all', () =>{
    if(port){
        port.write('O', (err) => {
            if(err){
                console.log("Error:", err.message)
            }
        });
        mainWindow.webContents.send('success', {status:200});
    }else{
        mainWindow.webContents.send('not-found-port', {status:404});
    }
});

ipcMain.on('eeprom-save', () => {
    if(port){
        port.write('E', (err) => {
            if(err){
                console.log("Error: ", err.message)
            }
        });
        mainWindow.webContents.send('success', {status: 200});
    }else{
        mainWindow.webContents.send('not-found-port', {status:404});
    }
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