# GitHub to GitLab auto-backup

## Summary

- Node.js v24 or later
- [GitHub REST API v3](https://developer.github.com/v3/)
- GitLab CE

## Usage

### Install

Just run `npm install`.

```bash
npm install
```

### Setup environment variables

```bash
cp .env.example .env
vi .env
```

Set all required variables in .env. You can also set environment variables directly in your system.

**Required environment variables:**
- `GITLAB_API_URL`: GitLab API endpoint URL
- `GITLAB_NAMESPACE`: Target namespace in GitLab
- `GITLAB_TOKEN`: GitLab personal access token (can be set as system environment variable for security)
- `GITHUB_API_URL`: GitHub API endpoint URL
- `GITHUB_TYPE`: Either `orgs` or `users`
- `GITHUB_OWNER`: GitHub organization or user name
- `GITHUB_TOKEN`: GitHub personal access token (can be set as system environment variable for security)

**Note:** Secret tokens (`GITLAB_TOKEN` and `GITHUB_TOKEN`) can be provided via system environment variables instead of the .env file for better security.

### Start backup

```bash
npm start
```

is as same as below.

```bash
node index.js
```

#### clean mode

`--clean` mode will ignore the GitHub repository's previous state.

```bash
node index.js --clean
```

#### force mode

`--force` mode will ignore the previous timestamp to backup all repos forcibly.

```bash
node index.js --force
```

#### dry mode

`--dry` mode will check all of target repos but neither delete projects nor import repos.

```bash
node index.js --dry
```

## License

Copyright (c) 2019 MESN Inc.

Released under the [MIT license](https://opensource.org/licenses/mit-license.php)

