var validateMessage = require("validate-commit-msg")
let valid;

module.exports = handlePullRequestChange

async function handlePullRequestChange (robot, context) {
  const api = context.github;
  const number = context.payload.pull_request.number;
  const sha = context.payload.pull_request.statuses_url.split(/\//).pop()
  const [owner, repo] = context.payload.repository.full_name.split(/\//)

  api.pullRequests.getCommits({
    owner,
    repo,
    number
  },
    function(err,res){
        if(err){
          console.log("error");
          console.log(err);
          return ;
        }
        if(res){
          for( var i = 0; i<res.data.length; i++){
            console.log(res.data[i].commit.message);
            valid = validateMessage(res.data[i].commit.message);
            console.log("valid = "+valid);
          }
        }
   });

  // api.repos.createStatus({
  //   owner,
  //   repo,
  //   sha,
  //   state: 'pending'
  // })

  console.log(context.payload.pull_request.statuses_url);
  console.log(context.payload.pull_request.number);

}
