#include <Arduino.h>
#include <DNSServer.h>
#include <ESP8266WiFi.h>
#include <WiFiServerSecure.h>
#include <WiFiClientSecure.h>
#include <WiFiClientSecureBearSSL.h>
#include <LittleFS.h>
#include <WebSocketsServer.h>
#include <ESP8266mDNS.h>

#include "HTTP_server.h"
#include "HTTPS_server.h"
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

WiFiServer       HTTP_server_private(localhost, 80);

WiFiServerSecure HTTPS_server_private(localhost, 443);
ServerSessions serverCache(40);

//WiFiServerSecure* HTTP_server_public = nullptr;
DNSServer DNS_server; // Disable?

//------------------------------
    static const char serverCert[] = R"EOF(
-----BEGIN CERTIFICATE-----
MIIB4TCCAYugAwIBAgIUMnz1dWpXntAo0b9EWOLrBrsLHP8wDQYJKoZIhvcNAQEL
BQAwRTELMAkGA1UEBhMCQVUxEzARBgNVBAgMClNvbWUtU3RhdGUxITAfBgNVBAoM
GEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZDAeFw0yMzAxMjMwMjIxMTBaFw0zNDA0
MTEwMjIxMTBaMEUxCzAJBgNVBAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEw
HwYDVQQKDBhJbnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQwXDANBgkqhkiG9w0BAQEF
AANLADBIAkEA0J2DzBniqad/xzrETA/WlYDMuzKHfdKduMIPmQ9UR52GNZ69l/W/
2sIvl/eR8GCFAA2zvFi3cL5umxUEUhUN8QIDAQABo1MwUTAdBgNVHQ4EFgQUflNG
3EyF4P3RASg8SWluE/mAFjAwHwYDVR0jBBgwFoAUflNG3EyF4P3RASg8SWluE/mA
FjAwDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQsFAANBAE53TRkan/cXwynD
9MtaXG7IMek5GyajiPxHy2oQ3zfS7Nj6K9gcFU/Hg2kVRDQZZfnhknsgrmXrPOc/
vi6bpQY=
-----END CERTIFICATE-----

)EOF";

static const char serverKey[] = R"EOF(
-----BEGIN PRIVATE KEY-----
MIIBUwIBADANBgkqhkiG9w0BAQEFAASCAT0wggE5AgEAAkEA0J2DzBniqad/xzrE
TA/WlYDMuzKHfdKduMIPmQ9UR52GNZ69l/W/2sIvl/eR8GCFAA2zvFi3cL5umxUE
UhUN8QIDAQABAkAkoCLtiHXk90VVwxmHiRhRcyV+kCZ9jqamM1vtsWVIlSw4Rg3e
93ayFIMuKMZ6czOv9AO26wWraszEDeZvMPcJAiEA7Uf7u+CNYllG+deGvjLP+heY
v9Akz68kxKzD0nlm69cCIQDhEpviO7dyV1va3uxXQDgqXXM5isdzBt++sVbhMNhb
dwIgforgJq8315ZzMrUNiAvDPMYu0UTpDNWED1tvx6S1DdsCID6uvBNJplGF2uMd
6pxyGjJSTGDeMaXraCznntagj+EJAiAEi0UNPTjaL8tLmeF6Okvp+3HDU5KohAWC
qOS0SpASgw==
-----END PRIVATE KEY-----
)EOF";


void setup() {
    Serial.begin(9600);
    Serial.println("Started...");

    /*
    WiFi_connected_public = WiFi.onStationModeGotIP([](const WiFiEventStationModeGotIP& event)
    {
        HTTP_server_public = (WiFiServerSecure*)malloc(sizeof(WiFiServerSecure));
        *HTTP_server_public = WiFiServerSecure(WiFi.localIP(), 80);
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

    //Serial.println(MDNS.begin("test"));

    FS_init();


    HTTP_init(&HTTP_server_private); 

    HTTPS_server_private.setRSACert(new BearSSL::X509List(serverCert), new BearSSL::PrivateKey(serverKey));
    HTTPS_server_private.setCache(&serverCache);
    HTTPS_init(&HTTPS_server_private); 
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
    HTTPS_loop(&HTTPS_server_private);
    //HTTP_loop(HTTP_server_public);
    Command_loop();
}
