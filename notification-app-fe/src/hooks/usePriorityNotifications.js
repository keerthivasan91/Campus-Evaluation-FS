import { useEffect, useState } from "react";

import { fetchAllNotifications } from "../api/notifications";
import { selectTopNotifications } from "../utils/priority";

export function usePriorityNotifications({ topN = 10, notificationType = "All", enabled = true, refreshKey = 0 } = {}) {
  const [state, setState] = useState({
    notifications: [],
    total: 0,
    totalPages: 1,
    loading: true,
    error: null,
    source: "idle",
  });

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const controller = new AbortController();
    let cancelled = false;

    const load = async () => {
      setState((current) => ({ ...current, loading: true, error: null }));

      const bundle = await fetchAllNotifications({
        limit: 25,
        notificationType,
        maxPages: 20,
        signal: controller.signal,
      });

      if (cancelled) {
        return;
      }

      const unread = (bundle.notifications ?? []).filter((notification) => !notification.isRead);

      setState({
        notifications: selectTopNotifications(unread, topN),
        total: unread.length,
        totalPages: 1,
        loading: false,
        error: bundle.error,
        source: bundle.source ?? "api",
      });
    };

    load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [enabled, notificationType, refreshKey, topN]);

  return state;
}