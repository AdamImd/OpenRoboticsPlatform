async function main(){
    var sock = await command_new_socket();
    var str = "Hello 🔥\n";

    var data = await save_file_command(sock, "/test.txt", str);
    console.log(data);

    var data = await read_file_command(sock, "/test.txt");
    console.log(data);
    console.log(data == str);
    console.log(data === str);

    sock.close();
}

main();