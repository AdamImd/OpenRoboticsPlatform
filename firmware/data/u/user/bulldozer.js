var input = null;

var init = async function init(){
    await require("/w/com/print.js");
    await require("/w/frame/motor_controller.js");
    await require("/w/frame/pins.js");
    
    m = new driver(14, 2, 0, 16, 4, 5);

    D6 = 12;
    D7 = 13;
    D8  = 15;
    servo_init_command([[D6], [D7], [D8]])
    // for(var i = 0; i < 100; i++){
    //     servo_write_command([[D6, 1+ -i/50.0], [D7, -1+ i/50.0]])
    //     await sleep(50);
    // }
    // for(var i = 100; i > -0; i--){
    //     servo_write_command([[D6, 1+ -i/50.0], [D7, -1+ i/50.0]])
    //     await sleep(50);
    // }
    await servo_write_command([[D6, 0], [D7, 0], [D8, 1]]);

    sensors.postMessage(["gp_init", "Null"], "*");

    events["gp_message"] = async function(data) {
        input = JSON.parse(data);
        console.log(input["axes"][3]);
        close = 1;
        if(input["buttons"][0] == 1) close = -1;
        angle = Math.max(-1, Math.min(0.6391796469688416, input["axes"][3]));
        await servo_write_command([[D6, angle], [D7, -angle], [D8, close]]);
        await m.set_speeds(input["axes"][0]+input["axes"][1], input["axes"][0]-input["axes"][1]);
    }
};

var main = async function main(){
    sensors.postMessage(["gp_get", "Null"], "*");
    await sleep(150);
};





async function run(){
  await init();
  while(enable)
    await main();
}
run();