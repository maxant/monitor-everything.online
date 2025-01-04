const exec = require('./action')

const core = require('@actions/core')

exec(core, '.monitor-everything-online.json', 'https://sre.maxant.ch')
