import { axiosInstance } from '@/utils/axios.instance';
import { Issue, CreateIssueRequest, UpdateIssueRequest } from './types';

const getIssues = async (projectId: string) => {
  const { data } = await axiosInstance.get<Issue[]>(`/api/${projectId}/issues`);
  return data;
};

const getIssuesCount = async (projectId: string) => {
  const { data } = await axiosInstance.get<{ count: number }>(`/api/${projectId}/issues/count`);
  return data;
};

const createIssue = async (projectId: string, issue: CreateIssueRequest) => {
  const { data } = await axiosInstance.post<Issue>(`/api/${projectId}/issues`, issue);
  return data;
};
const updateIssue = async (projectId: string, { id, ...issue }: UpdateIssueRequest) => {
  const { data } = await axiosInstance.patch<Issue>(`/api/${projectId}/issues/${id}`, issue);
  return data;
};
const deleteIssue = async (projectId: string, id: string) => {
  await axiosInstance.delete(`/api/${projectId}/issues/${id}`);
};
export const issuesApi = { createIssue, updateIssue, deleteIssue, getIssuesCount, getIssues };
