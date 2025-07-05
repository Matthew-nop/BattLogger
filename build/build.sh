#!/bin/sh

rm -rf dist/components

test -d dist || mkdir dist
tsc -p tsconfig.json
tsc -p tsconfig.client.json
sass src/style.scss:dist/style.css

test -d dist/components || mkdir dist/components 
test -d dist/data || mkdir dist/data
test -d dist/data/batteries || mkdir dist/data/batteries
test -d dist/data/test_runs || mkdir dist/data/test_runs

cp -r src/components/* dist/components/
cp -r data/* dist/data/