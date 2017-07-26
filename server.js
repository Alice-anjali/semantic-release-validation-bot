module.exports = function (robot) {
  robot.on('issues', handleIssue.bind(null, robot))
}

function handleIssue (robot, context) {
  const api = context.github
  const {installation, repository, issue} = context.payload

  api.issues.createComment({
    owner: repository.owner.login,
    repo: repository.name,
    number: issue.number,
    body: 'Welcome to the robot uprising!!!'
  })
}
