import { AuthStack } from '../../../cdk/lib/stacks/auth-stack';
import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CustomStage } from '../../../cdk/lib/types';

const STAGE: CustomStage = 'Beta';

describe('AuthStack', () => {
    it('Has expected stack resources', () => {
        const app = new App();
        const stack = new AuthStack(app, 'Test', { stage: STAGE });

        Template.fromStack(stack).hasResourceProperties('AWS::Cognito::UserPool', {
            UserPoolName: 'BetaDevOpsUserPool',
        });
    });
});
