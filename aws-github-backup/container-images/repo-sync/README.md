ビルド

```
DOCKER_BUILDKIT=0 docker build -t github-backup-repo-sync .
```

ローカル実行

```
docker run --name repo-sync --rm -it --env-file=.env github-backup-repo-sync
```

関数リクエスト

```
curl "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{ "owner": "mseninc", "repo" : isms-reports" }'
```

```json
{"statusCode":200,"body":{"owner":"mseninc","repo":"isms-reports","directory":"/mnt/efs/isms-reports","file_count":39,"total_size":60662221,"action":"clone"}}
```
