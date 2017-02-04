loadAPI(1);

host.defineController("my scripts", "Footpedal and Keytar Simple", "1.3", "444440B0-806E-4123-AB4C-06176423F6F9");
host.defineMidiPorts(2, 0);

load ("Util.js");
load ("Input.js");
load ("BitwigWrapper.js");
load ("OSC.js");
load ("CommonLogic.js");
load ("SimpleMode.js");

function init()
{
    setupSimpleMode();
}

function exit()
{
}
