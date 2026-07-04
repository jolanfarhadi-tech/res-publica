import { Card } from "@/components/ui/Card";

export function EmptyState({ message }: { message: string }) {
  return (
    <Card className="flex items-center justify-center py-16 text-center">
      <p className="text-muted">{message}</p>
    </Card>
  );
}
