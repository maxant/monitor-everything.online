const exec = require('./action')

const core = require('@actions/core')

exec(core, 'https://sre.maxant.ch').then((debug) => {
    if(debug.allGood) {
        console.log('all done')
        process.exit(0)
    } else {
        console.log('An error occurred. ' + JSON.stringify(debug))
        process.exit(1)
    }
}).catch((error) => {
    console.log('error: ' + error)
    process.exit(1)
})
