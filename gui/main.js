const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
const osc = require("osc");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
    // Create the browser window.
    win = new BrowserWindow({width: 800, height: 600})
    win.setMenu(null)

    // and load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Open the DevTools.
    win.webContents.openDevTools()

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null

    })



    win.webContents.on('did-finish-load', () => {

        //win.webContents.send('asdf' , "foooo");
        //console.log("print foo");

        var udpPortBitwig = new osc.UDPPort({
            localAddress: "0.0.0.0",
            localPort: 6661,
            remoteAddress: "0.0.0.0",
            remotePort:8000
        });

        var udpPortLooper = new osc.UDPPort({
            localAddress: "0.0.0.0",
            localPort: 6662,
            remoteAddress: "0.0.0.0",
            remotePort:9951
        });

        udpPortLooper.on("ready", function () {
            var url = "osc.udp://localhost:" + udpPortLooper.options.localPort +"/";
            udpPortLooper.send( {
                address: "/ping",
                args: [url, "/pingack"]
            });
            for(var i = 0; i < 4; i++) {
                udpPortLooper.send( {
                    address: "/sl/"+i+"/get",
                    args: ["state", url, "/sl/"+i+"/state"]
                });
                udpPortLooper.send( {
                    address: "/sl/"+i+"/get",
                    args: ["loop_pos", url, "/sl/"+i+"/loop_pos"]
                });
                udpPortLooper.send( {
                    address: "/sl/"+i+"/get",
                    args: ["loop_len", url, "/sl/"+i+"/loop_len"]
                });
                udpPortLooper.send( {
                    address: "/sl/"+i+"/register_auto_update",
                    args: ["state", {type:"i", value:100}, url, "/sl/"+i+"/state"]
                });
                udpPortLooper.send( {
                    address: "/sl/"+i+"/register_auto_update",
                    args: ["loop_pos", {type:"i", value:100}, url, "/sl/"+i+"/loop_pos"]
                });
                udpPortLooper.send( {
                    address: "/sl/"+i+"/register_auto_update",
                    args: ["loop_len", {type:"i", value:100}, url, "/sl/"+i+"/loop_len"]
                });
            }
            //udpPortLooper.send( {
            //    address: "/register_update",
            //    args: ["tap_tempo", url, "/sl/tap_tempo"]
            //});

            //udpPortLooper.send( {
                //address: "/get",
                //args: ["tempo", url, "/sl/tap_tempooooooooooooooooooo"]
            //});
        });

        udpPortBitwig.on("ready", function () {
            var url = "osc.udp://localhost:" + udpPortBitwig.options.localPort +"/";
            udpPortBitwig.send( {
                    address: "/ping",
                    args: [url, "/pingack"]
                }
            );
        });

        udpPortLooper.on("message", function (oscMessage) {
            //console.log("looper: ", oscMessage);
            win.webContents.send('osc' , oscMessage);
        });
        //var count = 0;
        udpPortBitwig.on("message", function (oscMessage) {
            //console.log("bitwig: ", oscMessage);
            //console.log(++count);
            win.webContents.send('osc' , oscMessage);

        });

        udpPortLooper.on("error", function (err) {
            console.log(err);
        });
        udpPortBitwig.on("error", function (err) {
            console.log(err);
        });

        udpPortLooper.open();
        udpPortBitwig.open();

    });





}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})

console.log("-----");

var getIPAddresses = function () {
    var os = require("os"),
        interfaces = os.networkInterfaces(),
        ipAddresses = [];

    for (var deviceName in interfaces) {
        var addresses = interfaces[deviceName];
        for (var i = 0; i < addresses.length; i++) {
            var addressInfo = addresses[i];
            if (addressInfo.family === "IPv4" && !addressInfo.internal) {
                ipAddresses.push(addressInfo.address);
            }
        }
    }

    return ipAddresses;
};

