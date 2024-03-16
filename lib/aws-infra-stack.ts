import * as cdk from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

import * as akdev from './akdev-constructs';

export class AwsInfraStack extends cdk.Stack {
  readonly githubActionsOidcProvider: akdev.GithubActionsOidcProvider;
  readonly monitoringEmailIdentity: akdev.SesEmailIdentity;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.githubActionsOidcProvider = new akdev.GithubActionsOidcProvider(this, 'GithubOidcProvider', {
      owner: 'akdev1l',
      repo: 'aws-log-archive',
      branch: 'main',
    });

    this.monitoringEmailIdentity = new akdev.SesEmailIdentity(this, 'MonitoringEmail', {
      domain: 'm.akdev.xyz',
    });
  }
}
