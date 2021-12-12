#ifndef connectionManager_h
#define connectionManager_h
#include <WString.h>

class connectionManager
{
  public:
    void setup(const char* _ssid, const char* _password, const String _deviceId, const String _deviceKey);
    void loop();
    void send(String _string);
    bool isConnected();
    bool isAuthenticated();
};

#endif
