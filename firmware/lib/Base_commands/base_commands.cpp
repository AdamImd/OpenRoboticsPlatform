#include "Command_server.h"
#include <LittleFS.h>
#include <Arduino.h>
#define FILESYS LittleFS

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
            for (int i = 0; i < read; i++)
            {
                Serial.print((char)buf[i]);
            }
            Serial.println();
            
        } while ( read && server->sendBIN(client_num, buf, read));
        file.close();
        Serial.println("Done T!");
        server->sendTXT(client_num, "\x00");
        //server->disconnect(client_num);
    } else {
        // TODO: fix
    }
    return 0;
}

void base_commands_init(){
    command read;
    read.command_num = 1;
    read.command_init_handle = &read_init_handle;
    read.command_rw_handle = nullptr;
    Command_list_add(read);
}



    /*
    switch (event_type) {
        case WStype_DISCONNECTED:
            break;
        case WStype_CONNECTED:
            break;
        case WStype_FRAGMENT_TEXT_START:
            memset(command[client_num], 0, command_len);
            strncat(command[client_num], (const char*)payload, length);
            break;
        case WStype_FRAGMENT:
            strncat(command[client_num], (const char*)payload, length);
            break;
        case WStype_FRAGMENT_FIN:
            strncat(command[client_num], (const char*)payload, length);
            break;
        default:
            break;
    }
    */