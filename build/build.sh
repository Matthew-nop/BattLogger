#!/bin/sh

rm -rf dist

test -d dist || mkdir dist
test -d dist/data || mkdir dist/data
test -d dist/data/batteries || mkdir dist/data/batteries
test -d dist/data/test_runs || mkdir dist/data/test_runs

cp -r data/* dist/data/