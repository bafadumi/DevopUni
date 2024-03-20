import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps, Stage as CDKStage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodeBuildStep, CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Stage, ENV } from "./config";
import { AuthStack } from './stacks/auth-stack';
import { BackendStack } from './stacks/backend-stack';
import { CustomStage } from './types';


const GITHUB_SOURCE_REPO = 'bafadumi/DevopUni';

const HOSTED_ZONE_ID = 'Z010502913W53UOD7EHXA';
const HOSTED_ZONE_NAME = 'devops.com';

const DOMAIN_SUFFIX = `Learn-Be-Curious.${HOSTED_ZONE_NAME}`;

const BETA_DOMAIN_NAME = `beta.${DOMAIN_SUFFIX}`;
const PROD_DOMAIN_NAME = `${DOMAIN_SUFFIX}`;

interface CustomStageProps extends StageProps {
  stage: CustomStage;
  hostedZoneId: string;
  hostedZoneName: string;
  domainName: string;
}

const BACKEND_ASSET_ROUTE = '../DevopUni/backend';
//const FRONTEND_ASSET_ROUTE = '../frontend/build';

export class PipelineStage extends CDKStage {
  constructor(scope: Construct, id: string, props: CustomStageProps) {
    super(scope, id, props);

    const { stage, hostedZoneName, domainName, hostedZoneId } = props;

    const { userPool, userPoolClient } = new AuthStack(this, `${stage}DevOpsAuthStack`, { stage: stage });

    new BackendStack(this, `${stage}DevOpsBackend`, {
      userPool,
      assetRoute: BACKEND_ASSET_ROUTE,
      userPoolClient,
      stage,
    });
  }
}

export class DevopUniStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const sourceAction = CodePipelineSource.gitHub('bafadumi/DevopUni', 'main');

    const frontendBuildAction = new CodeBuildStep('FrontendBuild', {
      input: sourceAction,
      commands: ['cd frontend', 'npm ci', 'npm run build', 'cd ..'],
      primaryOutputDirectory: './',
    });

    const backendBuildAction = new CodeBuildStep('BackendBuild', {
      input: frontendBuildAction,
      commands: ['cd backend', 'npm ci', 'npm run build', 'cd ..'],
      primaryOutputDirectory: './',
    });

    const synthAction = new CodeBuildStep('Synth', {
      input: backendBuildAction,
      installCommands: [
        // Globally install cdk in the container
        'npm install -g aws-cdk',
      ],
      commands: ['cd infrastructure', 'npm ci', 'npm run build', 'npx cdk synth', 'cd ..'],
      // Synth step must output to cdk.out for mutation/deployment
      primaryOutputDirectory: './',
    });

    const pipeline = new CodePipeline(this, 'DevOpsAssignmentPipeline', {
      pipelineName: 'DevOpsAssignmentPipeline',
      synth: synthAction,
    });

    const betaStage = new PipelineStage(this, 'BetaDevopAssignmentStage', {
      env: ENV,
      stage: 'Beta',
      hostedZoneId: HOSTED_ZONE_ID,
      hostedZoneName: HOSTED_ZONE_NAME,
      domainName: BETA_DOMAIN_NAME,
    });

    const prodStage = new PipelineStage(this, 'ProdDevopAssignmentStage', {
      env: ENV,
      stage: 'Prod',
      hostedZoneId: HOSTED_ZONE_ID,
      hostedZoneName: HOSTED_ZONE_NAME,
      domainName: PROD_DOMAIN_NAME,
    });
    pipeline.addStage(betaStage);
    pipeline.addStage(prodStage);

  }
} 
