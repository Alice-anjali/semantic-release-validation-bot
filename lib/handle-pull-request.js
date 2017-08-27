var validateMessage = require("validate-commit-msg");
var conventionalRecommendedBump = require('conventional-recommended-bump');
var gitSemverTags = require('git-semver-tags');
// var standardChangelog = require('standard-changelog');
// var conventionalChangelog = require('conventional-changelog');
var standardVersion = require('standard-version');
const releaseNotes = require("@semantic-release/release-notes-generator");
var fs = require("fs");
var md = require("node-markdown").Markdown;
let valid;
var invalid,total,version;

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

  console.log("result = "+result.data.length);

  total = result.data.length;
  invalid = 0;
  for( var i = 0; i<total; i++){
    console.log(result.data[i].commit.message);
    valid = validateMessage(result.data[i].commit.message);
    console.log("valid = "+valid);
    if(valid==false){
      invalid += 1;
    }
  }
  console.log("Total = "+total);
  console.log("Invalid = "+invalid);
  if(invalid){
    api.repos.createStatus({
      owner,
      repo,
      sha,
      state: 'error',
      description: invalid+'/'+total+' commit messages are invalid'
    })
  }
  else{
    conventionalRecommendedBump({
      preset: 'angular'
    }, function(err, result) {
         if(err){
           console.log(err);
         }
         else{
           console.log(result.releaseType);

           gitSemverTags(function(err, tags) {
             if(err){
               console.log(err);
             }
             else{
               console.log(tags);

//                standardChangelog()
//                .pipe(process.stdout);

//                conventionalChangelog({
//                  preset: 'angular'
//                })
//                .pipe(process.stdout);

               standardVersion({
                 noVerify: true,
                 infile: 'docs/CHANGELOG.md',
                 silent: true
               }).then(() => {
                                console.log("Jumped")
               fs.readFile("docs/CHANGELOG.md", function (err, data) {
                   if (err) {
                             throw err;
                          }
                          console.log("Step 3")
                          console.log(md(data.toString()));
                          var file_data = md(data.toString())
                          for(var k=0;k<file_data.length;k++){
                             var c = file_data.charAt(k);
                             var d = file_data.charAt(k+1);
                             if((c == '>')&&(d == '<')){
                               version = file_data.split('"');
                               break;
                             }
                           }
                           console.log("version = "+version[3]);
                           api.repos.createStatus({
                               owner,
                               repo,
                               sha,
                               state: 'success',
                               description: 'calculated release number: v'+version[3]
                           })

                           api.issues.createComment({
                             owner,
                             repo,
                             number,
                             body: 'New Version: v'+version[3]
                           });

                });
               })

             }
            });

        }
       });

  }

}
