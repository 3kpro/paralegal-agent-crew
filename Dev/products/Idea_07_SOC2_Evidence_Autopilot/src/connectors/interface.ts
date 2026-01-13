import { Integration, Evidence } from '../models/types';

export interface Connector {
  /**
   * Validates the integration configuration (credentials, etc)
   */
  validateConfig(config: Record<string, any>): Promise<boolean>;

  /**
   * Lists available collectors/jobs for this integration
   */
  getAvailableCollectors(): string[];

  /**
   * Executes a specific collector by name
   */
  collect(collectorName: string, integration: Integration): Promise<Evidence[]>;
}
