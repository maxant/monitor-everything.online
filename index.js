const core = require('@actions/core');
const github = require('@actions/github');

try {
  const token = core.getInput('token');
  const command = core.getInput('command');
  console.log(`Running command ${command}!`);
  if(command === "BUILD_STARTED") {
    const time = (new Date()).toISOString();
    core.setOutput("starttime", time);
  } else if(command === "BUILD_COMPLETED") {
    const context = core.getInput('context');
    const ctx = JSON.parse(context);
    if(!ctx.starttime) {
        core.setFailed("Missing context.starttime");
    } else {
        console.log(`TODO got starttime ${ctx.starttime}!`);
    }
  } else {
    core.setFailed(`Unknown command ${command}`);
  }
} catch (error) {
  core.setFailed("Error: " + error.message);
}

// Get the JSON webhook payload for the event that triggered the workflow
// const payload = JSON.stringify(github.context.payload, undefined, 2)
// console.log(`The event payload: ${payload}`);
