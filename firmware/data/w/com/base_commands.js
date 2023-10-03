var command_encoder = new TextEncoder();
var global_socket = null; // TODO: Use as default

// --------------------------------------------------------------------

async function sleep(ms){
    return new Promise(function (resolve) {
        setTimeout(function(){ resolve(); }, ms);
    });
}

async function require(path){
    var sock = await command_new_socket(false);
    var data = await read_file_command(path, sock);
    command_close_socket(sock);

    try{
        window.eval(data);
    } catch (e) {
        alert(e.lineNumber);
        alert(e.message);
        alert(e.name);
    };
}

async function require_HTTP(path){
    var data = await read_file_HTTP(path);

    try{
        window.eval(data);
    } catch (e) {
        alert(e.lineNumber);
        alert(e.message);
        alert(e.name);
    };
}

// --------------------------------------------------------------------

function command_text(num, text, callback_fun, socket){
    socket.message_fun = callback_fun;
    var buffer = command_encoder.encode("\0\0" + text);
    var buffer_num = new Uint16Array([num]).buffer;
    buffer.set(new Uint8Array(buffer_num));
    socket.send(buffer);
    return;
}

function command_binary(num, bin, callback_fun, socket){
    socket.message_fun = callback_fun;
    var buffer = new Uint8Array(bin.length + 2);
    var buffer_num = new Uint16Array([num]).buffer;
    buffer.set(new Uint8Array(buffer_num));
    buffer.set(new Uint8Array(bin), 2);
    socket.send(buffer);
    return;
}

async function command_new_socket(use_global = true) {
    return new Promise(function (resolve) {
        var socket = new WebSocket("ws://" + location.hostname + ":81/");
        socket.binaryType = "arraybuffer";
        socket.message_fun = function(event){ return; };

        socket.addEventListener("message", function(event){ 
            this.message_fun(event); 
        });

        socket.addEventListener("error", function(event){
            alert(event);
            socket.close();
            throw new Error("Socket Error!");
        });

        socket.addEventListener("open", function(event){
            resolve(socket); 
        });  
        if(use_global) {
            if(global_socket)
                global_socket.close();
            global_socket = socket;
        }
    });
}

function command_close_socket(socket = global_socket) {
    socket.close();
}

// --------------------------------------------------------------------
// WiFi

async function get_ESP_IP(socket = global_socket){
    return new Promise(function (resolve) {
        function callback(event) {
            resolve(event.data);
        }
        command_text(8, "", callback, socket);
    });
}

async function wifi_connect(ssid, password, socket = global_socket){
    return new Promise(function (resolve) {
        function callback(event) {
            resolve();
        }
        command_text(9, ssid + "\x00" + password + "\x00" , callback, socket);
    });
}

async function wifi_get_ssid(socket = global_socket){
    return new Promise(function (resolve) {
        function callback(event) {
            resolve(event.data);
        }
        command_text(10, "" , callback, socket);
    });
}

// --------------------------------------------------------------------
// File I/O

async function read_file_HTTP(file_name, callback = function(){}){
    return new Promise(function (resolve) {
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() { callback() };
        req.onloadend = function () {
            if(this.status != 200){
                throw error("XMLHttpRequest Failed!");
            }
            resolve(this.response);
        };
        req.timeout = 0;
        req.open("GET", file_name, true);
        req.send();
    });
}

async function read_file_command(file_name, socket = global_socket){
    return new Promise(function (resolve) {
        var command_decoder = new TextDecoder();
        var data = "";
        function callback(event) {
            if(event.data == "")
                resolve(data);
            else
                data+= (command_decoder.decode(event.data, {stream:true}));
        }
        command_text(1, file_name, callback, socket);
    });
}

async function save_file_command(file_name, file_data, socket = global_socket){
    return new Promise(function (resolve) {
        var encoded_data = command_encoder.encode(file_data);
        var data_offset = 0;
        var chunk_size = 512;
        function callback(event) {
            if(event.data == ""){
                resolve(encoded_data.length);
            } else if (event.data == "\x01") {
                if(data_offset >= encoded_data.length){
                    socket.send("\x01");
                }else {
                    socket.send(encoded_data.slice(data_offset, data_offset+chunk_size));
                    data_offset += chunk_size;
                }
            } else
                resolve(0);
        }
        command_text(2, file_name, callback, socket);
    });
}

// --------------------------------------------------------------------
// Hardware I/O

var OUTPUT = 1;
async function pin_mode_command(modes, socket = global_socket){ // Modes: [[Pin, Mode],[Pin,Mode]...]
    return new Promise(function (resolve) {
        function callback(event) {
            resolve();
        }
        let buffer = new Uint8Array(2 * modes.length);
        for (let i = 0; i < modes.length; i++) {
            buffer[2*i + 0] = modes[i][0];
            buffer[2*i + 1] = modes[i][1];
        }
        command_binary(20, buffer, callback, socket);
    });
}

async function digital_write_command(outputs, socket = global_socket){ // Modes: [[Pin, Mode],[Pin,Mode]...]
    return new Promise(function (resolve) {
        function callback(event) {
            resolve();
        }
        let buffer = new Uint8Array(2 * outputs.length);
        for (let i = 0; i < outputs.length; i++) {
            buffer[2*i + 0] = outputs[i][0];
            buffer[2*i + 1] = outputs[i][1];
        }
        command_binary(21, buffer, callback, socket);
    });
}

async function analog_write_command(outputs, socket = global_socket){ // Modes: [[Pin, Mode],[Pin,Mode]...]
    return new Promise(function (resolve) {
        function callback(event) {
            resolve();
        }
        let output_value = new Uint16Array(1);
        let buffer = new Uint8Array(3 * outputs.length);
        for (let i = 0; i < outputs.length; i++) {
            buffer[3*i + 0] = outputs[i][0];
            output_value[0] = outputs[i][1];
            buffer.set(new Uint8Array(output_value.buffer), 3*i + 1);
        }
        command_binary(22, buffer, callback, socket);
    });
}

async function servo_init_command(outputs, socket = global_socket){ // Modes: [[Pin],[Pin]...]
    return new Promise(function (resolve) {
        function callback(event) {
            resolve();
        }
        let buffer = new Uint8Array(outputs.length);
        for (let i = 0; i < outputs.length; i++) {
            buffer[i] = outputs[i][0];
        }
        command_binary(23, buffer, callback, socket);
    });
}


async function servo_write_command(outputs, socket = global_socket){ // Modes: [[Pin, Mode],[Pin,Mode]...]
    return new Promise(function (resolve) {
        function callback(event) {
            resolve();
        }
        let output_value = new Int16Array(1);
        let buffer = new Uint8Array(3 * outputs.length);
        for (let i = 0; i < outputs.length; i++) {
            buffer[3*i + 0] = outputs[i][0];
            output_value[0] = ~~(outputs[i][1]*500)+1500;
            buffer.set(new Uint8Array(output_value.buffer), 3*i + 1);
        }
        command_binary(24, buffer, callback, socket);
    });
}