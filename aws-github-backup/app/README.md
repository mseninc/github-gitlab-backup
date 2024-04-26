

| ファイル名            | 説明                                                     |
| --------------------- | -------------------------------------------------------- |
| 01_base.yml           | EC2 用キーペア, EFS ファイルシステム                     |
| 02_infra.yml          | VPC, ネットワーク周り, EFS 周り, 確認用 EC2 インスタンス |
| 03_lambda-layers.yml  | Lambda レイヤー                                          |
| 04_ecr-images.yml     | ECR へのコンテナーイメージのプッシュ                     |
| 05_ecs-cluster.yml    | ECS クラスター, リポジトリ同期タスク定義                 |
| 05_step-functions.yml | Step Functions ステートマシン定義                        |



### スタックのデプロイ方法

基本的には番号付きのスタックを順番にデプロイする。

```
npx serverless deploy --stage prod --config 01_base.yml
npx serverless deploy --stage prod --config 02_infra.yml
npx serverless deploy --stage prod --config 03_lambda-layers.yml
npx serverless deploy --stage prod --config 04_ecr-images.yml
npx serverless deploy --stage prod --config 05_ecs-cluster.yml
npx serverless deploy --stage prod --config 06_step-functions.yml
```
