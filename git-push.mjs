import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node/index.cjs';
import fs from 'fs';

const dir = process.cwd();

async function push() {
  console.log('Attempting git push to remote origin on main branch...');
  const res = await git.push({
    fs,
    http,
    dir,
    remote: 'origin',
    ref: 'main',
    onAuth: () => {
      console.log('Authentication requested by GitHub...');
      const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
      if (token) {
        return { username: token };
      }
      return undefined;
    },
  });
  console.log('Push result:', res);
}

push().catch((err) => {
  console.error('Push error:', err.message || err);
});
