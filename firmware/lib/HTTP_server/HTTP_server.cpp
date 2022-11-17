#include "HTTP_server.h"
#include <ESP8266WiFi.h>

void HTTP_loop(WiFiServer* http_server) {
    WiFiClient http_client = http_server->available();
    if(http_client){
        while(http_client.connected())
            if(http_client.available())
                if(HTTP_handle(&http_client))
                    break;
        while(http_client.available())
            http_client.read();
        http_client.stop();
    }
}

bool HTTP_handle(WiFiClient* http_clent){
    String path = http_clent->readStringUntil('\r');
    
    //TODO: Check path (may not be complete) https://arduino-esp8266.readthedocs.io/en/latest/esp8266wifi/server-examples.html
    //TODO: PRINT PAGE
    http_clent->println("DONE");
    return true;
}