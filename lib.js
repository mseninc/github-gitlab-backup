const env = require('dotenv').config().parsed;
const fs = require('fs');
const axiosBase = require('axios');

// Prepare axios for GitLab API
const gitlab = axiosBase.create({
  baseURL: env.GITLAB_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'PRIVATE-TOKEN': env.GITLAB_TOKEN,
  },
  responseType: 'json',
});

// Prepare axios for GitHub API
const github = axiosBase.create({
  baseURL: env.GITHUB_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `token ${env.GITHUB_TOKEN}`,
  },
  responseType: 'json',
});

/**
 * Loads the previously-saved information of the GitHub repos.
 * @param {String} filename File name
 */
function loadReposInfo(filename) {
  try {
    return JSON.parse(fs.readFileSync(filename, 'utf8'));
  } catch (error) {
    return []; // fallback
  }
}

/**
 * Saves the current information of the GitHub repos.
 * @param {String} filename File name
 * @param {Object} repos Repos information
 */
function saveReposInfo(filename, repos) {
  fs.writeFileSync(filename, JSON.stringify(repos, null, '  '));
}

/**
 * Gets a list of repos in GitHub.
 * @param {String} ownerType Resource type of owner (orgs|users)
 * @param {String} owner Owner name
 */
async function getGithubRepos(ownerType, owner) {
  const result = await github.get(`${ownerType}/${owner}/repos`, {
    params: { sort: 'full_name' },
  });
  if (!result.data || result.data.length === 0) return null;
  return result.data.map(({ id, name, updated_at }) => ({ id, name, updated_at }));
}

/**
 * Gets a project in GitLab.
 * @param {String} projectName Name of target project
 */
async function getGitlabProject(projectName) {
  const result = await gitlab.get('projects', { params: { search: projectName } });
  return result.data.find(x => x.name === projectName);
}

/**
 * Deletes the project from GitLab.
 * @param {Number} projectId Id of target project
 */
async function deleteGitlabProject(projectId) {
  await gitlab.delete(`projects/${projectId}`);
}

/**
 * Starts to import GitHub repo to GitLab.
 * @param {Number} repoId ID of the GitHub repo
 * @param {String} targetNamespace Namespace in GitLab
 */
async function importFromGithub(repoId, targetNamespace) {
  const data = {
    personal_access_token: env.GITHUB_TOKEN,
    repo_id: repoId,
    target_namespace: targetNamespace,
  };
  await gitlab.post('import/github', data);
}

module.exports = {
  loadReposInfo,
  saveReposInfo,
  getGithubRepos,
  getGitlabProject,
  deleteGitlabProject,
  importFromGithub,
};
