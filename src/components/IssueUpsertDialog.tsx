import { useProjectDialogs } from '@/components/project/useProjectDialogs';
import * as yup from 'yup';

import {
  Button,
  Dialog,
  DialogBody,
  DialogHeader,
  DialogTitle,
  IconButton,
  Input,
  Option,
  Select,
  Textarea,
  Typography,
} from '@/components/design-system/ui';

import { useUnCompletedSprintsQuery } from '../state/sprint';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useWatch } from 'react-hook-form';
import { useUsersQuery } from '../state/user';
import { ISSUE_TYPE_COLOR } from '../utils/constants';
import { Divider } from './design-system/Divider';
import { UserSelect } from './design-system/UserSelect';
import { Issue, IssueStatus, IssueStatusEnum, IssueType, IssueTypeEnum } from '@/state/issue/types';
import { useAuthStore } from '@/state/auth/store';
import {
  useCreateIssueMutation,
  useUpdateIssueMutation,
  useDeleteIssueMutation,
} from '@/state/issue';
import { useProjectIdParam } from '@/hooks/useProjectIdParam';

const IssueTypeLabel = {
  [IssueTypeEnum.enum.BUG]: 'Bug',
  [IssueTypeEnum.enum.STORY]: 'Story',
};

const IssueStatusLabel = {
  [IssueStatusEnum.enum.TO_DO]: 'To Do',
  [IssueStatusEnum.enum.IN_PROGRESS]: 'In Progress',
  [IssueStatusEnum.enum.REVIEW]: 'Review',
  [IssueStatusEnum.enum.DONE]: 'Done',
};

const schema = yup.object({
  summary: yup.string().trim().required('Summary is required'),
  description: yup.string().nullable(),
  reporterUserId: yup.string().required('Report cannot be unassigned'),
  assigneeUserId: yup.string().nullable(),
  sprintId: yup.string().nullable(),
  storyPoints: yup
    .number()
    .typeError('Story points must be a number')
    .min(0, 'Story points cannot be negative')
    .nullable()
    .transform((value, originalValue) => (String(originalValue).trim() === '' ? null : value)),
  type: yup.mixed<IssueType>().oneOf(IssueTypeEnum.options).required().default('STORY'),
  status: yup.mixed<IssueStatus>().oneOf(IssueStatusEnum.options).required().default('TO_DO'),
});

type FormValues = yup.InferType<typeof schema>;

const UpsertIssueForm = ({ issue }: { issue?: Issue }) => {
  const { closeDialog } = useProjectDialogs();
  const projectId = useProjectIdParam();
  const { data: usersData, isLoading: usersLoading } = useUsersQuery();
  const { data: sprintsData, isLoading: sprintLoading } = useUnCompletedSprintsQuery({
    projectId: projectId ?? '',
  });
  const createMutation = useCreateIssueMutation();
  const updateMutation = useUpdateIssueMutation();
  const deleteMutation = useDeleteIssueMutation();
  const currentUserId = useAuthStore.use.currentUserId();
  const loadingUpdate = updateMutation.isPending;
  const loadingDelete = deleteMutation.isPending;
  const loadingCreate = createMutation.isPending;
  const loading = loadingUpdate || loadingDelete || loadingCreate;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      assigneeUserId: issue?.assigneeUserId,
      description: issue?.description,
      reporterUserId: issue?.reporterUserId ?? currentUserId ?? '',
      sprintId: issue?.sprintId,
      status: issue?.status ?? IssueStatusEnum.enum.TO_DO,
      storyPoints: issue?.storyPoints,
      summary: issue?.summary,
      type: issue?.type ?? IssueTypeEnum.enum.STORY,
    },
    disabled: loading,
  });

  const selectedReporterId = useWatch({ control, name: 'reporterUserId' });
  const selectedAssigneeUserId = useWatch({ control, name: 'assigneeUserId' });
  const selectedSprintId = useWatch({ control, name: 'sprintId' });
  const selectedType = useWatch({ control, name: 'type' });
  const selectedStatus = useWatch({ control, name: 'status' });

  const onSubmit = (data: FormValues) => {
    if (issue?.id) {
      handleUpdateClick(data);
    } else {
      handleCreateClick(data);
    }
  };

  const normalize = (data: FormValues) => ({
    ...data,
    description: data.description ?? '',
    storyPoints: data.storyPoints ?? 0,
    assigneeUserId: data.assigneeUserId || null,
    sprintId: data.sprintId || null,
  });
  const handleCreateClick = (data: FormValues) =>
    createMutation.mutate(normalize(data), { onSuccess: closeDialog });
  const handleUpdateClick = (data: FormValues) => {
    if (issue)
      updateMutation.mutate({ ...normalize(data), id: issue.id }, { onSuccess: closeDialog });
  };
  const handleDeleteClick = () => {
    if (issue) deleteMutation.mutate(issue, { onSuccess: closeDialog });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
      <DialogHeader className="relative m-0 block">
        {issue?.type && (
          <div className="flex gap-2 items-center h-full mb-3">
            <div
              className={`w-5 h-5 ${
                ISSUE_TYPE_COLOR[selectedType as keyof typeof ISSUE_TYPE_COLOR]
              }`}
            />
            <Typography>{issue?.issueNumber}</Typography>
          </div>
        )}
        <DialogTitle>
          <Typography variant="h4" color="blue-gray">
            {issue?.id ? 'Update' : 'Create'} Issue
          </Typography>
        </DialogTitle>
        <IconButton
          aria-label="Close dialog"
          size="sm"
          variant="text"
          className="!absolute right-3.5 top-3.5"
          onClick={closeDialog}
          disabled={loading}
        >
          <XMarkIcon className="h-4 w-4 stroke-2" />
        </IconButton>
      </DialogHeader>
      <DialogBody className="space-y-8 pb-6">
        <div>
          <Input
            label="Summary"
            error={!!errors.summary}
            {...register('summary')}
            containerProps={{ className: 'min-w-full' }}
          />
          {errors?.summary && (
            <p className="text-sm text-red-500 mt-2">{errors.summary?.message}</p>
          )}
        </div>

        <div>
          {!usersLoading && (
            <UserSelect
              label="Reporter"
              users={usersData ?? []}
              value={selectedReporterId ?? ''}
              onChange={value => setValue('reporterUserId', value ?? '')}
              error={!!errors.reporterUserId}
              disabled={loading}
            />
          )}
          {usersLoading && (
            <Typography
              as="div"
              variant="paragraph"
              className="mb-2 h-10 w-full rounded-md bg-gray-300"
            >
              &nbsp;
            </Typography>
          )}
          {errors?.reporterUserId && (
            <p className="text-sm text-red-500 mt-2">{errors.reporterUserId?.message}</p>
          )}
        </div>

        <div>
          {!usersLoading && (
            <UserSelect
              label="Assignee"
              users={usersData ?? []}
              value={selectedAssigneeUserId ?? ''}
              onChange={value => setValue('assigneeUserId', value)}
              error={!!errors.assigneeUserId}
              disabled={loading}
            />
          )}
          {usersLoading && (
            <Typography
              as="div"
              variant="paragraph"
              className="mb-2 h-10 w-full rounded-md bg-gray-300"
            >
              &nbsp;
            </Typography>
          )}
          {errors?.assigneeUserId && (
            <p className="text-sm text-red-500 mt-2">{errors.assigneeUserId?.message}</p>
          )}
        </div>

        <div>
          <Textarea
            rows={7}
            label="Description"
            error={!!errors.description}
            {...register('description')}
            containerProps={{ className: 'min-w-full' }}
          />
          {errors?.description && (
            <p className="text-sm text-red-500 mt-2">{errors.description?.message}</p>
          )}
        </div>

        <div>
          {!sprintLoading && (
            <Select
              label="Sprint"
              value={selectedSprintId ?? ''}
              onChange={value => setValue('sprintId', value)}
              error={!!errors.sprintId}
              selected={() => sprintsData?.find(s => s.id === selectedSprintId)?.name}
              disabled={loading}
              containerProps={{ className: 'min-w-full' }}
            >
              <Option value="">Backlog</Option>
              {issue?.sprintId && !sprintsData?.some(sprint => sprint.id === issue.sprintId) && (
                <Option value={issue.sprintId}>Completed sprint</Option>
              )}
              {sprintsData?.map(sprint => (
                <Option key={sprint.id} value={sprint.id}>
                  {sprint.name}
                </Option>
              ))}
            </Select>
          )}
          {sprintLoading && (
            <Typography
              as="div"
              variant="paragraph"
              className="mb-2 h-10 w-full rounded-md bg-gray-300"
            >
              &nbsp;
            </Typography>
          )}

          {errors?.assigneeUserId && (
            <p className="text-sm text-red-500 mt-2">{errors.assigneeUserId?.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Input
              label="Story points"
              error={!!errors.storyPoints}
              {...register('storyPoints')}
              containerProps={{ className: 'min-w-full' }}
            />
            {errors?.storyPoints && (
              <p className="text-sm text-red-500 mt-2">{errors.storyPoints?.message}</p>
            )}
          </div>
          <div>
            <Select
              label="Type"
              value={selectedType as string}
              onChange={value => setValue('type', value as IssueType)}
              error={!!errors.type}
              selected={() => IssueTypeLabel[selectedType as IssueType]}
              disabled={loading}
              containerProps={{ className: 'min-w-0' }}
            >
              <Option value={IssueTypeEnum.enum.STORY}>
                {IssueTypeLabel[IssueTypeEnum.enum.STORY]}
              </Option>
              <Option value={IssueTypeEnum.enum.BUG}>
                {IssueTypeLabel[IssueTypeEnum.enum.BUG]}
              </Option>
            </Select>
          </div>
          <div>
            <Select
              label="Status"
              value={selectedStatus as string}
              onChange={value => setValue('status', value as IssueStatus)}
              error={!!errors.type}
              selected={() => IssueStatusLabel[selectedStatus as IssueStatus]}
              disabled={loading}
              containerProps={{ className: 'min-w-0' }}
            >
              {Object.entries(IssueStatusLabel).map(([key, label]) => (
                <Option value={key} key={key}>
                  {label}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <Button onClick={closeDialog} variant="text" disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loadingUpdate || loadingCreate} disabled={loading}>
            {issue?.id ? 'Save  ' : 'Create'}
          </Button>
        </div>

        {issue?.id && (
          <>
            <Divider />

            <div className="flex">
              <Button
                variant="outlined"
                className="ml-auto flex items-center gap-2"
                loading={loadingDelete}
                disabled={loading}
                onClick={handleDeleteClick}
              >
                Delete
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </div>
          </>
        )}
      </DialogBody>
    </form>
  );
};

export function IssueUpsertDialog() {
  const { dialog, closeDialog } = useProjectDialogs();
  const isOpen = dialog?.type === 'issue';
  const data = dialog?.type === 'issue' ? dialog.issue : undefined;

  return (
    <Dialog
      size="sm"
      open={isOpen}
      handler={closeDialog}
      className="p-4"
      dismiss={{ outsidePress: false }}
    >
      {isOpen && <UpsertIssueForm key={data?.id ?? 'new'} issue={data} />}
    </Dialog>
  );
}
