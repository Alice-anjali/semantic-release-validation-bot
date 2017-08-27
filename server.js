module.exports = probotPlugin

const handlePullRequestChange = require('./lib/handle-pull-request')
const handlePullRequestEdit = require('./lib/handle-pull-request-edit.js')

function probotPlugin (robot) {
  robot.on('pull_request.opened', handlePullRequestChange.bind(null, robot))
  robot.on('pull_request.edited', handlePullRequestEdit.bind(null, robot))
}
