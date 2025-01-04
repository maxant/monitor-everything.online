#!/bin/bash
# call like this: ./build.sh "...commit message..." "v0.0.1"

# fail completely if anything fails
set -e

ncc build index.js --license licenses.txt

git add --all
git commit -m "$1"
git tag -a -m "$2" $2
git push --follow-tags
