#!/usr/bin/env sh

#connect bitwig to IO
jack_connect "system:capture_1"       "Bitwig Studio:Stereo Input-L"
jack_connect "system:capture_2"       "Bitwig Studio:Stereo Input-R"
jack_connect "Bitwig Studio:Output-L" "system:playback_1"
jack_connect "Bitwig Studio:Output-R" "system:playback_2"

#connect sooperlooper and bitwig
jack_connect "Bitwig Studio:Looper Output-L" "sooperlooper:common_in_1"
jack_connect "Bitwig Studio:Looper Output-R" "sooperlooper:common_in_2"
jack_connect "sooperlooper:common_out_1"     "Bitwig Studio:Looper Input-L" 
jack_connect "sooperlooper:common_out_2"     "Bitwig Studio:Looper Input-R"

#connect keytar und pedal to bitwig
aconnect "Vortex Wireless:Vortex Wireless MIDI 1" "Virtual Raw MIDI 1-0:VirMIDI 1-0"
aconnect "MIDIMATE II:MIDIMATE II MIDI 1"         "Virtual Raw MIDI 1-1:VirMIDI 1-1"

#connect pedal to sooperlooper
aconnect "MIDIMATE II:MIDIMATE II MIDI 1"         "sooperlooper:sooperlooper"
aconnect "Virtual Raw MIDI 1-2:VirMIDI 1-2"       "sooperlooper:sooperlooper"

