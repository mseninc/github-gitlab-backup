// GitHub から取得したリポジトリ一覧と、リポジトリの同期結果を組み合わせて、同期結果レポートを作成する
//
// パラメーター
//   repoList: GitHub から取得したリポジトリ一覧
//   syncResults: リポジトリの同期結果リスト
// 戻り値
//   同期結果レポート

export async function handler(event: {
  repoList: GithubRepoList;
  syncResults: RepoSyncResult[];
}): Promise<SyncReport> {
  const { repoList, syncResults } = event;
  if (!repoList) {
    throw new Error("repoList is required");
  }
  if (!syncResults) {
    throw new Error("syncResults is required");
  }
  const repos = repoList.repos.map((r) => {
    const syncResult = syncResults.find(
      (s) => s.owner === r.owner && s.repo === r.repo
    );
    return {
      ...syncResult,
      ...r,
    };
  });
  const report: SyncReport = {
    total_count: repoList.total_count,
    total_disk_usage: repoList.total_disk_usage,
    repos,
  };
  return report;
}
