const core = require('@actions/core');
const github = require('@actions/github');
const Asana = require('asana');

const REGEX = /app\.asana\.com\/\d+\/\d+\/(\d+)/;
const accessToken = core.getInput('access-token') || process.env.ASANA_ACCESS_TOKEN;
const message = core.getInput('message');
const link = core.getInput('link');

try {
  const { number, pull_request: { body } } = github.context.payload;
  const match = body.match(REGEX);

  if (!match || !match[1]) {
    core.warning('No asana url found');
  } else {

    const [, taskGid] = match;
    const client = Asana.Client.create().useAccessToken(accessToken);
    const data = {
      html_text: `<body>Github PR #${number}: <a href="${link}">${message}</a></body>`,
      is_pinned: true,
    };

    client.stories.createStoryForTask(taskGid, data).catch((err) => {
      core.warning(err.value.errors[0]);
    });
  }
} catch (error) {
  core.warning(error);
}
