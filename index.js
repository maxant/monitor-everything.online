const core = require('@actions/core');
const github = require('@actions/github');

try {
  const token = core.getInput('token');
  const command = core.getInput('command');
  console.log(`Running command ${command}!`);
  const time = (new Date()).toISOString();
  core.setOutput("output", {
    startTime: time,
  });
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  // const payload = JSON.stringify(github.context.payload, undefined, 2)
  // console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
