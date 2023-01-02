#include "HTTP_server.h"
#include <ESP8266WiFi.h>
#include <LittleFS.h>

static bool tree_dirty;

void FS_init(){
    FILESYS.setConfig(LittleFSConfig(false));
    FILESYS.begin();
    tree_dirty = true;
}

void set_tree_dirty(bool dirty) { tree_dirty = dirty; }

void HTTP_init(WiFiServer* http_server){
    if(http_server == nullptr) return;
    http_server->setNoDelay(false); // TODO: CHECK?
    http_server->begin(80, 16);
    WiFiClient::setDefaultNoDelay(true);
    WiFiClient::setDefaultSync(false);
}

void HTTP_loop(WiFiServer* http_server) {
    if(http_server == nullptr) return;
    WiFiClient http_client = http_server->available();
    http_client.setTimeout(0);
    if(http_client){
        size_t len = HEADER_LEN;
        char* resource_path = (char*)calloc(len, sizeof(char)); 
        while(http_client.connected())
            if(http_client.available())
                if(HTTP_handle(&http_client, &resource_path, &len))
                    break;
        http_client.flush();
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

    //http_client->write(data); // TODO: Bug Report
    http_client->write(buf, strlen(buf));
    data.sendSize(http_client, data.size());
    data.close();
    return true;
}

const char* HTTP_getMIME(const char* file){
    char ext[16]; strcat(strcpy(ext, strchr(file, (int)'.')), " ");
    // TODO: FIX NO EXTENSION
    // TODO: Fix multiple ext
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
        if(file.isFile()){
            tree->write("\x1F\x1C");
            tree->write(file.fileName().c_str());
        }
        if(file.isDirectory()){
            char sub_path[32];
            strcat(strcat(strcpy(sub_path,path), "/"), file.fileName().c_str());
            tree->write("\x1F\x1D");
            tree->write(file.fileName().c_str());
            recursive_add_file(sub_path, tree);
            tree->write("\x1F\x1E");
        }
    }
}

void update_tree() {
    if(!tree_dirty) return;
    File tree = FILESYS.open("/s/tree.bin", "w");
    //recursive_add_file("/u", &tree);
    recursive_add_file("/", &tree);
    tree.flush();
    tree.close();
    tree_dirty = false;
}
    
