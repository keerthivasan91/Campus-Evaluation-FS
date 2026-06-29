const TYPE_WEIGHT = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function getTimestamp(notification) {
  const value = notification.createdAt ?? notification.updatedAt ?? Date.now();
  const timestamp = new Date(value).getTime();

  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function getPriorityScore(notification) {
  const weight = TYPE_WEIGHT[notification.notificationType] ?? 1;

  return weight * 1_000_000_000_000 + getTimestamp(notification);
}

function comparePriority(left, right) {
  const scoreDiff = getPriorityScore(right) - getPriorityScore(left);

  if (scoreDiff !== 0) {
    return scoreDiff;
  }

  return getTimestamp(right) - getTimestamp(left);
}

export function selectTopNotifications(notifications, topN = 10) {
  if (!Array.isArray(notifications) || notifications.length === 0 || topN <= 0) {
    return [];
  }

  return [...notifications]
    .sort(comparePriority)
    .slice(0, topN);
}

export function getPriorityLabel(notification) {
  const weight = TYPE_WEIGHT[notification.notificationType] ?? 1;

  if (weight === 3) {
    return "High";
  }

  if (weight === 2) {
    return "Medium";
  }

  return "Low";
}