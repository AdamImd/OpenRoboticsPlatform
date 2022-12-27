#include "Command_server.h"
#include <LittleFS.h>
#include <Arduino.h>
#define FILESYS LittleFS

#define READ_NUM 1
#define WRITE_NUM 2

uint16_t read_init_handle(WebSocketsServer* server, void **global_data, uint8_t client_num, uint8_t *payload, size_t length){
    Serial.println("REEAd");
    Serial.println((char*)payload);
    Serial.println(length);

    const size_t size = 512; size_t read; uint8_t buf[size];
    File file = FILESYS.open((char*)payload, "r");
    if(file){
        do{
            ESP.wdtFeed();
            read = file.read(buf, size);
        } while ( read && server->sendBIN(client_num, buf, read));
        file.close();
    } else {
        // TODO: fix 
    }
    server->sendTXT(client_num, "\x00");
    return 0;
}

struct file_data{
    File file;
};

// TODO: Remove
file_data write_files[WEBSOCKETS_SERVER_CLIENT_MAX];

uint16_t write_init_handle(WebSocketsServer* server, void **global_data, uint8_t client_num, uint8_t *payload, size_t length){
    Serial.println("WRIITRE");
    Serial.println((char*)payload);
    Serial.println(length);

    write_files[client_num] = {FILESYS.open((char*)payload, "w")};

    if(!write_files[client_num].file){
        server->sendTXT(client_num, "\x02");
        return 0;
    }
    server->sendTXT(client_num, "\x01");
    return WRITE_NUM;
}

uint16_t write_rw_handle(WebSocketsServer* server, void** global_data, uint8_t client_num, WStype_t event_type, uint8_t * payload, size_t length){
    Serial.println("WRIITRE 2");
    Serial.println(event_type);
    if(event_type != WStype_BIN && event_type != WStype_TEXT) 
        return WRITE_NUM;

    //Serial.println((char*)payload);
    Serial.println(length);

    if(!write_files[client_num].file){
        server->sendTXT(client_num, "\x02");
        return 0;
    }

    switch (event_type){
        case WStype_BIN:
            write_files[client_num].file.write(payload, length);
            server->sendTXT(client_num, "\x01");
            Serial.println("BIN");
            return WRITE_NUM;
        case WStype_TEXT:
            write_files[client_num].file.close();
            server->sendTXT(client_num, "\x00");
            Serial.println("TXT");
            return 0;
        default:
            break;
    }
    return 0;
}


void base_commands_init(){
    command read;
    read.command_num = READ_NUM;
    read.command_init_handle = &read_init_handle;
    read.command_rw_handle = nullptr;
    Command_list_add(read);

    command write;
    write.command_num = WRITE_NUM;
    write.command_init_handle = &write_init_handle;
    write.command_rw_handle = &write_rw_handle;
    Command_list_add(write);
}
