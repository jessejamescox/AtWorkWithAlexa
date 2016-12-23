/**
    Created 2016 Jesse Cox All Rights Reserved.
    Example demonstration only. Open Source under GNU License standard.  
    No warranties, or protection implied with the use of this example.
*/
/////////////////////////////////////////////////////
var APP_ID = undefined; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";
//Environment Configuration
var config = {};
config.IOT_BROKER_ENDPOINT      = "@lphaNumericEndpoint.iot.us-east-1.amazonaws.com".toLowerCase();
config.IOT_BROKER_REGION        = "us-east-1";
config.IOT_THING_NAME           = "Somethingname";
/////////////////////////////////////////////////////
//Loading AWS SDK libraries
var AWS = require('aws-sdk');
AWS.config.region = config.IOT_BROKER_REGION;

//Initializing client for IoT
var iotData = new AWS.IotData({endpoint: config.IOT_BROKER_ENDPOINT});
/////////////////////////////////////////////////////
// create the parameters for the send object.  
var sendParamsUpdate = {
            topic:"$aws/things/Somethingname/shadow/update",
            payload: "",
            qos:0
        };
// create the payload object to send to device
var payloadObj={ "state":
                    { "desired":
                        {"topic": "",
                         "command": "",
                         "value": 0
                          }
                     }
                };
/////////////////////////////////////////////////////
// create the voice response 
var speechOutput = "";
// create the objects to send
var sendValue;
/////////////////////////////////////////////////////

// * The AlexaSkill prototype and helper functions
var AlexaSkill = require('./AlexaSkill');

// main function container
var AlexaAtWork = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
AlexaAtWork.prototype = Object.create(AlexaSkill.prototype);
AlexaAtWork.prototype.constructor = AlexaAtWork;

AlexaAtWork.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("AlexaAtWork onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

AlexaAtWork.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("AlexaAtWork onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

AlexaAtWork.prototype.intentHandlers = {
    // register custom intent handlers
    "WorkIntent": function (intent, session, response) {
    //Set the payload for the device as an object ** processes as string to MQTT
    if (intent.slots.Direction.value == "here") {
        sendValue = 1;
        speechOutput = "OK, welcome to work";
    }
    else    {
        sendValue = 0;
        speechOutput = "Goodbye. See you soon.";
    }
    payloadObj.state.desired.topic = "work";
    payloadObj.state.desired.command = "change";
    payloadObj.state.desired.value = sendValue;
    
        // load the payload of the paramsUpdate object
        sendParamsUpdate.payload = JSON.stringify(payloadObj);
        //update the mqtt message
        iotData.publish(sendParamsUpdate, function(err, data) {
          if (err){
            //handle the error here
            console.log("MQTT Error" + data);
          }
          else {
            console.log(data);
            console.log(sendParamsUpdate.payload);
            response.tell(speechOutput);
          }    
        });
    }
};
/////////////////////////////////////////////////////
// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the AlexaAtWork skill.
    var alexaAtWork = new AlexaAtWork();
    alexaAtWork.execute(event, context);
};