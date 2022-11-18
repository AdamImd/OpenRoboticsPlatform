#include "HTTP_server.h"
#include <ESP8266WiFi.h>
#include <LittleFS.h>

void HTTP_init(){
    FILESYS.setConfig(LittleFSConfig(false));
    FILESYS.begin();
}

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

bool HTTP_handle(WiFiClient* http_client, char** path, size_t* length){
    size_t path_len = strlen(*path); 
    size_t remaining = *length - path_len;
    if(http_client->readBytes(*path + path_len, remaining) == remaining){
        char* tmp = (char*)memcpy((char*)calloc(*length * 2, sizeof(char)), *path, *length);
        free(*path);
        *path = tmp;
        *length *= 2;
        Serial.println("Recieving buffer resized!");
    }
    if(!strstr(*path, "\r\n\r\n")) return false;
    
    char type[5], file_path[64], FS_path[32] = "/w";
    sscanf(*path, "%s%s", type, file_path);
    if(!strcmp(file_path, "/")) strcpy(file_path, "/index.html");
    // TODO: Check/Chop flags on file_path
    strcat(FS_path, file_path);

    const size_t size = 128; char buf[size];
    const char* resp = "HTTP/1.1 %s\r\nContent-Type: %s\r\nContent-length: %zu\r\nConnection: close\r\n\r\n";
    File data = FILESYS.open(FS_path, "r");
    if (data) {
        sprintf(buf,resp, "200 OK", HTTP_getMIME(FS_path), data.size());
        Serial.println(buf);
    } else {
        if(!(data = FILESYS.open("/s/404.html", "r"))) return true;
        sprintf(buf,resp, "400 Not Found", HTTP_getMIME(".html"), data.size());
    }
    http_client->write(buf);
    http_client->flush();

    while(http_client->write(buf, data.read((uint8_t*)buf, size)))
        http_client->flush();
        //while(data.streamRemaining() > 0 && !data.available());
            //Serial.println("PP");

    return true;
}

const char* HTTP_getMIME(const char* file){
    char ext[16]; strcat(strcpy(ext, strchr(file, (int)'.')), " ");
    if(strstr(".html .htm ", ext))
        return "text/html";
    if(strstr(".js ", ext))
        return "text/javascript";
    if(strstr(".css ", ext))
        return "text/css";
    if(strstr(".jpg .jpeg ", ext))
        return "image/jpeg";
    if(strstr(".png ", ext))
        return "image/png";
    return "application/octet-stream";
}