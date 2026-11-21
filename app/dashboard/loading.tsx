import { Spinner } from "@/components/ui/spinner";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
      <Spinner className="size-8 text-primary" />
      <p>Loading console&hellip;</p>
    </div>
  );
}