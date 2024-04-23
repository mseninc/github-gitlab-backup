type RepoSyncResult = GithubOwnerRepo &
  (
    | {
        owner: string;
        repo: string;
        directory: string;
        file_count: number;
        total_size: number;
        action: string;
      }
    | { error: string }
  );

type RepoSyncResponse = {
  statusCode: number;
  body: RepoSyncResult;
};

type LsReposResponse = {
  statusCode: number;
  body: {
    items: string[];
    count: number;
  };
};
