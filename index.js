const exec = require('./action')

const core = require('@actions/core')

exec(core, '.monitor-everything-online.json', 'https://sre.maxant.ch').then((debug) => {
    console.log('all done')
    process.exit(0)
}).catch((error) => {
    console.log('error: ' + error)
    process.exit(1)
})
