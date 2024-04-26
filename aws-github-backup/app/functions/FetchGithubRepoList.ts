import { graphql } from "@octokit/graphql";
import { Organization, RepositoryConnection } from "@octokit/graphql-schema";
import { getSSMParameterValue } from "./lib/aws.js";

// GitHub から指定したオーナーのリポジトリ一覧を取得する
//
// 環境変数
//   GITHUB_TOKEN_PARAMETER_NAME: リポジトリ一覧を取得する GitHub のユーザー名
// 戻り値
//   リポジトリ一覧＋リポジトリ合計数とディスク使用量

export async function handler(event: {
  githubOwner: string;
}): Promise<GithubRepoList> {
  const parameterKey = process.env.GITHUB_TOKEN_PARAMETER_NAME;
  if (!parameterKey) {
    throw new Error("GITHUB_TOKEN_PARAMETER_NAME is required");
  }
  const githubToken = await getSSMParameterValue(parameterKey);
  if (!githubToken) {
    throw new Error(`Key "${parameterKey}" not found in SSM`);
  }
  if (!event.githubOwner) {
    throw new Error("githubOwner is required");
  }
  console.debug(`fetching repo list for ${event.githubOwner}`);
  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${githubToken}`,
    },
  });
  const repoList = await fetchAllRepoList(graphqlWithAuth, event.githubOwner);
  console.debug(`fetched ${repoList.repos.length} repos`);
  /* DEBUG
  repoList.repos.splice(0, repoList.repos.length - 10);
  //*/
  return repoList;
}

async function fetchAllRepoList(
  gql: typeof graphql,
  login: string
): Promise<GithubRepoList> {
  const repos: GithubOwnerRepo[] = [];
  let after = "";
  do {
    const repoConn = await fetchRepoConnections(gql, { login, after });
    if (repoConn.nodes) {
      const ownerRepos = repoConn.nodes.map((r) => ({
        owner: login,
        repo: r?.name || "",
      }));
      repos.push(...ownerRepos);
    }
    if (!repoConn.pageInfo.hasNextPage || !repoConn.pageInfo.endCursor) {
      const total_count = repoConn.totalCount;
      const total_disk_usage = repoConn.totalDiskUsage;
      console.debug(`fetched ${repos.length} repos: ${JSON.stringify(repos)}`);
      return {
        total_count,
        total_disk_usage,
        repos,
      };
    }
    after = repoConn.pageInfo.endCursor;
  } while (true);
}

async function fetchRepoConnections(
  gql: typeof graphql,
  params: { login: string; after: string }
): Promise<RepositoryConnection> {
  const { organization } = await gql<{ organization: Organization }>(
    `
query fetch($login: String!, $after: String) {
  organization(login: $login) {
    repositories(orderBy: { field: NAME, direction: DESC }, first: 100, after: $after) {
      totalCount
      totalDiskUsage
      nodes {
        name
        updatedAt
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
}
    `,
    params
  );
  console.log(organization.repositories);
  return organization.repositories;
}
