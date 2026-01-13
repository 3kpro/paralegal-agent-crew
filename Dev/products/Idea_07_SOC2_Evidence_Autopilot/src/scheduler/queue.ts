import Queue from 'bull';
import { processCaptureJob } from './processor';

// Initialize the evidence capture queue
// Connects to Redis at localhost:6379 by default or via REDIS_URL
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const evidenceQueue = new Queue('compliance-ghost-evidence', redisUrl, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true, // Keep Redis clean
    removeOnFail: false,   // Keep failed jobs for inspection
  }
});

/**
 * Initialize queue listeners and processors
 */
export const initScheduler = () => {
  console.log('Initializing Capture Scheduler...');

  // Process jobs with concurrency of 5
  evidenceQueue.process(5, processCaptureJob);

  evidenceQueue.on('completed', (job) => {
    console.log(`Job ${job.id} completed! Evidence collected for ${job.data.integrationId}`);
  });

  evidenceQueue.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed: ${err.message}`);
  });

  console.log('Scheduler Ready. Waiting for jobs...');
};

/**
 * Add a recurring job to the queue
 */
export const scheduleJob = async (jobId: string, cron: string, data: any) => {
  // Remove existing repeatable job with same ID config if needed
  // For now, just adding a basic job
  await evidenceQueue.add(data, {
    jobId: jobId,
    repeat: { cron: cron }
  });
};
