const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

const contextFilename = '.monitor-everything-online.json';

try {
  const token = core.getInput('token');
  const command = core.getInput('command');
  console.log(`Running command ${command}...`);
  if(command === "BUILD_STARTED") {
    let time = (new Date()).toISOString();
    let data = JSON.stringify({starttime: time});
    fs.writeFileSync(contextFilename, data);
    console.log(`Persisted starttime ${time}`);
  } else if(command === "BUILD_COMPLETED") {
    if (fs.existsSync(contextFilename)) {
        let rawdata = fs.readFileSync(contextFilename);
        let context= JSON.parse(rawdata);
        if(!context.starttime) {
            core.setFailed("MEOE-001 Missing context.starttime");
        } else {
            console.log(`TODO got starttime ${ctx.starttime}!`);
        }
    } else {
        core.setFailed("MEOE-002 Missing context file ${contextFilename} - did you forget to run this action with the command 'BUILD_STARTED'?");
    }
  } else {
    core.setFailed(`MEOE-003 Unknown command ${command}`);
  }
} catch (error) {
  core.setFailed("MEOE-004 General error: " + error.message);
}

// Get the JSON webhook payload for the event that triggered the workflow
// const payload = JSON.stringify(github.context.payload, undefined, 2)
// console.log(`The event payload: ${payload}`);
