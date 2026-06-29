import { useEffect, useState } from "react";

import { fetchNotifications } from "../api/notifications";

export function useNotifications({ page = 1, limit = 10, notificationType = "All", enabled = true, refreshKey = 0 } = {}) {
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

      const data = await fetchNotifications({
        page,
        limit,
        notificationType,
        signal: controller.signal,
      });

      if (cancelled) {
        return;
      }

      setState({
        notifications: data.notifications ?? [],
        total: data.total ?? 0,
        totalPages: data.totalPages ?? 1,
        loading: false,
        error: data.error,
        source: data.source ?? "api",
      });
    };

    load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [enabled, limit, notificationType, page, refreshKey]);

  return state;
}
