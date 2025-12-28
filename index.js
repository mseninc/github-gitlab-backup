require("dotenv").config();
const { format } = require("date-fns");
const {
  loadReposInfo,
  saveReposInfo,
  getGithubRepos,
  getGitlabProject,
  deleteGitlabProject,
  importFromGithub,
} = require("./lib");

// Processing modes
const DRY = process.argv.includes("--dry");
const FORCE = process.argv.includes("--force");
const CLEAN = process.argv.includes("--clean");

/**
 * Checks if environment variables are properly set.
 */
function checkEnv() {
  const expectedKeys = [
    "GITLAB_NAMESPACE",
    "GITLAB_API_URL",
    "GITLAB_TOKEN",
    "GITHUB_TYPE",
    "GITHUB_OWNER",
    "GITHUB_API_URL",
    "GITHUB_TOKEN",
  ];
  for (const key of expectedKeys) {
    if (!process.env[key]) {
      throw new Error(`❌ ${key} not found in environment variables.`);
    }
  }
}

/**
 * Starts to backup
 */
async function startBackup() {
  const reposFilename = `repos_${process.env.GITHUB_OWNER}.json`;
  const prevRepos = CLEAN ? [] : await loadReposInfo(reposFilename);

  console.log("🌏 Collecting GitHub repo information...");
  const repos = await getGithubRepos(
    process.env.GITHUB_TYPE,
    process.env.GITHUB_OWNER
  );
  if (!repos) {
    console.log("🌏 No repository found.");
    return;
  }
  console.log(`🌏 ${repos.length} repositories found.`);
  let n = 0;
  let errorCount = 0;
  for (const repo of repos) {
    console.group("🔹", n + 1, repo.name); // start grouping
    const pushedAt = new Date(repo.pushed_at);
    const prev = prevRepos.find((x) => x.id === repo.id);
    try {
      // check if repo is updated or not
      if (
        !FORCE &&
        prev &&
        pushedAt <= new Date(prev.pushed_at || prev.updated_at)
      ) {
        console.log(
          `✅ GitHub repo pushed at ${repo.pushed_at} : Not updated.`
        );
        continue;
      }
      console.log(`🔍 Finding same name projects in GitLab...`);
      const project = await getGitlabProject(repo.name);
      if (project) {
        // project already exists
        const lastActivityAt = new Date(project.last_activity_at);
        if (!FORCE && pushedAt <= lastActivityAt) {
          console.log(
            `ℹ️ GitHub repo pushed at ${
              repo.pushed_at
            }, GitLab last activity at ${format(
              lastActivityAt,
              "yyyy-MM-dd'T'HH:mm:ss.SSSX"
            )}.`
          );
          repo.updated_at = format(
            lastActivityAt,
            "yyyy-MM-dd'T'HH:mm:ss.SSSX"
          );
          console.log(`✅ Not updated after GitLab last activity.`);
          continue;
        }
        // delete existing project from GitLab
        console.log(`🗑️ Deleting project... (id: ${project.id})`);
        try {
          if (!DRY) await deleteGitlabProject(project.id);
        } catch (error) {
          console.error(`⚠ Failed to delete project. (id: ${project.id})`);
          errorCount++;
          continue;
        }
        console.log(`🗑️ Old project deleted. (id: ${project.id})`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
      // start to import
      console.log(`✅ Queueing import GitHub repo to GitLab project...`);
      if (!DRY) await importFromGithub(repo.id, process.env.GITLAB_NAMESPACE);
    } catch (e) {
      errorCount++;
      // over write pushed_at if not successfully finished.
      if (e.config && e.response) {
        console.error(
          `⚠ ${e.config.method} ${e.config.url} : ${e.response.status} ${e.response.statusText}`
        );
      } else {
        console.error(`⚠ ${e.message}`);
      }
      repo.pushed_at = prev ? prev.pushed_at || prev.updated_at : null;
    } finally {
      console.groupEnd(); // end grouping
      n += 1;
    }
  }
  if (!DRY) saveReposInfo(reposFilename, repos);
  return errorCount;
}

(async () => {
  try {
    checkEnv();
    const errorCount = await startBackup();
    if (errorCount > 0) {
      console.log(`⚠ ${errorCount} errors occurred during the process.`);
      process.exit(1);
    }
  } catch (e) {
    // unhandled exception
    console.error(e);
    process.exit(1);
  }
})();
