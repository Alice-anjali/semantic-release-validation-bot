module.exports = handlePullRequestChange

async function handlePullRequestChange (robot, context) {
  const api = context.github;
  const sha = context.payload.pull_request.statuses_url.split(/\//).pop()
  const [owner, repo] = context.payload.repository.full_name.split(/\//)

  api.repos.createStatus({
    owner,
    repo,
    sha,
    state: 'pending'
  })

  console.log(context.payload.pull_request.statuses_url);

}
