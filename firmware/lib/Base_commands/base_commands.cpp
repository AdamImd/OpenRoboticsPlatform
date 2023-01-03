#include "Command_server.h"
#include <LittleFS.h>
#include <Arduino.h>
#include "HTTP_server.h"

#define FILESYS LittleFS

#define READ_NUM 1
#define WRITE_NUM 2
#define DIGITAL_MODE_NUM 20
#define DIGITAL_OUTPUT_NUM 21
#define ANALOG_OUTPUT_NUM 22

uint16_t read_init_handle(WebSocketsServer* server, uint8_t client_num, uint8_t *payload, size_t length);
uint16_t write_init_handle(WebSocketsServer* server, uint8_t client_num, uint8_t *payload, size_t length);
uint16_t write_rw_handle(WebSocketsServer* server, uint8_t client_num, WStype_t event_type, uint8_t * payload, size_t length);
uint16_t digital_mode_init_handle(WebSocketsServer* server, uint8_t client_num, uint8_t *payload, size_t length);
uint16_t digital_output_init_handle(WebSocketsServer* server, uint8_t client_num, uint8_t *payload, size_t length);
uint16_t analog_output_init_handle(WebSocketsServer* server, uint8_t client_num, uint8_t *payload, size_t length);

void base_commands_init(){
    analogWriteResolution(10);

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
    
    command digital_mode;
    digital_mode.command_num = DIGITAL_MODE_NUM;
    digital_mode.command_init_handle = &digital_mode_init_handle;
    digital_mode.command_rw_handle = nullptr;
    Command_list_add(digital_mode);

    command digital_output;
    digital_output.command_num = DIGITAL_OUTPUT_NUM;
    digital_output.command_init_handle = &digital_output_init_handle;
    digital_output.command_rw_handle = nullptr;
    Command_list_add(digital_output);

    command analog_output;
    analog_output.command_num = ANALOG_OUTPUT_NUM;
    analog_output.command_init_handle = &analog_output_init_handle;
    analog_output.command_rw_handle = nullptr;
    Command_list_add(analog_output);
}

// -------------------------------------------------------

uint16_t read_init_handle(WebSocketsServer* server, uint8_t client_num, uint8_t *payload, size_t length){
    //Serial.println("Read");
    //Serial.println((char*)payload);
    //Serial.println(length);

    const size_t size = 2*512; size_t read; uint8_t buf[size];
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


// -------------------------------------------------------

struct file_data{
    File file;
};
file_data write_files[WEBSOCKETS_SERVER_CLIENT_MAX];

uint16_t write_init_handle(WebSocketsServer* server, uint8_t client_num, uint8_t *payload, size_t length){
    //Serial.println("Write");
    write_files[client_num] = {FILESYS.open((char*)payload, "w")};

    if(!write_files[client_num].file){
        server->sendTXT(client_num, "\x02");
        return 0;
    }
    server->sendTXT(client_num, "\x01");
    return WRITE_NUM;
}

uint16_t write_rw_handle(WebSocketsServer* server, uint8_t client_num, WStype_t event_type, uint8_t * payload, size_t length){
    //Serial.println("Write (callback)");
    if(event_type != WStype_BIN && event_type != WStype_TEXT) 
        return WRITE_NUM;

    //Serial.println((char*)payload);
    //Serial.println(length);

    if(!write_files[client_num].file){
        server->sendTXT(client_num, "\x02");
        return 0;
    }

    switch (event_type){
        case WStype_BIN:
            write_files[client_num].file.write(payload, length);
            server->sendTXT(client_num, "\x01");
            //Serial.println("BIN");
            return WRITE_NUM;
        case WStype_TEXT:
            write_files[client_num].file.close();
            server->sendTXT(client_num, "\x00");
            set_tree_dirty(true);
            //Serial.println("TXT");
            return 0;
        default:
            break;
    }
    return 0;
}


// -------------------------------------------------------

uint16_t digital_mode_init_handle(WebSocketsServer* server, uint8_t client_num, uint8_t *payload, size_t length){
    //Serial.println("MODE");
    for(size_t i = 0; i< length; i+=2)
        pinMode(payload[i], payload[i+1]);
    server->sendTXT(client_num, "\x00");
    return 0; 
}


uint16_t digital_output_init_handle(WebSocketsServer* server, uint8_t client_num, uint8_t *payload, size_t length){
    //Serial.println("DIO");
    for(size_t i = 0; i< length; i+=2)
        digitalWrite(payload[i], payload[i+1]);
    server->sendTXT(client_num, "\x00");
    return 0;
}

// TODO: Look into packet loss
uint16_t analog_output_init_handle(WebSocketsServer* server, uint8_t client_num, uint8_t *payload, size_t length){
    //Serial.println("AIO");
    struct __attribute__((__packed__)) analog_data{
        uint8_t pin;
        uint16_t data;
    };
    for(size_t i = 0; i< length/sizeof(analog_data); i++){
        analogWrite(((analog_data*)payload)[i].pin, ((analog_data*)payload)[i].data);
        //Serial.println(((analog_data*)payload)[i].data);
    }
    
    server->sendTXT(client_num, "\x00");
    return 0;
}


// -------------------------------------------------------
