import * as cdk from 'aws-cdk-lib';
import { aws_ses as ses } from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface SesEmailIdentityProps {
  readonly domain: string;
}

export class SesEmailIdentity extends Construct {
  readonly emailIdentity: ses.EmailIdentity;

  constructor(scope: Construct, id: string, props: SesEmailIdentityProps) {
    super(scope, id);

    this.emailIdentity = new ses.EmailIdentity(this, `${id}Identity`, {
      identity: ses.Identity.domain(props.domain),
    });

    const output: Record<string, string> = {
      SesEmailIdentity: this.emailIdentity.emailIdentityName,
    };
    Object.keys(output)
     .forEach(key => new cdk.CfnOutput(this, `${key}Output`, { value: output[key] }));
  }
}
