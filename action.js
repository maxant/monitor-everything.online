const fs = require('fs')
const httpm = require('@actions/http-client')
const github = require('@actions/github');

async function exec(core, baseUrl) {
    const debug = { allGood: false }
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
            const deploymentName = core.getInput('deploymentName')
            if(!deploymentName) {
                setFailed(debug, core, "MEOE-006 Missing deploymentName")
            } else {
                let now = new Date().getTime()
                let ctx = { startTime: now }
                let data = JSON.stringify(ctx)
                fs.writeFileSync(contextFilename, data)
                console.log(`Persisted startTime ${now}`)
                debug.ctx = ctx
    
                // post the commits so that the server can replicate them so that it always knows when development was started
                let http = new httpm.HttpClient()
                // console.log("GOT GITHUB CONTEXT PAYLOAD " + JSON.stringify(github.context.payload))
                let ref = github.context.payload.ref
                let repo = github.context.payload.repository.full_name
                let commits = github.context.payload.commits
                let url = `${baseUrl}/commits/${deploymentName}?repository=${repo}&ref=${ref}`
                let res = await http.post(url, JSON.stringify(commits), {"authorization": token})
                if(res.message.statusCode === 201) {
                    console.log(`Posted commits to ${baseUrl}`)
                    debug.allGood = true
                } else {
                    let body = await res.readBody()
                    setFailed(debug, core, `MEOE-008 Failed to POST commits to ${url}, status code was ${res.message.statusCode}, body was ${body}`)
                }
            }
        } else if(command === "BUILD_COMPLETED") {
            const deploymentName = core.getInput('deploymentName')
            if(!deploymentName) {
                setFailed(debug, core, "MEOE-007 Missing deploymentName")
            } else {
                if (fs.existsSync(contextFilename)) {
                    let now = new Date().getTime()
                    let rawdata = fs.readFileSync(contextFilename)
                    let context= JSON.parse(rawdata)
                    if(!context.startTime) {
                        setFailed(debug, core, "MEOE-001 Missing context.startTime")
                    } else {
                        let timeTaken = now - context.startTime
                        debug.timeTaken = timeTaken
                        console.log(`Build time was ${timeTaken}ms`)
    
                        // examples: https://github.com/actions/toolkit/tree/main/packages/http-client/__tests__
                        let http = new httpm.HttpClient()
                        let url = `${baseUrl}/build-time/${deploymentName}?timeTaken=${timeTaken}`
                        let res = await http.post(url, null, {"authorization": token})
                        if(res.message.statusCode === 201) {
                            console.log(`Posted build time to ${baseUrl}`)
                            debug.allGood = true
                        } else {
                            let body = await res.readBody()
                            setFailed(debug, core, `MEOE-005 Failed to POST build time to ${url}, status code was ${res.message.statusCode}, body was ${body}`)
                        }
                    }
                } else {
                    setFailed(debug, core, `MEOE-002 Missing context file ${contextFilename} - did you forget to run this action with the command 'BUILD_STARTED'?`)
                }
            }
        } else {
            setFailed(debug, core, `MEOE-003 Unknown command ${command}`)
        }
    } catch (error) {
        setFailed(debug, core, `MEOE-004 General error: ${error.message}`)
    }
    return debug
}

function setFailed(debug, core, msg) {
    core.setFailed(msg)
    debug.error = msg
    debug.allGood = false
}

module.exports = exec
