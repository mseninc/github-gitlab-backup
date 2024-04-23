type SyncReportRepoResult = GithubOwnerRepo & {
  directory?: string;
  file_count?: number;
  total_size?: number;
  action?: string;
  error?: string;
};

type SyncReport = {
  total_count: number;
  total_disk_usage: number;
  repos: SyncReportRepoResult[];
};
