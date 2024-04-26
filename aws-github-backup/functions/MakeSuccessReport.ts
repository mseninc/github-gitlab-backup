// Slack 通知用のレポートを作成する
//
// パラメーター
//   executionName: 実行名
//   startTime: 開始日時 (ISO 8601)
//   report: 同期結果レポート
// 戻り値
//   SlackPostRequestBody

import { formatBytes } from "./lib/util.js";

export async function handler(event: {
  executionName: string;
  startTime: string;
  report: SyncReport;
}): Promise<SlackPostRequestBody> {
  const { report, startTime, executionName } = event;
  if (!report) {
    throw new Error("report is required");
  }
  if (!startTime) {
    throw new Error("startTime is required");
  }
  const start = new Date(startTime);
  const end = new Date();
  const elapsed = end.getTime() - start.getTime();

  const successRepos = report.repos.filter((r) => !r.error && r.action);
  const errorRepos = report.repos.filter((r) => r.error);
  const text = `リポジトリのバックアップが完了しました`;

  const summary: SlackAttachment = {
    color: getColor(errorRepos.length > 0),
    footer: `execution name: ${executionName}`,
    fields: [
      {
        title: "開始日時",
        value: start.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }),
        short: true,
      },
      {
        title: "経過時間",
        value: `${(elapsed / 1000).toLocaleString("ja-JP")} s`,
        short: true,
      },
      {
        title: "対象リポジトリ数",
        value: `${report.total_count}`,
        short: true,
      },
      {
        title: "同期リポジトリ数",
        value: `${successRepos.length}`,
        short: true,
      },
      {
        title: "エラーリポジトリ数",
        value: `${errorRepos.length}`,
        short: true,
      },
      {
        title: "GitHub ディスク使用量",
        value: `${formatBytes(report.total_disk_usage * 1024)}`, // total_disk_usage は KB 単位
        short: true,
      },
    ],
  };

  const error: SlackAttachment = {
    color: "danger",
    fields: errorRepos.map((r) => ({
      title: `${r.owner}/${r.repo}`,
      value: `${r.error}`,
      short: true,
    })),
  };
  const attachments: SlackAttachment[] = [summary, error];
  const response = {
    text,
    attachments,
  };
  console.debug("response", JSON.stringify(response));
  return response;
}

function getColor(hasError: boolean): string {
  return hasError ? "warning" : "good";
}
