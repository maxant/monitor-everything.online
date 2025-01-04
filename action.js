const fs = require('fs')
const httpm = require('@actions/http-client')

async function exec(core, baseUrl) {
    const debug = {}
    let contextFilename = '.monitor-everything-online.json'
    try {
        const token = core.getInput('token')
        const command = core.getInput('command')
        const folderToStoreStateIn = core.getInput('folderToStoreStateIn')
        if(folderToStoreStateIn) {
            contextFilename = folderToStoreStateIn + "/" + contextFilename
        }
        console.log(`Running command '${command}'...`)
        if(command === "BUILD_STARTED") {
            let now = new Date().getTime()
            let ctx = { startTime: now }
            let data = JSON.stringify(ctx)
            fs.writeFileSync(contextFilename, data)
            console.log(`Persisted startTime ${now}`)
            debug.ctx = ctx
            debug.allGood = true
        } else if(command === "BUILD_COMPLETED") {
            if (fs.existsSync(contextFilename)) {
                let now = new Date().getTime()
                let rawdata = fs.readFileSync(contextFilename)
                let context= JSON.parse(rawdata)
                if(!context.startTime) {
                    core.setFailed("MEOE-001 Missing context.startTime")
                } else {
                    let timeTaken = now - context.startTime
                    debug.timeTaken = timeTaken
                    console.log(`Build time was ${timeTaken}ms`)

                    // examples: https://github.com/actions/toolkit/tree/main/packages/http-client/__tests__
                    let http = new httpm.HttpClient()
                    let url = `${baseUrl}/build-time/${token}?timeTaken=${timeTaken}`
                    let res = await http.post(url)
                    if(res.message.statusCode === 200) {
                        console.log(`Posted build time to ${baseUrl}`)
                        debug.allGood = true
                    } else {
                        let body = await res.readBody()
                        core.setFailed(`MEOE-005 Failed to POST build time to ${url}, status code was ${res.message.statusCode}, body was ${body}`)
                    }
                }
            } else {
                core.setFailed(`MEOE-002 Missing context file ${contextFilename} - did you forget to run this action with the command 'BUILD_STARTED'?`)
            }
        } else {
            core.setFailed(`MEOE-003 Unknown command ${command}`)
        }
    } catch (error) {
        core.setFailed(`MEOE-004 General error: ${error.message}`)
    }
    return debug
}

module.exports = exec


// Get the JSON webhook payload for the event that triggered the workflow
// const github = require('@actions/github')
// const payload = JSON.stringify(github.context.payload, undefined, 2)
// console.log(`The event payload: ${payload}`)
