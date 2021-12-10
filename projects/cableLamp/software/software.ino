#include <WiFi.h> // Include WIFi Library for ESP32
#include <WebServer.h> // Include WebSwever Library for ESP32
#include <ArduinoJson.h> // Include ArduinoJson Library
#include <WebSocketsServer.h>  // Include Websocket Library
#include "time.h"


const char* ssid = "";
const char* password = "";

String web = "<body><h1>Received message: <span id='message'>-</span></h1><button type='button' id='BTN_1'> <h1>ON</h1> </button><button type='button' id='BTN_2'> <h1>OFF</h1> </button><button type='button' id='BTN_3'> <h1>ANIMATE</h1> </button></body><script> var Socket; document.getElementById('BTN_1').addEventListener('click', button_1_pressed);document.getElementById('BTN_3').addEventListener('click', button_3_pressed); document.getElementById('BTN_2').addEventListener('click', button_2_pressed); function init() { Socket = new WebSocket('ws://' + window.location.hostname + ':81/'); Socket.onmessage = function(event) { processCommand(event); }; } function processCommand(event) { var obj = JSON.parse(event.data); document.getElementById('message').innerHTML = JSON.stringify(obj); console.log(obj);} function button_1_pressed() { Socket.send(JSON.stringify({type: 1, data: true})); } function button_2_pressed() {Socket.send(JSON.stringify({type: 1, data: false})); }; function button_3_pressed() {Socket.send(JSON.stringify({type: 2})); } window.onload = function(event) { init(); }</script></html>";

String jsonString; // Temporary storage for the JSON String

boolean lampOn = false; // Holds the status of the pin
const int lampEnablePin = 32;
const int buttonPin     = 33;
bool prevButtonState = false;


String executeLightProgramTime = "13:30";
unsigned int curLightProgram[64] = {1, 800, 2, 800, 1, 700, 2, 700, 1, 600, 2, 600, 1, 500, 2, 500, 1, 400, 2, 400, 1, 300, 2, 300, 1, 200, 2, 200, 1, 100, 2, 100, 1, 800, 2, 800, 1, 700, 2, 700, 1, 600, 2, 600, 1, 500, 2, 500, 1, 400, 2, 400, 1, 300, 2, 300, 1, 200, 2, 200, 1, 100, 2, 0};
int curLightProgramIndex = -1;
unsigned int waitUntilMillis = 0;

WebServer server(80);  // create instance for web server on port "80"
WebSocketsServer webSocket = WebSocketsServer(81);  //create instance for webSocket server on port"81"


// Get the time
const char* ntpServer = "pool.ntp.org";
const long  gmtOffset_sec = 3600;
const int   daylightOffset_sec = 3600;





void setup() {
  // put your setup code here, to run once:
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(lampEnablePin, OUTPUT);
  pinMode(buttonPin, INPUT);

  digitalWrite(lampEnablePin, LOW);
  Serial.begin(115200); // Init Serial for Debugging.




  WiFi.begin(ssid, password); // Connect to Wifi
  while (WiFi.status() != WL_CONNECTED) { // Check if wifi is connected or not
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  // Print the IP address in the serial monitor windows.
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  // Initialize a web server on the default IP address. and send the webpage as a response.
  server.on("/", []() {
    server.send(200, "text\html", web);
  });
  server.begin(); // init the server
  webSocket.begin();  // init the Websocketserver
  webSocket.onEvent(webSocketEvent);  // init the webSocketEvent function when a websocket event occurs


  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
}

bool buttonState = false;
void loop() {
  server.handleClient();  // webserver methode that handles all Client
  webSocket.loop(); // websocket server methode that handles all Client
  buttonState = digitalRead(buttonPin);
  if (prevButtonState != buttonState && buttonState)
  {
    Serial.println("click");
    setLampState(!lampOn);
  }

  prevButtonState = buttonState;



  // Time detector/program starter
  if (millis() % 50000 == 0)
  {
    Serial.println("Test if it's time");
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





// This function gets a call when a WebSocket event occurs
void webSocketEvent(byte num, WStype_t type, uint8_t * payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED: // enum that read status this is used for debugging.
      Serial.print("WS Type ");
      Serial.print(type);
      Serial.println(": DISCONNECTED");
      break;
    case WStype_CONNECTED:  // Check if a WebSocket client is connected or not
      Serial.print("WS Type ");
      Serial.print(type);
      Serial.println(": CONNECTED");

      update_webpage();// update the webpage accordingly

      break;
    case WStype_TEXT: // check responce from client
      bool newState;
      //      int program[16];

      Serial.println(); // the payload variable stores teh status internally
      Serial.println(length);
      Serial.println(num);

      char *request = reinterpret_cast<char*>(payload);
      Serial.println(request);
      Serial.println("Raw Data:");
      for (int i = 0; i < length; i++) Serial.println(payload[i]);

      DynamicJsonDocument doc(1024);
      deserializeJson(doc, request);
      int type = doc["type"];
      Serial.println(type);
      switch (type)
      {
        case 1:
          newState = doc["data"];
          setLampState(newState);
          break;
        case 2:

          for (int i = 0; i < 16; i++)
          {
            int a = doc["data"][i];
            Serial.print(a);
          }
          //          curLightProgram = {1, 500, 2, 500, 1, 500, 2, 500};
          curLightProgramIndex = 0;

          break;
        case 4:
          //          char* Time = doc["data"].as<char>();
          executeLightProgramTime = doc["data"].as<String>();
          //          executeLightProgramTime = Time;
          setLampState(!lampOn);
          delay(500);
          setLampState(!lampOn);
          break;
      }

      break;
  }
}



void setLampState(bool turnLampOn) {
  if (turnLampOn)
  {
    lampOn = true;
    digitalWrite(LED_BUILTIN, HIGH);
    digitalWrite(lampEnablePin, HIGH);
  } else {
    lampOn = false;
    digitalWrite(LED_BUILTIN, LOW);
    digitalWrite(lampEnablePin, LOW);
  }
  update_webpage();
}

void update_webpage()
{
  StaticJsonDocument<100> doc;
  // create an object
  JsonObject object = doc.to<JsonObject>();
  object["lampOn"] = lampOn;
  serializeJson(doc, jsonString); // serialize the object and save teh result to teh string variable.
  Serial.println( jsonString ); // print the string for debugging.
  webSocket.broadcastTXT(jsonString); // send the JSON object through the websocket
  jsonString = ""; // clear the String.
}
