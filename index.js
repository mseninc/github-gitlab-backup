const env = require('dotenv').config().parsed;
const { format } = require('date-fns');
const {
  loadReposInfo,
  saveReposInfo,
  getGithubRepos,
  getGitlabProject,
  deleteGitlabProject,
  importFromGithub,
} = require('./lib');

/**
 * Checks if .env is properly set.
 */
function checkEnv() {
  const expectedKeys = [
    'GITLAB_NAMESPACE',
    'GITLAB_API_URL',
    'GITLAB_TOKEN',
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
  const reposFilename = `repos_${env.GITHUB_OWNER}.json`;

  const prevRepos = await loadReposInfo(reposFilename);
  const repos = await getGithubRepos(env.GITHUB_TYPE, env.GITHUB_OWNER);
  if (!repos) {
    console.log('No repository found.');
    return;
  }
  console.log(`${repos.length} repositories found.`);
  let n = 0;
  for (const repo of repos) {
    console.group(n + 1, repo.name); // start grouping
    try {
      // check if repo is updated or not
      const updatedAt = new Date(repo.updated_at);
      const prev = prevRepos.find(x => x.id === repo.id);
      if (prev && updatedAt <= new Date(prev.updated_at)) {
        console.log(`GitHub repo updated at ${repo.updated_at} : Not updated.`);
        continue;
      }
      console.log(`Finding same name projects in GitLab...`);
      const project = await getGitlabProject(repo.name);
      if (project) {
        // project already exists
        const lastActivityAt = new Date(project.last_activity_at);
        if (updatedAt <= lastActivityAt) {
          console.log(`GitHub repo updated at ${repo.updated_at}, GitLab last activity at ${format(lastActivityAt)}.`);
          repo.updated_at = format(lastActivityAt);
          console.log(`Not updated after GitLab last activity.`);
          continue;
        }
        // delete existing project from GitLab
        console.log(`Deleting project... (id: ${project.id})`);
        try {
          await deleteGitlabProject(project.id);
        } catch (error) {
          console.error(`Failed to delete project. (id: ${project.id})`);
          continue;
        }
        console.log(`Old project deleted. (id: ${project.id})`);
      }
      // start to imoport
      console.log(`Queueing import GitHub repo to GitLab project...`);
      await importFromGithub(repo.id, env.GITLAB_NAMESPACE);
    } catch (e) {
      // over write updated_at if not successfully finished.
      repo.updated_at = prev ? prev.updated_at : null;
      if (e.config && e.response) {
        console.error(`${e.config.method} ${e.config.url} : ${e.response.status} ${e.response.statusText}`)
      } else {
        console.error(e.message);
      }
    } finally {
      console.groupEnd(); // end grouping
      n += 1;
      // if (n > 3) break;
    }
  }
  saveReposInfo(reposFilename, repos);
}

checkEnv();
startBackup();
