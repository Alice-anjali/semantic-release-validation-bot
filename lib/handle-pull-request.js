const toChangelog = require('./commits-to-changelog');
const commitParser = require('conventional-commits-parser');

module.exports = handlePullRequestChange

async function handlePullRequestChange (robot, context) {
  const api = context.github;
  const number = context.payload.pull_request.number;
  const sha = context.payload.pull_request.statuses_url.split(/\//).pop();
  const [owner, repo] = context.payload.repository.full_name.split(/\//);

  const result = await api.pullRequests.getCommits({
    owner,
    repo,
    number
  })

  const messages = result.data.map(row => row.commit.message)

  const stream = commitParser();
  const parsedCommits = [];
  stream.on('data', (parsedCommit) => {
    parsedCommits.push(parsedCommit)
  })
  messages.forEach(stream.write.bind(stream));
  stream.end();

  const testCommits = parsedCommits.every((parsedCommit) => parsedCommit.type !== null);
  const invalidCommits = parsedCommits.filter(message => message.type == null);
  const validCommits = parsedCommits.filter(message => message.type != null);

  if(testCommits){

    const tags = await api.repos.getTags({
      owner,
      repo
    });

    console.log(tags);
    console.log(tags.data[0].name);

    console.log("Valid commits");
    const changelog = await toChangelog(parsedCommits,tags.data[0].name);
    console.log(changelog);

    api.repos.createStatus({
      owner,
      repo,
      sha,
      state: 'success',
      description: 'calculated release number: '
    });

    api.issues.createComment({
      owner,
      repo,
      number,
      body: changelog
    });


  }
  else{
    api.repos.createStatus({
      owner,
      repo,
      sha,
      state: 'error',
      description: invalidCommits.length+'/'+parsedCommits.length+' commit messages are invalid'
    });
  }

}
