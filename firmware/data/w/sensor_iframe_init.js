function $(doc) {
    return document.getElementById(doc);
}

var parent = null;
var stream = new MediaStream(); 

gp = null;

window.addEventListener("load", async function () {
    parent = window.opener;
    //av = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
    
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
    events["rtc_0"] = async function(data) {
        console.log("RTC_INIT");
        rtc = new RTCPeerConnection({
            //iceServers: [{urls: "stun:127.0.0.1:9876"}],
            //iceTransportPolicy: "relay"
        });
        rtc.onicecandidate = function (event){
            parent.postMessage(["rtc_ice", JSON.stringify(event.candidate)], "*");
        }
        stream.addTrack(av.getVideoTracks()[0]);
        stream.addTrack(av.getAudioTracks()[0]);
        rtc.addTrack(stream.getVideoTracks()[0], stream);
        rtc.addTrack(stream.getAudioTracks()[0], stream);
        console.log(stream);
        $("video").srcObject = stream;
        await rtc.setLocalDescription();
        parent.postMessage(["rtc_1", JSON.stringify(rtc.localDescription)], "*");
    }
    events["rtc_2"] = async function(data) {
        console.log("RTC_2");
        let description= JSON.parse(data);
        console.log(description);
        if (description) {
            await rtc.setRemoteDescription(description);
        }
        parent.postMessage(["rtc_3", "Hello World"], "*");
    }  


    events["gp_init"] = async function(data) {
        window.addEventListener("gamepadconnected", (e) => {
            gp = e.gamepad;
        });
    }  

    events["gp_get"] = async function(data) {
        if (gp != null) {
            console.log(gp.axes);
            data = {};
            data["buttons"] = gp.buttons.map((b) => b.value);
            data["axes"] = gp.axes;
            parent.postMessage(["gp_message", JSON.stringify(data)], "*");
        }
        
    }  
});


var events = {}
window.addEventListener("message", (event) => {
    //console.log(event.data);
    events[event.data[0]] ? events[event.data[0]](event.data[1]) : false;
});

