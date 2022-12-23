#include <Arduino.h>
#include <DNSServer.h>
#include <ESP8266WiFi.h>
#include <LittleFS.h>
#include <WebSocketsServer.h>

#include "HTTP_server.h"
#include "Command_server.h"
#include "base_commands.h"

// -----------------------------

const char* hostname = "NODE";
const char* ssid = "Test";
const char* pass = "";
const int max_conn = 4;

const IPAddress localhost = IPAddress(192, 168, 0, 1);
const IPAddress subnet = IPAddress(255, 255, 255, 0);

WiFiServer HTTP_server(localhost, 80);
DNSServer DNS_server; // Disable?

//------------------------------

void setup() {
    Serial.begin(9600);
    Serial.println("Started...");

    WiFi.mode(WIFI_AP);
    WiFi.hostname(hostname);
    WiFi.softAPConfig(localhost, localhost, subnet);
    WiFi.softAP(ssid,pass,1,0,max_conn);

    HTTP_init(&HTTP_server);    
    Command_init();
    base_commands_init();

    DNS_server.setErrorReplyCode(DNSReplyCode::NoError);
    DNS_server.start(53, "*", localhost);
}

// -----------------------------
 
void loop() {
    HTTP_loop(&HTTP_server);
    Command_loop();
    //DNS_server.processNextRequest();
}