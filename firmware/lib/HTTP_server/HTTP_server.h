#include <ESP8266WiFi.h>

#define FILESYS LittleFS
#define HEADER_LEN 650

void HTTP_init();
void HTTP_loop(WiFiServer* http_server);
bool HTTP_handle(WiFiClient* http_client, char** path, size_t* length);
const char* HTTP_getMIME(const char* file);