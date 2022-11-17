#include <ESP8266WiFi.h>

void HTTP_loop(WiFiServer* http_server);
bool HTTP_handle(WiFiClient* http_clent);