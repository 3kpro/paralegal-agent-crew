import { Connector } from '../interface';
import { Integration, Evidence } from '../../models/types';
import * as okta from '@okta/okta-sdk-nodejs';

export class OktaConnector implements Connector {
  
  async validateConfig(config: Record<string, any>): Promise<boolean> {
    try {
      const client = new okta.Client({
        orgUrl: config.orgUrl,
        token: config.token
      });
      // Try to get current user or distinct resource to validate auth
      await client.getUser('me'); 
      return true;
    } catch (error) {
      console.error('Okta Config Validation Failed', error);
      return false;
    }
  }

  getAvailableCollectors(): string[] {
    return [
      'okta.users.inactive',
      'okta.policies.mfa'
    ];
  }

  async collect(collectorName: string, integration: Integration): Promise<Evidence[]> {
    switch (collectorName) {
      case 'okta.users.inactive':
        return this.collectInactiveUsers(integration);
      case 'okta.policies.mfa':
        return this.collectMfaPolicies(integration);
      default:
        throw new Error(`Collector ${collectorName} not supported for Okta`);
    }
  }

  private async collectInactiveUsers(integration: Integration): Promise<Evidence[]> {
      // Mock implementation
      // Real: client.listUsers({ clean: true, filter: 'status eq "DEPROVISIONED"' })
      return [{
          id: 'ev_' + Date.now(),
          integrationId: integration.id,
          controlIds: ['CC6.1', 'CC6.2'], 
          title: 'Inactive & Deprovisioned Users',
          description: 'List of users who have been deprovisioned or are inactive > 90 days',
          s3Key: `audit/${integration.id}/okta-users-inactive.json`,
          mediaType: 'json',
          sizeBytes: 3048,
          hash: 'sha256-placeholder',
          capturedAt: new Date(),
          status: 'captured',
          metadata: { 
             count: 12,
             period: '90_days'
          }
      }];
  }

  private async collectMfaPolicies(integration: Integration): Promise<Evidence[]> {
      // Mock implementation
      // Real: client.listPolicies({ type: 'MFA_ENROLL' })
      return [{
          id: 'ev_' + Date.now() + '_1',
          integrationId: integration.id,
          controlIds: ['CC6.1', 'CC6.8.1'],
          title: 'MFA Enrollment Policies',
          description: 'Configuration of Multi-Factor Authentication requirements',
          s3Key: `audit/${integration.id}/okta-mfa-policies.json`,
          mediaType: 'json',
          sizeBytes: 1524,
          hash: 'sha256-placeholder',
          capturedAt: new Date(),
          status: 'captured'
      }];
  }
}
