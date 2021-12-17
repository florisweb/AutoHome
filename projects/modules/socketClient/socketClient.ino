#include "connectionManager.h";
#include "time.h"
connectionManager ConnectionManager;


const char* ssid = "";
const char* password = "";
const String deviceId = "";
const String deviceKey = "";

const int lampEnablePin = 32;
const int buttonPin     = 33;

boolean lampOn = false; // Holds the status of the pin
bool buttonState = false;
bool prevButtonState = false;


String executeLightProgramTime = "";
unsigned int curLightProgram[64] = {3, 800, 3, 800, 3, 700, 3, 700, 3, 600, 3, 600, 3, 500, 3, 500, 3, 400, 3, 400, 3, 300, 3, 300, 3, 200, 3, 200, 3, 100, 3, 100, 3, 200, 3, 200, 3, 300, 3, 300, 3, 400, 3, 400, 3, 500, 3, 500, 3, 600, 3, 600, 3, 700, 3, 700, 3, 800, 3, 800, 1, 0};
int curLightProgramIndex = -1;
unsigned int waitUntilMillis = 0;




// Get the time
const char* ntpServer = "pool.ntp.org";
const long  gmtOffset_sec = 3600;
const int   daylightOffset_sec = 3600;






void onMessage(DynamicJsonDocument message) {
  String error = message["error"];
  int packetType = message["type"];

  Serial.print("[OnMessage] Error: ");
  Serial.println(error);
  Serial.print("[OnMessage] type: ");
  Serial.println(packetType);
  switch (packetType)
  {
    case 1:
      setLampState(message["data"]);
      break;
    case 2:
      curLightProgramIndex = 0;
      break;
    case 3:
      executeLightProgramTime = message["data"].as<String>();
      setLampState(!lampOn);
      delay(500);
      setLampState(!lampOn);
      break;
  }
}


void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(buttonPin, INPUT);
  pinMode(lampEnablePin, OUTPUT);
  digitalWrite(lampEnablePin, LOW);

  Serial.begin(115200);
  //  Serial.setDebugOutput(true);

  delay(1000);
  Serial.println("Waking up...");

  ConnectionManager.setup(ssid, password, deviceId, deviceKey, &onMessage);

  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
}

void loop() {
  ConnectionManager.loop();

  buttonState = digitalRead(buttonPin);
  if (prevButtonState != buttonState && buttonState) 
  {
    setLampState(!lampOn);
    ConnectionManager.send("{\"type\": \"buttonPressed\"}");
  }
  prevButtonState = buttonState;



  // Time detector/program starter
  if (millis() % 10000 == 0 && curLightProgramIndex == -1)
  {
    struct tm timeinfo;
    if (getLocalTime(&timeinfo))
    {
      char timeChar[3];
      strftime(timeChar, 6, "%H:%M", &timeinfo);
      if (String(timeChar) == executeLightProgramTime) curLightProgramIndex = 0;
    }
  }












  // Light program executer
  if (curLightProgramIndex != -1 && waitUntilMillis < millis())
  {
    Serial.print(curLightProgramIndex);
    Serial.print("/");
    Serial.println(sizeof(curLightProgram) / sizeof(int));
    if (curLightProgramIndex % 2 == 0)
    {
      switch (curLightProgram[curLightProgramIndex])
      {
        case 0:
          curLightProgramIndex = -2; // -2 + 1 = -1
          break;
        case 1:
          setLampState(true);
          break;
        case 2:
          setLampState(false);
          break;
        case 3:
          setLampState(!lampOn);
          break;
      }
    } else {
      waitUntilMillis = millis() + curLightProgram[curLightProgramIndex];
      Serial.print("Set timer to: ");
      Serial.println(waitUntilMillis);
    }

    curLightProgramIndex++;
    if (sizeof(curLightProgram) / sizeof(int) < curLightProgramIndex) curLightProgramIndex = -1;
  }
}




void setLampState(bool turnLampOn) {
  String statusMessage = "{\"type\": \"lampStatus\", \"data\":";
  if (turnLampOn)
  {
    lampOn = true;
    digitalWrite(LED_BUILTIN, HIGH);
    digitalWrite(lampEnablePin, HIGH);
    statusMessage += "true";
  } else {
    lampOn = false;
    digitalWrite(LED_BUILTIN, LOW);
    digitalWrite(lampEnablePin, LOW);
    statusMessage += "false";
  }

  statusMessage += "}";
  ConnectionManager.send(statusMessage);
}
