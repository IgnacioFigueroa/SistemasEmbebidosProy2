const electron = require('electron');


const port = new SerialPort('COM3')
const {ipcRenderer} = electron;

const RS0 = document.getElementById("read-switch-0");

RS0.addEventListener('click', e =>{
    e.preventDefault();
    console.log("holi")
});
