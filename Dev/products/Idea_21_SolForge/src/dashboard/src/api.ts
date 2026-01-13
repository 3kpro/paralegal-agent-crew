
import type { Lane, SystemStatus, Trade, ReadinessScore } from './types';

const API_base = 'http://localhost:8000/api/v1';

export const api = {
  getStatus: async (): Promise<SystemStatus> => {
    const res = await fetch(`${API_base}/status`);
    return res.json();
  },
  
  getLanes: async (): Promise<Lane[]> => {
    const res = await fetch(`${API_base}/lanes`);
    return res.json();
  },
  
  getRecentTrades: async (): Promise<Trade[]> => {
    const res = await fetch(`${API_base}/trades`);
    return res.json();
  },
  
  startLane: async (id: string) => {
    await fetch(`${API_base}/lanes/${id}/start`, { method: 'POST' });
  },
  
  stopLane: async (id: string) => {
    await fetch(`${API_base}/lanes/${id}/stop`, { method: 'POST' });
  },

  getLaneAnalytics: async (id: string): Promise<any> => {
    const res = await fetch(`${API_base}/lanes/${id}/analytics`);
    return res.json();
  },

  getReadiness: async (id: string): Promise<ReadinessScore> => {
    const res = await fetch(`${API_base}/lanes/${id}/readiness`);
    return res.json();
  }
};
