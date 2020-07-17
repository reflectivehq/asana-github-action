const core = require('@actions/core');
const github = require('@actions/github');
const Asana = require('asana');

const REGEX = /app\.asana\.com\/\d+\/\d+\/(\d+)/;

try {
  const { number, pull_request: { body } } = github.context.payload;
  const match = body.match(REGEX);

  if (!match || !match[1]) {
    throw Error('No Asana URL found in PR comment');
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

  console.log(data);

  client.stories.createStoryForTask(taskGid, data).catch((err) => {
    console.log(err);
    throw err;
  });
} catch (error) {
  core.setFailed(error);
}
