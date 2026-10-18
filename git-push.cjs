const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');

const dir = process.cwd();

async function push() {
  const tokenArg = process.argv[2];
  const token = tokenArg || process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

  console.log('Attempting git push to https://github.com/giriselluri/MedConnect.git...');

  if (!token) {
    console.log('Notice: No GitHub Personal Access Token provided.');
    console.log('To push, run: GITHUB_TOKEN=your_token node git-push.cjs');
    console.log('Or: node git-push.cjs your_token');
    return;
  }

  try {
    const res = await git.push({
      fs,
      http,
      dir,
      remote: 'origin',
      ref: 'main',
      onAuth: () => {
        return {
          username: token,
          password: '',
        };
      },
    });
    console.log('✅ Git push to https://github.com/giriselluri/MedConnect.git completed successfully!');
    console.log('Push summary:', JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('❌ Git push failed:', err.message || err);
    if (err.data) {
      console.error('Details:', err.data);
    }
  }
}

push();
