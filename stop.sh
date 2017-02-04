

echo stop sooperlooper
killall -9 sooperlooper

echo stop bitwig
killall -9 bitwig-studio

echo stop connection daemon
./keep-connected.sh stop

echo stop jack
jack_control stop
