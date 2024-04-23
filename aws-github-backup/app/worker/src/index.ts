import { getGithubRepoList } from "./github";
import { writeFile } from "fs/promises";
import { formatBytes } from "./lib/util";

async function main() {
  const githubOwner = process.argv[2];
  const outFilePath = process.argv[3];
  const DEBUG = process.env.DEBUG === "true";

  if (!DEBUG) {
    console.debug = () => {};
  }

  const repoList = await getGithubRepoList({ githubOwner });
  console.log(
    `Repo count: ${repoList.total_count} (fetched: ${repoList.repos.length})`
  );
  console.log(`Total size: ${formatBytes(repoList.total_disk_usage * 1024)}`);
  const repoNames = repoList.repos.map((r) => r.repo);
  await writeFile(outFilePath, repoNames.join("\n"));
  console.log(`Wrote repo list to ${outFilePath}`);
}

main();
