const exec = require('./action')

const core = require('@actions/core')

exec(core, '.monitor-everything-online.json', 'https://sre.maxant.ch').then((debug) => {
    console.log('promise resolved')
}).catch((error) => {
    console.log('promise rejected')
})

console.log('done')
