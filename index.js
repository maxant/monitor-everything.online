const exec = require('./action')

const core = require('@actions/core')

exec(core, 'https://sre.maxant.ch').then(() => {
    console.log('all done')
    process.exit(0)
}).catch((error) => {
    console.log('error: ' + error)
    process.exit(1)
})
