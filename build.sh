#!/bin/bash
# call like this: ./build.sh "...commit message..." "v0.1"

ncc build index.js --license licenses.txt

git add --all
git commit -m "$1"
git tag -a -m "$2" $2
git push --follow-tags
