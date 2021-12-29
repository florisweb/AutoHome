#include <WiFi.h>
#include <WiFiMulti.h>
#include <WiFiClientSecure.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include "connectionManager.h";

WiFiMulti WiFiMulti;
WebSocketsClient webSocket;

String deviceId;
String deviceKey;
bool authenticated = false;
String jsonString;

void (*onMessagePointer)(DynamicJsonDocument message);



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
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.printf("[WSc] Disconnected!\n");
      authenticated = false;
      digitalWrite(LED_BUILTIN, LOW);
      break;
    case WStype_CONNECTED:
      Serial.printf("[WSc] Connected to url: %s\n", payload);
      authenticated = false;

      // Authentication request
      webSocket.sendTXT("{\"id\":\"" + deviceId + "\", \"key\": \"" + deviceKey + "\"}");
      break;
    case WStype_TEXT:
      Serial.printf("[WSc] get text: %s\n", payload);
      if (authenticated)
      {
        digitalWrite(LED_BUILTIN, HIGH);
        DynamicJsonDocument doc(1024);
        deserializeJson(doc, payload);
        onMessagePointer(doc);

      } else {
        DynamicJsonDocument doc(1024);
        deserializeJson(doc, payload);
        String error = doc["error"];
        String packetType = doc["type"];

        Serial.print("Error: ");
        Serial.println(error);
        digitalWrite(LED_BUILTIN, LOW);
        if (packetType == "auth" && doc["data"] == true)
        {
          Serial.println("Successfully authenticated.");
          authenticated = true;
        }

      }
      //      webSocket.sendTXT(payload);
      break;
    case WStype_BIN:
      //      hexdump(payload, length);
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






void connectionManager::setup(const char* _ssid, const char* _password, const String _deviceId, const String _deviceKey, void _onMessage(DynamicJsonDocument message)) {
  pinMode(LED_BUILTIN, OUTPUT);
  deviceId            = _deviceId;
  deviceKey           = _deviceKey;
  onMessagePointer    = _onMessage;

  Serial.begin(115200);
  Serial.setDebugOutput(true);

  WiFiMulti.addAP(_ssid, _password);
  while (WiFiMulti.run() != WL_CONNECTED)
  {
    delay(100);
  }

  webSocket.begin(serverIP, serverPort, "/");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000); // try every 5000 again if connection has failed
}
void connectionManager::send(String _string) {
  webSocket.sendTXT(_string);
}
bool connectionManager::isConnected() {
  return true;
}

bool connectionManager::isAuthenticated() {
  return authenticated;
}

void connectionManager::loop() {
  webSocket.loop();
}
