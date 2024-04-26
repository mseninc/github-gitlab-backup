type GithubRepoList = {
  total_count: number;
  total_disk_usage: number;
  repos: GithubOwnerRepo[];
};

type GithubOwnerRepo = {
  owner: string;
  repo: string;
};
