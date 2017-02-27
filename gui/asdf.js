const {ipcRenderer} = require('electron')

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
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
            console.log("ERROR IN OBSERVERWRAPPER");
        }
        currentNode = currentNode[url[i]];
    }
    currentNode[url[url.length-1]] = value;
}
State.prototype.dump = function() {
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

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Parameter() {
    this.color = {
        active       : ["#0000cc", "#aaaadd"],
        passive      : ["#777777", "#dddddd"],
    }
}

Parameter.prototype.setBar = function(id, name, amount, color) {
    var root = document.getElementById(id);
    root.innerHTML = "<td>"+name+"</td><td><div class=\"barOuter\"><div class=\"barInner\"></div> </div></td>";
    var inner = root.children[1].children[0].children[0];
    var outer = root.children[1].children[0];
    inner.style.width = amount;
    inner.style.background = color[0];
    outer.style.background = color[1];
}

Parameter.prototype.setManyBars = function(state, prefix, path, active) {
    this.setBar(prefix+"0", 
            state.get(["bw","tracks"].concat(path).concat(["macro",0,"name"])),
            state.get(["bw","tracks"].concat(path).concat(["macro",0,"amount"])),
            active ? this.color.active : this.color.passive);
    this.setBar(prefix+"1", 
            state.get(["bw","tracks"].concat(path).concat(["macro",1,"name"])),
            state.get(["bw","tracks"].concat(path).concat(["macro",1,"amount"])),
            active ? this.color.active : this.color.passive);
    this.setBar(prefix+"2", 
            state.get(["bw","tracks"].concat(path).concat(["macro",2,"name"])),
            state.get(["bw","tracks"].concat(path).concat(["macro",2,"amount"])),
            active ? this.color.active : this.color.passive);
    this.setBar(prefix+"3", 
            state.get(["bw","tracks"].concat(path).concat(["macro",4,"name"])),
            state.get(["bw","tracks"].concat(path).concat(["macro",4,"amount"])),
            active ? this.color.active : this.color.passive);
}

Parameter.prototype.update = function(state) {
    var currInst          = state.get(["bw","currInst"]);
    var knobDevice        = state.get(["bw","knobDevice"]);
    if(currInst !== undefined && knobDevice !== undefined)
    {
        this.setBar("volume", "Volume", state.get(["bw","tracks",currInst[0],currInst[1],"volume"]), this.color.active);
        this.setManyBars(state, "m0", [currInst[0], currInst[1], "device", 0], knobDevice == 0);
        this.setManyBars(state, "m1", [currInst[0], "device", 0], knobDevice == 1);
        this.setManyBars(state, "m2", [currInst[0], "device", 1], knobDevice == 2);
        this.setManyBars(state, "m3", [currInst[0], "device", 2], knobDevice == 3);
        this.setManyBars(state, "m4", ["device", 0], knobDevice == 4);
        this.setManyBars(state, "m5", ["device", 1], knobDevice == 5);
        this.setManyBars(state, "m6", ["device", 2], knobDevice == 6);
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Track() {
    this.tapTempo = document.getElementById("tapTempo");
    this.playback = document.getElementById("playback");
    this.nextBank = document.getElementById("nextBank");
    this.prevBank = document.getElementById("prevBank");
    this.currBank = document.getElementById("currBank");
    this.currInst = document.getElementById("currInst");
    this.numTracks = 8;
    this.track = [];
    for(var i = 0; i < this.numTracks; i++) {
        this.track[i] = document.getElementById("track"+i);
    }
    
    this.color = {
        border     : "gray",
        bankSelect : "#444444",
        cold       : "#000000",
        hot        : "#0000bb",
    }
    
    this.tapTempo.innerHTML = "Tap Tempo";
    this.playback.innerHTML = "playback";
    this.nextBank.innerHTML = "next bank";
    this.prevBank.innerHTML = "prev bank";
    for(var i = 0; i < this.numTracks; i++) {
        this.track[i].innerHTML = "track "+i;
    }

    this.tapTempo.style.background = this.color.cold;
    this.playback.style.background = this.color.cold;
    this.nextBank.style.background = this.color.bankSelect;
    this.prevBank.style.background = this.color.bankSelect;
    this.playback.style.background = this.color.bankSelect;
    this.tapTempo.style.background = this.color.bankSelect;
    for(var i = 0; i < this.numTracks; i++) {
        this.track[i].style.background = this.color.cold;
    }
    this.tapTempo.style.borderColor = this.color.border;
    this.playback.style.borderColor = this.color.border;
    this.nextBank.style.borderColor = this.color.border;
    this.prevBank.style.borderColor = this.color.border;
    for(var i = 0; i < this.numTracks; i++) {
        this.track[i].style.borderColor = this.color.border;
    }
}

Track.prototype.update = function(state) {
    var currInst          = state.get(["bw","currInst"]);
    var currBank          = state.get(["bw","currBank"]);
    var nextBank          = state.get(["bw","nextBank"]);
    var prevBank          = state.get(["bw","prevBank"]);
    if(currInst !== undefined 
       && currBank !== undefined
       && nextBank !== undefined
       && prevBank !== undefined
    )
    {
        //update tracknames and selection
        for(var i = 0; i < this.numTracks; i++) {
            this.track[i].innerHTML = state.get(["bw","tracks",currBank[0],i,"name"]); 
            this.track[i].style.background = this.color.cold;
        }
        if(currInst[0] == currBank[0]) {
            this.track[currInst[1]].style.background = this.color.hot;
        }

        this.nextBank.innerHTML = state.get(["bw","tracks",nextBank[0],"name"]);
        this.prevBank.innerHTML = state.get(["bw","tracks",prevBank[0],"name"]);
        this.currBank.innerHTML = state.get(["bw","tracks",currBank[0],"name"]);

        this.currInst.innerHTML = state.get(["bw","tracks",currInst[0],"name"]) + "/" + state.get(["bw","tracks",currInst[0],currInst[1],"name"]);

    }

    var isPlaying = state.get(["bw","isPlaying"]);
    if(isPlaying !== undefined) {
        if(isPlaying[0]) {
            this.playback.style.background = this.color.cold;
            this.playback.innerHTML = "Playing";
        } else {
            this.playback.style.background = this.color.cold;
            this.playback.innerHTML = "Stopped";
        }
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


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
        border  : "gray",
        cold    : "#000000",
        hot     : "#ff2222",
        waiting : "#ffff22",
        offline : "#dddddd",
    }

    this.lastFrac = [];
    this.lastFrac[0] = 0;
    this.lastFrac[1] = 0;
    this.lastFrac[2] = 0;
    this.lastFrac[3] = 0;

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
Looper.prototype.update = function(state) {
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

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

window.addEventListener('DOMContentLoaded', function() {
    var state     = new State();
    var track     = new Track();
    var parameter = new Parameter();
    var looper    = new Looper();
    ipcRenderer.on("osc", (evnt, msg) => {
        state.eventHandler(msg.address, msg.args);
        track.update(state);
        parameter.update(state);
        looper.update(state);
    });
});
