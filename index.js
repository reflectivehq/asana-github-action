const core = require('@actions/core');
const github = require('@actions/github');
const Asana = require('asana');

const REGEX = /app\.asana\.com\/\d+\/\d+\/(\d+)/

try {
  const { number, pull_request: { _links, body } } = github.context.payload;
  const match = body.match(REGEX);

  if (!match || !match[1]) {
    console.log('No Asana URL found in PR comment');
    console.log(body);
    console.log(match);
    return true;
  }

  const [, taskGid] = match;
  const accessToken = core.getInput('access-token') || process.env.ASANA_ACCESS_TOKEN;
  const client = Asana.Client.create().useAccessToken(accessToken);
  const herokuUrl = `https://reflective-pr-${number}.herokuapp.com`;
  const reflectiveDeepUrl = `reflective://switch-host?host=${herokuUrl}`;
  const data = {
    html_text: `<body>Github PR: <a href="${reflectiveDeepUrl}">Open Build for PR #${number} in the Reflective App</a></body>`,
    is_pinned: true,
  };

  client.stories.createStoryForTask(taskGid, data).catch(console.log);
} catch (error) {
  console.log(error);
  core.setFailed(error);
}
