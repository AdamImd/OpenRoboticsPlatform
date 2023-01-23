var x;
var m;
var stream;
var webcam;
const webcamElement = document.getElementById('webcam');
const canvasElement = document.getElementById('canvas');
const snapSoundElement = document.getElementById('snapSound');

var init = async function init(){
    await require("/w/com/print.js");
    //await require("/w/com/input_square.js");
    //await require("/w/frame/motor_controller.js");
    
    //await require_HTTP("https://code.jquery.com/jquery-3.6.3.slim.min.js");
    //await require_HTTP("https://unpkg.com/@tensorflow/tfjs");
    //await require_HTTP("https://unpkg.com/@tensorflow-models/posenet");

    const net = await posenet.load({
        architecture: 'ResNet50',
        outputStride: 32,
        inputResolution: { width: 256, height: 256 },
        quantBytes: 2
    });
    
    //stream = await navigator.mediaDevices.getUserMedia({ video: true });
    //const track = stream.getVideoTracks()[0];
    webcam = new Webcam(webcamElement, 'user', canvasElement, snapSoundElement);
    await webcam.start();


    //x = new input_square(400);
    //m = new driver(14, 2, 0, 16, 4, 5);
};

var main = async function main(){
    //let pos = x.get_position();
    //m.set_speeds(pos[0], pos[1]); 
    //print(x.get_position());
    let image = await webcam.snap()
    const pose = await net.estimateSinglePose(image);
    console.log(pose);

    await sleep(10);
};

async function run(){
  await init();
  while(enable)
    await main();
}
run();