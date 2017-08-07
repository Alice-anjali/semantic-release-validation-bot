var validateMessage = require("validate-commit-msg")
let valid;
var invalid = 0;
var total;

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
          total = res.data.length;
          for( var i = 0; i<total; i++){
            console.log(res.data[i].commit.message);
            valid = validateMessage(res.data[i].commit.message);
            console.log("valid = "+valid);
            if(valid==false){
             ++invalid;
            }
          }
          console.log("Total = "+total);
          console.log("Invalid = "+invalid);
           if(invalid>0){
            api.repos.createStatus({
              owner,
              repo,
              sha,
              state: 'error'
            })
          }
          else{
           api.repos.createStatus({
              owner,
              repo,
              sha,
              state: 'success'
            })
          }
        }
   });

  console.log(context.payload.pull_request.statuses_url);
  console.log(context.payload.pull_request.number);

}
