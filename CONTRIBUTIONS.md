# Creation

https://docs.github.com/en/actions/sharing-automations/creating-actions/creating-a-javascript-action

# Committing

Make changes to code. 

Run tests: `npm test`

Debug tests: go to scripts section of `package.json` in vscode and click "debug" (https://mattmazzola.medium.com/how-to-debug-jest-tests-with-vscode-2021-version-36b52b089605).

Determine the version number, which should be based on the latest version from `git tag`.

Update the README.md file to document the version and update the examples that use the version number.

Then run:

    ./build.sh "...commit message..." "v0.0.15"

This will build, commit, tag and push.

# Backward compatibility

Remember to think about third-party builds which are still using older versions of this action!

