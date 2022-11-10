/*
 Name:		Prototype.ino
 Created:	4/16/2019 7:40:14 PM
 Author:	witts
*/

// the setup function runs once when you press reset or power the board
//#include <Hash/src/Hash.h>
#include <DNSServer.h>
#include <ArduinoJson.hpp>
#include <ArduinoJson.h>
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
#include <WebSocketsServer.h>
#include <WebSocketsClient.h>
#include <WebSockets.h>

#include "core_esp8266_waveform.h"

char* ssid = "Erickson5";
char* password = "";

IPAddress ip(192, 168, 11, 4);
IPAddress gateway(192, 168, 11, 1);
IPAddress subnet(255, 255, 255, 0);

DNSServer DNSserver;
         
ESP8266WebServer webServer(80);
WebSocketsServer server(90,"/websocket/");

const int capacity = 4*JSON_OBJECT_SIZE(2);
StaticJsonBuffer<capacity> buffer;

void setup() {
	Serial.begin(9600);
	WiFi.mode(WIFI_STA);
	WiFi.hostname("ESP");
	WiFi.softAPConfig(ip, ip, subnet);
	WiFi.softAP(ssid, password);
	

	webServer.on("/", handleRootPath);
	webServer.on("/about/", handleAbout);
	webServer.onNotFound(handleRootPath);
	webServer.begin();

	server.begin();
	server.onEvent(webSocketEvent);
	
	DNSserver.setErrorReplyCode(DNSReplyCode::NoError);
	DNSserver.start(53, "*", ip);

	pinMode(D0, OUTPUT);
	pinMode(D1, OUTPUT);
	pinMode(D2, OUTPUT);
	pinMode(D3, OUTPUT);
	pinMode(D4, OUTPUT);
	pinMode(D5, OUTPUT);
	pinMode(D6, OUTPUT);
	pinMode(D7, OUTPUT);
	analogWrite(D0, 0);
	analogWrite(D5, 0);
}

// the loop function runs over and over again until power down or reset
void loop() {
	server.loop();
	webServer.handleClient();
	DNSserver.processNextRequest();
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
	switch (type)
	{
	case WStype_DISCONNECTED:
		Serial.printf("[%u] Disconected\n", num);
		digitalWrite(D6, LOW);
		setMotor(D4, D3, D5, 0);
		setMotor(D2, D1, D0, 0);
		break;
	case WStype_CONNECTED: {            // if a new websocket connection is established
		IPAddress ip = server.remoteIP(num);
		digitalWrite(D6, HIGH);
		Serial.printf("[%u] Connected from %d.%d.%d.%d url: %s\n", num, ip[0], ip[1], ip[2], ip[3], payload);
		break;
	}
	default:
		//Serial.printf("[%u] get Text: %s\n", num, payload);
		//char* temp = (char*)(payload);
		//Serial.println(temp);
		
		JsonObject& data = buffer.parse(payload);
		
		int left = data["left"];
		int right = data["right"];
		buffer.clear();
		//analogWrite(D0, left);

		//startWaveform(D0, int(1500 - (500 * left)), 20000 - int(1500 - (500 * left)), 0);
		//startWaveform(D1, int(1500 - (500 * left)), 20000 - int(1500 - (500 * left)), 0);
		//startWaveform(D2, int(1500 - (500 * left)), 20000 - int(1500 - (500 * left)), 0);
		//startWaveform(D3, int(1500 - (500 * left)), 20000 - int(1500 - (500 * left)), 0);

		//setMotor(D3, D4, D5, -left);
		//setMotor(D2, D1, D0, -right);
		
		break;
	}
}

void handleRootPath() {
	webServer.send(200, "html", webData());
}
void handleAbout() {
	webServer.send(200, "html", about());
}

void setMotor(int side1, int side2, int pwm, int speed) {
	if (speed > 0) {
		digitalWrite(side1, HIGH);
		digitalWrite(side2, LOW);
		analogWrite(pwm, speed);
	}
	else {
		digitalWrite(side1, LOW);
		digitalWrite(side2, HIGH);
		analogWrite(pwm, -speed);
	}
}

String webData() {
	//http://tomeko.net/online_tools/cpp_text_escape.php?lang=en
	return (
		"<!DOCTYPE html>\n"
		"<html>\n"
		"<head>\n"
		"    <title> "
		+ String(ssid)+
		"</title>\n"
		"    <meta name=\"viewport\" content=\"width=device-width, initial-scale=0.7, maximum-scale=0.7\">\n"
		"    <meta charset=\"utf-8\">\n"
		"    <style>\n"
		"        body { text-align: center; font-size: width/2pt; }\n"
		"        h1 { font-weight: bold; font-size: width/2pt; }\n"
		"        h2 { font-weight: bold; font-size: width/2pt; }\n"
		"        button { font-weight: bold; font-size: width/2pt; }\n"
		"    </style>\n"
		"    <script>\n"
		"        var canvas_width = 500, canvas_height = 500;\n"
		"        var radius_base = 150;\n"
		"        var radius_handle = 72;\n"
		"        var radius_shaft = 120;\n"
		"        var range = canvas_width/2 - 10;\n"
		"        var step = 18;\n"
		"        var ws;\n"
		"        var joystick = {x:0, y:0};\n"
		"        var click_state = 0;\n"
		"        var ratio = 1;\n"
		"        function init()\n"
		"        {\n"
		"            var width = window.innerWidth;\n"
		"            var height = window.innerHeight;\n"
		"            if(width < height)\n"
		"                ratio = (width - 50) / canvas_width;\n"
		"            else\n"
		"                ratio = (height - 50) / canvas_width;\n"
		"            canvas_width = Math.round(canvas_width*ratio);\n"
		"            canvas_height = Math.round(canvas_height*ratio);\n"
		"            radius_base = Math.round(radius_base*ratio);\n"
		"            radius_handle = Math.round(radius_handle*ratio);\n"
		"            radius_shaft = Math.round(radius_shaft*ratio);\n"
		"            range = Math.round(range*ratio);\n"
		"            step = Math.round(step*ratio);\n"
		"            var canvas = document.getElementById(\"remote\");\n"
		"            //canvas.style.backgroundColor = \"#999999\";\n"
		"            canvas.width = canvas_width;\n"
		"            canvas.height = canvas_height;\n"
		"            canvas.addEventListener(\"touchstart\", mouse_down);\n"
		"            canvas.addEventListener(\"touchend\", mouse_up);\n"
		"            canvas.addEventListener(\"touchmove\", mouse_move);\n"
		"            canvas.addEventListener(\"mousedown\", mouse_down);\n"
		"            canvas.addEventListener(\"mouseup\", mouse_up);\n"
		"            canvas.addEventListener(\"mousemove\", mouse_move);\n"
		"            var ctx = canvas.getContext(\"2d\");\n"
		"            ctx.translate(canvas_width/2, canvas_height/2);\n"
		"            ctx.shadowBlur = 20;\n"
		"            ctx.shadowColor = \"LightGray\";\n"
		"            ctx.lineCap=\"round\";\n"
		"            ctx.lineJoin=\"round\";\n"
		"            update_view();\n"
		"        }\n"
		"        function connect_onclick()\n"
		"        {\n"
		"            if(ws == null)\n"
		"            {\n"
		"                //var ws_host_addr = \"<?echo _SERVER(\"HTTP_HOST\")?>\";\n"
		"                //if((navigator.platform.indexOf(\"Win\") != -1) && (ws_host_addr.charAt(0) == \"[\"))\n"
		"                {\n"
		"                    // network resource identifier to UNC path name conversion\n"
		"                    //ws_host_addr = ws_host_addr.replace(/[\\[\\]]/g, '');\n"
		"                    //ws_host_addr = ws_host_addr.replace(/:/g, \"-\");\n"
		"                    //ws_host_addr += \".ipv6-literal.net\";\n"
		"                }\n"
		"                //ws = new WebSocket(\"ws://\" + ws_host_addr + \"/web_joystick\", \"text.phpoc\");\n"
		"                ws = new WebSocket(\"ws://192.168.11.4:90/websocket/\");\n"
		"                document.getElementById(\"ws_state\").innerHTML = \"CONNECTING\";\n"
		"                ws.onopen = ws_onopen;\n"
		"                ws.onclose = ws_onclose;\n"
		"                ws.onmessage = ws_onmessage;\n"
		"            }\n"
		"            else\n"
		"                ws.close();\n"
		"        }\n"
		"        function ws_onopen()\n"
		"        {\n"
		"            document.getElementById(\"ws_state\").innerHTML = \"<font color='blue'>CONNECTED</font>\";\n"
		"            document.getElementById(\"bt_connect\").innerHTML = \"Disconnect\";\n"
		"            update_view();\n"
		"        }\n"
		"        function ws_onclose()\n"
		"        {\n"
		"            document.getElementById(\"ws_state\").innerHTML = \"<font color='gray'>CLOSED</font>\";\n"
		"            document.getElementById(\"bt_connect\").innerHTML = \"Connect\";\n"
		"            ws.onopen = null;\n"
		"            ws.onclose = null;\n"
		"            ws.onmessage = null;\n"
		"            ws = null;\n"
		"            update_view();\n"
		"        }\n"
		"        function ws_onmessage(e_msg)\n"
		"        {\n"
		"            e_msg = e_msg || window.event; // MessageEvent\n"
		"        }\n"
		"        function send_data()\n"
		"        {\n"
		"            var x = joystick.x, y = joystick.y;\n"
		"            var joystick_range = range - radius_handle;\n"
		"            var scale= 1024/100;\n"
		"            y = Math.round(-(y*100/joystick_range)*scale);\n"
		"            x = Math.round((x*100/joystick_range)*scale);\n"
		"\n"
		"            var leftVal= -y-x;\n"
		"            var rightVal= y-x;\n"
		"\n"
		"            var msg={\n"
		"                left: leftVal,\n"
		"                right: rightVal\n"
		"            }\n"
		"            if(ws != null)\n"
		"                //ws.send(x + \":\" + y + \"\\r\\n\");\n"
		"                ws.send(JSON.stringify(msg));\n"
		"        }\n"
		"        function update_view()\n"
		"        {\n"
		"            var x = joystick.x, y = joystick.y;\n"
		"            var canvas = document.getElementById(\"remote\");\n"
		"            var ctx = canvas.getContext(\"2d\");\n"
		"            ctx.clearRect(-canvas_width/2, -canvas_height/2, canvas_width, canvas_height);\n"
		"            ctx.lineWidth = 3;\n"
		"            ctx.strokeStyle=\"gray\";\n"
		"            ctx.fillStyle = \"LightGray\";\n"
		"            ctx.beginPath();\n"
		"            ctx.arc(0, 0, range, 0, 2 * Math.PI);\n"
		"            ctx.stroke();\n"
		"            ctx.fill();\n"
		"            ctx.strokeStyle=\"black\";\n"
		"            ctx.fillStyle = \"hsl(0, 0%, 35%)\";\n"
		"            ctx.beginPath();\n"
		"            ctx.arc(0, 0, radius_base, 0, 2 * Math.PI);\n"
		"            ctx.stroke();\n"
		"            ctx.fill();\n"
		"            ctx.strokeStyle=\"red\";\n"
		"            var lineWidth = radius_shaft;\n"
		"            var pre_x = pre_y = 0;\n"
		"            var x_end = x/5;\n"
		"            var y_end = y/5;\n"
		"            var max_count  = (radius_shaft - 10)/step;\n"
		"            var count = 1;\n"
		"            while(lineWidth >= 10)\n"
		"            {\n"
		"                var cur_x = Math.round(count * x_end / max_count);\n"
		"                var cur_y = Math.round(count * y_end / max_count);\n"
		"                console.log(cur_x);\n"
		"                ctx.lineWidth = lineWidth;\n"
		"                ctx.beginPath();\n"
		"                ctx.lineTo(pre_x, pre_y);\n"
		"                ctx.lineTo(cur_x, cur_y);\n"
		"                ctx.stroke();\n"
		"                lineWidth -= step;\n"
		"                pre_x = cur_x;\n"
		"                pre_y = cur_y;\n"
		"                count++;\n"
		"            }\n"
		"            var x_start = Math.round(x / 3);\n"
		"            var y_start = Math.round(y / 3);\n"
		"            lineWidth += step;\n"
		"            ctx.beginPath();\n"
		"            ctx.lineTo(pre_x, pre_y);\n"
		"            ctx.lineTo(x_start, y_start);\n"
		"            ctx.stroke();\n"
		"            count = 1;\n"
		"            pre_x = x_start;\n"
		"            pre_y = y_start;\n"
		"            while(lineWidth < radius_shaft)\n"
		"            {\n"
		"                var cur_x = Math.round(x_start + count * (x - x_start) / max_count);\n"
		"                var cur_y = Math.round(y_start + count * (y - y_start) / max_count);\n"
		"                ctx.lineWidth = lineWidth;\n"
		"                ctx.beginPath();\n"
		"                ctx.lineTo(pre_x, pre_y);\n"
		"                ctx.lineTo(cur_x, cur_y);\n"
		"                ctx.stroke();\n"
		"                lineWidth += step;\n"
		"                pre_x = cur_x;\n"
		"                pre_y = cur_y;\n"
		"                count++;\n"
		"            }\n"
		"            var grd = ctx.createRadialGradient(x, y, 0, x, y, radius_handle);\n"
		"            for(var i = 85; i >= 50; i-=5)\n"
		"                grd.addColorStop((85 - i)/35, \"hsl(0, 100%, \"+ i + \"%)\");\n"
		"            ctx.fillStyle = grd;\n"
		"            ctx.beginPath();\n"
		"            ctx.arc(x, y, radius_handle, 0, 2 * Math.PI);\n"
		"            ctx.fill();\n"
		"        }\n"
		"        function process_event(event)\n"
		"        {\n"
		"            var pos_x, pos_y;\n"
		"            if(event.offsetX)\n"
		"            {\n"
		"                pos_x = event.offsetX - canvas_width/2;\n"
		"                pos_y = event.offsetY - canvas_height/2;\n"
		"            }\n"
		"            else if(event.layerX)\n"
		"            {\n"
		"                pos_x = event.layerX - canvas_width/2;\n"
		"                pos_y = event.layerY - canvas_height/2;\n"
		"            }\n"
		"            else\n"
		"            {\n"
		"                pos_x = (Math.round(event.touches[0].pageX - event.touches[0].target.offsetLeft)) - canvas_width/2;\n"
		"                pos_y = (Math.round(event.touches[0].pageY - event.touches[0].target.offsetTop)) - canvas_height/2;\n"
		"            }\n"
		"            return {x:pos_x, y:pos_y}\n"
		"        }\n"
		"        function mouse_down()\n"
		"        {\n"
		"            if(ws == null)\n"
		"                return;\n"
		"            event.preventDefault();\n"
		"            var pos = process_event(event);\n"
		"            var delta_x = pos.x - joystick.x;\n"
		"            var delta_y = pos.y - joystick.y;\n"
		"            var dist = Math.sqrt(delta_x*delta_x + delta_y*delta_y);\n"
		"            if(dist > radius_handle)\n"
		"                return;\n"
		"            click_state = 1;\n"
		"            var radius = Math.sqrt(pos.x*pos.x + pos.y*pos.y);\n"
		"            if(radius <(range - radius_handle))\n"
		"            {\n"
		"                joystick = pos;\n"
		"                send_data();\n"
		"                update_view();\n"
		"            }\n"
		"        }\n"
		"        function mouse_up()\n"
		"        {\n"
		"            joystick.x=0;\n"
		"            joystick.y=0;\n"
		"            send_data();\n"
		"            update_view();\n"
		"            event.preventDefault();\n"
		"            click_state = 0;\n"
		"        }\n"
		"        function mouse_move()\n"
		"        {\n"
		"            if(ws == null)\n"
		"                return;\n"
		"            event.preventDefault();\n"
		"            if(!click_state)\n"
		"                return;\n"
		"            var pos = process_event(event);\n"
		"            var radius = Math.sqrt(pos.x*pos.x + pos.y*pos.y);\n"
		"            if(radius <(range - radius_handle))\n"
		"            {\n"
		"                joystick = pos;\n"
		"                send_data();\n"
		"                update_view();\n"
		"            }\n"
		"        }\n"
		"        window.onload = init;\n"
		"    </script>\n"
		"</head>\n"
		"<body>\n"
		"<a href=\"/about/\"><h1>"
		+String(ssid)+
		"</h1></a>\n"
		"<canvas id=\"remote\"></canvas>\n"
		"<h2>\n"
		"    <p>\n"
		"        WebSocket : <span id=\"ws_state\">null</span>\n"
		"    </p>\n"
		"    <button id=\"bt_connect\" type=\"button\" onclick=\"connect_onclick();\">Connect</button>\n"
		"</h2>\n"
		"</body>\n"
		"</html>\n"
		""
		);
}

String about() {
	return(
		"<!DOCTYPE html>\n"
		"<html lang=\"en\">\n"
		"<head>\n"
		"    <meta charset=\"UTF-8\">\n"
		"    <title>About "
		+ String(ssid)+ 
		"</title>\n"
		"</head>\n"
		"<body>\n"
		"<h1>My Robot: "
		+ String(ssid) +
		"</h1>\n"
		"<p>\n"
		"This is information about my robot.\n"
		"</p>\n"
		"</body>\n"
		"</html>"
		);
}
