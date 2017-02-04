const {ipcRenderer} = require('electron')

function startListening(state, buttons) {
    console.log("start listening");

    ipcRenderer.on("osc", (evnt, msg) => {
        //console.log(msg.address);
        //console.log(msg.args);


        state.eventHandler(msg.address, msg.args);
        buttons.updateWithState(state);

        switch(msg.address) {
            case "/sl/tap_tempo":
                buttons.recordButton.style.borderColor = "#ffffff";
                setTimeout(function(){
                    buttons.recordButton.style.borderColor = buttons.lpColor.border;
                }, 100);
                break;
            //case "/bw/currentInstrument":
                //console.log("select instrument (" + msg.args[0] + ", "+ msg.args[1] + ")");
                //break;

            //case "/bw/visibleBank":
                //console.log("select bank " + msg.args[0]);
                //break;

            //case "/sl/state":
                //console.log("yay! looper is alive!");
                //break;

            default:
                break;
        }
    });
}




function State(tracksPerLevel) {
    this.data = [];
}
State.prototype.eventHandler = function(url, value) {
    var url = url.split("/");
    url.shift();

    var currentNode = this.data;
    for(var i = 0; i < url.length-1; i++) {
        if(currentNode[url[i]] === undefined) {
            currentNode[url[i]] = [];      
        } 
        if (currentNode[url[i]].constructor !== Array) {
            println("ERROR IN OBSERVERWRAPPER");
        }
        currentNode = currentNode[url[i]];
    }
    currentNode[url[url.length-1]] = value;
}
State.prototype.dump = function() {
    //return [{path: "asdf", value: "huuu"}];
    return function collect(path, root) {
        if (root.constructor !== Array) {
            return [{path : path, value : root}]
        }
        var ret = []
        for(var arg in root) {
            ret = ret.concat(collect(path.concat(arg), root[arg])); 
        }
        return ret;
    }([], this.data);
}
State.prototype.get = function(path) {
    var curr = this.data;
    for(var i = 0; i < path.length; i++) {
        if(curr === undefined) return undefined;
        curr = curr[path[i]];
    }
    return curr;
}









function ButtonsInDOM() {

    this.knob0 = document.getElementById("knob0");
    this.knob1 = document.getElementById("knob1");
    this.knob2 = document.getElementById("knob2");
    this.valueKnob0 = document.getElementById("valueKnob0");
    this.valueKnob1 = document.getElementById("valueKnob1");
    this.valueKnob2 = document.getElementById("valueKnob2");
    this.ribbon0 = document.getElementById("ribbon0");
    this.ribbon1 = document.getElementById("ribbon1");
    this.ribbon2 = document.getElementById("ribbon2");
    this.valueRibbon0 = document.getElementById("valueRibbon0");
    this.valueRibbon1 = document.getElementById("valueRibbon1");
    this.valueRibbon2 = document.getElementById("valueRibbon2");
    this.instrument = document.getElementById("instrument");
    this.currentBankName = document.getElementById("currentBankName");
    this.volume = document.getElementById("volume");

    this.keytarTapTempo = document.getElementById("keytarButton4");
    this.keytarPlayback = document.getElementById("keytarButton5");
    //this.keytarButton1  = document.getElementById("keytarButton1");
    //this.keytarButton2  = document.getElementById("keytarButton2");
    //this.keytarButton3  = document.getElementById("keytarButton3");
    //this.keytarButton4  = document.getElementById("keytarButton4");
    //this.keytarButton5  = document.getElementById("keytarButton5");
    //this.keytarButton6  = document.getElementById("keytarButton6");
    //this.keytarButton7  = document.getElementById("keytarButton7");

    this.trackButtons = [];
    this.nextBankButton = document.getElementById("button00");
    this.prevBankButton = document.getElementById("button06");
    this.trackButtons[0] = document.getElementById("button01");
    this.trackButtons[1] = document.getElementById("button02");
    this.trackButtons[2] = document.getElementById("button07");
    this.trackButtons[3] = document.getElementById("button08");
    this.trackButtons[4] = document.getElementById("button09");
    this.undoButton = document.getElementById("button05");
    this.redoButton = document.getElementById("button11");
    this.recordButton = document.getElementById("button04");
    this.overdubButton = document.getElementById("button10");
    this.playButton = document.getElementById("button03");

    var lastFrac = 0;

    //-----------------------------------------------------
    
    this.keytarTapTempo.innerHTML = "Tap Tempo";

    this.nextBankButton.innerHTML = "Next Bank";
    this.prevBankButton.innerHTML = "Previous Bank";
    this.trackButtons[0].innerHTML = "Instrument 0";
    this.trackButtons[1].innerHTML = "Instrument 1";
    this.trackButtons[2].innerHTML = "Instrument 2";
    this.trackButtons[3].innerHTML = "Instrument 3";
    this.trackButtons[4].innerHTML = "Instrument 5";
    this.undoButton.innerHTML = "Undo";
    this.redoButton.innerHTML = "Redo";
    this.recordButton.innerHTML = "Record";
    this.overdubButton.innerHTML = "Overdub";
    this.playButton.innerHTML = "Playing";

    this.lpColor = {
        border  : "#aa2222",
        cold    : "#222222",
        hot     : "#ff2222",
        waiting : "#ffff22",
        offline : "#ffffff",
    }
    this.bwColor = {
        border  : "#2222aa",
        cold    : "#222222",
        hot     : "#2222ff",
    }

    this.nextBankButton.style.background = this.bwColor.cold;
    this.prevBankButton.style.background = this.bwColor.cold;
    this.trackButtons[0].style.background = this.bwColor.cold;
    this.trackButtons[1].style.background = this.bwColor.cold;
    this.trackButtons[2].style.background = this.bwColor.cold;
    this.trackButtons[3].style.background = this.bwColor.cold;
    this.trackButtons[4].style.background = this.bwColor.cold;
    this.undoButton.style.background = this.lpColor.cold;
    this.redoButton.style.background = this.lpColor.cold;
    this.recordButton.style.background = this.lpColor.cold;
    this.overdubButton.style.background = this.lpColor.cold;
    this.playButton.style.background = this.lpColor.cold;

    this.nextBankButton.style.borderColor = this.bwColor.border;
    this.prevBankButton.style.borderColor = this.bwColor.border;
    this.trackButtons[0].style.borderColor = this.bwColor.border;
    this.trackButtons[1].style.borderColor = this.bwColor.border;
    this.trackButtons[2].style.borderColor = this.bwColor.border;
    this.trackButtons[3].style.borderColor = this.bwColor.border;
    this.trackButtons[4].style.borderColor = this.bwColor.border;
    this.undoButton.style.borderColor = this.lpColor.border;
    this.redoButton.style.borderColor = this.lpColor.border;
    this.recordButton.style.borderColor = this.lpColor.border;
    this.overdubButton.style.borderColor = this.lpColor.border;
    this.playButton.style.borderColor = this.lpColor.border;

}
ButtonsInDOM.prototype.slWait= function() {
    this.undoButton.style.background = this.lpColor.cold;
    this.redoButton.style.background = this.lpColor.cold;
    this.recordButton.style.background = this.lpColor.waiting;
    this.overdubButton.style.background = this.lpColor.cold;
    this.playButton.style.background = this.lpColor.cold;
}
ButtonsInDOM.prototype.slRecording = function() {
    this.undoButton.style.background = this.lpColor.cold;
    this.redoButton.style.background = this.lpColor.cold;
    this.recordButton.style.background = this.lpColor.hot;
    this.overdubButton.style.background = this.lpColor.cold;
    this.playButton.style.background = this.lpColor.cold;
}
ButtonsInDOM.prototype.slPlaying = function(fraction) {
    this.undoButton.style.background = this.lpColor.cold;
    this.redoButton.style.background = this.lpColor.cold;
    this.recordButton.style.background = this.lpColor.cold;
    this.overdubButton.style.background = this.lpColor.cold;
    this.playButton.style.background = this.lpColor.hot;
}
ButtonsInDOM.prototype.slOverdubbing = function() {
    this.undoButton.style.background = this.lpColor.cold;
    this.redoButton.style.background = this.lpColor.cold;
    this.recordButton.style.background = this.lpColor.cold;
    this.overdubButton.style.background = this.lpColor.hot;
    this.playButton.style.background = this.lpColor.hot;
}
ButtonsInDOM.prototype.slMuted = function() {
    this.undoButton.style.background = this.lpColor.cold;
    this.redoButton.style.background = this.lpColor.cold;
    this.recordButton.style.background = this.lpColor.cold;
    this.overdubButton.style.background = this.lpColor.cold;
    this.playButton.style.background = this.lpColor.cold;
}
ButtonsInDOM.prototype.slOffline  = function() {
    this.undoButton.style.background = this.lpColor.offline;
    this.redoButton.style.background = this.lpColor.offline;
    this.recordButton.style.background = this.lpColor.offline;
    this.overdubButton.style.background = this.lpColor.offline;
    this.playButton.style.background = this.lpColor.offline;
}
ButtonsInDOM.prototype.bwIsPlaying = function() {
    this.keytarPlayback.style.background = this.lpColor.cold;
    this.keytarPlayback.innerHTML = "Playing";
}
ButtonsInDOM.prototype.bwIsNotPlaying  = function() {
    this.keytarPlayback.style.background = this.lpColor.cold;
    this.keytarPlayback.innerHTML = "Stopped";
}
ButtonsInDOM.prototype.selectTrack = function(trackIdx) {
    for(var i = 0; i < 5; i++) {
        this.trackButtons[i].style.background = this.bwColor.cold;
    }
        this.trackButtons[trackIdx].style.background = this.bwColor.hot;
}


ButtonsInDOM.prototype.updateWithState = function(state) {
    var currentInstrument = state.get(["bw","currentInstrument"]);
    var visibleBank       = state.get(["bw","visibleBank"]);
    var knobDevice        = state.get(["bw","knobDevice"]);
    var nextBank          = state.get(["bw","nextBank"]);
    var prevBank          = state.get(["bw","prevBank"]);
    if(currentInstrument !== undefined 
        && visibleBank !== undefined
        && knobDevice !== undefined
        && nextBank !== undefined
        && prevBank !== undefined
    )
    {
        for(var i = 0; i < 5; i++) {
            this.trackButtons[i].innerHTML = state.get(["bw","tracks",visibleBank[0],i,"name"]); 
            this.trackButtons[i].style.background = this.bwColor.cold;
        }
        if(currentInstrument[0] == visibleBank[0]) {
            this.trackButtons[currentInstrument[1]].style.background = this.bwColor.hot;
        }
        this.nextBankButton.innerHTML = state.get(["bw","tracks",nextBank[0],"name"]);
        this.prevBankButton.innerHTML = state.get(["bw","tracks",prevBank[0],"name"]);

        this.instrument.innerHTML = state.get(["bw","tracks",currentInstrument[0],"name"]) + "/" + 
                                    state.get(["bw","tracks",currentInstrument[0],currentInstrument[1],"name"]);

        this.currentBankName.innerHTML = state.get(["bw","tracks",visibleBank,"name"]);

        if(knobDevice == 0) {
            this.knob0.innerHTML = state.get(["bw","tracks",currentInstrument[0],currentInstrument[1],"device", 0, "macro",0,"name"]);
            this.knob1.innerHTML = state.get(["bw","tracks",currentInstrument[0],currentInstrument[1],"device", 0, "macro",1,"name"]);
            this.knob2.innerHTML = state.get(["bw","tracks",currentInstrument[0],currentInstrument[1],"device", 0, "macro",2,"name"]);
            this.valueKnob0.style.width = state.get(["bw","tracks",currentInstrument[0],currentInstrument[1],"device", 0, "macro",0,"amount"])[0];
            this.valueKnob1.style.width = state.get(["bw","tracks",currentInstrument[0],currentInstrument[1],"device", 0, "macro",1,"amount"])[0];
            this.valueKnob2.style.width = state.get(["bw","tracks",currentInstrument[0],currentInstrument[1],"device", 0, "macro",2,"amount"])[0];
        } else {
            this.knob0.innerHTML = state.get(["bw","tracks",currentInstrument[0], "device", knobDevice-1, "macro",0,"name"]);
            this.knob1.innerHTML = state.get(["bw","tracks",currentInstrument[0], "device", knobDevice-1, "macro",1,"name"]);
            this.knob2.innerHTML = state.get(["bw","tracks",currentInstrument[0], "device", knobDevice-1, "macro",2,"name"]);
            this.valueKnob0.style.width = state.get(["bw","tracks",currentInstrument[0], "device", knobDevice-1, "macro",0,"amount"])[0];
            this.valueKnob1.style.width = state.get(["bw","tracks",currentInstrument[0], "device", knobDevice-1, "macro",1,"amount"])[0];
            this.valueKnob2.style.width = state.get(["bw","tracks",currentInstrument[0], "device", knobDevice-1, "macro",2,"amount"])[0];

        }
        this.ribbon0.innerHTML = state.get(["bw","tracks",currentInstrument[0],currentInstrument[1],"device", 0, "macro",4,"name"]);
        this.ribbon1.innerHTML = state.get(["bw","tracks",currentInstrument[0],currentInstrument[1],"device", 0, "macro",5,"name"]);
        this.ribbon2.innerHTML = state.get(["bw","tracks",currentInstrument[0],currentInstrument[1],"device", 0, "macro",6,"name"]);
        this.valueRibbon0.style.width = state.get(["bw","tracks",currentInstrument[0],currentInstrument[1],"device", 0, "macro",4,"amount"])[0];
        this.valueRibbon1.style.width = state.get(["bw","tracks",currentInstrument[0],currentInstrument[1],"device", 0, "macro",5,"amount"])[0];
        this.valueRibbon2.style.width = state.get(["bw","tracks",currentInstrument[0],currentInstrument[1],"device", 0, "macro",6,"amount"])[0];
        this.volume.style.width = state.get(["bw","tracks",currentInstrument[0],currentInstrument[1],"volume"])[0];
    }

    var slState = state.get(["sl","state"]);
    if(slState === undefined) {
        this.slOffline();
    } else {
        //console.log(slState);
        switch(slState[2]) {
            case -1:
                //console.log("looper state: Unknown");
                break;
            case 0:
                //console.log("looper state: Off");
                this.slMuted();
                break;
            case 1:
                //console.log("looper state: WaitStart");
                this.slWait();
                break;
            case 2:
                //console.log("looper state: Recording");
                this.slRecording();
                break;
            case 3:
                //console.log("looper state: WaitStop");
                this.slWait();
                break;
            case 4:
                //console.log("looper state: Playing");
                this.slPlaying();
                break;
            case 5:
                //console.log("looper state: Overdubbing");
                this.slOverdubbing();
                break;
            case 6:
                //console.log("looper state: Multiplying");
                break;
            case 7:
                //console.log("looper state: Inserting");
                break;
            case 8:
                //console.log("looper state: Replacing");
                break;
            case 9:
                //console.log("looper state: Delay");
                break;
            case 10:
                //console.log("looper state: Muted");
                this.slMuted();
                break;
            case 11:
                //console.log("looper state: Scratching");
                break;
            case 12:
                //console.log("looper state: OneShot");
                break;
            case 13:
                //console.log("looper state: Substitute");
                break;
            case 14:
                //console.log("looper state: Paused");
                break;
        }

        if(slState[2] == 4 || slState[2] == 10) {
            var len = state.get(["sl","loop_len"])[2];
            var pos = state.get(["sl","loop_pos"])[2];
            var frac = pos / len;
            var obj = this;
            if(frac < this.lastFrac) {
                this.playButton.style.borderColor = "#ffffff";
                setTimeout(function(){
                    obj.playButton.style.borderColor = obj.lpColor.border;
                }, 100);
            }
            this.lastFrac = frac;
            //this.playButton.style.background = "rgb(" + Math.round(255 * (1-frac)) + ",0,0)"; // + Math.round(255 * (1-frac)) + ",0)";
        }

    }

    var bwIsPlaying = state.get(["bw","isPlaying"]);
    if(bwIsPlaying !== undefined) {
        if(bwIsPlaying[0]) {
            this.bwIsPlaying();
        } else {
            this.bwIsNotPlaying();
        }
    }
}



window.addEventListener('DOMContentLoaded', function() {

    var state = new State();
    var buttons = new ButtonsInDOM();
    startListening(state, buttons);

    //setTimeout(function() {
        //console.log("=====");   
        //console.log(state.dump());
        //console.log("=====");   
    //}, 3000);
});
