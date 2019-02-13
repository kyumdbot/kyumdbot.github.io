//
// BLE RGB Light - app.js
//

var defaultNamePrefix = "RLHome_RGB_Light";
document.getElementById("namePrefix").value = defaultNamePrefix;

disabledControlButtons(true);

var bluetoothDevice;
var bleMsgLabel = document.getElementById("bleStateLabel");
var setupMsgLabel = document.getElementById("setupStateLabel");

var serviceUuid     =  "0000ff00-0000-1000-8000-00805f9b34fb";
var switchCharUuid  =  "0000ff01-0000-1000-8000-00805f9b34fb"
var redCharUuid     =  "0000ff02-0000-1000-8000-00805f9b34fb"
var greenCharUuid   =  "0000ff03-0000-1000-8000-00805f9b34fb"
var blueCharUuid    =  "0000ff04-0000-1000-8000-00805f9b34fb"

var switchCharacteristic;
var redCharacteristic;
var greenCharacteristic;
var blueCharacteristic;

var switchValue = "0";

function onScanButtonClick() {
    let namePrefix = document.getElementById("namePrefix").value;

    if (namePrefix !== "") {
        let options = {filters: [], "optionalServices": [serviceUuid]};
        options.filters.push({namePrefix: namePrefix});

        bluetoothDevice = null;
        console.log('Requesting Bluetooth Device...');
        navigator.bluetooth.requestDevice(options)
        .then(device => {
            bluetoothDevice = device;
            bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);
            return connect();
        })
        .catch(error => {
            console.log('Argh! ' + error);
            bleMsgLabel.innerText = "Request device failed!";
        });
    } else {
        bleMsgLabel.innerText = "Please enter a device name prefix!";
    }
}

function connect() {
    console.log('Connecting to Bluetooth Device...');
    return bluetoothDevice.gatt.connect()
    .then(server => {
        console.log('> Bluetooth Device connected');
        bleMsgLabel.innerText = "Connected to " + bluetoothDevice.name;
        return server.getPrimaryService(serviceUuid);
    })
    .then(service => {
        console.log('Getting Characteristics...');

        // get switch Characteristic
        service.getCharacteristic(switchCharUuid).then(function(ch) {
            switchCharacteristic = ch;
            // read switch value
            switchCharacteristic.readValue().then(function(value) {
                let decoder = new TextDecoder('utf-8');
                switchValue = decoder.decode(value);
                console.log('> Switch value: ' + switchValue);
                disabledControlButtons(false);
            });
        });

        // get red Characteristic
        service.getCharacteristic(redCharUuid).then(function(ch) {
            redCharacteristic = ch;
        });

        // get green Characteristic
        service.getCharacteristic(greenCharUuid).then(function(ch) {
            greenCharacteristic = ch;
        });

        // get blue Characteristic
        service.getCharacteristic(blueCharUuid).then(function(ch) {
            blueCharacteristic = ch;
        });
    })
    .catch(error => {
        console.log('Argh! ' + error);
        bleMsgLabel.innerText = 'Error: ' + error;
    });
}

function onDisconnectButtonClick() {
    setupMsgLabel.innerText = '';
    if (!bluetoothDevice) {
        return;
    }
    console.log('Disconnecting from Bluetooth Device...');
    if (bluetoothDevice.gatt.connected) {
        bluetoothDevice.gatt.disconnect();
    } else {
        console.log('> Bluetooth Device is already disconnected');
        bleMsgLabel.innerText = "Bluetooth Device is already disconnected"
    }
}

function onDisconnected(event) {
    // Object event.target is Bluetooth Device getting disconnected.
    console.log('> Bluetooth Device disconnected');
    bleMsgLabel.innerText = "Bluetooth Device is disconnected";
    disabledControlButtons(true) 
}

function onReconnectButtonClick() {
    bleMsgLabel.innerText = '';
    setupMsgLabel.innerText = '';

    if (!bluetoothDevice) {
      return;
    }

    if (bluetoothDevice.gatt.connected) {
        console.log('> Bluetooth Device is already connected');
        bleMsgLabel.innerText = "Connected to " + bluetoothDevice.name;
      return;
    }
    connect()
    .catch(error => {
        console.log('Argh! ' + error);
        bleMsgLabel.innerText = "Connection failed!";
    });
}

function disabledControlButtons(isDisabled) {
    document.getElementById("switchButton").disabled = isDisabled;
    document.getElementById("select_color").disabled = isDisabled;
    changeSwitchButtonColor(isDisabled);
}

function changeSwitchButtonColor(isDisabled) {
    if (isDisabled) {
        document.getElementById("switchButton").style.background = '#8e8e8e';
    } else {
        if (switchValue === "1") {
            document.getElementById("switchButton").style.background = '#ea7500';
            document.getElementById("switchButton").innerText = "Off";
        } else {
            document.getElementById("switchButton").style.background = '#01b468';
            document.getElementById("switchButton").innerText = "On";
        }
    }
}

function selectColor(e) {
    console.log('> Color: ' + e.value);

    if (e.value === "white") {
        writeColor("255", "255", "255");
    } else if (e.value === "red") {
        writeColor("255", "0", "0");
    } else if (e.value === "green") {
        writeColor("0", "255", "0");
    } else if (e.value === "blue") {
        writeColor("0", "0", "255");
    } else if (e.value === "orange") {
        writeColor("255", "127", "0");
    } else if (e.value === "yellow") {
        writeColor("255", "255", "0");
    }
}

function onSwitchButtonClick() {
    if (switchValue === "1") {
        switchValue = "0"
    } else {
        switchValue = "1"
    }
    changeSwitchButtonColor(false);

    let encoder = new TextEncoder('utf-8');
    switchCharacteristic.writeValue(encoder.encode(switchValue))
    .then(_ => {
        console.log('> Write data to switchCharacteristic is ok.');
    })
    .catch(error => {
        console.log('Argh! ' + error);
    });
}

function writeColor(R, G, B) {
    let encoder = new TextEncoder('utf-8');

    redCharacteristic.writeValue(encoder.encode(R))
    .then(_ => {
        console.log('> Write data to redCharacteristic is ok.');

        greenCharacteristic.writeValue(encoder.encode(G))
        .then(_ => {
            console.log('> Write data to greenCharacteristic is ok.');

            blueCharacteristic.writeValue(encoder.encode(B))
            .then(_ => {
                console.log('> Write data to blueCharacteristic is ok.');
            })
            .catch(error => {
                console.log('Argh! ' + error);
            });
        })
        .catch(error => {
            console.log('Argh! ' + error);
        });
    })
    .catch(error => {
        console.log('Argh! ' + error);
    });
}
