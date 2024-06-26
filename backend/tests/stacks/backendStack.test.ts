import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as path from 'path';
import { AuthStack } from '../../../cdk/lib/stacks/auth-stack';
import { BackendStack } from '../../../cdk/lib/stacks/backend-stack';
import { CustomStage } from '../../../cdk/lib/types';

const STAGE: CustomStage = 'Beta';

describe('BackendStack', () => {
    it('Has expected stack resources', () => {
        const app = new App();
        const appRoot = path.resolve(__dirname);

        const { userPool, userPoolClient } = new AuthStack(app, 'AuthTest', { stage: STAGE });
        const stack = new BackendStack(app, 'Test', { userPool, assetRoute: appRoot, userPoolClient, stage: STAGE });

        Template.fromStack(stack).hasResource('AWS::DynamoDB::Table', {});
        Template.fromStack(stack).hasResource('AWS::Lambda::Function', {});
        Template.fromStack(stack).hasResource('AWS::ApiGatewayV2::Api', {});
    });
});
