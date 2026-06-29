import { AccessTime, CheckCircle, NotificationsActive } from "@mui/icons-material";
import { Avatar, Box, Card, CardActionArea, Chip, Typography } from "@mui/material";

import { getPriorityLabel } from "../utils/priority";

const TYPE_STYLES = {
  Placement: {
    background: "rgba(194, 65, 12, 0.12)",
    color: "#9a3412",
  },
  Result: {
    background: "rgba(15, 118, 110, 0.12)",
    color: "#0f766e",
  },
  Event: {
    background: "rgba(37, 99, 235, 0.12)",
    color: "#1d4ed8",
  },
};

function formatRelativeTime(value) {
  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return "Just now";
  }

  const diffMinutes = Math.max(1, Math.round((Date.now() - timestamp) / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.round(diffHours / 24);

  return `${diffDays}d ago`;
}

export function NotificationCard({ notification, isViewed = false, onClick, rank, highlight = false }) {
  const type = notification.notificationType ?? "Event";
  const styles = TYPE_STYLES[type] ?? TYPE_STYLES.Event;
  const priorityLabel = getPriorityLabel(notification);
  const viewed = isViewed || notification.isRead;

  return (
    <Card
      elevation={0}
      sx={{
        position: "relative",
        overflow: "hidden",
        border: "1px solid",
        borderColor: highlight ? "rgba(15, 118, 110, 0.35)" : "rgba(16, 33, 42, 0.08)",
        background: highlight
          ? "linear-gradient(180deg, rgba(15, 118, 110, 0.08), rgba(255, 255, 255, 0.98))"
          : "rgba(255, 255, 255, 0.96)",
        opacity: viewed ? 0.84 : 1,
        transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
        boxShadow: highlight ? "0 16px 40px rgba(15, 118, 110, 0.12)" : "0 10px 28px rgba(16, 33, 42, 0.06)",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 20px 48px rgba(16, 33, 42, 0.1)",
        },
      }}
    >
      <CardActionArea onClick={() => onClick?.(notification)} sx={{ p: 2 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
          <Box
            sx={{
              width: 6,
              alignSelf: "stretch",
              borderRadius: 999,
              bgcolor: styles.color,
              opacity: highlight ? 1 : 0.7,
            }}
          />

          <Avatar
            sx={{
              width: 46,
              height: 46,
              bgcolor: styles.background,
              color: styles.color,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            <NotificationsActive fontSize="small" />
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", gap: 1, justifyContent: "space-between", flexWrap: "wrap" }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                  {notification.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5, lineHeight: 1.55, maxWidth: 780 }}
                >
                  {notification.message}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                <Chip
                  size="small"
                  label={type}
                  sx={{
                    bgcolor: styles.background,
                    color: styles.color,
                    fontWeight: 700,
                  }}
                />
                <Chip
                  size="small"
                  icon={viewed ? <CheckCircle fontSize="small" /> : undefined}
                  label={viewed ? "Viewed" : "New"}
                  color={viewed ? "default" : "primary"}
                  variant={viewed ? "outlined" : "filled"}
                />
                {typeof rank === "number" && (
                  <Chip
                    size="small"
                    label={`#${rank}`}
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />
                )}
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 1.5, mt: 1.5, flexWrap: "wrap", alignItems: "center", color: "text.secondary" }}>
              <Box sx={{ display: "flex", gap: 0.6, alignItems: "center" }}>
                <AccessTime fontSize="small" />
                <Typography variant="caption">{formatRelativeTime(notification.createdAt)}</Typography>
              </Box>
              <Typography variant="caption">Priority: {priorityLabel}</Typography>
            </Box>
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
}