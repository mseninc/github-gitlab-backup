// Slack 通知用のレポートを作成する
//
// パラメーター
//   report: 同期結果レポート
// 戻り値
//   同期結果レポート

import { formatBytes } from "./lib/util";

export async function handler(event: {
  report: SyncReport;
}): Promise<SlackPostRequestBody> {
  const { report } = event;
  if (!report) {
    throw new Error("report is required");
  }
  const errorRepos = report.repos.filter((r) => r.error);
  const text = `リポジトリの同期が完了しました`;
  const fundamentalBlocks: SlackBlock[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*リポジトリ数*: ${report.total_count}`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*ディスク使用量*: ${formatBytes(report.total_disk_usage)}`,
      },
    },
  ];
  const errorRepoBlocks: SlackBlock[] = errorRepos.map((r) => ({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*${r.owner}/${r.repo}*: ${r.error}`,
    },
  }));
  const attachments: SlackAttachment[] = [
    {
      color: getColor(errorRepos.length > 0),
      blocks: fundamentalBlocks,
    },
    {
      color: "danger",
      blocks: errorRepoBlocks,
    },
  ];
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
