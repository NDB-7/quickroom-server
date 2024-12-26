const MESSAGE_LIMIT = 5;
const TIME_WINDOW = 2500; // milliseconds

export const rateLimitMap = new Map<string, number[]>();

export default function rateLimit(
  id: string,
  callback: (rateLimited: boolean) => void,
  emit: () => void
) {
  const now = Date.now();

  if (!rateLimitMap.has(id)) rateLimitMap.set(id, []);

  const timestamps = rateLimitMap.get(id);
  const recentTimestamps = timestamps.filter(
    timestamp => now - timestamp < TIME_WINDOW
  );
  recentTimestamps.push(now);
  rateLimitMap.set(id, recentTimestamps);

  if (recentTimestamps.length > MESSAGE_LIMIT) callback(true);
  else {
    callback(false);
    emit();
  }
}
