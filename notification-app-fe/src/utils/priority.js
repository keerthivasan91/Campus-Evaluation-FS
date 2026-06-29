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

function compareAscPriority(left, right) {
  const leftScore = getPriorityScore(left);
  const rightScore = getPriorityScore(right);

  if (leftScore !== rightScore) {
    return leftScore - rightScore;
  }

  return getTimestamp(left) - getTimestamp(right);
}

class NotificationPriorityHeap {
  constructor(limit) {
    this.limit = limit;
    this.values = [];
  }

  push(notification) {
    if (this.values.length < this.limit) {
      this.values.push(notification);
      this.bubbleUp(this.values.length - 1);
      return;
    }

    if (compareAscPriority(notification, this.values[0]) > 0) {
      this.values[0] = notification;
      this.bubbleDown(0);
    }
  }

  bubbleUp(index) {
    let current = index;

    while (current > 0) {
      const parent = Math.floor((current - 1) / 2);

      if (compareAscPriority(this.values[current], this.values[parent]) >= 0) {
        break;
      }

      [this.values[current], this.values[parent]] = [this.values[parent], this.values[current]];
      current = parent;
    }
  }

  bubbleDown(index) {
    let current = index;

    while (true) {
      const left = current * 2 + 1;
      const right = current * 2 + 2;
      let lowest = current;

      if (left < this.values.length && compareAscPriority(this.values[left], this.values[lowest]) < 0) {
        lowest = left;
      }

      if (right < this.values.length && compareAscPriority(this.values[right], this.values[lowest]) < 0) {
        lowest = right;
      }

      if (lowest === current) {
        break;
      }

      [this.values[current], this.values[lowest]] = [this.values[lowest], this.values[current]];
      current = lowest;
    }
  }

  toSortedArray() {
    return [...this.values].sort((left, right) => compareAscPriority(right, left));
  }
}

export function selectTopNotifications(notifications, topN = 10) {
  if (!Array.isArray(notifications) || notifications.length === 0 || topN <= 0) {
    return [];
  }

  const heap = new NotificationPriorityHeap(topN);

  notifications.forEach((notification) => heap.push(notification));

  return heap.toSortedArray();
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