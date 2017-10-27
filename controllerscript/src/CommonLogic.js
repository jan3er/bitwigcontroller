
//// use the keytar buttons to switch between projects 1 to 8.
//function setupProjectSelection(im, bw) {
    //var mProjectIdx = 0;
    //// you have to make sure that project number i exits
    //// when calling this function with projectIdx i.
    //// otherwise the function will wrap arround modulo and be confused.
    //var switchTo = function(projectIdx) {
        //println("switch to project " + (projectIdx+1));
        //host.showPopupNotification("switch to project " + (projectIdx+1));
        //while(mProjectIdx < projectIdx) {
            //mProjectIdx++;
            //bw.applicationWrapper.nextProject();
        //}
        //while(mProjectIdx > projectIdx) {
            //mProjectIdx--;
            //bw.applicationWrapper.previousProject();
        //}
        //bw.applicationWrapper.activateEngine();
    //}
    //im.addButtonCallback( Keytar.BUTTON1, ButtonAction.tap, function(){switchTo(0);});
    //im.addButtonCallback( Keytar.BUTTON2, ButtonAction.tap, function(){switchTo(1);});
    //im.addButtonCallback( Keytar.BUTTON3, ButtonAction.tap, function(){switchTo(2);});
    //im.addButtonCallback( Keytar.BUTTON4, ButtonAction.tap, function(){switchTo(3);});
    //im.addButtonCallback( Keytar.BUTTON5, ButtonAction.tap, function(){switchTo(4);});
    //im.addButtonCallback( Keytar.BUTTON6, ButtonAction.tap, function(){switchTo(5);});
    //im.addButtonCallback( Keytar.BUTTON7, ButtonAction.tap, function(){switchTo(6);});
    //im.addButtonCallback( Keytar.BUTTON8, ButtonAction.tap, function(){switchTo(7);});
//}

//// use two footbuttons on the bottom right to controll click, playback and tap-temo
//function setupClickPlaybackTemo(im, bw) {
    //// playback
    //im.addButtonCallback(Nobels.NINE, ButtonAction.longPress, function(){
        //host.showPopupNotification("toggle playback");
        //bw.transportWrapper.togglePlay();
    //});
    //// metronome
    //im.addButtonCallback(Nobels.NINE, ButtonAction.shortPress1, function(){
        //host.showPopupNotification("toggle click");
        //bw.transportWrapper.toggleClick();
    //});
    //// repeadedly tap button 0 to set tempo tempo
    //im.addButtonCallback( Nobels.ZERO,  ButtonAction.tap, function(){
        //bw.transportWrapper.transport.tapTempo();
    //});
//}
