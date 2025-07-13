import { parseISO, format } from "date-fns";

export const formatDateDetailed = (date: string): string => {
  const parsed = parseISO(date);
  const formatted = format(parsed, "hh:mm a MMM d, yyyy");

  return formatted;
};

export const formatCompactTimeAgo = (dateString: string): string => {
  const now = new Date();
  const then = parseISO(dateString);
  const diffMs = now.getTime() - then.getTime();

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (seconds < 60) return `${seconds}s`;
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;

  return format(then, "d MMM");
};
