import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import NotificationsIcon from "@mui/icons-material/Notifications";

import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { useNotifications } from "../hooks/useNotifications";
import { usePriorityNotifications } from "../hooks/usePriorityNotifications";

const VIEWED_KEY = "notification-viewed-ids-v1";
const PAGE_SIZES = [5, 10, 15, 20];
const TOP_SIZES = [10, 15, 20];

function loadViewedIds() {
  try {
    const raw = localStorage.getItem(VIEWED_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistViewedIds(viewedIds) {
  localStorage.setItem(VIEWED_KEY, JSON.stringify(Array.from(viewedIds)));
}

export function NotificationsPage() {
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [topN, setTopN] = useState(10);
  const [activeTab, setActiveTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewedIds, setViewedIds] = useState(() => new Set(loadViewedIds()));

  useEffect(() => {
    persistViewedIds(viewedIds);
  }, [viewedIds]);

  const allFeed = useNotifications({
    page,
    limit,
    notificationType: filter,
    enabled: true,
    refreshKey,
  });

  const priorityFeed = usePriorityNotifications({
    topN,
    notificationType: filter,
    enabled: activeTab === 1,
    refreshKey,
  });

  const visibleFeed = activeTab === 0 ? allFeed : priorityFeed;
  const visibleNotifications = visibleFeed.notifications ?? [];
  const totalPages = visibleFeed.totalPages ?? 1;
  const loading = visibleFeed.loading;
  const error = visibleFeed.error;
  const unreadCount = visibleNotifications.filter((notification) => !notification.isRead && !viewedIds.has(notification.id)).length;
  const viewedCount = visibleNotifications.length - unreadCount;

  function handleFilterChange(newFilter) {
    setFilter(newFilter);
    setPage(1);
  }

  function handleLimitChange(event) {
    setLimit(Number(event.target.value));
    setPage(1);
  }

  function handleTopNChange(event) {
    setTopN(Number(event.target.value));
  }

  function handlePageChange(_, newPage) {
    setPage(newPage);
  }

  function handleViewed(notification) {
    setViewedIds((current) => {
      const next = new Set(current);

      next.add(notification.id);

      return next;
    });
  }

  function handleRefresh() {
    setRefreshKey((current) => current + 1);
  }

  const summaryLabel = activeTab === 0 ? `${allFeed.total ?? visibleNotifications.length} total loaded` : `${priorityFeed.total ?? visibleNotifications.length} unread candidates`;

  return (
    <Box
      sx={{
        maxWidth: 1240,
        mx: "auto",
        px: { xs: 1.5, sm: 2.5 },
        py: { xs: 2, sm: 3.5 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          border: "1px solid rgba(16, 33, 42, 0.08)",
          p: { xs: 2.25, sm: 3 },
          mb: 2.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                display: "grid",
                placeItems: "center",
                borderRadius: 3,
                bgcolor: "rgba(15, 118, 110, 0.1)",
                color: "primary.main",
              }}
            >
              <NotificationsIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ color: "text.primary", lineHeight: 1.1 }}>
                Notifications
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Track new campus updates, prioritize urgent items, and keep viewed notifications separate.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
            <Chip label={`${unreadCount} unread`} color="primary" variant="filled" />
            <Chip label={`${viewedCount} viewed`} variant="outlined" />
            <Chip label={summaryLabel} variant="outlined" sx={{ display: { xs: "none", sm: "inline-flex" } }} />
            <IconButton onClick={handleRefresh} sx={{ border: "1px solid rgba(16, 33, 42, 0.12)" }}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Stack spacing={2}>
          <Tabs
            value={activeTab}
            onChange={(_, nextValue) => setActiveTab(nextValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ minHeight: 44, borderBottom: "1px solid rgba(16, 33, 42, 0.08)" }}
          >
            <Tab label="All notifications" sx={{ minHeight: 44, textTransform: "none", fontWeight: 700 }} />
            <Tab label="Priority inbox" sx={{ minHeight: 44, textTransform: "none", fontWeight: 700 }} />
          </Tabs>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "320px 1fr" },
              gap: 2,
              alignItems: "start",
            }}
          >
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.85)",
              }}
            >
              <Typography variant="overline" color="text.secondary">
                Filter
              </Typography>
              <Box sx={{ mt: 1 }}>
                <NotificationFilter value={filter} onChange={handleFilterChange} />
              </Box>
            </Paper>

            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.85)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                  justifyContent: "space-between",
                  alignItems: { xs: "stretch", sm: "center" },
                }}
              >
                <Box>
                  <Typography variant="subtitle2" fontWeight={800}>
                    {activeTab === 0 ? "All notifications" : "Priority inbox"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activeTab === 0
                      ? "Browse paginated updates with viewed-state tracking."
                      : "Top unread notifications ranked by type and recency."}
                  </Typography>
                </Box>

                {activeTab === 0 ? (
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel id="page-size-label">Page size</InputLabel>
                    <Select
                      labelId="page-size-label"
                      value={limit}
                      label="Page size"
                      onChange={handleLimitChange}
                    >
                      {PAGE_SIZES.map((size) => (
                        <MenuItem key={size} value={size}>
                          {size} items
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel id="top-n-label">Top N</InputLabel>
                    <Select
                      labelId="top-n-label"
                      value={topN}
                      label="Top N"
                      onChange={handleTopNChange}
                    >
                      {TOP_SIZES.map((size) => (
                        <MenuItem key={size} value={size}>
                          Top {size}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Box>
            </Paper>
          </Box>
        </Stack>
      </Paper>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity={visibleFeed.source === "fallback" ? "warning" : "error"} sx={{ mb: 3 }}>
          {visibleFeed.source === "fallback"
            ? `Live API unavailable, showing fallback notifications. ${error}`
            : `Failed to load notifications: ${error}`}
        </Alert>
      )}

      <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2.5 }, bgcolor: "transparent" }}>
        {visibleNotifications.length === 0 && !loading ? (
          <Alert severity="info">No notifications match the current filters.</Alert>
        ) : (
          <Stack spacing={1.25}>
            {visibleNotifications.map((notification, index) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                isViewed={viewedIds.has(notification.id)}
                onClick={handleViewed}
                rank={activeTab === 1 ? index + 1 : undefined}
                highlight={activeTab === 1 && index === 0}
              />
            ))}
          </Stack>
        )}

        {activeTab === 0 && totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              shape="rounded"
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
}

