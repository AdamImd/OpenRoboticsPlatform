/*
 Name:		WifiTest.ino
 Created:	5/5/2019 8:48:42 PM
 Author:	witts
*/

// the setup function runs once when you press reset or power the board
#include <ESP8266WebServerSecureBearSSL.h>
#include <ESP8266WebServerSecureAxTLS.h>
#include <ESP8266WebServerSecure.h>
#include <ESP8266WebServer.h>
#include <WiFiUdp.h>
#include <WiFiServerSecureBearSSL.h>
#include <WiFiServerSecureAxTLS.h>
#include <WiFiServerSecure.h>
#include <WiFiServer.h>
#include <WiFiClientSecureBearSSL.h>
#include <WiFiClientSecureAxTLS.h>
#include <WiFiClientSecure.h>
#include <WiFiClient.h>
#include <ESP8266WiFiType.h>
#include <ESP8266WiFiSTA.h>
#include <ESP8266WiFiScan.h>
#include <ESP8266WiFiMulti.h>
#include <ESP8266WiFiGeneric.h>
#include <ESP8266WiFiAP.h>
#include <ESP8266WiFi.h>
#include <CertStoreBearSSL.h>
#include <BearSSLHelpers.h>

char* ssid = "Beta";
char* password = "";

IPAddress ip(192, 168, 11, 4);
IPAddress gateway(192, 168, 11, 1);
IPAddress subnet(255, 255, 255, 0);

ESP8266WebServer server(80);

void setup() {
	WiFi.mode(WIFI_STA);
	WiFi.softAPConfig(ip, gateway, subnet);
	WiFi.softAP(ssid, password);
	WiFi.begin();

	server.on("/", handleRootPath);
	server.begin();
}

// the loop function runs over and over again until power down or reset
void loop() {
	server.handleClient();
}

void handleRootPath() {
	server.send(200, "html", "HI");
}