import git from 'isomorphic-git';
import fs from 'fs';
import path from 'path';

const dir = process.cwd();

async function initAndCommit() {
  console.log('Initializing git repository in', dir);
  await git.init({ fs, dir });

  // Read gitignore
  console.log('Adding files...');
  // Find all files not ignored
  const filesToAdd = [];
  function scan(currentDir, relativePath = '') {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.bin' || entry.name === '.next' || entry.name === '.data' || entry.name === '.DS_Store' || entry.name.endsWith('.local')) {
        continue;
      }
      const fullPath = path.join(currentDir, entry.name);
      const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        scan(fullPath, relPath);
      } else {
        filesToAdd.push(relPath);
      }
    }
  }

  scan(dir);

  for (const filepath of filesToAdd) {
    await git.add({ fs, dir, filepath });
  }

  console.log(`Staged ${filesToAdd.length} files.`);

  const author = {
    name: 'Srinivas Elluri',
    email: 'giri-srinivas.elluri.external@telefonica.com',
  };

  const sha = await git.commit({
    fs,
    dir,
    author,
    message: 'feat: Initial release of MedConnect AI full-stack healthcare networking platform',
  });

  console.log('Committed successfully with SHA:', sha);

  // Set remote
  const remoteUrl = 'https://github.com/giriselluri/MedConnect.git';
  try {
    await git.deleteRemote({ fs, dir, remote: 'origin' });
  } catch (e) {}

  await git.addRemote({
    fs,
    dir,
    remote: 'origin',
    url: remoteUrl,
  });

  console.log('Remote origin set to:', remoteUrl);

  // Set branch to main
  await git.branch({ fs, dir, ref: 'main', checkout: true });
  console.log('Branch set to main');
}

initAndCommit().catch(console.error);
