const {ipcRenderer} = require('electron')

function startListening(state, buttons, looper) {
}


function Bitwig() {

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

    //-----------------------------------------------------
    
    this.keytarTapTempo.innerHTML = "Tap Tempo";

    this.nextBankButton.innerHTML = "Next Bank";
    this.prevBankButton.innerHTML = "Previous Bank";
    this.trackButtons[0].innerHTML = "Instrument 0";
    this.trackButtons[1].innerHTML = "Instrument 1";
    this.trackButtons[2].innerHTML = "Instrument 2";
    this.trackButtons[3].innerHTML = "Instrument 3";
    this.trackButtons[4].innerHTML = "Instrument 5";

    this.color = {
        border  : "#2222aa",
        cold    : "#222222",
        hot     : "#2222ff",
    }

    this.nextBankButton.style.background = this.color.cold;
    this.prevBankButton.style.background = this.color.cold;
    this.trackButtons[0].style.background = this.color.cold;
    this.trackButtons[1].style.background = this.color.cold;
    this.trackButtons[2].style.background = this.color.cold;
    this.trackButtons[3].style.background = this.color.cold;
    this.trackButtons[4].style.background = this.color.cold;

    this.nextBankButton.style.borderColor = this.color.border;
    this.prevBankButton.style.borderColor = this.color.border;
    this.trackButtons[0].style.borderColor = this.color.border;
    this.trackButtons[1].style.borderColor = this.color.border;
    this.trackButtons[2].style.borderColor = this.color.border;
    this.trackButtons[3].style.borderColor = this.color.border;
    this.trackButtons[4].style.borderColor = this.color.border;
}
Bitwig.prototype.bwIsPlaying = function() {
    this.keytarPlayback.style.background = this.color.cold;
    this.keytarPlayback.innerHTML = "Playing";
}
Bitwig.prototype.bwIsNotPlaying  = function() {
    this.keytarPlayback.style.background = this.color.cold;
    this.keytarPlayback.innerHTML = "Stopped";
}
Bitwig.prototype.selectTrack = function(trackIdx) {
    for(var i = 0; i < 5; i++) {
        this.trackButtons[i].style.background = this.color.cold;
    }
        this.trackButtons[trackIdx].style.background = this.color.hot;
}


Bitwig.prototype.updateWithState = function(state) {
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
            this.trackButtons[i].style.background = this.color.cold;
        }
        if(currentInstrument[0] == visibleBank[0]) {
            this.trackButtons[currentInstrument[1]].style.background = this.color.hot;
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


    var bwIsPlaying = state.get(["bw","isPlaying"]);
    if(bwIsPlaying !== undefined) {
        if(bwIsPlaying[0]) {
            this.bwIsPlaying();
        } else {
            this.bwIsNotPlaying();
        }
    }
}


function State() {
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


function Looper() {

    this.undo = [];
    this.redo = [];
    this.play = [];
    this.recd = [];
    this.odub = [];

    this.undo[0] = document.getElementById("undo0");
    this.redo[0] = document.getElementById("redo0");
    this.odub[0] = document.getElementById("odub0");
    this.play[0] = document.getElementById("play0");
    this.recd[0] = document.getElementById("recd0");
    this.play[1] = document.getElementById("play1");
    this.recd[1] = document.getElementById("recd1");
    this.play[2] = document.getElementById("play2");
    this.recd[2] = document.getElementById("recd2");
    this.play[3] = document.getElementById("play3");
    this.recd[3] = document.getElementById("recd3");

    this.numLoops = 4;

    this.color = {
        border  : "#aa2222",
        cold    : "#222222",
        hot     : "#ff2222",
        waiting : "#ffff22",
        offline : "#dddddd",
    }

    this.lastFrac    = [];
    this.lastFrac[0] = 0;
    this.lastFrac[1] = 0;
    this.lastFrac[2] = 0;
    this.lastFrac[3] = 0;


    //--------------------------

    for(var i = 0; i < this.numLoops; i++) {
        if(this.undo[i] != null) this.undo[i].innerHTML = "undo " + i;
        if(this.redo[i] != null) this.redo[i].innerHTML = "redo " + i;
        if(this.odub[i] != null) this.odub[i].innerHTML = "odub " + i;
        if(this.play[i] != null) this.play[i].innerHTML = "play " + i;
        if(this.recd[i] != null) this.recd[i].innerHTML = "recd " + i;
        if(this.undo[i] != null) this.undo[i].style.borderColor = this.color.border;
        if(this.redo[i] != null) this.redo[i].style.borderColor = this.color.border;
        if(this.odub[i] != null) this.odub[i].style.borderColor = this.color.border;
        if(this.play[i] != null) this.play[i].style.borderColor = this.color.border;
        if(this.recd[i] != null) this.recd[i].style.borderColor = this.color.border;
    }

    var noop = document.getElementById("noop");
    noop.innerHTML = "";
    noop.style.borderColor = this.color.border;
    noop.style.background  = this.color.cold;

}
Looper.prototype.waiting = function(i) {
    if(this.undo[i] != null) this.undo[i].style.background = this.color.cold;
    if(this.redo[i] != null) this.redo[i].style.background = this.color.cold;
    if(this.odub[i] != null) this.odub[i].style.background = this.color.cold;
    if(this.play[i] != null) this.play[i].style.background = this.color.cold;
    if(this.recd[i] != null) this.recd[i].style.background = this.color.waiting;
}
Looper.prototype.recording = function(i) {
    if(this.undo[i] != null) this.undo[i].style.background = this.color.cold;
    if(this.redo[i] != null) this.redo[i].style.background = this.color.cold;
    if(this.odub[i] != null) this.odub[i].style.background = this.color.cold;
    if(this.play[i] != null) this.play[i].style.background = this.color.cold;
    if(this.recd[i] != null) this.recd[i].style.background = this.color.hot;
}
Looper.prototype.playing = function(i, fraction) {
    if(this.undo[i] != null) this.undo[i].style.background = this.color.cold;
    if(this.redo[i] != null) this.redo[i].style.background = this.color.cold;
    if(this.odub[i] != null) this.odub[i].style.background = this.color.cold;
    if(this.play[i] != null) this.play[i].style.background = this.color.hot;
    if(this.recd[i] != null) this.recd[i].style.background = this.color.cold;
}
Looper.prototype.overdubbing = function(i) {
    if(this.undo[i] != null) this.undo[i].style.background = this.color.cold;
    if(this.redo[i] != null) this.redo[i].style.background = this.color.cold;
    if(this.odub[i] != null) this.odub[i].style.background = this.color.hot;
    if(this.play[i] != null) this.play[i].style.background = this.color.hot;
    if(this.recd[i] != null) this.recd[i].style.background = this.color.cold;
}
Looper.prototype.muted = function(i) {
    if(this.undo[i] != null) this.undo[i].style.background = this.color.cold;
    if(this.redo[i] != null) this.redo[i].style.background = this.color.cold;
    if(this.odub[i] != null) this.odub[i].style.background = this.color.cold;
    if(this.play[i] != null) this.play[i].style.background = this.color.cold;
    if(this.recd[i] != null) this.recd[i].style.background = this.color.cold;
}
Looper.prototype.offline = function(i) {
    if(this.undo[i] != null) this.undo[i].style.background = this.color.offline;
    if(this.redo[i] != null) this.redo[i].style.background = this.color.offline;
    if(this.odub[i] != null) this.odub[i].style.background = this.color.offline;
    if(this.play[i] != null) this.play[i].style.background = this.color.offline;
    if(this.recd[i] != null) this.recd[i].style.background = this.color.offline;
}
Looper.prototype.updateWithState = function(state) {
    for(var i = 0; i < this.numLoops; i++) {
        var slState = state.get(["sl",i,"state"]);
        if(slState === undefined) {
            this.offline(i);
        } else {
            switch(slState[2]) {
                case -1: //console.log("looper state: Unknown");
                    break;
                case 0: //console.log("looper state: Off");
                    this.muted(i);
                    break;
                case 1: //console.log("looper state: WaitStart");
                    this.waiting(i);
                    break;
                case 2: //console.log("looper state: Recording");
                    this.recording(i);
                    break;
                case 3: //console.log("looper state: WaitStop");
                    this.waiting(i);
                    break;
                case 4: //console.log("looper state: Playing");
                    this.playing(i);
                    break;
                case 5: //console.log("looper state: Overdubbing");
                    this.overdubbing(i);
                    break;
                case 6: //console.log("looper state: Multiplying");
                    break;
                case 7: //console.log("looper state: Inserting");
                    break;
                case 8: //console.log("looper state: Replacing");
                    break;
                case 9: //console.log("looper state: Delay");
                    break;
                case 10: //console.log("looper state: Muted");
                    this.muted(i);
                    break;
                case 11: //console.log("looper state: Scratching");
                    break;
                case 12: //console.log("looper state: OneShot");
                    break;
                case 13: //console.log("looper state: Substitute");
                    break;
                case 14: //console.log("looper state: Paused");
                    break;
            }

            if(slState[2] == 4 || slState[2] == 10 || slState[2] == 5) {
                if(state.get(["sl",i,"loop_len"]) != null &&  state.get(["sl",i,"loop_pos"]) != null) {
                    var len = state.get(["sl",i,"loop_len"])[2];
                    var pos = state.get(["sl",i,"loop_pos"])[2];
                    var frac = pos / len;
                    var obj = this;
                    if(frac < this.lastFrac[i]) {
                        this.play[i].style.borderColor = "#ffffff";
                        setTimeout(function(i,obj){ return function(){
                            obj.play[i].style.borderColor = obj.color.border;
                        }}(i,obj), 100);
                    }
                    this.lastFrac[i] = frac;
                }
                //this.playButton.style.background = "rgb(" + Math.round(255 * (1-frac)) + ",0,0)"; // + Math.round(255 * (1-frac)) + ",0)";
            }

        }
    }

}


window.addEventListener('DOMContentLoaded', function() {
    var state   = new State();
    var bitwig  = new Bitwig();
    var looper  = new Looper();
    ipcRenderer.on("osc", (evnt, msg) => {
        state.eventHandler(msg.address, msg.args);
        bitwig.updateWithState(state);
        looper.updateWithState(state);
    });
});
