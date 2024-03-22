#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DevopUniStack } from '../lib/devop_uni-stack';
import { BackendStack } from '../lib/stacks/backend-stack';
const app = new cdk.App();
new DevopUniStack(app, 'DevopsUniStack', {
    env: {
        account: '381492192118',
        region: 'us-east-1',
    },
});

app.synth();
