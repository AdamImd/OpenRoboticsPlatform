async function main(){
    //await command_new_socket();
    let LED_BUILTIN = 2;
    let OUTPUT = 1;
    await pin_mode_command([[LED_BUILTIN, OUTPUT]]);
    
    for (let i = 0; i < 1024; i++) {
      await analog_write_command([[LED_BUILTIN, i]]);
      await sleep(1);
    }
  }
  
  main();