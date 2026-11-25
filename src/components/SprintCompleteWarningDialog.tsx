import { useProjectDialogs } from '@/components/project/useProjectDialogs';
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  IconButton,
  Typography,
} from '@/components/design-system/ui';
import { ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export function SprintCompleteWarningDialog() {
  const { dialog, closeDialog } = useProjectDialogs();
  const isOpen = dialog?.type === 'sprint-complete-warning';

  return (
    <Dialog open={isOpen} handler={closeDialog}>
      <DialogHeader>
        <DialogTitle>
          <Typography variant="h5" color="blue-gray" className="text-center w-full">
            Warning
          </Typography>
        </DialogTitle>
        <IconButton
          aria-label="Close dialog"
          size="sm"
          variant="text"
          className="!absolute right-3.5 top-3.5"
          onClick={closeDialog}
        >
          <XMarkIcon className="h-4 w-4 stroke-2" />
        </IconButton>
      </DialogHeader>
      <DialogBody divider className="grid place-items-center gap-4">
        <ExclamationCircleIcon className="h-12 w-12 stroke-2" />
        <Typography variant="h4">Sprint cannot be completed!</Typography>
        <Typography className="text-center font-normal">
          There are pending issues in the sprint. Complete them or move them to another sprint.
        </Typography>
      </DialogBody>
      <DialogFooter className="space-x-2">
        <Button variant="gradient" onClick={closeDialog}>
          Ok, Got it
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
