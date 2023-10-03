var x;
var m;
var vid;
var net;

var init = async function init(){
    await require("/w/com/print.js");
    await require("/w/frame/motor_controller.js");
    //await require("/w/com/input_square.js");
    //x = new input_square(400);
    //let pos = x.get_position();
    
    await require_HTTP("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js");
    await require_HTTP("https://cdn.jsdelivr.net/npm/@tensorflow-models/posenet@2.0.0/dist/posenet.min.js");

    net = await posenet.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        inputResolution: 257,
        multiplier: 0.75
      });

    vid = $("video");
    
    m = new driver(14, 2, 0, 16, 4, 5);
};

var main = async function main(){
    let poses = await net.estimatePoses(vid, {
        flipHorizontal: true,
        decodingMethod: 'single-person'
    });
    pos = poses[0].keypoints[11].position;
    leftShoulder = poses[0].keypoints[5].position.y;
    leftWrist = poses[0].keypoints[9].position.y
    if(leftShoulder < leftWrist && leftShoulder > 0.6 && leftWrist > 0.6){
        m.set_speeds(0, 0);
    } else {
        const speed = 150
        m.set_speeds(
            -(pos.x-257)/speed + (pos.y-257)/speed,
            +(pos.x-257)/speed + (pos.y-257)/speed
        ); 
    }

    await sleep(10);
};




async function run(){
  await init();
  while(enable)
    await main();
}
run();