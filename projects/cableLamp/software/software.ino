#include <WiFi.h> // Include WIFi Library for ESP32
#include <WebServer.h> // Include WebSwever Library for ESP32
#include <ArduinoJson.h> // Include ArduinoJson Library
#include <WebSocketsServer.h>  // Include Websocket Library

const char* ssid = "";
const char* password = "";

String web = "<body><h1>Received message: <span id='message'>-</span></h1><button type='button' id='BTN_1'> <h1>ON</h1> </button><button type='button' id='BTN_2'> <h1>OFF</h1> </button></body><script> var Socket; document.getElementById('BTN_1').addEventListener('click', button_1_pressed); document.getElementById('BTN_2').addEventListener('click', button_2_pressed); function init() { Socket = new WebSocket('ws://' + window.location.hostname + ':81/'); Socket.onmessage = function(event) { processCommand(event); }; } function processCommand(event) { var obj = JSON.parse(event.data); document.getElementById('message').innerHTML = JSON.stringify(obj); console.log(obj);} function button_1_pressed() { Socket.send('1'); } function button_2_pressed() { Socket.send('0'); } window.onload = function(event) { init(); }</script></html>";

String jsonString; // Temporary storage for the JSON String

boolean lampOn = false; // Holds the status of the pin
const int lampEnablePin = 32;



WebServer server(80);  // create instance for web server on port "80"
WebSocketsServer webSocket = WebSocketsServer(81);  //create instance for webSocket server on port"81"


void setup() {
  // put your setup code here, to run once:
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(lampEnablePin, OUTPUT);
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
}


void loop() {
  server.handleClient();  // webserver methode that handles all Client
  webSocket.loop(); // websocket server methode that handles all Client
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
      Serial.println(); // the payload variable stores teh status internally
      Serial.println(payload[0]);
      if (payload[0] == '1') {
        lampOn = true;
        digitalWrite(LED_BUILTIN, HIGH);
        digitalWrite(lampEnablePin, HIGH);
      } else if (payload[0] == '0') {
        lampOn = false;
        digitalWrite(LED_BUILTIN, LOW);
        digitalWrite(lampEnablePin, LOW);
      }
      update_webpage();
      break;
  }
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
