#!/bin/bash
# call like this: ./build.sh "...commit message..." "vN.O.P", replacing "N.O.P" with the actual version number

# fail completely if anything fails
set -e

npm test

ncc build index.js --license licenses.txt

git add --all
git commit -m "$1"
git tag -a -m "$2" $2
git push --follow-tags
