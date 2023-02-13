#ifndef HTTPS_SERVER
#define HTTPS_SERVER

#include <ESP8266WiFi.h>
#include <HTTP_server.h>

#define FILESYS LittleFS
#define HEADER_LEN 650



void HTTPS_init(WiFiServerSecure* https_server);
void HTTPS_loop(WiFiServerSecure* https_server);
bool HTTPS_handle(WiFiClientSecure* https_client, char** path, size_t* length);


#endif