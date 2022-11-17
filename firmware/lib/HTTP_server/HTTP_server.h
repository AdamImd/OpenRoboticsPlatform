#include <ESP8266WiFi.h>

#define HEADER_LEN 650

void HTTP_loop(WiFiServer* http_server);
bool HTTP_handle(WiFiClient* http_client, char** path, size_t* length);