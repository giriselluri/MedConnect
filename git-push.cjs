const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');

const dir = process.cwd();

async function push() {
  const token = process.argv[2];
  if (!token) {
    console.error('No token provided');
    process.exit(1);
  }

  const urlWithToken = `https://${token}@github.com/giriselluri/MedConnect.git`;
  console.log('Attempting push via embedded token URL...');

  try {
    const res = await git.push({
      fs,
      http,
      dir,
      url: urlWithToken,
      ref: 'main',
      remoteRef: 'refs/heads/main',
      force: true,
    });
    console.log('✅ Push succeeded via embedded URL!');
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('Push with URL token failed:', err.message || err);
    if (err.data) console.error('Details:', err.data);
  }
}

push();
