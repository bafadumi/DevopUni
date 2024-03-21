import { Environment } from "aws-cdk-lib";
interface Config {
  account: string;
  region: string;
  hostedZoneName: string;
  hostedZoneId: string;
}

export const CONFIG: Config = {
  account: process.env.AWS_ACCOUNT_ID || "381492192118",
  region: process.env.AWS_DEFAULT_REGION || "us-east-1",
  hostedZoneName: process.env.AWS_HOSTED_ZONE_NAME || "devops.com",
  hostedZoneId: process.env.AWS_HOSTED_ZONE_ID || "Z010502913W53UOD7EHXA",
};
export const STAGES = ["Beta", "Prod"] as const;

const REGION = "us-east-1";
export const ENV: Environment = { region: REGION };
