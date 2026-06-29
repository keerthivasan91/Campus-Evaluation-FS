import { Log } from "../../../logging-middleware/logger.js";

const API_URL = "http://4.224.186.213/evaluation-service/notifications";
const DEFAULT_LIMIT = 10;

function createFallbackNotifications() {
	const now = Date.now();

	return [
		{
			id: "fallback-1",
			studentId: 1042,
			title: "Placement drive scheduled",
			message: "Apex Labs will visit campus tomorrow at 10:00 AM.",
			notificationType: "Placement",
			isRead: false,
			createdAt: new Date(now - 10 * 60 * 1000).toISOString(),
			updatedAt: new Date(now - 10 * 60 * 1000).toISOString(),
		},
		{
			id: "fallback-2",
			studentId: 1042,
			title: "Result published",
			message: "Your internship evaluation result is now available.",
			notificationType: "Result",
			isRead: false,
			createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
			updatedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
		},
		{
			id: "fallback-3",
			studentId: 1042,
			title: "Campus event reminder",
			message: "The product demo event starts at 4:30 PM today.",
			notificationType: "Event",
			isRead: true,
			createdAt: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
			updatedAt: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
		},
		{
			id: "fallback-4",
			studentId: 1042,
			title: "Placement shortlisting update",
			message: "You have been shortlisted for the next interview round.",
			notificationType: "Placement",
			isRead: false,
			createdAt: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
			updatedAt: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
		},
		{
			id: "fallback-5",
			studentId: 1042,
			title: "Result verification complete",
			message: "Your uploaded marksheet has been verified by the office.",
			notificationType: "Result",
			isRead: true,
			createdAt: new Date(now - 18 * 60 * 60 * 1000).toISOString(),
			updatedAt: new Date(now - 18 * 60 * 60 * 1000).toISOString(),
		},
		{
			id: "fallback-6",
			studentId: 1042,
			title: "Seminar hall changed",
			message: "Tomorrow's seminar is moved to the main auditorium.",
			notificationType: "Event",
			isRead: false,
			createdAt: new Date(now - 26 * 60 * 60 * 1000).toISOString(),
			updatedAt: new Date(now - 26 * 60 * 60 * 1000).toISOString(),
		},
		{
			id: "fallback-7",
			studentId: 1042,
			title: "Placement aptitude test",
			message: "Complete the aptitude test before 8:00 PM tonight.",
			notificationType: "Placement",
			isRead: false,
			createdAt: new Date(now - 31 * 60 * 60 * 1000).toISOString(),
			updatedAt: new Date(now - 31 * 60 * 60 * 1000).toISOString(),
		},
		{
			id: "fallback-8",
			studentId: 1042,
			title: "Event registration opened",
			message: "Registrations for the alumni talk are now open.",
			notificationType: "Event",
			isRead: true,
			createdAt: new Date(now - 45 * 60 * 60 * 1000).toISOString(),
			updatedAt: new Date(now - 45 * 60 * 60 * 1000).toISOString(),
		},
		{
			id: "fallback-9",
			studentId: 1042,
			title: "Result pending approval",
			message: "Your final semester result is awaiting approval.",
			notificationType: "Result",
			isRead: false,
			createdAt: new Date(now - 56 * 60 * 60 * 1000).toISOString(),
			updatedAt: new Date(now - 56 * 60 * 60 * 1000).toISOString(),
		},
		{
			id: "fallback-10",
			studentId: 1042,
			title: "Placement offer letter uploaded",
			message: "The offer letter for your selected role is available.",
			notificationType: "Placement",
			isRead: true,
			createdAt: new Date(now - 70 * 60 * 60 * 1000).toISOString(),
			updatedAt: new Date(now - 70 * 60 * 60 * 1000).toISOString(),
		},
		{
			id: "fallback-11",
			studentId: 1042,
			title: "Workshop reminder",
			message: "The resume workshop starts in 30 minutes.",
			notificationType: "Event",
			isRead: false,
			createdAt: new Date(now - 78 * 60 * 60 * 1000).toISOString(),
			updatedAt: new Date(now - 78 * 60 * 60 * 1000).toISOString(),
		},
		{
			id: "fallback-12",
			studentId: 1042,
			title: "Result PDF ready",
			message: "Your results PDF has been generated successfully.",
			notificationType: "Result",
			isRead: false,
			createdAt: new Date(now - 96 * 60 * 60 * 1000).toISOString(),
			updatedAt: new Date(now - 96 * 60 * 60 * 1000).toISOString(),
		},
	];
}

function safeLog(level, message) {
	return Log("notification-app-fe", level, "notifications", message).catch(() => {});
}

function buildHeaders() {
	const headers = {
		Accept: "application/json",
	};

	const token = import.meta.env.VITE_NOTIFICATION_API_TOKEN;

	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	return headers;
}

function normalizeNotification(raw, index = 0) {
	const createdAt = raw.createdAt ?? raw.created_at ?? raw.Timestamp ?? raw.timestamp ?? new Date().toISOString();
	const notificationType = raw.notificationType ?? raw.notification_type ?? raw.Type ?? raw.type ?? "Event";
	const message = raw.message ?? raw.body ?? raw.Message ?? raw.description ?? "No message provided.";
	const title = raw.title ?? raw.subject ?? raw.Title ?? raw.notificationTitle ?? notificationType;

	return {
		id: raw.id ?? raw.notificationId ?? raw.notification_id ?? `${createdAt}-${index}`,
		studentId: raw.studentId ?? raw.studentID ?? raw.student_id ?? null,
		title,
		message,
		notificationType,
		isRead: Boolean(raw.isRead ?? raw.read ?? raw.viewed ?? raw.is_read),
		createdAt,
		updatedAt: raw.updatedAt ?? raw.updated_at ?? createdAt,
		priority: Number(raw.priority ?? 1),
		channel: raw.channel ?? raw.deliveryChannel ?? "in_app",
	};
}

function extractArray(payload) {
	if (Array.isArray(payload)) {
		return payload;
	}

	if (Array.isArray(payload?.data)) {
		return payload.data;
	}

	if (Array.isArray(payload?.notifications)) {
		return payload.notifications;
	}

	if (Array.isArray(payload?.items)) {
		return payload.items;
	}

	return [];
}

function extractMeta(payload, limit, total) {
	const meta = payload?.meta ?? payload?.pagination ?? {};

	const resolvedTotal = Number(meta.total ?? payload?.total ?? payload?.totalCount ?? total);
	const resolvedPage = Number(meta.page ?? payload?.page ?? 1);
	const resolvedLimit = Number(meta.limit ?? payload?.limit ?? limit);
	const resolvedPages = Number(meta.totalPages ?? payload?.totalPages ?? Math.max(1, Math.ceil(resolvedTotal / resolvedLimit)));

	return {
		page: resolvedPage,
		limit: resolvedLimit,
		total: resolvedTotal,
		totalPages: resolvedPages,
	};
}

function paginateFallback(source, page, limit, notificationType) {
	const filtered = source.filter((notification) => {
		if (!notificationType || notificationType === "All") {
			return true;
		}

		return notification.notificationType === notificationType;
	});

	const start = (page - 1) * limit;
	const notifications = filtered.slice(start, start + limit);

	return {
		notifications,
		page,
		limit,
		total: filtered.length,
		totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
		source: "fallback",
	};
}

export async function fetchNotifications({ page = 1, limit = DEFAULT_LIMIT, notificationType = "All", signal } = {}) {
	const query = new URLSearchParams();
	query.set("page", String(page));
	query.set("limit", String(limit));

	if (notificationType && notificationType !== "All") {
		query.set("notification_type", notificationType);
	}

	const label = `page=${page};limit=${limit};type=${notificationType}`;

	try {
		await safeLog("info", `fetch start ${label}`);

		const response = await fetch(`${API_URL}?${query.toString()}`, {
			headers: buildHeaders(),
			signal,
		});

		if (!response.ok) {
			throw new Error(`Notification API responded with ${response.status}`);
		}

		const payload = await response.json();
		const rawNotifications = extractArray(payload);
		const notifications = rawNotifications.map(normalizeNotification);
		const meta = extractMeta(payload, limit, notifications.length);

		await safeLog("info", `fetch success ${label}; count=${notifications.length}`);

		return {
			notifications,
			...meta,
			source: "api",
			error: null,
		};
	} catch (error) {
		await safeLog("warn", `fetch fallback ${label}; reason=${error?.message ?? "unknown"}`);

		const fallback = paginateFallback(createFallbackNotifications(), page, limit, notificationType);

		return {
			notifications: fallback.notifications,
			page: fallback.page,
			limit: fallback.limit,
			total: fallback.total,
			totalPages: fallback.totalPages,
			source: fallback.source,
			error: error?.message ?? "Unable to load notifications.",
		};
	}
}

export async function fetchAllNotifications({ limit = 25, notificationType = "All", maxPages = 20, signal } = {}) {
	const collected = [];
	let totalPages = 1;

	for (let page = 1; page <= maxPages; page += 1) {
		const result = await fetchNotifications({ page, limit, notificationType, signal });
		collected.push(...result.notifications);
		totalPages = result.totalPages ?? totalPages;

		if (result.notifications.length < limit || page >= totalPages) {
			return {
				notifications: collected,
				total: result.total ?? collected.length,
				totalPages,
				page: 1,
				limit,
				source: result.source,
				error: result.error,
			};
		}
	}

	return {
		notifications: collected,
		total: collected.length,
		totalPages,
		page: 1,
		limit,
		source: "api",
		error: null,
	};
}
