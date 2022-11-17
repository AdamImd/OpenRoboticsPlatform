#include <Arduino.h>
#include <DNSServer.h>
#include <ESP8266WiFi.h>

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

WiFiServer HTTP_server(localhost,80);

// TCP/WEBSOCKETS SERVER

//------------------------------

void setup() {
    Serial.begin(9600);
    Serial.println("Started...");

    WiFi.mode(WIFI_AP);
    WiFi.hostname(hostname);
    WiFi.softAPConfig(localhost, localhost, subnet);
    WiFi.softAP(ssid,pass,1,0,max_conn);

    DNS_server.setErrorReplyCode(DNSReplyCode::NoError);
    DNS_server.start(53, "*", localhost);
    
    HTTP_server.begin();

    // DATA SERVER
}

// -----------------------------
 
void loop() {
    HTTP_loop(&HTTP_server);
    DNS_server.processNextRequest();
    
}