//
// BLE Music Player - app.js
//

var defaultNamePrefix = "RLHome_MP3_Player";
document.getElementById("namePrefix").value = defaultNamePrefix;

disabledControlButtons(true);

var bluetoothDevice;
var bleMsgLabel = document.getElementById("bleStateLabel");
var setupMsgLabel = document.getElementById("setupStateLabel");

var serviceUuid     =  "0000aa00-0000-1000-8000-00805f9b34fb";
var actionCharUuid  =  "0000aa01-0000-1000-8000-00805f9b34fb";
var volumeCharUuid  =  "0000aa02-0000-1000-8000-00805f9b34fb";
var nextCharUuid    =  "0000aa03-0000-1000-8000-00805f9b34fb";
var loopCharUuid    =  "0000aa04-0000-1000-8000-00805f9b34fb";

var actionCharacteristic;
var volumeCharacteristic;
var nextCharacteristic;
var loopCharacteristic;


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
        // Get all characteristics.
        return service.getCharacteristics();
    })
    .then(characteristics => {
        characteristics.forEach(function(ch) {
            console.log(ch.uuid);
            if (ch.uuid === actionCharUuid) {
                actionCharacteristic = ch;
            }
            else if (ch.uuid === volumeCharUuid ) {
                volumeCharacteristic = ch;
            }
            else if (ch.uuid === nextCharUuid) {
                nextCharacteristic = ch;
            }
            else if (ch.uuid === loopCharUuid) {
                loopCharacteristic = ch;
            }
        });
        disabledControlButtons(false);
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

function onPlayButtonClick() {

}

function onStopButtonClick() {

}

function onPrevButtonClick() {

}

function onNextButtonClick() {

}

function onVolumeUpButtonClick() {

}

function onVolumeDownButtonClick() {
    
}

function disabledControlButtons(isDisabled) {
    document.getElementById("playButton").disabled = isDisabled;
    document.getElementById("stopButton").disabled = isDisabled;
    document.getElementById("prevButton").disabled = isDisabled;
    document.getElementById("nextButton").disabled = isDisabled;
    document.getElementById("volumeUpButton").disabled = isDisabled;
    document.getElementById("volumeDownButton").disabled = isDisabled;

    if (isDisabled) {
        let color = '#8e8e8e';
        document.getElementById("playButton").style.background = color;
        document.getElementById("stopButton").style.background = color;
        document.getElementById("prevButton").style.background = color;
        document.getElementById("nextButton").style.background = color;
        document.getElementById("volumeUpButton").style.background = color;
        document.getElementById("volumeDownButton").style.background = color;
    } else {
        let color = '#d84a38';
        document.getElementById("playButton").style.background = color;
        document.getElementById("stopButton").style.background = color;
        document.getElementById("prevButton").style.background = color;
        document.getElementById("nextButton").style.background = color;
        document.getElementById("volumeUpButton").style.background = color;
        document.getElementById("volumeDownButton").style.background = color;
    }
}