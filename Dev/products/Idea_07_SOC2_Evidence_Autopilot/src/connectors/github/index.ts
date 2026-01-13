import { Connector } from '../interface';
import { Integration, Evidence } from '../../models/types';
import { Octokit } from '@octokit/rest';

export class GitHubConnector implements Connector {
  
  async validateConfig(config: Record<string, any>): Promise<boolean> {
    try {
      const octokit = new Octokit({ auth: config.token });
      await octokit.users.getAuthenticated();
      return true;
    } catch (error) {
      console.error('GitHub Config Validation Failed', error);
      return false;
    }
  }

  getAvailableCollectors(): string[] {
    return [
      'github.branch_protection',
      'github.pr_settings'
    ];
  }

  async collect(collectorName: string, integration: Integration): Promise<Evidence[]> {
    switch (collectorName) {
      case 'github.branch_protection':
        return this.collectBranchProtection(integration);
      case 'github.pr_settings':
        return this.collectPrSettings(integration);
      default:
        throw new Error(`Collector ${collectorName} not supported for GitHub`);
    }
  }

  private async collectBranchProtection(integration: Integration): Promise<Evidence[]> {
      // Mock implementation
      // Real: list repos, get default branch, get protection rules
      return [{
          id: 'ev_' + Date.now(),
          integrationId: integration.id,
          controlIds: ['CC8.1'], 
          title: 'Main Branch Protection Rules',
          description: 'Configuration of branch protection for main/master',
          s3Key: `audit/${integration.id}/github-protection.json`,
          mediaType: 'json',
          sizeBytes: 2048,
          hash: 'sha256-placeholder',
          capturedAt: new Date(),
          status: 'captured',
          metadata: { 
            repo: 'compliance-ghost',
            branch: 'main',
            requires_admins: true,
            required_reviews: 2 
          }
      }];
  }

  private async collectPrSettings(integration: Integration): Promise<Evidence[]> {
      // Mock implementation
      // Real: Check repo settings for PR merge requirements
      return [{
          id: 'ev_' + Date.now() + '_1',
          integrationId: integration.id,
          controlIds: ['CC8.1', 'CC6.8'],
          title: 'Pull Request Review Policy',
          description: 'Evidence that Code Review is enforced',
          s3Key: `audit/${integration.id}/github-pr-policy.json`,
          mediaType: 'json',
          sizeBytes: 1024,
          hash: 'sha256-placeholder',
          capturedAt: new Date(),
          status: 'captured'
      }];
  }
}
