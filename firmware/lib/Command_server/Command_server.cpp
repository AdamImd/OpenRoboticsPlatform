#include <Arduino.h>
#include "Command_server.h"
#include <LittleFS.h>
#include <WebSocketsServer.h>

command* command_list;
uint16_t command_list_len = 0;
uint16_t command_list_len_max = 0;

const uint8_t command_len = 128;
//char command[WEBSOCKETS_SERVER_CLIENT_MAX][command_len];
uint16_t command_state[WEBSOCKETS_SERVER_CLIENT_MAX];
static WebSocketsServer Command_server(81, "/");


void Command_init(){
    for(int i = 0; i < WEBSOCKETS_SERVER_CLIENT_MAX; i++)
        command_state[i]=0;
    
    Command_server.begin();
    Command_server.onEvent(Command_handle);
}

void Command_list_add(command event){
    if(command_list_len_max < 1){ // Init command_list
        Serial.println("H:1");
        command_list_len = 0;
        command_list_len_max = 128;
        command* tmp = command_list;
        command_list = (command*)malloc(sizeof(command) * command_list_len_max);
        free(tmp);
    }
    if(command_list_len >= command_list_len_max){ // Resize command_list
        Serial.println("H:2");
        command_list_len_max *= 2;
        command* tmp = command_list;
        command_list = (command*)malloc(sizeof(command) * command_list_len_max);
        memcpy(command_list, tmp, sizeof(command)*command_list_len);
        free(tmp);
    }
    command_list[command_list_len++] = event;
    Serial.println(command_list[0].command_num);
}

void Command_loop() {
    Command_server.loop();
}

uint16_t Command_handle(uint8_t client_num, WStype_t event_type, uint8_t * payload, size_t length){
    if(command_state[client_num]){
        for (int i = 0; i < command_list_len; i++)
            if(command_list[i].command_num == command_state[client_num])
                command_state[client_num] = command_list[i].command_rw_handle(&Command_server, client_num, event_type, payload, length);
    } else {
        switch (event_type) {
            case WStype_DISCONNECTED:
                break;
            case WStype_CONNECTED:
                break;
            case WStype_TEXT:
            case WStype_BIN:
                Serial.print("EVENT: ");
                Serial.println(event_type);
                command_state[client_num] = Command_execute(client_num, payload, length);
                break;
            default:
                break;
        }
    }
    return command_state[client_num];
}

uint16_t Command_execute(uint8_t client_num, uint8_t * payload, size_t length){
    Serial.println("EXE TIME 0");
    uint16_t* event_num = (uint16_t*)payload;
    uint8_t* payload_data = (payload + sizeof(uint16_t));
    Serial.println("EXE TIME 1");
    Serial.println(*event_num);
    Serial.println("CL:");

    for(int i=0; i<command_list_len; i++){
         Serial.println(command_list[i].command_num);
        if(command_list[i].command_num == *event_num){
            Serial.println("EXE TIME 3");
            return command_list[i].command_init_handle(&Command_server, client_num, payload_data, length - sizeof(uint16_t));
        }
    }
    // TODO: Error handle
    return 0;    
}
