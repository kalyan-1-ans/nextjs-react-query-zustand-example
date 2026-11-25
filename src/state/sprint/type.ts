import { z } from 'zod';
import { issueSchema } from '../issue/types';

export const SprintStatusEnum = z.enum(['ACTIVE', 'COMPLETED', 'PLANNED']);
export const sprintSchema = z.object({
  id: z.string(),
  name: z.string(),
  projectId: z.string(),
  goal: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  status: SprintStatusEnum,
  issues: z.array(issueSchema),
});
export type SprintStatus = z.infer<typeof SprintStatusEnum>;
export type Sprint = z.infer<typeof sprintSchema>;
export interface CreateSprintRequest {
  name: string;
  goal: string;
  startDate: Date;
  endDate: Date;
}
