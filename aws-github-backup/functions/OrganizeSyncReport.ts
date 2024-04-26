// GitHub から取得したリポジトリ一覧と、リポジトリの同期結果を組み合わせて、同期結果レポートを作成する
//
// パラメーター
//   repoList: GitHub から取得したリポジトリ一覧
//   syncResults: リポジトリの同期結果リスト
// 戻り値
//   同期結果レポート

export async function handler(event: SyncReportInput): Promise<SyncReport> {
  const { repoList, syncResults } = event;
  if (!repoList) {
    throw new Error("repoList is required");
  }
  if (!syncResults) {
    throw new Error("syncResults is required");
  }
  // ここで repoList と syncResults の長さが一致していることを確認する
  if (repoList.repos.length !== syncResults.length) {
    throw new Error(
      `repoList length mismatch: ${repoList.repos.length} !== ${syncResults.length}`
    );
  }

  const repos = repoList.repos.map((repo, i) => {
    const syncResult = syncResults[i];
    // ここで "error" がある場合は、同期結果がエラーであることを示すが、
    // その場合、 syncResult には owner や repo などの情報が含まれていないため、
    //
    if ("error" in syncResult) {
      return {
        ...repo,
        error: syncResult.error,
      };
    }
    if (`${repo.repo}` !== syncResult.repo) {
      throw new Error(
        `repo mismatch: ${repo.repo} !== ${syncResult.repo} (${i})`
      );
    }
    return {
      ...repo,
      ...syncResult,
    };
  });
  const report: SyncReport = {
    total_count: repoList.total_count,
    total_disk_usage: repoList.total_disk_usage,
    repos,
  };
  return report;
}
