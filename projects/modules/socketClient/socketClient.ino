#include "connectionManager.h";
connectionManager ConnectionManager;


const char* ssid = "";
const char* password = "";
const String deviceId = "";
const String deviceKey = "";

void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);

  ConnectionManager.setup(ssid, password, deviceId, deviceKey);
}

void loop() {
  ConnectionManager.loop();
}
