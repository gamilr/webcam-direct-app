export function formatTimeSince(time: number): string {
  //calculate the time since last seen
  const lastSeenTime = new Date(time);
  const currentTime = new Date();
  const timeDiff = currentTime.getTime() - lastSeenTime.getTime();
  const seconds = Math.floor(timeDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  return days > 0
    ? `${days} days ago`
    : hours > 0
      ? `${hours} hours ago`
      : minutes > 0
        ? `${minutes} min ago`
        : `${seconds} sec ago`;
}
