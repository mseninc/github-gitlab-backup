[【AWS】SAMでStep Functionsを利用してCloudWatch Logsにログ出力する際、sam deploy時にエラーが発生するケースがある【SAM】 - Qiita](https://qiita.com/tmiki/items/1ad26ca38f8b68e00df1#%E5%AF%BE%E5%BF%9C%E6%96%B9%E6%B3%95)

Step Functions のデプロイ時に下記のようなエラーが発生することがある。

これは Step Functions に付与する IAM ロールの問題ではなく、 CloudWatch Logs 側の Resource based policy の問題らしい。

Serverless Framework でも自動更新されないので、 AWS CLI から JSON を指定して手動更新してやる必要がある。

> The state machine IAM Role is not authorized to access the Log Destination (Service: AWSStepFunctions; Status Code: 400; Error Code: AccessDeniedException; Request ID: 4598526e-a9b6-4745-880d-1dd24f47f500; Proxy: null)

※JSON 内の アカウント ID を設定すること

```
aws logs put-resource-policy --policy-name AWSLogDeliveryWrite20150319 --profile=$AWS_PROFILE --region=ap-northeast-1 --policy-document file://cloudwatch-logs-resource-policy.json
```

```
aws logs describe-resource-policies --profile=$AWS_PROFILE --region=ap-northeast-1
```
