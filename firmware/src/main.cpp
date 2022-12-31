#include <Arduino.h>
#include <DNSServer.h>
#include <ESP8266WiFi.h>
#include <LittleFS.h>
#include <WebSocketsServer.h>
#include <ESP8266mDNS.h>

#include "HTTP_server.h"
#include "Command_server.h"
#include "base_commands.h"

// -----------------------------

WiFiEventHandler WiFi_connected_public, WiFi_disconnected_public;

const char* hostname = "NODE";
const char* ssid = "Open";
const char* pass = "";
const int max_conn = 4;

const IPAddress localhost = IPAddress(192, 168, 0, 1);
const IPAddress subnet = IPAddress(255, 255, 255, 0);

WiFiServer HTTP_server_private(localhost, 80);
WiFiServer* HTTP_server_public = nullptr;
DNSServer DNS_server; // Disable?

//------------------------------

void setup() {
    Serial.begin(9600);
    Serial.println("Started...");

    /*
    WiFi_connected_public = WiFi.onStationModeGotIP([](const WiFiEventStationModeGotIP& event)
    {
        HTTP_server_public = (WiFiServer*)malloc(sizeof(WiFiServer));
        *HTTP_server_public = WiFiServer(WiFi.localIP(), 80);
        HTTP_init(HTTP_server_public);

        Serial.println("C-------------------");
        Serial.println(WiFi.localIP());
        Serial.println("-------------------");
    });

    WiFi_disconnected_public = WiFi.onStationModeDisconnected([](const WiFiEventStationModeDisconnected& event)
    {
        free(HTTP_server_public);
        HTTP_server_public = nullptr;

        Serial.println("D-------------------");
        Serial.println(WiFi.localIP());
        Serial.println("-------------------");
    });
    */

    WiFi.mode(WIFI_AP_STA);
    WiFi.hostname(hostname);
    WiFi.softAPConfig(localhost, localhost, subnet);
    WiFi.softAP(ssid,pass,1,0,max_conn);

    //WiFi.begin("rumble");
    //WiFi.begin("DinnakenResidence", "Argyle!920");

    //Serial.println(MDNS.begin("test"));

    FS_init();

    HTTP_init(&HTTP_server_private); 
    Command_init();
    base_commands_init();

    //DNS_server.setErrorReplyCode(DNSReplyCode::NoError);
    //DNS_server.start(53, "*", localhost);
}

// -----------------------------
 
void loop() {
    //MDNS.update();
    //DNS_server.processNextRequest();
    
    HTTP_loop(&HTTP_server_private);
    //HTTP_loop(HTTP_server_public);
    Command_loop();
}
