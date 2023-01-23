#ifndef HTTP_SERVER
#define HTTP_SERVER

#include <ESP8266WiFi.h>

#define FILESYS LittleFS
#define HEADER_LEN 650

void FS_init();

void HTTP_init(WiFiServerSecure* http_server);
void HTTP_loop(WiFiServerSecure* http_server);
bool HTTP_handle(WiFiClientSecure* http_client, char** path, size_t* length);
const char* HTTP_getMIME(const char* file);
void update_tree();
void set_tree_dirty(bool dirty);

#endif