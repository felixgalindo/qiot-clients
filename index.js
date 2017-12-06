/**
 * @fileoverview QIOT MQTT client API
 * @author fgalindo@quantumiot.com (Felix Galindo)
 */

var mqtt = require('mqtt');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Client(config) {
    console.log("Starting Qiot Mqtt Client");
    var Client = this;
    Client.config = config;

    Client.mqtt = mqtt.connect(Client.config.url, Client.config.mqttConnection);

    Client.mqtt.on('message', function(topic, message) {
        console.log('QIOT MQTT Client received message %s %s', topic, message);
        Client.emit('message', topic, message);
    });

    Client.mqtt.on('connect', function(connack) {
        console.log("QIOT MQTT Client Connected");
        Client.mqtt.subscribe(Client.config.subTopic);
        Client.clientConnected = true;
    });

    Client.mqtt.on('close', function() {
        console.log("QIOT MQTT Client Connection Closed");
        Client.clientConnected = false;
    });

    Client.mqtt.on('error', function(error) {
        console.log("QIOT MQTT Client Error", error);
    });

    Client.mqtt.on('offline', function() {
        console.log("QIOT MQTT Client Offline");
        Client.clientConnected = false;
    });

}

util.inherits(Client, EventEmitter);

Client.prototype.publishMessage = function(mqttTopic, valuesObject) {
    if (this.clientConnected !== true) {
        console.log("Can't publish message, QIOT MQTT client not connected!");
        return;
    }
    var Client = this;
    var time = new Date().toISOString();

    var message = {};
    message.messages = [];
    message.messages[0] = {};
    for (var attrname in valuesObject) {
        message.messages[0][attrname] = valuesObject[attrname];
    }
    message.messages[0].time = new Date().toISOString();
    var messageString = JSON.stringify(message);
    console.log("QIOT MQTT Client Publishin Topic:", mqttTopic);
    console.log("QIOT MQTT Client Publishing Message:", messageString);
    Client.mqtt.publish(mqttTopic, messageString);
};


module.exports = function(config) {
    var instance = new Client(config);
    return instance;
};