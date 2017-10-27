loadAPI(1);

host.defineController("controllerscripts", "stagesetup", "0.1", "444440B0-806E-4123-AB5C-06176423F6F9");
host.defineMidiPorts(2, 0);

load ("Util.js");
load ("Input.js");
load ("BitwigWrapper.js");
load ("OSC.js");
load ("SimpleMode.js");

function init()
{
    setup();
}

function exit()
{
}
