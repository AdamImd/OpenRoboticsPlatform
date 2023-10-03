#include "HTTPS_server.h"
#include <ESP8266WiFi.h>
#include <WiFiServerSecure.h>
#include <WiFiClientSecure.h>
#include <WiFiClientSecureBearSSL.h>
#include <LittleFS.h>

void HTTPS_init(WiFiServerSecure* https_server){
    if(https_server == nullptr) return;
    https_server->setNoDelay(false); // TODO: CHECK?
    https_server->begin(443, 16);
    //WiFiClient::setDefaultNoDelay(true);
    WiFiClient::setDefaultSync(false);
}

void HTTPS_loop(WiFiServerSecure* https_server) {
    if(https_server == nullptr) return;
    WiFiClientSecure https_client = https_server->available();
    https_client.setTimeout(0);
    if(https_client){
        size_t len = HEADER_LEN;
        char* resource_path = (char*)calloc(len, sizeof(char)); 
        while(https_client.connected())
            if(https_client.available())
                if(HTTPS_handle(&https_client, &resource_path, &len))
                    break;
        https_client.flush();
        while(https_client.available())
            https_client.read();
        free(resource_path);
        https_client.stop();
    }
}

bool HTTPS_handle(WiFiClientSecure* https_client, char** path, size_t* length){
    size_t path_len = strlen(*path); 
    size_t remaining = *length - path_len;
    if(https_client->readBytes(*path + path_len, remaining) == remaining){
        char* tmp = (char*)memcpy((char*)calloc(*length * 2, sizeof(char)), *path, *length);
        free(*path);
        *path = tmp;
        *length *= 2;
        Serial.println("Receiving buffer resized!");
    }
    Serial.println(*path);
    
    if(!strstr(*path, "\r\n\r\n")) return false;
    
    char type[5], enc[16], file_path[64]; 
    sscanf(*path, "%s%s", type, file_path); // GET /***
    

    if(!strcmp(file_path, "/")) strcpy(file_path, "/w/index.html");
    if(!strcmp(file_path, "/favicon.ico")) strcpy(file_path, "/w/favicon.ico");

    if(!strcmp(file_path, "/w/editor.js")) // TODO: GZIP folder
        strcpy(enc, "gzip");
    else
        strcpy(enc, "identity");
        
    if(!strcmp(file_path, "/s/tree.bin"))
        update_tree();
    
    Serial.println(file_path);
    // TODO: Check/Chop flags on file_path

    const size_t size = 512; char buf[size];
    const char* resp = "HTTP/1.1 %s\r\nAccess-Control-Allow-Origin: *\r\nContent-Encoding: %s\r\nContent-Type: %s\r\n\
                        Content-length: %zu\r\nConnection: close\r\n\r\n";

    File data = FILESYS.open(file_path, "r");
    if (data) {
        sprintf(buf, resp, "200 OK", enc, HTTP_getMIME(file_path), data.size());
    } else {
        if(!(data = FILESYS.open("/s/404.html", "r"))) return true;
        sprintf(buf, resp, "400 Not Found", enc, HTTP_getMIME(".html"), data.size());
    }
    if(!data) Serial.println("FS ERROR: Files missing!");

    //https_client->write(data); // TODO: Bug Report
    https_client->write((uint8_t*)buf, strlen(buf));
    data.sendSize(https_client, data.size());
    data.close();
    return true;
}
