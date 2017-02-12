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
fillTrackTree = function(root, treeSize) {
    var children = [];
    var devices  = [];
    var tmp = treeSize.shift();
    if(tmp !== undefined) {
        var numChildren = tmp[0];
        var numDevices = tmp[1];

        if(treeSize.length == 1) {
            var flattenTracks = true;
        } else {
            var flattenTracks = false;
        }
        if(root === undefined) root = host.createTrackBank(1,0,0).getTrack(0);
        if(treeSize.length > 1) {
            var trackBank = root.createTrackBank(numChildren, 0, 0, flattenTracks);
            for(var i = 0; i < numChildren; i++) {
                children[i] = fillTrackTree(trackBank.getTrack(i), treeSize.slice());
            }
        }

        if(numDevices != 0) {
            var deviceBank = root.createDeviceBank(numDevices);
            for(var i = 0; i < numDevices; i++) {
                devices[i] = deviceBank.getDevice(i);
            }
        }
    } 
    return {
        track    : root,
        children : children,
        devices  : devices,
    };
}

// ===============================================================================
// TRACK WRAPPER
// 

function TrackWrapper(im, treeSize) {

    this.im            = im;
    this.trackTree     = fillTrackTree(undefined, treeSize.slice());
    
    var obj = this;
    host.scheduleTask(function(){
    }, [], 0);
    
}

TrackWrapper.prototype.killStuckNote = function() {
    // this message releases the sustain button.
    this.im.keytarIn.sendRawMidiEvent(176, 64, 0);
    for(var i = 0; i < 128; i++) {
        this.im.keytarIn.sendRawMidiEvent(128, i, 1);
    }
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
    var applyToSubtree = function(root, fn){
        fn(root);
        for(var i = 0; i < root.children.length; i++) {
            applyToSubtree(root.children[i], fn)
        }
    }
    applyToSubtree(root, fnNoMatch);
    var currRoot = root;
    while(selector.length != 0) {
        if(includeParents) fnMatch(currRoot);
        currRoot = currRoot.children[selector.shift()];
    }
    fnMatch(currRoot);
    if(includeChildren) applyToSubtree(currRoot, fnMatch)
}


TrackWrapper.prototype.armTrack = function(positionInTree, includeParents, includeChildren) {
    this.killStuckNote();
    var obj = this;
    //run this as scheduled task such that all notes are killed before switching
    host.scheduleTask(function(){
        obj.forEachSubtree(obj.trackTree, positionInTree, includeParents, includeChildren,
            function(root) {root.track.getArm().set(true)}, 
            function(root) {root.track.getArm().set(false)});
    }, [], 0);
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

function ObserverWrapper(treeSize) {
    this.callback      = undefined;
    this.data          = [];
    this.addObservers(fillTrackTree(undefined, treeSize.slice()), ["tracks"]);

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

function BitwigWrapper(im, treeSize){

    this.transportWrapper   = new TransportWrapper();
    this.trackWrapper       = new TrackWrapper(im, treeSize.slice());
    this.observerWrapper    = new ObserverWrapper(treeSize.slice());
}
