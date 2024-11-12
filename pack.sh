#!/bin/bash

rm -f myclip@bbhtt.space.shell-extension.zip
gnome-extensions pack --force --extra-source=icons --extra-source=lib --out-dir=.
