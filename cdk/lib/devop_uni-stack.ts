import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps, Stage as CDKStage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodeBuildStep, CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { STAGES, ENV, CONFIG } from './config';
import { AuthStack } from './stacks/auth-stack';
import { BackendStack } from './stacks/backend-stack';
import { CustomStage } from './types';
import { UIStack } from './stacks/front-end-stack';

const GITHUB_SOURCE_REPO = 'bafadumi/DevopUni';

const HOSTED_ZONE_ID = 'Z010502913W53UOD7EHXA';
const HOSTED_ZONE_NAME = 'devops.com';

const DOMAIN_SUFFIX = `learn-be-curious.${HOSTED_ZONE_NAME}`;
const STEP_COMMANDS = ['npm ci', 'npm run bootstrap', 'npm run install-all', 'npm run build'];
const BETA_DOMAIN_NAME = `beta.${DOMAIN_SUFFIX}`;
const PROD_DOMAIN_NAME = `${DOMAIN_SUFFIX}`;

interface CustomStageProps extends StageProps {
    stage: CustomStage;
    hostedZoneId: string;
    hostedZoneName: string;
    domainName: string;
}

const BACKEND_ASSET_ROUTE = '../backend';
const FRONTEND_ASSET_ROUTE = '../frontend/build';

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

        new UIStack(this, `${stage}DevOpsUIStack`, {
            domainName,
            hostedZoneName,
            stage,
            hostedZoneId,
            frontEndAssetRoute: FRONTEND_ASSET_ROUTE,
        });
    }
}

export class DevopUniStack extends cdk.Stack {
    private pipeline: CodePipeline;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const sourceAction = CodePipelineSource.gitHub('bafadumi/DevopUni', 'main', {
            authentication: cdk.SecretValue.secretsManager('my-secret-token'),
        });

        const frontendBuildAction = new CodeBuildStep('FrontendBuild', {
            input: sourceAction,
            commands: ['cd frontend', 'npm ci', 'npm run build', 'cd ..'],
            primaryOutputDirectory: './',
            env: {
                AWS_GITHUB_TOKEN: cdk.SecretValue.secretsManager('my-secret-token').unsafeUnwrap(),
            },
        });

        const backendBuildAction = new CodeBuildStep('BackendBuild', {
            input: frontendBuildAction,
            commands: ['cd backend', 'npm ci', 'npm run build', 'cd ..'],
            primaryOutputDirectory: './',
            env: {
                AWS_GITHUB_TOKEN: cdk.SecretValue.secretsManager('my-secret-token').unsafeUnwrap(),
            },
        });

        const synthAction = new CodeBuildStep('Synth', {
            input: backendBuildAction,
            installCommands: [
                // Globally install cdk in the container
                'npm install -g aws-cdk',
            ],
            commands: ['cd cdk', 'npm ci', 'npm run build', 'npx cdk synth', 'cd ..'],
            // Synth step must output to cdk.out for mutation/deployment
            primaryOutputDirectory: './cdk/cdk.out',
            env: {
                AWS_GITHUB_TOKEN: cdk.SecretValue.secretsManager('my-secret-token').unsafeUnwrap(),
            },
        });

        const pipeline = new CodePipeline(this, 'Pipeline', {
            pipelineName: 'DevOpsAssignmentPipeline',
            synth: synthAction,
        });

        const betaStage = new PipelineStage(this, 'BetaLearnBeCuriousStage', {
            env: ENV,
            stage: 'Beta',
            hostedZoneId: HOSTED_ZONE_ID,
            hostedZoneName: HOSTED_ZONE_NAME,
            domainName: BETA_DOMAIN_NAME,
        });

        const prodStage = new PipelineStage(this, 'ProdLearnBeCuriousStage', {
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
