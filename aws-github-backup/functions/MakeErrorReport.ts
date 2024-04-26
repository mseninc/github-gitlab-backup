// Slack エラー通知用のレポートを作成する
//
// パラメーター
//   event: パラメーター
// 戻り値
//   SlackPostRequestBody

export async function handler(event: any): Promise<SlackPostRequestBody> {
  console.log("event", JSON.stringify(event));
  const error: SlackAttachment = {
    color: "danger",
    fields: [
      {
        title: "data",
        value: `${JSON.stringify(event, null, 2)}`,
        short: false,
      },
    ],
  };
  const response = {
    text: "リポジトリのバックアップでエラーが発生しました",
    attachments: [error],
  };
  console.debug("response", JSON.stringify(response));
  return response;
}
