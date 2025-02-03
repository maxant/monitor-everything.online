// https://jestjs.io/docs/getting-started

const fs = require('fs')
const http = require("http");
const github = require('@actions/github');

const exec = require('./action');
const { timeStamp } = require('console');

const contextFilename = '/tmp/.monitor-everything-online.json'

test('BUILD_STARTED and BUILD_COMPLETED', async () => {

    // given
    const host = 'localhost'
    const port = 9996
    const baseUrl = 'http://' + host + ':' + port

    // mock server
    let callsToMockServer = []
    const requestListener = function (req, res) {
        callsToMockServer.push(req.method + " " + req.url + " " + req.headers.authorization)
        res.writeHead(201)
        res.end()
    }
    const mockServer = http.createServer(requestListener)
    mockServer.listen(port, host, () => {
        console.log(`Mock Server is running on http://${host}:${port}`)
    })

    // set up github context
    github.context = {
            payload: {
                repository: {
                    "full_name": 'test/app'
                },
                ref: 'refs/heads/test/app#0-some-branch-name',
                commits: [
                    {
                        id: 'a',
                        timestamp: '2025-02-02T18:20:12+01:00',
                    }
                ]
            }
        }

    let core = {
        getInput: jest.fn().mockReturnValueOnce('myToken').mockReturnValueOnce('BUILD_STARTED').mockReturnValueOnce('/tmp').mockReturnValueOnce('test-app'),
        setOutput: jest.fn(),
        setFailed: jest.fn(),
    }
            
    // when BUILD_STARTED
    let debug = await exec(core, baseUrl)

    // then
    expect(debug.allGood).toBe(true)

    let rawdata = fs.readFileSync(contextFilename)
    let context= JSON.parse(rawdata)

    let now = new Date().getTime()
    expect(context.startTime).toBeLessThanOrEqual(now)
    expect(context.startTime).toBeGreaterThanOrEqual(now-100)
    expect(debug.ctx.startTime).toBe(context.startTime)
    expect(core.setOutput.mock.calls.length).toBe(0)
    expect(core.setFailed.mock.calls.length).toBe(0)
    expect(callsToMockServer.length).toBe(1)
    expect(callsToMockServer[0]).toMatch(/^POST \/commits\/test-app\?repository=test\/app&ref=refs\/heads\/test\/app myToken$/)

    // given BUILD_COMPLETED
    core = {
        getInput: jest.fn().mockReturnValueOnce('myToken').mockReturnValueOnce('BUILD_COMPLETED').mockReturnValueOnce('/tmp').mockReturnValueOnce('test-app'),
        setOutput: jest.fn(),
        setFailed: jest.fn(),
    }

    // when BUILD_COMPLETED
    debug = await exec(core, baseUrl)
    
    mockServer.close();
    setImmediate(function(){mockServer.emit('close')});

    // then
    expect(debug.allGood).toBe(true)
    expect(debug.timeTaken).toBeLessThanOrEqual(100)
    expect(debug.timeTaken).toBeGreaterThanOrEqual(0)
    expect(core.setOutput.mock.calls.length).toBe(0)
    expect(core.setFailed.mock.calls.length).toBe(0)
    expect(callsToMockServer.length).toBe(2)
    expect(callsToMockServer[0]).toMatch(/^POST \/commits\/test-app\?repository=test\/app&ref=refs\/heads\/test\/app myToken$/)
    expect(callsToMockServer[1]).toMatch(/^POST \/build-time\/test-app\?timeTaken=[0-9]+ myToken$/)
})

test('BUILD_STARTED no folderToStoreStateIn provided', async () => {

    try {
        fs.rmSync(".monitor-everything-online.json", { force: true })
    } catch(error) {
        // ignore it
    }

    const host = 'localhost'
    const port = 9996
    const baseUrl = 'http://' + host + ':' + port

    // mock server
    let callsToMockServer = []
    const requestListener = function (req, res) {
        callsToMockServer.push(req.method + " " + req.url + " " + req.headers.authorization)
        res.writeHead(201)
        res.end()
    }
    const mockServer = http.createServer(requestListener)
    mockServer.listen(port, host, () => {
        console.log(`Mock Server is running on http://${host}:${port}`)
    })

    // set up github context
    github.context = {
            payload: {
                repository: {
                    "full_name": 'test/app'
                },
                ref: 'refs/heads/test/app#0-some-branch-name',
                commits: [
                    {
                        id: 'a',
                        timestamp: '2025-02-02T18:20:12+01:00',
                    }
                ]
            }
        }

    try {
        let core = {
            getInput: jest.fn().mockReturnValueOnce('myToken').mockReturnValueOnce('BUILD_STARTED').mockReturnValueOnce(undefined).mockReturnValueOnce('test-app'),
            setOutput: jest.fn(),
            setFailed: jest.fn(),
        }
        
        // when BUILD_STARTED
        let debug = await exec(core, baseUrl)
    
        // then
        expect(debug.allGood).toBe(true)
    
        let rawdata = fs.readFileSync(".monitor-everything-online.json")
        let context= JSON.parse(rawdata)
    
        let now = new Date().getTime()
        expect(context.startTime).toBeLessThanOrEqual(now)
        expect(context.startTime).toBeGreaterThanOrEqual(now-100)
        expect(debug.ctx.startTime).toBe(context.startTime)
        expect(core.setOutput.mock.calls.length).toBe(0)
        expect(core.setFailed.mock.calls.length).toBe(0)
    } finally {
        mockServer.close();
        setImmediate(function(){mockServer.emit('close')});

        fs.rmSync(".monitor-everything-online.json", { force: true })
    }
})

test('BUILD_STARTED no deploymentName provided', async () => {

    let core = {
        getInput: jest.fn().mockReturnValueOnce('myToken').mockReturnValueOnce('BUILD_STARTED'),
        setOutput: jest.fn(),
        setFailed: jest.fn(),
    }
    
    // when BUILD_STARTED
    let debug = await exec(core)

    // then
    expect(debug.allGood).toBe(false)
    expect(debug.error).toBe("MEOE-006 Missing deploymentName")
})

test('BUILD_STARTED but bad POST on completed', async () => {

    // given
    const host = 'localhost'
    const port = 9996
    const baseUrl = 'http://' + host + ':' + port

    // mock server
    let callsToMockServer = []
    const requestListener = function (req, res) {
        callsToMockServer.push(req.method + " " + req.url + " " + req.headers.authorization)
        res.writeHead(500)
        res.end("testing failure")
    }
    const mockServer = http.createServer(requestListener)
    mockServer.listen(port, host, () => {
        console.log(`Mock Server is running on http://${host}:${port}`)
    })

    // set up github context
    github.context = {
            payload: {
                repository: {
                    "full_name": 'test/app'
                },
                ref: 'refs/heads/test/app#0-some-branch-name',
                commits: [
                    {
                        id: 'a',
                        timestamp: '2025-02-02T18:20:12+01:00',
                    }
                ]
            }
        }

    let core = {
        getInput: jest.fn().mockReturnValueOnce('myToken').mockReturnValueOnce('BUILD_STARTED').mockReturnValueOnce('/tmp').mockReturnValueOnce('test-app'),
        setOutput: jest.fn(),
        setFailed: jest.fn(),
    }
    
    // when BUILD_STARTED
    let debug = await exec(core, baseUrl)

    mockServer.close();
    setImmediate(function(){mockServer.emit('close')});

    // then
    expect(debug.allGood).toBeFalsy()
    expect(core.setOutput.mock.calls.length).toBe(0)
    expect(core.setFailed.mock.calls.length).toBe(1)
    expect(core.setFailed.mock.calls[0].length).toBe(1)
    expect(core.setFailed.mock.calls[0][0]).toMatch(new RegExp("^MEOE-008 Failed to POST commits to http://localhost:9996/commits/test-app\\?repository=test\\/app&ref=refs\\/heads\\/test\\/app#0-some-branch-name, status code was 500, body was testing failure$"))
    expect(callsToMockServer.length).toBe(1)
    expect(callsToMockServer[0]).toMatch(/^POST \/commits\/test-app\?repository=test\/app&ref=refs\/heads\/test\/app myToken$/)
})

test('BUILD_STARTED and BUILD_COMPLETED but bad POST on completed', async () => {

    // given
    const host = 'localhost'
    const port = 9996
    const baseUrl = 'http://' + host + ':' + port

    // mock server
    let count = 0
    let callsToMockServer = []
    const requestListener = function (req, res) {
        callsToMockServer.push(req.method + " " + req.url + " " + req.headers.authorization)
        if (count++ > 0) {
            res.writeHead(500)
            res.end("testing failure")
        } else {
            res.writeHead(201)
            res.end()
        }
    }
    const mockServer = http.createServer(requestListener)
    mockServer.listen(port, host, () => {
        console.log(`Mock Server is running on http://${host}:${port}`)
    })

    // set up github context
    github.context = {
            payload: {
                repository: {
                    "full_name": 'test/app'
                },
                ref: 'refs/heads/test/app#0-some-branch-name',
                commits: [
                    {
                        id: 'a',
                        timestamp: '2025-02-02T18:20:12+01:00',
                    }
                ]
            }
        }

    let core = {
        getInput: jest.fn().mockReturnValueOnce('myToken').mockReturnValueOnce('BUILD_STARTED').mockReturnValueOnce('/tmp').mockReturnValueOnce('test-app'),
        setOutput: jest.fn(),
        setFailed: jest.fn(),
    }
    
    // when BUILD_STARTED
    let debug = await exec(core, baseUrl)

    // then
    expect(debug.allGood).toBe(true)

    let rawdata = fs.readFileSync(contextFilename)
    let context= JSON.parse(rawdata)

    let now = new Date().getTime()
    expect(context.startTime).toBeLessThanOrEqual(now)
    expect(context.startTime).toBeGreaterThanOrEqual(now-100)
    expect(debug.ctx.startTime).toBe(context.startTime)
    expect(core.setOutput.mock.calls.length).toBe(0)
    expect(core.setFailed.mock.calls.length).toBe(0)

    // given BUILD_COMPLETED
    core = {
        getInput: jest.fn().mockReturnValueOnce('myToken').mockReturnValueOnce('BUILD_COMPLETED').mockReturnValueOnce('/tmp').mockReturnValueOnce('test-app'),
        setOutput: jest.fn(),
        setFailed: jest.fn(),
    }

    // when BUILD_COMPLETED
    debug = await exec(core, baseUrl)
    
    mockServer.close();
    setImmediate(function(){mockServer.emit('close')});

    // then
    expect(debug.allGood).toBeFalsy()
    expect(core.setOutput.mock.calls.length).toBe(0)
    expect(core.setFailed.mock.calls.length).toBe(1)
    expect(core.setFailed.mock.calls[0].length).toBe(1)
    expect(core.setFailed.mock.calls[0][0]).toMatch(new RegExp("^MEOE-005 Failed to POST build time to http://localhost:9996/build-time/test-app\\?timeTaken=[0-9]+, status code was 500, body was testing failure$"))
    expect(callsToMockServer.length).toBe(2)
    expect(callsToMockServer[1]).toMatch(new RegExp('^POST /build-time/test-app\\?timeTaken=[0-9]+ myToken$'))
})

test('BUILD_COMPLETED but corrupt context file', async () => {

    // given
    let core = {
        getInput: jest.fn().mockReturnValueOnce('myToken').mockReturnValueOnce('BUILD_COMPLETED').mockReturnValueOnce('/tmp').mockReturnValueOnce('test-app'),
        setOutput: jest.fn(),
        setFailed: jest.fn(),
    }

    let data = JSON.stringify(JSON.stringify({})) // <<< missing startTime attribute
    fs.writeFileSync(contextFilename, data)
    
    // when BUILD_STARTED
    let debug = await exec(core)

    // then
    expect(debug.allGood).toBeFalsy()
    expect(core.setOutput.mock.calls.length).toBe(0)
    expect(core.setFailed.mock.calls.length).toBe(1)
    expect(core.setFailed.mock.calls[0].length).toBe(1)
    expect(core.setFailed.mock.calls[0][0]).toBe("MEOE-001 Missing context.startTime")
})

test('BUILD_COMPLETED but missing context file', async () => {

    // given
    let core = {
        getInput: jest.fn().mockReturnValueOnce('myToken').mockReturnValueOnce('BUILD_COMPLETED').mockReturnValueOnce('/tmp').mockReturnValueOnce('test-app'),
        setOutput: jest.fn(),
        setFailed: jest.fn(),
    }

    // delete context file
    fs.unlinkSync(contextFilename)

    // when
    debug = await exec(core)
    
    // then
    expect(debug.allGood).toBeFalsy()
    expect(core.setOutput.mock.calls.length).toBe(0)
    expect(core.setFailed.mock.calls.length).toBe(1)
    expect(core.setFailed.mock.calls[0].length).toBe(1)
    expect(core.setFailed.mock.calls[0][0]).toBe("MEOE-002 Missing context file /tmp/.monitor-everything-online.json - did you forget to run this action with the command 'BUILD_STARTED'?")
})

test('MEOE-004 General error', async () => {

    // given
    let core = {
        getInput: jest.fn().mockImplementation((params) => {
            throw new Error('test error for param "' + params + '"')
        }),
        setOutput: jest.fn(),
        setFailed: jest.fn(),
    }
    
    // when
    let debug = await exec(core)

    // then
    expect(debug.allGood).toBeFalsy()
    expect(core.setOutput.mock.calls.length).toBe(0)
    expect(core.setFailed.mock.calls.length).toBe(1)
    expect(core.setFailed.mock.calls[0].length).toBe(1)
    expect(core.setFailed.mock.calls[0][0]).toBe('MEOE-004 General error: test error for param "token"')
})

test('MEOE-003 Unknown command', async () => {

    // given
    let core = {
        getInput: jest.fn().mockReturnValueOnce('myToken').mockReturnValueOnce('UNKNOWN_COMMAND').mockReturnValueOnce('/tmp').mockReturnValueOnce('test-app'),
        setOutput: jest.fn(),
        setFailed: jest.fn(),
    }
    
    // when
    let debug = await exec(core)

    // then
    expect(debug.allGood).toBeFalsy()
    expect(core.setOutput.mock.calls.length).toBe(0)
    expect(core.setFailed.mock.calls.length).toBe(1)
    expect(core.setFailed.mock.calls[0].length).toBe(1)
    expect(core.setFailed.mock.calls[0][0]).toBe('MEOE-003 Unknown command UNKNOWN_COMMAND')
})

test('MEOE-006 missing deployment name', async () => {

    // given
    let core = {
        getInput: jest.fn().mockReturnValueOnce('myToken').mockReturnValueOnce('BUILD_COMPLETED').mockReturnValueOnce('/tmp'),
        setOutput: jest.fn(),
        setFailed: jest.fn(),
    }
    
    // when
    let debug = await exec(core)

    // then
    expect(debug.allGood).toBeFalsy()
    expect(core.setOutput.mock.calls.length).toBe(0)
    expect(core.setFailed.mock.calls.length).toBe(1)
    expect(core.setFailed.mock.calls[0].length).toBe(1)
    expect(core.setFailed.mock.calls[0][0]).toBe('MEOE-007 Missing deploymentName')
})
