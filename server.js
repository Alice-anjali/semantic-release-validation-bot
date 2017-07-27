module.exports = probotPlugin

const handlePullRequestChange = require('./lib/handle-pull-request')

function probotPlugin (robot) {
  robot.on('pull_request.opened', handlePullRequestChange.bind(null, robot))
}
