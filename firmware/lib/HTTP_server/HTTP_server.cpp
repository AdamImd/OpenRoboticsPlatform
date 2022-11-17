#include "HTTP_server.h"
#include <ESP8266WiFi.h>

void HTTP_loop(WiFiServer* http_server) {
    WiFiClient http_client = http_server->available();
    http_client.setTimeout(0);
    if(http_client){
        size_t len = HEADER_LEN;
        char* resource_path = (char*)calloc(len, sizeof(char)); 
        while(http_client.connected())
            if(http_client.available())
                if(HTTP_handle(&http_client, &resource_path, &len))
                    break;
        while(http_client.available())
            http_client.read();
        free(resource_path);
        http_client.stop();
    }
}

String prepareHtmlPage()
{
  String htmlPage;
  htmlPage.reserve(1024); // prevent ram fragmentation
  htmlPage = F("HTTP/1.1 200 OK\r\n"
                "Content-Type: text/html\r\n"
                "Connection: close\r\n" 
                "\r\n"
                "<!DOCTYPE HTML>"
                "<html>"
                "Test"
                "</html>"
                "\r\n");
  return htmlPage;
}

bool HTTP_handle(WiFiClient* http_client, char** path, size_t* length){
    size_t path_len = strlen(*path); 
    size_t remaining = *length - path_len;
    if(http_client->readBytes(*path + path_len, remaining) == remaining){
        char* tmp = (char*)memcpy((char*)calloc(*length * 2, sizeof(char)), *path, *length);
        free(*path);
        *path = tmp;
        *length *= 2;
        Serial.println("------------------DUP");
    }
    if(!strstr(*path, "\r\n\r\n")) return false;
    
    char type[5], SPIFFS_path[255];
    Serial.println(sscanf(*path, "%s%s", type, SPIFFS_path));
    Serial.println(type);
    Serial.println(SPIFFS_path);

    //TODO: PRINT PAGE
    http_client->println(prepareHtmlPage());

    Serial.println("-------------------------------");
    Serial.println(*path);
    //Serial.println(strlen(*path));
    Serial.println("DONE");
    return true;
}