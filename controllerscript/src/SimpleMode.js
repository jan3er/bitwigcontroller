
function SimpleMode(){

    //first entry: number of siblings in ith level
    //second entry: number of devices per track in ith level
    this.tracksPerLevel  = [[5,5], [5,1], [5,1]];
    this.maxBank         = 10;

    this.instTrackIdx    = 0;
    this.instBankIdx     = 0;
    this.knobDevice      = 0;
    this.visibleBankIdx  = 0;

    this.sendToHost   = "localhost";
    this.sendToPort   = 6661; //the port of the gui
    this.listenToHost = "localhost";
    this.listenToPort = 8000;

    this.im  = new InputManager();
    this.bw  = new BitwigWrapper(this.im, this.tracksPerLevel); 

    this.addMidiCallbacks();
    this.addBitwigCallbacks();
    this.addOSCCallbacks();


    var obj = this;
    host.scheduleTask(function(){
        obj.selectKnobDevice(0);
        obj.selectTrack(0);
    }, [], 0);
}
SimpleMode.prototype.selectKnobDevice = function(knobDevice) {
    this.knobDevice = knobDevice;
    host.showPopupNotification("select knobDevice " + knobDevice);
    this.sendCurrentInstrumentAndBank();
}
SimpleMode.prototype.selectTrack = function(instTrackIdx) {
    this.instBankIdx  = this.visibleBankIdx;;
    this.instTrackIdx = instTrackIdx;
    host.showPopupNotification("select instrument (" + this.instBankIdx + ", " + this.instTrackIdx + ")");
    this.bw.trackWrapper.armTrack([this.instBankIdx, this.instTrackIdx], false, true);
    this.sendCurrentInstrumentAndBank();
}
SimpleMode.prototype.selectNextBank = function(step) {
    this.visibleBankIdx = Math.max(0, Math.min(this.maxBank, this.visibleBankIdx + step));;
    host.showPopupNotification("select bank " + this.visibleBankIdx);
    this.sendCurrentInstrumentAndBank();
}

SimpleMode.prototype.sendCurrentInstrumentAndBank = function() {
    var nextBank = Math.max(0, Math.min(this.maxBank, this.visibleBankIdx + 1));;
    var prevBank = Math.max(0, Math.min(this.maxBank, this.visibleBankIdx - 1));;
    OSCSendMessage(this.sendToHost, this.sendToPort, "/bw/currentInstrument", [this.instBankIdx, this.instTrackIdx]);
    OSCSendMessage(this.sendToHost, this.sendToPort, "/bw/visibleBank", this.visibleBankIdx);
    OSCSendMessage(this.sendToHost, this.sendToPort, "/bw/nextBank", nextBank);
    OSCSendMessage(this.sendToHost, this.sendToPort, "/bw/prevBank", prevBank);
    OSCSendMessage(this.sendToHost, this.sendToPort, "/bw/knobDevice", this.knobDevice);

}

SimpleMode.prototype.addBitwigCallbacks = function() {
    var obj = this;
    obj.bw.observerWrapper.registerCallback(function(path,value) {
        var pathString = "/bw/" + path.join("/");
        OSCSendMessage(obj.sendToHost, obj.sendToPort, pathString, value);
    });
    //host.scheduleTask(function(){
    //}, [], 2000);
}
SimpleMode.prototype.addOSCCallbacks = function() {
    var obj = this;
    OSCRegisterCallback(this.listenToHost, this.listenToPort, function(path, values) {
        if(path == "/ping") {
            println("got message " + path + " " + values);
            println("got ping from gui");
            var value = values[0];
            var port = value.substring(value.lastIndexOf(":")+1,value.lastIndexOf("/"));
            obj.sendToPort = parseInt(port);
            obj.sendToHost = "localhost";
            println("set port to " + port);

            var bwstate = obj.bw.observerWrapper.dump();
            println("send observerWrapper.data of size " + bwstate.length + " to gui");
            var pathValueArray = []
            for(var i in bwstate) {
                var pathString = "/bw/" + bwstate[i].path.join("/");
                var message    = bwstate[i].value;
                pathValueArray.push({path : pathString, value: message});

            }
            OSCSendMessages(obj.sendToHost, obj.sendToPort, pathValueArray);
            obj.sendCurrentInstrumentAndBank();
        }
    });
}
SimpleMode.prototype.onKnobRibbon = function(macroIdx, value){
    if(this.knobDevice == 0 || macroIdx > 3) {
        this.bw.trackWrapper.setMacroValue([this.instBankIdx, this.instTrackIdx], false, true, 0, macroIdx, value);
    } else {
        this.bw.trackWrapper.setMacroValue([this.instBankIdx], false, false, this.knobDevice-1, macroIdx, value);
    }
}

SimpleMode.prototype.addMidiCallbacks = function() {

    var obj = this;
    this.im.addButtonCallback( Nobels.UP,    ButtonAction.tap, function(){ obj.selectNextBank(1);});
    this.im.addButtonCallback( Nobels.DOWN,  ButtonAction.tap, function(){ obj.selectNextBank(-1);});
    this.im.addButtonCallback( Nobels.ONE,   ButtonAction.tap, function(){ obj.selectTrack(0);});
    this.im.addButtonCallback( Nobels.TWO,   ButtonAction.tap, function(){ obj.selectTrack(1);});
    this.im.addButtonCallback( Nobels.SIX,   ButtonAction.tap, function(){ obj.selectTrack(2);});
    this.im.addButtonCallback( Nobels.SEVEN, ButtonAction.tap, function(){ obj.selectTrack(3);});
    this.im.addButtonCallback( Nobels.EIGHT, ButtonAction.tap, function(){ obj.selectTrack(4);});


    // volume slider
    obj.im.addFaderCallback(Keytar.SLIDER,  function(value){ obj.bw.trackWrapper.setVolume(obj.instBankIdx, obj.instTrackIdx, value); });

    // modify parameters
    //this.im.addFaderCallback(Keytar.KNOB1,   function(value){ obj.bw.trackWrapper.setMacroValue([obj.instBankIdx, obj.instTrackIdx], 0, 0, value);});
    //this.im.addFaderCallback(Keytar.KNOB2,   function(value){ obj.bw.trackWrapper.setMacroValue([obj.instBankIdx, obj.instTrackIdx], 0, 1, value);});
    //this.im.addFaderCallback(Keytar.KNOB3,   function(value){ obj.bw.trackWrapper.setMacroValue([obj.instBankIdx, obj.instTrackIdx], 0, 2, value);});
    //this.im.addFaderCallback(Keytar.RIBBON1, function(value){ obj.bw.trackWrapper.setMacroValue([obj.instBankIdx, obj.instTrackIdx], 0, 4, value);});
    //this.im.addFaderCallback(Keytar.RIBBON2, function(value){ obj.bw.trackWrapper.setMacroValue([obj.instBankIdx, obj.instTrackIdx], 0, 5, value);});
    //this.im.addFaderCallback(Keytar.RIBBON3, function(value){ obj.bw.trackWrapper.setMacroValue([obj.instBankIdx, obj.instTrackIdx], 0, 6, value);});
    this.im.addFaderCallback(Keytar.KNOB1,   function(value){ obj.onKnobRibbon(0, value)});
    this.im.addFaderCallback(Keytar.KNOB2,   function(value){ obj.onKnobRibbon(1, value)});
    this.im.addFaderCallback(Keytar.KNOB3,   function(value){ obj.onKnobRibbon(2, value)});
    this.im.addFaderCallback(Keytar.RIBBON1, function(value){ obj.onKnobRibbon(4, value)});
    this.im.addFaderCallback(Keytar.RIBBON2, function(value){ obj.onKnobRibbon(5, value)});
    this.im.addFaderCallback(Keytar.RIBBON3, function(value){ obj.onKnobRibbon(6, value)});

    //keytar buttons
    this.im.addButtonCallback( Keytar.BUTTON5, ButtonAction.tap, function(){ 
        obj.bw.transportWrapper.tapTempo();
    });
    this.im.addButtonCallback( Keytar.BUTTON6, ButtonAction.tap, function(){ 
        obj.bw.transportWrapper.togglePlay();
    });

    this.im.addButtonCallback( Keytar.BUTTON1, ButtonAction.tap, function(){ obj.selectKnobDevice(0);});
    this.im.addButtonCallback( Keytar.BUTTON2, ButtonAction.tap, function(){ obj.selectKnobDevice(1);});
    this.im.addButtonCallback( Keytar.BUTTON3, ButtonAction.tap, function(){ obj.selectKnobDevice(2);});
    this.im.addButtonCallback( Keytar.BUTTON4, ButtonAction.tap, function(){ obj.selectKnobDevice(3);});
    //this.im.addButtonCallback( Keytar.BUTTON2, ButtonAction.tap, function(){ obj.selectTrack(1);});
    //this.im.addButtonCallback( Keytar.BUTTON3, ButtonAction.tap, function(){ obj.selectTrack(2);});
    //this.im.addButtonCallback( Keytar.BUTTON4, ButtonAction.tap, function(){ obj.selectTrack(3);});
    //this.im.addButtonCallback( Keytar.BUTTON6, ButtonAction.tap, function(){ obj.selectTrack(5);});
    //this.im.addButtonCallback(Keytar.BUTTON7, ButtonAction.tap, function(){ obj.bw.trackWrapper.toggleMacroValue(obj.currentTrack(), 3);});
    //this.im.addButtonCallback(Keytar.BUTTON8, ButtonAction.tap, function(){ obj.bw.trackWrapper.toggleMacroValue(obj.currentTrack(), 7);});
}



function setupSimpleMode() {
    var simpleMode = new SimpleMode();
}

