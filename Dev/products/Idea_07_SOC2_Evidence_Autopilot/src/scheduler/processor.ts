import { Job } from 'bull';
import { CaptureJob, Integration, Evidence } from '../models/types';
import { AwsConnector } from '../connectors/aws';
import { GitHubConnector } from '../connectors/github';
import { OktaConnector } from '../connectors/okta';
import { Connector } from '../connectors/interface';

// Connector Factory
const getConnector = (type: string): Connector => {
  switch (type) {
    case 'aws':
      return new AwsConnector();
    case 'github':
      return new GitHubConnector();
    case 'okta':
      return new OktaConnector();
    default:
      throw new Error(`Unsupported integration type: ${type}`);
  }
};

interface JobPayload {
  job: CaptureJob;
  integration: Integration;
}

/**
 * Worker function to process evidence capture jobs
 */
export const processCaptureJob = async (job: Job<JobPayload>) => {
  const { job: captureJob, integration } = job.data;

  console.log(`Processing capture job: ${captureJob.name} (${captureJob.fnHandler})`);

  if (!integration.enabled) {
    throw new Error(`Integration ${integration.name} is disabled. Skipping job.`);
  }

  // 1. Get appropriate connector
  const connector = getConnector(integration.type);

  // 2. Execute collection
  // The fnHandler string (e.g. "aws.iam.policies") maps to the collectorName
  const results: Evidence[] = await connector.collect(captureJob.fnHandler, integration);

  console.log(`Collected ${results.length} evidence items.`);

  // 3. In a real app, we would save these Evidence records to the database here
  // await db.evidence.createMany({ data: results });

  return results;
};
