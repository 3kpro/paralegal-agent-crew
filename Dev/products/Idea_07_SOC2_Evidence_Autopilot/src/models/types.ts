export type IntegratrionType = 'aws' | 'github' | 'okta';
export type EvidenceStatus = 'pending' | 'captured' | 'failed';
export type MediaType = 'screenshot' | 'log' | 'json' | 'pdf';

/**
 * Represents a connection to an external tool (e.g. AWS Account, GitHub Org)
 */
export interface Integration {
  id: string;
  type: IntegratrionType;
  name: string;
  enabled: boolean;
  config: Record<string, any>; // e.g. roleArn, orgName
  lastSyncAt?: Date;
}

/**
 * Represents a specific SOC 2 or compliance control
 * e.g. CC6.1 - Access Control
 */
export interface Control {
  id: string; 
  code: string; // "CC6.1"
  title: string;
  description: string;
  framework: 'SOC2_TYPE_II';
  requirement: string;
}

/**
 * A scheduled task to collect specific evidence
 */
export interface CaptureJob {
  id: string;
  integrationId: string;
  name: string;
  description: string;
  cronSchedule: string; 
  fnHandler: string; // e.g. "aws.iam.capturePolicies"
  nextRunAt: Date;
  enabled: boolean;
}

/**
 * The actual artifact collected by the system
 */
export interface Evidence {
  id: string;
  jobId?: string; // If automated
  integrationId: string;
  controlIds: string[]; // Mapped controls
  title: string;
  description: string;
  s3Key: string;
  mediaType: MediaType;
  sizeBytes: number;
  hash: string; // Integrity check
  capturedAt: Date;
  status: EvidenceStatus;
  metadata?: Record<string, any>;
}
