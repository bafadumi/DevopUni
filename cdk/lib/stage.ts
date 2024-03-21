import { BackendStack } from "./stacks/backend-stack";
import { AuthStack } from "./stacks/auth-stack";
import { Stage, StageProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { CustomStage } from "./types";

interface CustomStageProps extends StageProps {
  stage: CustomStage;
  hostedZoneId: string;
  hostedZoneName: string;
  domainName: string;
}

const BACKEND_ASSET_ROUTE = "../backend";
//const FRONTEND_ASSET_ROUTE = '../frontend/build';

export class PipelineStage extends Stage {
  constructor(scope: Construct, id: string, props: CustomStageProps) {
    super(scope, id, props);

    const { stage, hostedZoneName, domainName, hostedZoneId } = props;

    const { userPool, userPoolClient } = new AuthStack(
      this,
      `${stage}DevOpsAuthStack`,
      { stage: stage }
    );

    new BackendStack(this, `${stage}DevOpsBackend`, {
      userPool,
      assetRoute: BACKEND_ASSET_ROUTE,
      userPoolClient,
      stage,
    });
  }
}
