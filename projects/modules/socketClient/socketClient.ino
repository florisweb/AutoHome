#include <WiFi.h>
#include <WiFiMulti.h>
#include <WiFiClientSecure.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

WiFiMulti WiFiMulti;
WebSocketsClient webSocket;

const char* ssid = "";
const char* password = "";
const String deviceId = "CableLamp";
const String deviceKey = "";


bool authenticated = false;
String jsonString; // Temporary storage for the JSON String



void hexdump(const void *mem, uint32_t len, uint8_t cols = 16) {
  const uint8_t* src = (const uint8_t*) mem;
  Serial.printf("\n[HEXDUMP] Address: 0x%08X len: 0x%X (%d)", (ptrdiff_t)src, len, len);
  for (uint32_t i = 0; i < len; i++) {
    if (i % cols == 0) {
      Serial.printf("\n[0x%08X] 0x%08X: ", (ptrdiff_t)src, i);
    }
    Serial.printf("%02X ", *src);
    src++;
  }
  Serial.printf("\n");
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  DynamicJsonDocument doc(1024);
  deserializeJson(doc, payload);
  String error = doc["error"];
  String packetType = doc["type"];
  
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.printf("[WSc] Disconnected!\n");
      authenticated = false;
      break;
    case WStype_CONNECTED:
      Serial.printf("[WSc] Connected to url: %s\n", payload);
      authenticated = false;

      // send message to server when Connected
      webSocket.sendTXT("{\"id\":\"" + deviceId + "\", \"key\": \"" + deviceKey + "\"}");
      break;
    case WStype_TEXT:
      Serial.printf("[WSc] get text: %s\n", payload);
      
      Serial.print("Error: ");
      Serial.println(error);
      if (packetType == "auth" && doc["data"] == true)
      {
        Serial.println("Successfully authenticated.");
        authenticated = true;
      }

      // send message to server
      //      webSocket.sendTXT(payload);
      break;
    case WStype_BIN:
      //      Serial.printf("[WSc] get binary length: %u\n", length);
      //      hexdump(payload, length);

      // send data to server
      // webSocket.sendBIN(payload, length);
      break;
    case WStype_ERROR:
    case WStype_FRAGMENT_TEXT_START:
    case WStype_FRAGMENT_BIN_START:
    case WStype_FRAGMENT:
    case WStype_FRAGMENT_FIN:
      break;
  }

}

void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);

  WiFiMulti.addAP(ssid, password);
  while (WiFiMulti.run() != WL_CONNECTED) {
    delay(100);
  }

  webSocket.begin("192.168.178.92", 8080, "/");
  webSocket.onEvent(webSocketEvent);

  // try every 5000 again if connection has failed
  webSocket.setReconnectInterval(5000);
}

void loop() {
  webSocket.loop();
}
