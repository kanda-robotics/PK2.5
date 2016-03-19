// PK2.50.js

// Functions =============================================================
function IsMyNumber(OrderString, MyNumber) {
    try {
        var FirstTwoHex = parseInt( OrderString.substr(0,2), 16 );
        if ( ( FirstTwoHex & ( 1 << ( MyNumber - 1 ) ) ) != 0 ) {
            return true;
        } else {
            return false;
        }
    } catch(e) {
        return false;
    }
}


// Read Setting files ===================================================
var fs = require("fs");
function LoadSetting( filename, errorvalue ) {
    try {
        var filetext = fs.readFileSync('./pksetting/' + filename );
        return filetext;
    } catch (e) {
        return errorvalue;
    }
}

function SaveSetting( filename, value ) {
    try {
        var fd = fs.openSync('./pksetting/' + filename, "w");
        fs.writeSync(fd, value, 0, "ascii");
        fs.closeSync(fd);
        return true;
    } catch(e) {
        return false;
    }
}

var MyPkNumber = parseInt( LoadSetting('pknum',1) );
var OpenURLPortNum = parseInt( LoadSetting('urlportnum',3000), 10);
var MqttUrl = LoadSetting('mqtturl','noteihfhy2wn.mlkcca.com');
var MqttDataStoreR = LoadSetting('mqttdatastorer','control');
var MqttDataStoreS = LoadSetting('mqttdatastores','pk');
console.log('PK:' + MyPkNumber);
console.log('OpenURLPort:' + OpenURLPortNum);
console.log('MQTT URL:' + MqttUrl);
console.log('MQTT DataStoreR:' + MqttDataStoreR);
console.log('MQTT DataStoreS:' + MqttDataStoreS);

// Serial port ==========================================================
var SerialPort = require("serialport").SerialPort;
var PortName = "/dev/ttyACM0";
var sp = new SerialPort(PortName, {
  baudrate:19200,
  dataBits:8,
  parity:'none',
  stopBits:1,
  flowControl:false
});

sp.open(function(error) {
  if (error) {
    console.log('Failed to open: ' + error);
  } else {
    console.log('open');
    sp.on('data', function(data) {
      console.log('data received: ' + data);
      // send to MQTT ==================================================
      try {
        var sendStr = ( '00' + MyPkNumber ).substr(0,2) + data;
        dsS.send({ 'cmd' : sendStr });
      } catch (e) {
      }
    });
  }
});

// Open URL server ======================================================
var http = require('http');
var server = http.createServer();
server.on('request', function(req, res) {
  var urlinfo = require('url').parse( req.url );
  if ( urlinfo.query != null) {
    res.end(urlinfo.query);
    console.log(urlinfo.query);
    sp.write(urlinfo.query);
  }
});
server.listen(OpenURLPortNum);

// Milkcocoa(MQTT) ======================================================
var MilkCocoa = require('milkcocoa');
var milkcocoa = new MilkCocoa("leadilsv05vy.mlkcca.com");
var dsR = milkcocoa.dataStore(MqttDataStoreR);
var dsS = milkcocoa.dataStore(MqttDataStoreS);
dsR.on('send',function(cmd){
    if (IsMyNumber( cmd, MyPkNumber ) ) {
        console.log( cmd.value.cmd );
        sp.write( cmd.value.cmd.substr(2) );
    }
});


