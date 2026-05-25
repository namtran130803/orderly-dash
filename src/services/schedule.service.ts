import { axiosInstance } from '@/lib/axios';

export interface ScheduleOverride {
  id: number;
  date: string;
  type: 'OFF' | 'WORKING_DAY';
}

export interface ScheduleData {
  defaultWorkDays: number[];
  overrides: ScheduleOverride[];
}

export const scheduleService = {
  get: (storeId: number) =>
    axiosInstance.get<{ success: boolean; data: ScheduleData; message: string }>(
      `/stores/${storeId}/schedule`,
    ),

  putDefault: (storeId: number, defaultWorkDays: number[]) =>
    axiosInstance.put<{ success: boolean; data: unknown; message: string }>(
      `/stores/${storeId}/schedule/default`,
      { defaultWorkDays },
    ),

  postOverride: (storeId: number, data: { date: string; type: 'OFF' | 'WORKING_DAY' }) =>
    axiosInstance.post<{ success: boolean; data: unknown; message: string }>(
      `/stores/${storeId}/schedule/overrides`,
      data,
    ),

  deleteOverride: (storeId: number, overrideId: number) =>
    axiosInstance.delete<{ success: boolean; data: null; message: string }>(
      `/stores/${storeId}/schedule/overrides/${overrideId}`,
    ),
};
