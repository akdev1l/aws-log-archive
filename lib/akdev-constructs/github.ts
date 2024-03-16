import  * as cdk from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface GithubActionsOidcProviderProps {
  readonly owner: string;
  readonly repo: string;
  readonly branch: string;
}

export class GithubActionsOidcProvider extends Construct {
  readonly githubActionsOidcProvider: iam.OpenIdConnectProvider;
  readonly githubActionsRole: iam.Role;

  constructor(scope: Construct, id: string, props: GithubActionsOidcProviderProps) {
    super(scope, id);

    this.githubActionsOidcProvider = new iam.OpenIdConnectProvider(this, 'GitHubActionsOidc', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: [ 'sts.amazonaws.com' ],
      thumbprints: ['6938fd4d98bab03faadb97b34396831e3780aea1', '1c58a3a8518e8759bf075b76b750d4f2df264fcd'],
    });

    this.githubActionsRole = new iam.Role(this, `GithubActionsRole`, {
      roleName: 'OidcGithubActions',
      assumedBy: new iam.FederatedPrincipal(
        this.githubActionsOidcProvider.openIdConnectProviderArn,
        {
          StringLike: {
            // This specifies that the subscriber (sub) claim must be the main
            // branch of your repository. You can use wildcards here, but
            // you should be careful about what you allow.
            "token.actions.githubusercontent.com:sub": [
              `repo:${props.owner}/${props.repo}:ref:refs/heads/${props.branch}`,
            ],
          },
          // This specifies that the audience (aud) claim must be sts.amazonaws.com
          StringEquals: {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          },
        },
        "sts:AssumeRoleWithWebIdentity" // <-- Allows use of OIDC identity
      ),
    });

    const allowCdkAccessPolicyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["sts:AssumeRole"],
      resources: ["arn:aws:iam::*:role/cdk-*"],
      conditions: {
        StringEquals: {
          "aws:ResourceTag/aws-cdk:bootstrap-role": [
            "file-publishing",
            "lookup",
            "deploy",
          ],
        },
      },
    });
    this.githubActionsRole.addToPolicy(allowCdkAccessPolicyStatement);

    const outputs: Record<string, string> = {
      GithubActionsRole: this.githubActionsRole.roleArn,
    };
    Object.keys(outputs)
     .forEach(key => new cdk.CfnOutput(this, `${key}Output`, { value: outputs[key] }));
  }
}
