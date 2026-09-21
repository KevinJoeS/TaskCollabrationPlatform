import { ListChecks } from 'lucide-react';
import Button from '../components/ui/Button';
import { PageHeader } from '../components/ui/Misc';
import { SkeletonTable } from '../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../components/ui/States';
import TaskTable from '../components/TaskTable';
import { useTasks } from '../hooks/useTasks';
import { useTaskPanel } from '../hooks/useTaskPanel';
import { useDocumentTitle } from '../hooks/useUtilities';

export default function MyTasks() {
  useDocumentTitle('My tasks');
  const { tasks, loading, error, reload } = useTasks('mine');
  const { openTask } = useTaskPanel();
  return (
    <>
      <PageHeader title="My tasks" subtitle="Everything assigned to you, across all projects." />
      {loading ? (
        <SkeletonTable />
      ) : error ? (
        <div className="panel"><ErrorState error={error} onRetry={reload} /></div>
      ) : (
        <TaskTable
          tasks={tasks}
          onOpen={openTask}
          showProject
          showAssignee={false}
          emptyState={<EmptyState icon={ListChecks} title="No tasks assigned." body="Your workload is clear for now." action={<Button to="/projects">Browse projects</Button>} />}
        />
      )}
    </>
  );
}
