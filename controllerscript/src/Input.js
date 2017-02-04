ButtonEvent = {
    LOW  : 64,
    HIGH : 0,
}

// these are note values
// make sure they are above 60 so that there are no collisions with
// the CC values of the keytar
// somehow the Nobels sometimes randomly transposes one octave up or low...
Nobels = {
    UP    : [60, 72],
    ONE   : [61, 73],
    TWO   : [62, 74],
    THREE : [63, 75],
    FOUR  : [64, 76],
    FIVE  : [65, 77],
    DOWN  : [66, 78],
    SIX   : [67, 79],
    SEVEN : [68, 80],
    EIGHT : [69, 81],
    NINE  : [70, 82],
    ZERO  : [71, 83],
}
// these are CC values
// make sure they are below 60, so that there is no collision with the 
// note values of the Nobels
Keytar = {
    SLIDER  : [ 7],
    KNOB1   : [20],
    KNOB2   : [21],
    KNOB3   : [22],
    RIBBON1 : [24],
    RIBBON2 : [25],
    RIBBON3 : [26],
    BUTTON1 : [36],
    BUTTON2 : [37],
    BUTTON3 : [38],
    BUTTON4 : [39],
    BUTTON5 : [40],
    BUTTON6 : [41],
    BUTTON7 : [42],
    BUTTON8 : [43],
}

ButtonAction = {
    tap         : 0,
    longPress   : 1,
    shortPress1 : 2,
    shortPress2 : 3,
    shortPress3 : 4,
    unknown     : 5,
}

//---------------------------------

function Button(CC){
    this.CC = CC;
    this.callbacks = [];
    //for(action in ButtonAction) {
        //this.callbacks[ButtonAction[action]] = [];
    //}
    this.history = [];
}

// checks if a callback needs to be run and runs it
Button.prototype.checkAndRunEvent = function(data1, data2) {


    // act only if he value is either low or high
    if(data2 != ButtonEvent.LOW && data2 != ButtonEvent.HIGH) {
        return undefined;
    }
    // act only if the CC matches and the value is either low or high
    if(this.CC.indexOf(data1) == -1) {
        return undefined;
    }

    // ignore event if it is of the same type as the previous event
    // this may happen if host.scheduleTask has written an up event
    // before the button was released
    if(this.history.length != 0 && data2 == this.history[0].event) {
        return undefined;
    }
    
    //-----------------------

    // add the new event to the history queue.
    this.history.unshift({event : data2, timestamp : Date.now()});
    while(this.history.length > 20) {this.history.pop();}

    //-----------------------
    
    // maximum gap between a release and a push to still be counted as double/triple
    var maxGapBetweenPresses = 400
    // the length of a long press
    var longPressLength = 600

    var obj = this;

    // this function will try to execute the given action when called
    var executeAction = function(action) {
        if(obj.callbacks[action] != undefined) {
            obj.callbacks[action]();
        }
    }
    
    if(this.history[0].event == ButtonEvent.LOW) {

        var lastEvent = this.history[0];
        host.scheduleTask(function(){
            var eps = 10;
            if(lastEvent == obj.history[0]) {
                // nothing has happend since this callback has been created
                // thus, the button has been pressed long enough
                // execute the appropriate action -> longPress
                obj.history.unshift({event : ButtonEvent.HIGH, timestamp : Date.now()});
                executeAction(ButtonAction.longPress);

            }
        }, [], longPressLength);
        // button was pressed -> tap
        executeAction(ButtonAction.tap);
    } 
    else 
    {
        // count number of short presses
        var lastTimestamp = this.history[0].timestamp;
        var presses = 1;
        for(i = 1; i < this.history.length; i++) {
            if(this.history[i].event == ButtonEvent.HIGH) {
                if(lastTimestamp - this.history[i].timestamp > maxGapBetweenPresses) {
                    break;
                }
                presses += 1;
                lastTimestamp = this.history[i].timestamp;
            }
        }
        if(presses == 1) {
            executeAction(ButtonAction.shortPress1);
        }
        if(presses == 2) {
            executeAction(ButtonAction.shortPress2);
        }
        if(presses == 3) {
            executeAction(ButtonAction.shortPress3);
        }
    }
}

//---------------------------------

function Fader(CC){
    this.CC = CC;
    this.callbacks = [];
}

// checks if a callback needs to be run and runs it
Fader.prototype.checkAndRunEvent = function(data1, data2) {
    // act only if the CC matches
    if(data1 != this.CC) {
        return undefined;
    }
    if(this.callbacks != undefined) {
        this.callbacks(data2);
    }
    return true;
}



// -----------------------


function InputManager() {
    this.buttonsAndFaders = [];
    this.userControls = host.createUserControls(8);

    var obj = this;
    //midi port 0 corresponds to the keytar
    host.getMidiInPort(0).setMidiCallback(
        function (status, data1, data2)
        {
            println("keytar: " + status + " " + data1 + " " + data2);
            obj.checkEvent(status, data1, data2, "keytar");

        }
    );

    //midi port 1 corresponds to the footpedal
    host.getMidiInPort(1).setMidiCallback(
        function (status, data1, data2)
        {
            println("footpedal: " + status + " " + data1 + " " + data2);
            obj.checkEvent(status, data1, data2, "footpedal");
        }
    );

    //forward the keytar events to bitwig as well
    this.keytarIn = host.getMidiInPort(0).createNoteInput("Keytar", "??????");
    this.keytarIn.setShouldConsumeEvents(false);
}

InputManager.prototype.addButtonCallback = function (CC, action, callback) {
    if(this.buttonsAndFaders[CC] == undefined) {
        this.buttonsAndFaders[CC] = new Button(CC)
    }
    this.buttonsAndFaders[CC].callbacks[action] = callback;
}

InputManager.prototype.addFaderCallback = function (CC, callback) {
    if(this.buttonsAndFaders[CC] == undefined) {
        this.buttonsAndFaders[CC] = new Fader(CC)
    }
    this.buttonsAndFaders[CC].callbacks = callback;
}

InputManager.prototype.checkEvent = function(status, data1, data2, device) {

    if (device == "footpedal") {
        for(var i in this.buttonsAndFaders){
            this.buttonsAndFaders[i].checkAndRunEvent(data1, data2);
        }
    }
    if (device == "keytar") {
        if (isChannelController(status)) {

            // buttons and faders
            for(var i in this.buttonsAndFaders){
                this.buttonsAndFaders[i].checkAndRunEvent(data1, data2);
            }

            // user control. needed for the "learn controller assignment" option
            if(data1 == Keytar.KNOB1){
                this.userControls.getControl(0).set(data2, 128);
            }
            if(data1 == Keytar.KNOB2){
                this.userControls.getControl(1).set(data2, 128);
            }
            if(data1 == Keytar.KNOB3){
                this.userControls.getControl(2).set(data2, 128);
            }
            if(data1 == Keytar.RIBBON1){
                this.userControls.getControl(4).set(data2, 128);
            }
            if(data1 == Keytar.RIBBON2){
                this.userControls.getControl(5).set(data2, 128);
            }
            if(data1 == Keytar.RIBBON3){
                this.userControls.getControl(6).set(data2, 128);
            }
        }
    }
}
