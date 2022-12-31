var command_encoder = new TextEncoder();
var command_queue = [];

function command(socket, num, text){
    socket.done = false;
    
    var buffer = command_encoder.encode("\x01\x01" + text);
    var buffer_num = new Uint16Array(buffer);
    buffer_num[0] = num;
    
    if(socket.readyState === WebSocket.OPEN){
        console.log("SENDING");
        socket.send(buffer);
    } else {
        console.log("PUSHING");
        command_queue.push(buffer);
    }
    
    print(buffer);
}

function command_socket(){
    var socket = new WebSocket("ws://" + location.hostname + ":81/");
    socket.binaryType = "arraybuffer";
    
    socket.addEventListener("error", function(event){
        alert(event);
        socket.close();
    });

    socket.addEventListener("open", function(event){
        command_queue.forEach(buffer => {
            socket.send(buffer);
        });
    });

    socket.message_fun = function(event){ return; };
    socket.on("message", function(event){ this.message_fun(event); });

    socket.done = true;
    return socket;
}