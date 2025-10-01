import axios from 'axios';
import { ProcessInfo } from '../types';

const API_BASE = '/api';

export const api = {
  setAuthToken: (token: string | null) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  },

  getProcesses: async (): Promise<ProcessInfo[]> => {
    const response = await axios.get(`${API_BASE}/processes`);
    return response.data;
  },

  getProcessDetails: async (name: string): Promise<any> => {
    const response = await axios.get(`${API_BASE}/processes/${name}`);
    return response.data;
  },

  restartProcess: async (name: string): Promise<any> => {
    const response = await axios.post(`${API_BASE}/processes/${name}/restart`);
    return response.data;
  },

  stopProcess: async (name: string): Promise<any> => {
    const response = await axios.post(`${API_BASE}/processes/${name}/stop`);
    return response.data;
  },

  startProcess: async (name: string): Promise<any> => {
    const response = await axios.post(`${API_BASE}/processes/${name}/start`);
    return response.data;
  },

  getHealth: async (): Promise<any> => {
    const response = await axios.get(`${API_BASE}/health`);
    return response.data;
  },

  changePassword: async (newPassword: string): Promise<any> => {
    const response = await axios.post(`${API_BASE}/auth/change-password`, { newPassword });
    return response.data;
  },
};