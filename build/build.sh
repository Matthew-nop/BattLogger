#!/bin/sh

test -d out/dist/ || mkdir -p out/dist/

cp package*.json out/dist/
npm install --omit=dev --prefix out/dist/

test -d out/dist/data || mkdir out/dist/data
cp -r src/data/* out/dist/data/

test -d out/dist/data/batteries || mkdir out/dist/data/batteries
test -d out/dist/data/test_runs || mkdir out/dist/data/test_runs

cp build/install.sh out/
