/**
 * Function : dump()
 * Arguments: The data - array,hash(associative array),object
 *    The level - OPTIONAL
 * Returns  : The textual representation of the array.
 * This function was inspired by the print_r function of PHP.
 * This will accept some data as the argument and return a
 * text that will be a more readable version of the
 * array/hash/object that is given.
 * Docs: http://www.openjs.com/scripts/others/dump_function_php_print_r.php
 */
function dump(arr,level) {
	if(!level) level = 0;
	
	//The padding given at the beginning of the line.
	var level_padding = "";
	for(var j=0;j<level+1;j++) level_padding += "    ";
	
	if(typeof(arr) == 'object') { //Array/Hashes/Objects 
		for(var item in arr) {
			var value = arr[item];
			
			if(typeof(value) == 'object') { //If it is an array,
				println("|" + level_padding + "'" + item + "' ...");
				dump(value,level+1);
			} else {
				println("|" + level_padding + "'" + item + "' => \"" + value + "\"");
			}
		}
	} else { //Stings/Chars/Numbers etc.
		println("===>"+arr+"<===("+typeof(arr)+")");
	}
}


function createMatrix2d(a,b) {
    var x = new Array(a);
    for (var i = 0; i < a; i++) {
        x[i] = new Array(b);
    }
    return x;
}

function createMatrix3d(a,b,c) {
    var x = new Array(a);
    for (var i = 0; i < a; i++) {
        x[i] = createMatrix2d(b,c);
    }
    return x;
}

function doObject (object, f)
{
    return function ()
    {
        f.apply (object, arguments);
    };
}

///////////////////////////

//https://github.com/lukasolson/simple-js-set/blob/master/set.js


//function getMacroSet() {
    //var hashFunction = function(value){
        //return 1000000 * value.track + 100 * value.device + value.macro
    //}
    //return new Set(hashFunction);
//}

//function Set(hashFunction) {
	//this._hashFunction = hashFunction;
	//this._values = {};
	//this._size = 0;
//}

//Set.prototype = {
	//add: function add(value) {
		//if (!this.contains(value)) {
			//this._values[this._hashFunction(value)] = value;
			//this._size++;
		//}
	//},
	
	//remove: function remove(value) {
		//if (this.contains(value)) {
			//delete this._values[this._hashFunction(value)];
			//this._size--;
		//}
	//},
	
	//contains: function contains(value) {
		//return typeof this._values[this._hashFunction(value)] !== "undefined";
	//},
	
	//size: function size() {
		//return this._size;
	//},
	
	//each: function each(iteratorFunction, thisObj) {
		//for (var value in this._values) {
			//iteratorFunction.call(thisObj, this._values[value]);
		//}
	//}
//};
