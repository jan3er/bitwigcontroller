// ===============================================================================
// TRANSPORT WRAPPER
// just a thin wrapper around the bitwig transport object

function TransportWrapper(){
    this.transport = host.createTransport();
}
TransportWrapper.prototype.toggleClick = function() {
    this.transport.toggleClick();
}
TransportWrapper.prototype.togglePlay = function() {
    this.transport.togglePlay();
}
TransportWrapper.prototype.tapTempo = function() {
    this.transport.tapTempo();
}


// ===============================================================================
// BITWIG DATA TREE
// 

fillTrackTree = function(parentTrack, tracksPerLevel) {
    var children = [];
    var tmp = tracksPerLevel.shift();
    if(tmp !== undefined) {
        var numTracks = tmp[0];
        var numDevices = tmp[1];

        if(tracksPerLevel.length == 0) {
            var flattenTracks = true;
        } else {
            var flattenTracks = false;
        }

        if(parentTrack === undefined) {
            var trackBank = host.createTrackBank(1, 0, 0).getTrack(0).createTrackBank(numTracks, 0, 0, flattenTracks);
        } else {
            var trackBank = parentTrack.createTrackBank(numTracks, 0, 0, flattenTracks);
        }
        for(var i = 0; i < numTracks; i++) {
            children[i] = fillTrackTree(trackBank.getTrack(i), tracksPerLevel.slice());
            var deviceBank = children[i].track.createDeviceBank(numDevices);
            for(var j = 0; j < numDevices; j++) {
                children[i].devices[j] = deviceBank.getDevice(j);
            }
        }
    } 
    return {
        children : children,
        track    : parentTrack,
        devices  : []
    };
}

// ===============================================================================
// TRACK WRAPPER
// 

function TrackWrapper(im, tracksPerLevel) {

    this.im            = im;
    this.trackTree     = fillTrackTree(undefined, tracksPerLevel.slice());
    this.tracksPerLevel = tracksPerLevel.slice();
    
    var obj = this;
    host.scheduleTask(function(){
    }, [], 0);
    
}

TrackWrapper.prototype.renameTracks = function(root, url) {
    if(root.track !== undefined) {
        root.track.setName(url.join("/"));
        //println("rename " + url.join("/"));
    }
    for(var i = 0; i < root.children.length; i++) {
        this.renameTracks(root.children[i], url.concat(i));
    }
}

TrackWrapper.prototype.forEachSubtree = function(root, selector, includeParents, includeChildren, fnMatch, fnNoMatch) {
    var subCall = function(root, selector, includeParents, includeChildren, fnMatch) {
        var index = selector.shift();
        for(var i = 0; i < root.children.length; i++) {
            var subRoot = root.children[i];

            if(index == i && selector.length != 0) {
                //we reached a parent
                if(includeParents) {
                    fnMatch(subRoot);
                }
                subCall(subRoot, selector.slice(), includeParents, includeChildren, fnMatch);
            } else if(index == i && selector.length == 0) {
                //we reached the node itself
                fnMatch(subRoot);
                if(includeChildren) {
                    subCall(subRoot, [], true, true, fnMatch);
                }
            } else if(index === undefined){
                //we reached a child
                fnMatch(subRoot);
                subCall(subRoot, [], true, true, fnMatch);
            }
        }
    }
    subCall(root, [], true, true, fnNoMatch);
    subCall(root, selector, includeParents, includeChildren, fnMatch);
}


TrackWrapper.prototype.armTrack = function(positionInTree, includeParents, includeChildren) {
    // this message releases the sustain button.
    // let us hope this message always arives at the current channel before switching
    this.im.keytarIn.sendRawMidiEvent(176, 64, 0);

    this.forEachSubtree(this.trackTree, positionInTree, includeParents, includeChildren,
        function(root) {root.track.getArm().set(true)}, 
        function(root) {root.track.getArm().set(false)});
}

TrackWrapper.prototype.setVolume = function(bankIdx, trackIdx, value) {
    this.trackTree.children[bankIdx].children[trackIdx].track.getVolume().set(value,128);
}

TrackWrapper.prototype.setMacroValue = function(positionInTree, includeParents, includeChildren, deviceIdx, macroIdx, value) {

    this.forEachSubtree(this.trackTree, positionInTree, includeParents, includeChildren,
        function(root) {root.devices[deviceIdx].getMacro(macroIdx).getAmount().set(value,128)},
        function(root) {});
}

// ===============================================================================
// OBSERVER WRAPPER
//

function ObserverWrapper(tracksPerLevel) {
    this.tracksPerLevel = tracksPerLevel;
    this.callback      = undefined;
    this.data          = [];
    this.addObservers(fillTrackTree(undefined, this.tracksPerLevel.slice()), ["tracks"]);

    this.transport = host.createTransport();
    var obj = this;
    this.transport.addIsPlayingObserver(function(value) {
        obj.eventHandler(["isPlaying"],value);
    });

}
ObserverWrapper.prototype.registerCallback = function(fn) {
    this.callback = fn;
}
ObserverWrapper.prototype.eventHandler = function(url, value) {
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

    if(this.callback !== undefined) {
        this.callback(url,value);
    }
}
ObserverWrapper.prototype.dump = function() {
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
ObserverWrapper.prototype.addDeviceObservers = function(device, url) {
    var obj = this;
    var nameurl = url.concat("name");
    device.addNameObserver(100, "", function(value) {
        obj.eventHandler(nameurl, value);
    });

    for(var i = 0; i < 8; i++) {
        device.getMacro(i).addLabelObserver(100, "", function(url) { return function(value) {
            obj.eventHandler(url, value);
        }}(url.concat("macro",i,"name")));

        device.getMacro(i).getAmount().addValueDisplayObserver(100, "", function(url) { return function(value) {
            obj.eventHandler(url, value.replace(" ",""));
        }}(url.concat("macro",i,"amount")));
    }
}
ObserverWrapper.prototype.addObservers = function(root, url) {
    if(root.track !== undefined) {
        var obj = this;
        root.track.addNameObserver(100, "", function(url) { return function(value) {
            obj.eventHandler(url, value);
        }}(url.concat("name")));

        root.track.getVolume().addValueDisplayObserver(100, "", function(url) { return function(value) {
            value = value.substr(0,value.indexOf(" "));
            value = Math.pow(2,value/20) / 1.232;
            if(isNaN(value)) value = 0;
            value = (100 * value) + "%";
            obj.eventHandler(url, value);
        }}(url.concat("volume")));

        root.track.addIsSelectedInEditorObserver(function(url) { return function(value) {
            obj.eventHandler(url, value);
        }}(url.concat("selected")));

        for(var i = 0; i < root.devices.length; i++) {
            this.addDeviceObservers(root.devices[i], url.concat("device", i));
        }
    }
    for(var i = 0; i < root.children.length; i++) {
        this.addObservers(root.children[i], url.concat(i));
    }
}

// ===============================================================================
// BITWIG WRAPPER
//

function BitwigWrapper(im, tracksPerLevel){

    this.tracksPerLevel = tracksPerLevel;

    this.transportWrapper   = new TransportWrapper();
    this.trackWrapper       = new TrackWrapper(im, tracksPerLevel.slice());
    this.observerWrapper    = new ObserverWrapper(tracksPerLevel.slice());
}
