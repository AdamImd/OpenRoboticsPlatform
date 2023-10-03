var m;
var keys;

var init = async function init(){
    await require("/w/com/print.js");
    await require("/w/frame/motor_controller.js");
    await require("/w/com/input_square.js");
    await require("/w/com/key_input.js");
    
    m = new driver(14, 2, 0, 16, 4, 5);
    m.invert_motor(false, true);
    keys = new key_input();
};

var main = async function main(){
    // Get WASD input
    let pos = [0, 0];
    if(keys.key_pressed("w"))
        pos = [1, 1]
    if(keys.key_pressed("s"))
        pos = [-1, -1]
    if(keys.key_pressed("a"))
        pos = [-1, 1]
    if(keys.key_pressed("d"))
        pos = [1, -1]
    
    m.set_speeds(pos[0], pos[1]);
    print(pos)
    await sleep(10);
};


async function run(){
  await init();
  while(enable)
    await main();
}
run();

