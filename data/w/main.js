function $(doc) {
    return document.getElementById(doc);
}

async function editor_nav_init(callback, data = null) {
    var nav = $("editor_nav_tree");
    var tree = "";
    var path = ["/"];

    var selected_id = [];
    var old_selected = document.getElementsByClassName("caret-down");
    for(var i = 0; i < old_selected.length; i++)
        selected_id.push(old_selected[i].id);

    if(!data){
        var data = await read_file_HTTP("/s/tree.bin");
        localStorage.setItem("tree_data", data);
    }

    data.split("\x1F").forEach(element => {
        if(element.length != 0) {
            if(element[0] == "\x1D"){ // Folder Start
                var local_path = path[path.length-1] + element.substring(1) + "/";
                var selected = selected_id.includes(local_path) ? [" caret-down", " active"] : ["", ""];
                tree += '<li> <span id="' + local_path + '" class="caret' + selected[0] + '">'+ 
                        element.substring(1) + '/</span> <ul class="nested' + selected[1] + '"> ';
                path.push(local_path);
            }
            else if(element[0] == "\x1C"){ // File
                tree += '<li id="' + path[path.length-1] + element.substring(1) + 
                     '" class="nav_file">-' + element.substring(1) + '</li>';
            }
            else if(element[0] == "\x1E"){ // Folder End
                tree += '</ul></li>';
                path.pop();
            }        
        }
    });


    nav.innerHTML = tree;

    var folders = document.getElementsByClassName("caret");
    for(var i = 0; i < folders.length; i++){
        folders.item(i).addEventListener("click", function() {
            this.parentElement.querySelector(".nested").classList.toggle("active");
            this.classList.toggle("caret-down");
        });
    };

    var files = document.getElementsByClassName("nav_file");
    for(var i = 0; i < files.length; i++){
        files.item(i).addEventListener("click", function(event) {
            if(!event.ctrlKey){
                var selected = document.getElementsByClassName("nav_selected");
                var len = selected.length;
                for(var i = 0; i < len; i++){
                    selected.item(0).classList.remove("nav_selected");
                }
            }
            this.classList.add("nav_selected");
        });
        files.item(i).addEventListener("dblclick", async function() {
            callback(this.id);
        });
    };
}

var remote_IP;
var local_IP;
var sensors = null;
var message_rcv;

var rtc;
var stream;

window.addEventListener("load", function () {
    $("switch_IP").onclick = init_connection;
    $("sensor_button").onclick = function (event) {
        sensors = window.open("https://192.168.0.1/w/sensor_iframe.html", "sensors");
        event.preventDefault();
    }
    message_rcv = function(event) {
        alert(event.data);
    }
    
    add_message_events();
});



var events = {}

var message_web_sock = null;
function add_message_events() {
    events["icon"] = function(data) {
        //message_web_sock = command_new_socket(false);
    }
    events["dcon"] = function(data) {
        //command_close_socket(message_web_sock);
    }
    events["s_offer"] = function(data) {
        //(message_web_sock);
    }
    events["rtc_ice"] = async function(data) {
        try{
            console.log("------------")
            console.log(data)
            console.log(JSON.parse(data))
            console.log("------------")
            rtc.addIceCandidate(new RTCIceCandidate(JSON.parse(data)));
        }catch {
            console.log("Dripped out!");
        }
    }
    events["rtc_1"] = async function(data) {
        console.log("RTC_1");
        description = JSON.parse(data);
        console.log(description);
        rtc = new RTCPeerConnection({
            //iceServers: [{urls: "stun:127.0.0.1:9876"}],
            //iceTransportPolicy: "relay"
        });
        rtc.onicecandidate = function (event){
            parent.postMessage(["rtc_ice", JSON.stringify(event.candidate)], "*");
        }
        if (description) {
            await rtc.setRemoteDescription(description);
            console.log("HERE");
            if(description.type === "offer") {
                await rtc.setLocalDescription();
                sensors.postMessage(["rtc_2", JSON.stringify(rtc.localDescription)], "*")
            }
        }
    }
    events["rtc_3"] = async function(data) {
        console.log("RTC_3");
        stream = new MediaStream([rtc.getReceivers()[0].track]);
        $("video").srcObject = stream;
        $("video").width = 500;
        $("video").height = 500;
    }
}
window.addEventListener("message", (event) => {
    //console.log(event.data);
    events[event.data[0]] ? events[event.data[0]](event.data[1]) : false;
});

async function init_connection() {
    let sock = await command_new_socket(false);
    await wifi_connect("DinnakenResidence", "Argyle!920", sock);
    let ssid = await wifi_get_ssid(sock);
    command_close_socket(sock);
    $("switch_IP").onclick = connecting;
    $("switch_IP_label").innerText = "Connecting...";
    console.log(ssid);
}

async function connecting() {
    console.log("CONN");
    let sock = await command_new_socket(false);
    let rawIPs = await get_ESP_IP(sock);
    command_close_socket(sock);
    let bytes = new Uint8Array(rawIPs);
    remote_IP = bytes[0].toString() + "." 
                + bytes[1].toString() + "." 
                + bytes[2].toString() + "." 
                + bytes[3].toString();
    local_IP = bytes[4].toString() + "." 
                + bytes[5].toString() + "." 
                + bytes[6].toString() + "." 
                + bytes[7].toString();
    console.log(remote_IP);
    console.log(local_IP);

    if(local_IP != "0.0.0.0"){
        $("switch_IP_label").innerText = "Click here to switch to new network:";
        $("switch_IP").onclick = connect_to_external;
    }
};

async function connect_to_external() {
    console.log("ext");
    let sock = await command_new_socket(false);
    let rawIPs = await get_ESP_IP(sock);
    command_close_socket(sock);
    let bytes = new Uint8Array(rawIPs);
    remote_IP = bytes[0].toString() + "." 
                + bytes[1].toString() + "." 
                + bytes[2].toString() + "." 
                + bytes[3].toString();
    local_IP = bytes[4].toString() + "." 
                + bytes[5].toString() + "." 
                + bytes[6].toString() + "." 
                + bytes[7].toString();
    console.log(remote_IP);
    console.log(local_IP);
};