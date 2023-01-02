var command_encoder = new TextEncoder();
var global_socket = null; // TODO: Use as default

function command(num, text, callback_fun, socket){
    socket.message_fun = callback_fun;
    var buffer = command_encoder.encode("\0\0" + text);
    var buffer_num = new Uint16Array([num]).buffer;
    buffer.set(new Uint8Array(buffer_num));
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
        command(1, file_name, callback, socket);
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
        command(2, file_name, callback, socket);
    });
}

// --------------------------------------------------------------------
// Hardware I/O

async function pin_mode_command(modes, socket = global_socket){ // Modes: [[Pin, Mode],[Pin,Mode]...]
    return new Promise(function (resolve) {
        function callback(event) {
            resolve(data);
        }
        command(20, modes, callback, socket);
    });
}

async function digital_write_command(outputs, socket = global_socket){ // Modes: [[Pin, Mode],[Pin,Mode]...]
    return new Promise(function (resolve) {
        function callback(event) {
            resolve(data);
        }
        command(20, modes, callback, socket);
    });
}