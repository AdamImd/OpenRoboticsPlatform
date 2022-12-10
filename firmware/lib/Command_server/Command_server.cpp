#include <Arduino.h>
#include "Command_server.h"
#include <ESP8266WiFi.h>
#include <LittleFS.h>

const uint8_t command_clients_max = 4;
WiFiClient command_clients[command_clients_max];

const int command_len = 128;
char command[command_clients_max][command_len];

void Command_init(WiFiServer* command_server){
    command_server->begin(81, 8);
    for(int i = 0; i < command_clients_max; i++)
        command_clients[i] = command_server->available();
}

void Command_loop(WiFiServer* command_server) {
    for(int i = 0; i < command_clients_max; i++){
        if(!command_clients[i] || !command_clients[i].connected())
            command_clients[i] = command_server->available();
        if(command_clients[i] && command_clients[i].connected())
            Command_handle(&command_clients[i], i);
    }
}


void Command_handle(WiFiClient* http_client, int con){
        if(http_client->available()){
            size_t len = strlen(command[con]);
            http_client->readBytesUntil('\x10', command[con], command_len - len); // Message break point
            Serial.println(command[con]);
            if(strchr(command[con], '\x11')){ // End
                char* start;
                if((start = strchr(command[con], '\x12'))){ // Start
                    Command_execute(http_client, start);
                } else{
                    Serial.println("MALFORMED COMMAND PACKET!");
                }
                memset(command[con], 0, command_len);
                return;
            }
        }
}

void Command_execute(WiFiClient* http_client, char* command){
    // TODO: do?
    Serial.println("EXE TIME");
}