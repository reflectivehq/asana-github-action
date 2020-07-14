const core = require('@actions/core');
const github = require('@actions/github');
const Asana = require('asana');

const REGEX = /app\.asana\.com\/\d+\/\d+\/(\d+)/

try {
  const { number, pull_request: { _links, body } } = github.context.payload;
  const match = body.match(REGEX);

  if (!match || !match[1]) {
    console.log('No Asana URL found in PR comment');
    return true;
  }

  const [, taskGid] = match;
  const PRUrl = _links.html.href;
  const accessToken = core.getInput('access-token') || process.env.ASANA_ACCESS_TOKEN;
  const client = Asana.Client.create().useAccessToken(accessToken);
  const data = {
    html_text: `<body>Github PR: <a href="${PRUrl}">#${number}</a></body>`,
    is_pinned: true,
  };

  client.stories.createStoryForTask(taskGid, data).catch(console.log);
} catch (error) {
  console.log(error);
  core.setFailed(error);
}
