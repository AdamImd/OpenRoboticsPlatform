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
    
    ///-----------------
    //Serial.println(*path);
    ///-----------------

    char type[5], enc[16], file_path[64], FS_path[32] = "/w"; 
    sscanf(*path, "%s%s", type, file_path);
    
    if(!strcmp(file_path, "/")) strcpy(file_path, "/index.html");

    if(!strcmp(file_path, "/editor.js"))
        strcpy(enc, "gzip");
    else
        strcpy(enc, "identity");
        
    if(!strcmp(file_path, "/tree.bin")) {
        update_tree();
        strcpy(FS_path, "/s");
    }
    
    // TODO: Check/Chop flags on file_path
    strcat(FS_path, file_path);


    
    // TODO: opt size
    const size_t size = 512; size_t read; char buf[size];
    const char* resp = "HTTP/1.1 %s\r\nContent-Encoding: %s\r\nContent-Type: %s\r\nContent-length: %zu\r\nConnection: close\r\n\r\n";

    File data = FILESYS.open(FS_path, "r");
    if (data) {
        sprintf(buf, resp, "200 OK", enc, HTTP_getMIME(FS_path), data.size());
    } else {
        if(!(data = FILESYS.open("/s/404.html", "r"))) return true;
        sprintf(buf, resp, "400 Not Found", enc, HTTP_getMIME(".html"), data.size());
    }
    read = strlen(buf);
    do{
        ESP.wdtFeed();
        http_client->flush();
        http_client->write(buf, read);
    } while( (read = data.read((uint8_t*)buf, size)) );
    http_client->flush();
    return true;
}

const char* HTTP_getMIME(const char* file){
    char ext[16]; strcat(strcpy(ext, strchr(file, (int)'.')), " ");
    //TODO: FIX NO EXTENSION
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
    if(strstr(".ico ", ext))
        return "image/x-icon";
    return "application/octet-stream";
}

void recursive_add_file(const char* path, File* tree){
    Dir file = FILESYS.openDir(path);
    while(file.next()) {
        Serial.println(file.fileName());
        tree->write(file.fileName().c_str());
        if(file.isFile()){
            tree->write("\x1C\x1F");
        }
        if(file.isDirectory()){
            char sub_path[32];
            strcat(strcat(strcpy(sub_path,path), "/"), file.fileName().c_str());
            tree->write("\x1D\x1F");
                recursive_add_file(sub_path, tree);
            tree->write("\x1E\x1F");
        }
    }
}

void update_tree() {
    File tree = FILESYS.open("/s/tree.bin", "w");
    recursive_add_file("/u", &tree);
    tree.flush();
    tree.close();
}
    
