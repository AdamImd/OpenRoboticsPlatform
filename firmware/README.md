# ESP8266 Web IDE

## PlatformIO/Setup

The project is built using PlatformIO, an open source ecosystem for IoT development. PlatformIO is available as a plugin for Visual Studio Code, which is the recommended IDE for this project. To install PlatformIO, make sure that *python3-venv* is installed if you are using Ubuntu.

To upload firmware to the ESP8266, open the PLATOFORMIO tab in Visual Studio Code and click the *upload* button under the General tab. PlatformIO will automatically install the required dependencies, and detect the connected ESP8266. Once the upload is complete, press the *Build Filesystem Image* button under the Platform tab, and then the *Upload Filesystem Image* button. This will upload the Little-FS filesystem to the ESP8266.

The device should now be ready to go.

## Connecting to the device

The device will create a WiFi access point with the SSID *Open* by default. Connect to this access point and navigate to *[http://192.168.0.1](http://192.168.0.1)* in your browser. You should now be able to see the device's web interface.

## Navigation

### Home

The home page has three main areas:

- The editor, where you can write your code.
- The file browser, where you can navigate the filesystem.
- The Save/Run buttons, which allow you to save your code to the filesystem, and run it.

To load the editor, click the button to start loading the editor. This will take a few seconds, and the button will change to a loading indicator. Once the editor has loaded, the CodeMirror editor will appear. You can now write your code. To save your code to the filesystem, click the *Save* button. To run your code, click the *Run* button. The code will be saved to the filesystem, and the run page will open in a new tab.

### Run

The run page has three main areas:

- The control buttons, which allow you to start, stop, and restart the program.
- The the canvas, which displays the output of the program and allows you to interact with it.
- The file browser, which allows you to navigate the filesystem and select a different program to run.

## High-Level API

There are some high level functions available to the user. These are intended to allow easy interaction with the device, and to allow the user to focus on the logic of their program.

### *key_input.js*

This file contains the *key_input* object, which allows the user to check if a key is pressed. The *key_input* object has the following methods:

- *key_pressed*(key) - Returns true if the key is pressed, false otherwise.

The *key* parameter is a string containing the name of the key to check. The names can be found on these pages:

- [w3.org](https://www.w3.org/TR/uievents-key/#named-key-attribute-values)
- [mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values)

### *input_square.js*

This file contains the *input_square* object, which allows the user to click on a square on the canvas. The *input_square* object has the following methods:

- Constructor - *input_square*(size, new_frame) - Creates a new input square with the given size in px. The *new_frame* parameter is a boolean which determines if an existing frame should be used if one exists. If *new_frame* is true, a new frame will be created, and the square will be drawn on it. If *new_frame* is false, the square will be drawn on the existing frame, if one exists. If no frame exists, a new one will be created.
- *get_position()* - Returns the position of the square as an object with the properties *x* and *y*.\

### *motor_controller.js*

This file contains the *driver* object, which allows the user to control a L298N motor controller. The *driver* object has the following methods:

- Constructor *driver(motor1_enable, motor1_D1, motor1_D2, motor2_enable, motor2_D1, motor2_D2, enable = true)* - The first six parameters are the GPIO pins connected to the motor controller. The *enable* parameter is a boolean which determines if the motor controller should be enabled. If *enable* is true, the motor controller will be enabled, and the motors will be able to move. If *enable* is false, the motor controller will be disabled, and the motors will not be able to move. The default value for *enable* is true. This sets the pins to the correct mode, and motors to zero speed.
- *set_speeds(motor1_speed, motor2_speed)* - Sets the speed of the motors. The *motor1_speed* and *motor2_speed* parameters are numbers between -1 and 1. A negative value will cause the motor to move in reverse, and a positive value will cause the motor to move forwards. A value of 0 will cause the motor to stop.
- *invert_motor(motor1_invert, motor2_invert)* - Used to invert the direction of the motors. The *motor1_invert* and *motor2_invert* parameters are booleans.

A typical usage of the *driver* object would look like this:

```javascript
new driver(14, 2, 0, 16, 4, 5);
```

### *print.js*

This file contains the *print* function, that overides the default *print* function. The *print* function has the following format:

- *print(obj)* - Prints the object to the console. The object can be of any type.

This function is intended to be used for debugging and communicating with the user. It checks if the "run_console" object is defined, and if it is, it will print the object to the console. If the "run_console" object is not defined, it will be created. The console will appear in the canvas of the run page.

### *pins.js*

This file contains the translation from the pin names used in the code to the GPIO pins on the ESP8266. The file contains the following global definitions:

```javascript
const D0  = 16;
const D1  = 5;
const D2  = 4;
const D3  = 0;
const D4  = 2;
const D5  = 14;
const D6  = 12;
const D7  = 13;
const D8  = 15;
const D9  = 3;
const D10 = 1;
const LED_BUILTIN = 2;
const LED_BUILTIN_AUX = 16
```

## Low-Level API

The low-level API is intended to be used by the high-level API, and offers greater control over the hardware at the cost of abstraction.

Many commands will require the use of the *await* keyword as they are asynchronous. This is because they operate over a WebSockets connection, and the response from the device may take some time to arrive. The *await* keyword will cause the program to wait until the response arrives before continuing.

### *base_commands.js*

This file contains all of system calls that are available to the user. This file is loaded by each webpage, so they are all available to the user. The following system calls are available:

#### Base commands

- *sleep(ms)* - Sleeps for the given number of milliseconds. Must be called with await.
- *require(path)* - Loads the given file as Javascript and executes the contets. This method operates over a WebSockets connection. Must be called with await.
- *require_HTTP(path)* - Loads the given file as Javascript and executes the contets. This method operates over HTTP. Must be called with await.
- *command_new_socket(use_global = true)* - Creates a new WebSockets connection to the ESP8266. If *use_global* is true, the *global_socket* variable will be set to the new socket. If *use_global* is false, the *global_socket* variable will not be changed and a new variable will be returned. Must be called with await.
- *command_close_socket(socket = global_socket)* - Closes the given WebSockets connection. If *socket* is not given, the *global_socket* variable will be used.

#### Filesystem commands

- *read_file_HTTP(file_name, callback = function(){})* - Reads the given file from the filesystem. This method operates over HTTP. The *callback* parameter is a function that will be called when *.onreadystatechange* is called. This method uses the HTTP Get method. Must be called with await.
- *read_file_command(file_name, socket = global_socket)* - Reads the given file from the filesystem. This method operates over a WebSockets connection. If *socket* is not given, the *global_socket* variable will be used. Must be called with await.
- *save_file_command(file_name, file_data, socket = global_socket)* - Saves the given file to the filesystem. This method operates over a WebSockets connection. If *socket* is not given, the *global_socket* variable will be used.

#### Hardware I/O commands

These commands are akin to the Arduino API, and are intended to be used in the same way. They function more or less as RPCs for the Arduino API on the ESP8266.

- *pin_mode_command(modes, socket = global_socket)* - Sets the mode of the given pins. The *modes* parameter is an object with the pin names as keys, and the modes as values. The modes can be *INPUT*, *OUTPUT*, or *INPUT_PULLUP*. This method operates over a WebSockets connection. If *socket* is not given, the *global_socket* variable will be used. Must be called with await.
- *digital_write_command(outputs, socket = global_socket)* - Sets the output of the given pins. The *outputs* parameter is an object with the pin names as keys, and the outputs as values. The outputs can be 1 or 0. This method operates over a WebSockets connection. If *socket* is not given, the *global_socket* variable will be used. Must be called with await.
- *analog_write_command(outputs, socket = global_socket)* - Sets the output of the given pins. The *outputs* parameter is an object with the pin names as keys, and the outputs as values. The outputs can be between 0 and 1023. This method operates over a WebSockets connection. If *socket* is not given, the *global_socket* variable will be used. Must be called with await.
- *servo_init_command(outputs, socket = global_socket)* - Sets the mode of the given pins to servo mode. The *outputs* parameter is an object with the pin names as keys, and the outputs as values. The outputs can be between 0 and 1023. This method operates over a WebSockets connection. If *socket* is not given, the *global_socket* variable will be used. Must be called with await.
- *servo_write_command(outputs, socket = global_socket)* - Sets the output of the given pins. The *outputs* parameter is an object with the pin names as keys, and the outputs as values. The outputs can be between 0 and 1023. This method operates over a WebSockets connection. If *socket* is not given, the *global_socket* variable will be used. Must be called with await.

#### WiFi commands

These methods are intended to be used to connect the ESP8266 to a WiFi network. They are not required to use the device, but they can allow for connecting to external WiFi networks.

- *get_ESP_IP(socket = global_socket)* - Returns the IP address of the ESP8266. This method operates over a WebSockets connection. If *socket* is not given, the *global_socket* variable will be used. Must be called with await.
- *wifi_connect(ssid, password, socket = global_socket)* - Connects the ESP8266 to the given WiFi network. The *ssid* parameter is the name of the WiFi network, and the *password* parameter is the password for the WiFi network. This method operates over a WebSockets connection. If *socket* is not given, the *global_socket* variable will be used. Must be called with await.
- *wifi_get_ssid(socket = global_socket)* - Returns the name of the WiFi network that the ESP8266 is connected to. This method operates over a WebSockets connection. If *socket* is not given, the *global_socket* variable will be used. Must be called with await.

### Command structure

These commands are structured as RPC calls. Each command has one callback number. The callback number used in a RPC will call the corispondign callback function on the ESP8266. This communicates with the ESP8266 over a WebSockets connection with one of the two calls:

- *command_text(num, text, callback_fun, socket)* - Sends the given text to the ESP8266. The *num* parameter is the number of the command, and the *text* parameter is the text to send. The *callback_fun* parameter is a function that will be called when the response is received. The *socket* parameter is the WebSockets connection to use.
- *command_binary(num, bin, callback_fun, socket)* - Sends the given binary data to the ESP8266. The *num* parameter is the number of the command, and the *bin* parameter is the binary data to send. The *callback_fun* parameter is a function that will be called when the response is received. The *socket* parameter is the WebSockets connection to use.

A typical command looks like this:

```javascript
async function wifi_connect(ssid, password, socket = global_socket){
    return new Promise(function (resolve) {
        function callback(event) {
            resolve();
        }
        command_text(9, ssid + "\x00" + password + "\x00" , callback, socket);
    });
}
```

In this command, the *command_text* function is used to send the command to the ESP8266. The *command_text* function takes the command number, the text to send, a callback function, and the WebSockets connection to use. The callback function will be called when the response is received. The *wifi_connect* function is an asynchronous function, so it must be called with the *await* keyword. The *wifi_connect* function returns a promise, which will be resolved when the callback function is called. The *wifi_connect* function takes the SSID and password of the WiFi network to connect to, and the WebSockets connection to use.

The corisponding command on the ESP8266 looks like this:

```c
#define WIFI_CONNECT_NUM 9
// ...
void some_function(){
    command wifi_connect;
    wifi_connect.command_num = WIFI_CONNECT_NUM;
    wifi_connect.command_init_handle = &wifi_connect_init_handle;
    wifi_connect.command_rw_handle = nullptr;
    Command_list_add(wifi_connect);
}
//...
uint16_t wifi_connect_init_handle(WebSocketsServer* server, uint8_t client_num, uint8_t *payload, size_t length){
    WiFi.begin((char*)payload, (char*)payload+strlen((char*)payload)+1);
    server->sendTXT(client_num, "\x00");
    return 0;
}
```

When the ESP8266 receives the command, it will call the *wifi_connect_init_handle* function. This function will be called with the WebSocketsServer object, the client number, the payload, and the length of the payload. The *wifi_connect_init_handle* function will call the *WiFi.begin* function with the SSID and password. The *wifi_connect_init_handle* function will then send a null byte to the client to indicate that the command has been completed.
