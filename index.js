const core = require('@actions/core');
const github = require('@actions/github');
const Asana = require('asana');

const taskGid = '1182826486567385';

try {
  console.log(github);
  const payload = github.context.payload
  console.log(payload.repository);
  const PRUrl = `https://github.com/${github.repository}/pull/${payload.number}`;
  const accessToken = core.getInput('access-token') || process.env.ASANA_ACCESS_TOKEN;
  const client = Asana.Client.create().useAccessToken(accessToken);
  const data = {
    html_text: `<body>Github PR: <a href="${PRUrl}">#${payload.number}</a></body>`,
    is_pinned: true,
  };

  client.stories.createStoryForTask(taskGid, data).then(console.log).catch(err => console.log(err.value.errors[0]));
} catch (error) {
  console.log(error);
  core.setFailed(error);
}
