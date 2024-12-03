import { ScrollArea } from "@/components/ui/scroll-area";

type Notification = {
  id: string;
  title: string;
  description: string;
  date: string;
};

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "New expense added",
    description: "A new expense of $50 was added to your account.",
    date: "2 minutes ago",
  },
  {
    id: "2",
    title: "Budget limit reached",
    description: "You've reached 80% of your monthly budget for groceries.",
    date: "1 hour ago",
  },
  {
    id: "3",
    title: "Bill due soon",
    description: "Your electricity bill is due in 3 days.",
    date: "5 hours ago",
  },
];

export function NotificationList() {
  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-4">
        {mockNotifications.map((notification) => (
          <div
            key={notification.id}
            className="flex flex-col space-y-1 border-b pb-2 last:border-0"
          >
            <h4 className="text-sm font-semibold">{notification.title}</h4>
            <p className="text-sm text-muted-foreground">
              {notification.description}
            </p>
            <span className="text-xs text-muted-foreground">
              {notification.date}
            </span>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
