import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'

export async function getSSMParameterValue(
  parameterName: string
): Promise<string | undefined> {
  if (!process.env.AWS_REGION) {
    throw new Error('AWS_REGION is required')
  }
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-ssm/
  const client = new SSMClient({ region: process.env.AWS_REGION })
  const command = new GetParameterCommand({
    Name: parameterName,
    WithDecryption: true,
  })
  const response = await client.send(command)
  return response.Parameter?.Value
}
