#!/usr/bin/env sh

#load virtual midi
sudo modprobe snd-virmidi midi_devs=3

#setup and start jack
jack_control stop
jack_control eps realtime true
jack_control ds alsa
jack_control dps device hw:0 
jack_control dps capture hw:0 
jack_control dps playback hw:0 
jack_control dps rate 44100
jack_control dps nperiods 2
jack_control dps period 1024 
jack_control start
sudo schedtool -R -p 80 `pidof jackdbus`

#start bitwig
PROJECT="projects/jam/jam.bwproject"
nohup bitwig-studio "$PROJECT" >/dev/null 2>&1 &

#restart sooperlooper
killall -9 sooperlooper
nohup sooperlooper -L sooperlooper/sooperlooper.slsess -m sooperlooper/sooperlooper.slb >/dev/null 2>&1 &

#establish audio and midi connections
./keep-connected.sh stop
nohup ./keep-connected.sh start >/dev/null 2>&1 &


