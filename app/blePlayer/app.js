//
// app.js
//

function onScanButtonClick() {
    let options = {filters: []};
    options.filters.push({name: 'RLHome_MP3_Player'});

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
    });
}

function connect() {
    console.log('Connecting to Bluetooth Device...');
    return bluetoothDevice.gatt.connect()
    .then(server => {
        console.log('> Bluetooth Device connected');
    });
}
  
function onDisconnectButtonClick() {
    if (!bluetoothDevice) {
        return;
    }
    console.log('Disconnecting from Bluetooth Device...');
    if (bluetoothDevice.gatt.connected) {
        bluetoothDevice.gatt.disconnect();
    } else {
        console.log('> Bluetooth Device is already disconnected');
    }
}

function onDisconnected(event) {
    // Object event.target is Bluetooth Device getting disconnected.
    console.log('> Bluetooth Device disconnected');
}

function onReconnectButtonClick() {
    if (!bluetoothDevice) {
      return;
    }
    if (bluetoothDevice.gatt.connected) {
        console.log('> Bluetooth Device is already connected');
      return;
    }
    connect()
    .catch(error => {
        console.log('Argh! ' + error);
    });
}
