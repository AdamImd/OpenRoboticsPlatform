#include <Arduino.h>
#include <DNSServer.h>
#include <ESP8266WiFi.h>
#include <LittleFS.h>
#include <WebSocketsServer.h>

#include "HTTP_server.h"
//#include <ESP8266mDNS.h>
// -----------------------------

const char* hostname = "NODE";
const char* ssid = "Test";
const char* pass = emptyString.c_str();
int max_conn = 4;

const IPAddress localhost = IPAddress(192, 168, 0, 1);
const IPAddress subnet = IPAddress(255, 255, 0, 0);

DNSServer DNS_server;
WebSocketsServer WS_server(81,"/", "arduino");
WiFiServer HTTP_server(localhost,80);

// TCP/WEBSOCKETS SERVER

//------------------------------

void WS_event(uint8_t remote_num, WStype_t ev_type, uint8_t* data, size_t len) {
    switch (ev_type) {
    case WStype_CONNECTED:
        break; // TODO: LOGGING/INDI
    case WStype_DISCONNECTED:
        break; // TODO: LOGGING/INDI
    case WStype_TEXT:
        Serial.write(data, len);
    }
}

void setup() {
    Serial.begin(9600);
    Serial.println("Started...");

    WiFi.mode(WIFI_AP);
    WiFi.hostname(hostname);
    WiFi.softAPConfig(localhost, localhost, subnet);
    WiFi.softAP(ssid,pass,1,0,max_conn);

    DNS_server.setErrorReplyCode(DNSReplyCode::NoError);
    DNS_server.start(53, "*", localhost);

    WS_server.begin();
    WS_server.onEvent(WS_event);
    
    HTTP_server.begin();
    HTTP_init();
}

// -----------------------------
 
void loop() {
    HTTP_loop(&HTTP_server);
    WS_server.loop();
    DNS_server.processNextRequest();
}