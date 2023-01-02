async function main(){
    var sock = await command_new_socket(true);
    var str = "Hello 🔥\n";

    var data = await save_file_command("/test.txt", str, sock);
    console.log(data);

    var data = await read_file_command("/test.txt", sock);
    console.log(data);
    console.log(data == str);
    console.log(data === str);

    command_close_socket(sock);
}

main();