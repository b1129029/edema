#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_VL53L0X.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <WiFi.h>
#include <FS.h>
#include <SPIFFS.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <WebServer.h>

#define I2C_SDA 16
#define I2C_SCL 17
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

#define MOTOR_A_IA 19
#define MOTOR_A_IB 18
#define PWM_DUTY 205 
Adafruit_VL53L0X lox = Adafruit_VL53L0X();
WebServer server(80);

#define MAX_DATA_COUNT 90
float sensorData[MAX_DATA_COUNT];
int sensorCount = 0;
int count = 0;
int max_count = 3;
bool measurementComplete = false;
String userId = "";
String serverUrl = "https://2f9893b40d97.ngrok.app";
bool readyToRun = false;

int device_connect = 0;
int led_pin2 = 22;
unsigned long lastCheckTime = 0;
const unsigned long checkInterval = 10000;

const char index_html[] PROGMEM = R"rawliteral(
<!DOCTYPE html><html><head><title>WiFi Configuration</title></head><body>
<h1>WiFi Configuration</h1>
<form action="/config" method="post">
<label>SSID:</label><br><input type="text" name="ssid" required><br><br>
<label>Password:</label><br><input type="password" name="password" required><br><br>
<input type="submit" value="Submit"></form></body></html>
)rawliteral";

void startAPMode();
void saveWiFiConfig(String ssid, String password);
bool readWiFiConfig(String &ssid, String &password);
bool fetchUserId();
void sendDataToServer();
void handleRoot();
void handleConfig();

void setup() {
  Serial.begin(115200);
  Wire.begin(I2C_SDA, I2C_SCL);
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) for (;;);
  display.clearDisplay(); display.setTextSize(2); display.setTextColor(WHITE);
  display.setCursor(0, 10); display.println("WELCOME"); display.display();
  delay(2000);

  pinMode(MOTOR_A_IA, OUTPUT);
  pinMode(MOTOR_A_IB, OUTPUT);
  pinMode(led_pin2, OUTPUT); digitalWrite(led_pin2, HIGH);

  if (!SPIFFS.begin(true)) for (;;);
  Serial.println("SPIFFS OK");

  String ssid, password;
  if (readWiFiConfig(ssid, password)) {
    Serial.println("連線 Wi-Fi...");
    WiFi.begin(ssid.c_str(), password.c_str());
    unsigned long startAttemptTime = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 10000) delay(50);

    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("Wi-Fi 成功");
      digitalWrite(led_pin2, LOW);
      display.clearDisplay(); display.setTextSize(1); display.setCursor(0, 0);
      display.println("Wi-Fi Connected"); display.println("IP: " + WiFi.localIP().toString()); display.display();
      delay(2000);

      while (!fetchUserId()) {
        for (int i = 10; i > 0; i--) {
          display.clearDisplay();
          display.setCursor(0, 0);
          display.setTextSize(1);
          display.println("UserID < 0");
          display.println("Retry in " + String(i) + "s");
          display.display();
          delay(1000);
        }
      }
      readyToRun = true;
    } else {
      Serial.println("Wi-Fi 失敗");
      startAPMode();
    }
  } else {
    startAPMode();
  }

  if (!lox.begin()) for (;;);
  Serial.println("VL53L0X Ready");
}

void loop() {
  if (!measurementComplete && WiFi.status() == WL_CONNECTED) {
    if (readyToRun && count < max_count) {
      analogWrite(MOTOR_A_IA, PWM_DUTY);
      analogWrite(MOTOR_A_IB, LOW);
      int pointsPerCycle = 30;
      for (int i = 0; i < pointsPerCycle && sensorCount < MAX_DATA_COUNT; i++) {
        VL53L0X_RangingMeasurementData_t measure;
        lox.rangingTest(&measure, false);
        float value = (measure.RangeStatus != 4) ? measure.RangeMilliMeter / 10.0 : 10.0;
        sensorData[sensorCount++] = value;

        float progress = (float)sensorCount / MAX_DATA_COUNT * 100.0;
        display.clearDisplay(); display.setTextSize(2); display.setCursor(0, 10);
        display.print(progress, 1); display.println("%"); display.display();
        delay(2000 / pointsPerCycle);
      }
      count++;
    } else if (sensorCount >= MAX_DATA_COUNT) {
      analogWrite(MOTOR_A_IA, LOW);
      analogWrite(MOTOR_A_IB, LOW);
      sendDataToServer();
      measurementComplete = true;
    }
  } else if (measurementComplete) {
    measurementComplete = false;
    sensorCount = 0;
    count = 0;
    while (!fetchUserId()) {
      for (int i = 10; i > 0; i--) {
        display.clearDisplay();
        display.setCursor(0, 0);
        display.setTextSize(1);
        display.println("UserID < 0");
        display.println("Retry in " + String(i) + "s");
        display.display();
        delay(1000);
      }
    }
    readyToRun = true;
  }
  server.handleClient();
}

bool fetchUserId() {
  HTTPClient http;
  http.begin(serverUrl + "/get_test");
  int httpResponseCode = http.GET();

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("Response from /get_test: " + response);

    StaticJsonDocument<128> doc;
    DeserializationError error = deserializeJson(doc, response);
    if (!error) {
      int uid = doc["userid"] | -1;
      if (uid >= 0) {
        userId = String(uid);
        Serial.println("✅ 取得 userId: " + userId);
        http.end();
        return true;
      }
    } else {
      Serial.println("❌ JSON parse error: " + String(error.c_str()));
    }
  } else {
    Serial.println("❌ HTTP error code: " + String(httpResponseCode));
  }

  http.end();
  return false;
}

void sendDataToServer() {
  HTTPClient http;
  String dataStr = "[";
  for (int i = 0; i < MAX_DATA_COUNT; i++) {
    dataStr += String(sensorData[i], 2);
    if (i < MAX_DATA_COUNT - 1) dataStr += ",";
  }
  dataStr += "]";
  String payload = "{\"userId\":\"" + userId + "\",\"data\":" + dataStr + "}";

  http.begin(serverUrl + "/data");
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(payload);
  if (code > 0) {
    String res = http.getString();
    StaticJsonDocument<768> doc;
    if (!deserializeJson(doc, res)) {
      float area = doc["area"] | 0.0;
      float peri = doc["perimeter"] | 0.0;
      area /= 100.0; peri /= 10.0;
      display.clearDisplay(); display.setTextSize(1);
      display.setCursor(0,0); display.print("A: "); display.println(area, 1);
      display.setCursor(0,32); display.print("P: "); display.println(peri, 1);
      display.display();
    }
  }
  http.end();
}

bool readWiFiConfig(String &ssid, String &password) {
  File file = SPIFFS.open("/wificonfig.txt", "r");
  if (!file) return false;
  ssid = file.readStringUntil('\n');
  password = file.readStringUntil('\n');
  ssid.trim(); password.trim();
  file.close();
  return true;
}

void saveWiFiConfig(String ssid, String password) {
  File file = SPIFFS.open("/wificonfig.txt", "w");
  if (!file) return;
  file.println(ssid); file.println(password); file.close();
}

void startAPMode() {
  WiFi.mode(WIFI_AP); WiFi.softAP("ESP32_AP", "12345678");
  server.on("/", HTTP_GET, handleRoot);
  server.on("/config", HTTP_POST, handleConfig);
  server.begin();
  display.clearDisplay(); display.setCursor(0, 0); display.setTextSize(1);
  display.println("AP Mode"); display.println("SSID: ESP32_AP"); display.display();
}

void handleRoot() {
  server.send(200, "text/html", index_html);
}

void handleConfig() {
  if (server.hasArg("ssid") && server.hasArg("password")) {
    String ssid = server.arg("ssid");
    String password = server.arg("password");
    saveWiFiConfig(ssid, password);
    server.send(200, "text/html", "<h1>Saved. Rebooting...</h1>");
    ESP.restart();
  } else {
    server.send(400, "text/html", "<h1>Missing Fields</h1>");
  }
}
