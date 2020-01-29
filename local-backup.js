const path = require('path');
const git = require('simple-git/promise')();
const env = require('dotenv').config().parsed;
const {
  format
} = require('date-fns');
const {
  loadReposInfo,
  saveReposInfo,
  getGithubRepos,
  getGitlabProject,
  deleteGitlabProject,
  importFromGithub,
  getBranchesFromGitHub,
  isFileExist,
} = require('./lib');

// Processing modes
const DRY = process.argv.includes('--dry');
const FORCE = process.argv.includes('--force');

/**
 * Checks if .env is properly set.
 */
function checkEnv() {
  const expectedKeys = [
    'GITHUB_TYPE',
    'GITHUB_OWNER',
    'GITHUB_API_URL',
    'GITHUB_TOKEN',
  ];
  for (const key of expectedKeys) {
    if (!(key in env)) {
      throw new Error(`${key} not found in .env.`);
    }
  }
}

/**
 * Starts to backup
 */
async function startBackup() {
  const reposFilename = `repos/repos_${env.GITHUB_OWNER}.json`;
  const prevRepos = await loadReposInfo(reposFilename);

  console.log('Collecting GitHub repo informations...');
  const repos = await getGithubRepos(env.GITHUB_TYPE, env.GITHUB_OWNER);
  if (!repos) {
    console.log('No repository found.');
    return;
  }
  console.log(`${repos.length} repositories found.`);
  await Promise.all(repos.reduce((acc, repo) => [...acc, backup(repo, prevRepos)], []));
  if (!DRY) saveReposInfo(reposFilename, repos);
}

async function backup(repo, prevRepos) {
  if (!isFileExist(`repos/${repo.name}`)) {
    if (!DRY) await git.cwd(path.join(process.cwd(), 'repos'));
    console.log(`cloning ${repo.name}...`);
    if (!DRY) await git.silent(true).clone(repo.clone_url);
  }
  const updatedAt = new Date(repo.updated_at);
  const prev = prevRepos.find(x => x.id === repo.id);
  try {
    // check if repo is updated or not
    if (!FORCE && prev && updatedAt <= new Date(prev.updated_at)) {
      console.log(`GitHub repo updated at ${repo.updated_at} : Not updated.`);
      return;
    }
    const branches = await getBranchesFromGitHub(env.GITHUB_TYPE, env.GITHUB_OWNER, repo.name);
    if (!DRY) {
      await git.cwd(path.join(process.cwd(), `repos/${repo.name}`));
      await git.fetch();
    }
    for (const branch of branches) {
      console.log(`checking out ${repo.name}/${branch.name}...`);
      if (!DRY) await git.checkout(branch.name);
      console.log(`pulling ${repo.name}/${branch.name}...`);
      if (!DRY) await git.pull();
    }
  } catch (e) {
    // over write updated_at if not successfully finished.
    if (e.config && e.response) {
      console.error(`${e.config.method} ${e.config.url} : ${e.response.status} ${e.response.statusText}`)
    } else {
      console.error(e.message);
    }
    repo.updated_at = prev ? prev.updated_at : null;
  }
}
(async () => {
  try {
    await checkEnv();
    await startBackup();
  } catch (e) {
    // unhandled exception
    console.error(e);
    process.exit(1);
  }
})();
