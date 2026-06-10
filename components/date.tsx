import { parseISO, format } from "date-fns";

export default function Date({ dateString }: { dateString?: string }) {
  if (!dateString || !dateString.trim()) {
    return <time>Unknown date</time>;
  }

  const date = parseISO(dateString);
  if (isNaN(date.getTime())) {
    return <time>Unknown date</time>;
  }

  return <time dateTime={dateString}>{format(date, "LLLL d, yyyy")}</time>;
}
