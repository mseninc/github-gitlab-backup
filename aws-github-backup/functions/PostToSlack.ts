// 入力のテキストを Slack に投稿する
//
// 環境変数
//   SLACK_WEBHOOK_URL_PARAMETER_NAME: Slack の Incoming Webhook の URL を格納した SSM パラメーター名
// パラメーター
//   text: string
//   blocks: JSON[]
//   attachments: JSON[]
// 戻り値
//   なし

import { getSSMParameterValue } from "./lib/aws.js";

export async function handler(event: SlackPostRequestBody): Promise<void> {
  const parameterKey = process.env.SLACK_WEBHOOK_URL_PARAMETER_NAME;
  if (!parameterKey) {
    throw new Error("SLACK_WEBHOOK_URL_PARAMETER_NAME is required");
  }
  const slackWebhookUrl = await getSSMParameterValue(parameterKey);
  if (!slackWebhookUrl) {
    throw new Error(`"${parameterKey}" not set in SSM`);
  }
  const body = event;
  console.debug("body", JSON.stringify(body));
  const response = await fetch(slackWebhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  // レスポンスボディは非JSON ("ok" とか) のため、response.json() は呼び出さないこと
  console.debug(`response: ${response.status} ${await response.text()}`);
}
