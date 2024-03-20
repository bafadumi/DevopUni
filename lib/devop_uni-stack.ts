import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import * as sqs from 'aws-cdk-lib/aws-sqs';

const GITHUB_SOURCE_REPO = 'bafadumi/DevopUni';

export class DevopUniStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new CodePipeline(this, 'Pipeline', {
      pipelineName: 'DevOpsAssignmentPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub(GITHUB_SOURCE_REPO, 'main', {
          authentication: cdk.SecretValue.secretsManager('my-secret-token'),
        }),
        installCommands: [
          // Globally install cdk in the container
          'npm install -g aws-cdk',
        ],
        commands: ['npm ci', 'npm run build', 'npx cdk synth'],
      }),
    });
  }
} 