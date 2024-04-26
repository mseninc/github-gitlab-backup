type RepoSyncResult =
  | (GithubOwnerRepo & {
      owner: string;
      repo: string;
      directory: string;
      file_count: number;
      total_size: number;
      action: string;
    })
  | { error: string };

type LsReposResponse = {
  statusCode: number;
  body: {
    items: string[];
    count: number;
  };
};
