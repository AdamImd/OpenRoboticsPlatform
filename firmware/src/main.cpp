#include <Arduino.h>
#include <DNSServer.h>
#include <ESP8266WiFi.h>
// -----------------------------

const char* hostname = "NODE";
const char* ssid = "Test";
const char* pass = emptyString.c_str();
int max_conn = 4;

IPAddress localhost = IPAddress(192, 168, 0, 0);
IPAddress subnet = IPAddress(255, 255, 0, 0);

DNSServer DNS_server;

// WEB SERVER

// TCP/WEBSOCKETS SERVER

//------------------------------

void setup() {
    WiFi.mode(WIFI_AP);
    WiFi.hostname(hostname);
    WiFi.softAPConfig(localhost, localhost, subnet);
    WiFi.softAP(ssid,pass,1,0,max_conn);

    DNS_server.setErrorReplyCode(DNSReplyCode::NoError);
    DNS_server.start(53, "*", localhost);
    
}

// -----------------------------
 
void loop() {

}