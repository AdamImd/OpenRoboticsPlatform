var x;
var m;

var init = async function init(){
    await require("/w/com/input_square.js");
    await require("/w/com/print.js");
    await require("/w/frame/motor_controller.js");
    x = new input_square(400);
    m = new driver(14, 2, 0, 16, 4, 5);
};

var main = async function main(){
    let pos = x.get_position();
    m.set_speeds(pos[0], pos[1]); 
    print(x.get_position());
    await sleep(10);
};

async function run(){
  await init();
  while(enable)
    await main();
}
run();