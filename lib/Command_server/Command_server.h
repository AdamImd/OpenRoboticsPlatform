#ifndef COMMAND_SERVER
#define COMMAND_SERVER

#include <WebSocketsServer.h>

#define FILESYS LittleFS

struct command{
    uint16_t command_num;
    uint16_t (*command_init_handle) (WebSocketsServer* server, uint8_t client_num, uint8_t * payload, size_t length);
    uint16_t (*command_rw_handle) (WebSocketsServer* server, uint8_t client_num, WStype_t event_type, uint8_t * payload, size_t length);
};

void Command_init();
void Command_loop();
void Command_list_add(command event);
uint16_t Command_handle(uint8_t client_num, WStype_t event_type, uint8_t * payload, size_t length);
uint16_t Command_execute(uint8_t client_num, uint8_t * payload, size_t length);

#endif