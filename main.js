const electron = require('electron')
const url = require('url')
const path = require('path')

const {app, BrowserWindow, Menu} = electron;

let mainWindow;
let addWindow;
//Listen for the app to be ready

app.on('ready',() =>{
    mainWindow = new BrowserWindow({})
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