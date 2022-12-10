#include <ESP8266WiFi.h>

#define FILESYS LittleFS

void Command_init(WiFiServer* command_server);
void Command_loop(WiFiServer* http_server);
void Command_handle(WiFiClient* http_client, int con);
void Command_execute(WiFiClient* http_client, char* command);
const char* Command_getMIME(const char* file);
void update_tree();