#!/usr/bin/env bash
if [[ "$1" == "start" ]]
then
    while true; do
        sleep 10
        ./connect.sh
    done
fi
if [[ "$1" == "stop" ]]
then
    ps -ef | grep $0 | awk '{print $2}' | xargs kill -9;
fi
