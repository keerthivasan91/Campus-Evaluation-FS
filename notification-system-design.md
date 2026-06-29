# Notification System Design

## Stage 1

### Core actions

The notification platform should support these actions:

1. Create a notification for one student or many students.
2. List notifications for the current student with pagination and filtering.
3. Fetch unread notifications separately for the inbox badge and priority view.
4. Mark a notification as read or viewed.
5. Delete or archive a notification if cleanup is required later.
6. Push the notification in real time to the browser when a new item is created.

### REST API contract

Base path: `/api/v1/notifications`

Common headers:

```http
Accept: application/json
Content-Type: application/json
Authorization: Bearer <pre-authorized-token>
X-Request-Id: <uuid>
```

#### 1. List notifications

`GET /api/v1/notifications?limit=10&page=1&notification_type=Placement&is_read=false`

Query parameters:

```json
{
	"limit": 10,
	"page": 1,
	"notification_type": "Placement",
	"is_read": false
}
```

Successful response:

```json
{
	"data": [
		{
			"id": "ntf_1001",
			"studentId": 1042,
			"title": "Placement drive scheduled",
			"message": "Apex Labs will visit campus tomorrow at 10:00 AM.",
			"notificationType": "Placement",
			"isRead": false,
			"createdAt": "2026-06-29T08:15:00Z",
			"updatedAt": "2026-06-29T08:15:00Z",
			"priority": 3
		}
	],
	"meta": {
		"page": 1,
		"limit": 10,
		"total": 86,
		"totalPages": 9
	}
}
```

#### 2. Fetch a single notification

`GET /api/v1/notifications/{notificationId}`

Successful response:

```json
{
	"data": {
		"id": "ntf_1001",
		"studentId": 1042,
		"title": "Placement drive scheduled",
		"message": "Apex Labs will visit campus tomorrow at 10:00 AM.",
		"notificationType": "Placement",
		"isRead": false,
		"createdAt": "2026-06-29T08:15:00Z",
		"updatedAt": "2026-06-29T08:15:00Z"
	}
}
```

#### 3. Mark as read

`PATCH /api/v1/notifications/{notificationId}/read`

Request body:

```json
{
	"isRead": true,
	"readAt": "2026-06-29T09:00:00Z"
}
```

Successful response:

```json
{
	"data": {
		"id": "ntf_1001",
		"isRead": true,
		"readAt": "2026-06-29T09:00:00Z"
	}
}
```

#### 4. Create one notification

`POST /api/v1/notifications`

Request body:

```json
{
	"studentId": 1042,
	"title": "Result published",
	"message": "Your internship result has been published.",
	"notificationType": "Result",
	"channel": ["in_app", "email"]
}
```

Successful response:

```json
{
	"data": {
		"id": "ntf_1099",
		"studentId": 1042,
		"title": "Result published",
		"message": "Your internship result has been published.",
		"notificationType": "Result",
		"isRead": false,
		"createdAt": "2026-06-29T10:00:00Z"
	}
}
```

#### 5. Bulk create notifications

`POST /api/v1/notifications/bulk`

Request body:

```json
{
	"studentIds": [1042, 1043, 1044],
	"title": "Placement alert",
	"message": "Shortlisted students must report to the seminar hall.",
	"notificationType": "Placement"
}
```

#### 6. Delete or archive notification

`DELETE /api/v1/notifications/{notificationId}`

### Real-time mechanism

Use Server-Sent Events or WebSockets for push delivery.

Recommended approach:

```text
Browser opens /notifications/stream
Server keeps a per-user socket or SSE connection open
New notification is persisted
Server publishes the event to the connected student channel
Client updates the UI immediately without page refresh
```

SSE is simpler for one-way delivery. WebSockets are better if read receipts, typing indicators, or interactive actions are added later.

## Stage 2

### Suggested storage

Use PostgreSQL.

Reasoning:

1. Notifications are naturally relational because each row belongs to a student and can be queried by type, read state, and time.
2. PostgreSQL supports strong consistency, indexing, partial indexes, JSONB for future payload extensions, and reliable pagination.
3. The workload is mostly read-heavy with predictable filters, which fits relational indexing well.

### Schema

```sql
CREATE TYPE notification_type AS ENUM ('Event', 'Result', 'Placement');

CREATE TABLE notifications (
	id BIGSERIAL PRIMARY KEY,
	student_id BIGINT NOT NULL,
	title VARCHAR(200) NOT NULL,
	message TEXT NOT NULL,
	notification_type notification_type NOT NULL,
	is_read BOOLEAN NOT NULL DEFAULT FALSE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	read_at TIMESTAMPTZ NULL,
	priority SMALLINT NOT NULL DEFAULT 1,
	metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_notifications_student_read_created
	ON notifications (student_id, is_read, created_at DESC);

CREATE INDEX idx_notifications_student_type_created
	ON notifications (student_id, notification_type, created_at DESC);

CREATE INDEX idx_notifications_type_created
	ON notifications (notification_type, created_at DESC);
```

### Scaling risks and fixes

As data volume grows, the main problems are slower range scans, larger sort cost, index bloat, and expensive count queries.

Mitigations:

1. Use composite and partial indexes instead of indexing every column.
2. Paginate with keyset/cursor pagination for deep inboxes.
3. Archive old notifications into monthly partitions or a cold table.
4. Cache unread counts and recent feeds in Redis.
5. Keep write paths lean by avoiding unnecessary secondary indexes.

### Example queries

List a student inbox:

```sql
SELECT id, title, message, notification_type, is_read, created_at
FROM notifications
WHERE student_id = :student_id
	AND is_read = false
ORDER BY created_at DESC
LIMIT :limit OFFSET :offset;
```

Count unread notifications:

```sql
SELECT COUNT(*) AS unread_count
FROM notifications
WHERE student_id = :student_id
	AND is_read = false;
```

Mark one notification as read:

```sql
UPDATE notifications
SET is_read = true,
		read_at = NOW(),
		updated_at = NOW()
WHERE id = :notification_id
	AND student_id = :student_id;
```

## Stage 3

The query is logically acceptable only if the product wants the oldest unread notifications first. In most inboxes it is semantically backwards because the newest unread item is usually shown first.

Why it is slow:

1. `SELECT *` reads unnecessary columns.
2. Filtering by `studentID` and `isRead` without a matching composite index can trigger a large scan.
3. `ORDER BY createdAt ASC` requires sorting the qualifying rows if the index does not already support the order.

What to change:

```sql
SELECT id, student_id, title, message, notification_type, is_read, created_at
FROM notifications
WHERE student_id = 1042
	AND is_read = false
ORDER BY created_at DESC
LIMIT 50;
```

Likely computation cost:

1. Without an index: roughly $O(N)$ scan plus $O(M \log M)$ sort, where $N$ is table size and $M$ is unread rows for the student.
2. With a composite index like `(student_id, is_read, created_at DESC)`: roughly $O(\log N + K)$, where $K$ is the number of returned rows.

Why indexing every column is not good advice:

1. Every extra index increases insert/update/delete cost.
2. It consumes storage and cache memory.
3. The optimizer may still choose a bad plan if the indexes are low-selectivity.
4. The right fix is a targeted composite or covering index that matches the actual filter and sort pattern.

Query for students who got a placement notification in the last 7 days:

```sql
SELECT DISTINCT student_id
FROM notifications
WHERE notification_type = 'Placement'
	AND created_at >= NOW() - INTERVAL '7 days';
```

## Stage 4

If notifications are fetched on every page load, the simplest fix is to stop treating the database as the live rendering tier.

Recommended strategy:

1. Add client-side caching for already fetched pages.
2. Use cursor pagination or infinite scroll instead of loading everything.
3. Cache unread counts and the first page in Redis.
4. Push fresh notifications through WebSockets or SSE so the client does not keep polling.
5. Serve immutable old notifications from a cold archive or partitioned table.

Tradeoffs:

1. Client cache improves UX but can become stale.
2. Redis improves speed but adds another operational dependency.
3. WebSockets/SSE reduce read pressure but require connection management.
4. Cursor pagination scales better than offset pagination but is slightly more complex for the UI.

## Stage 5

The pseudocode is not reliable or fast enough for 50,000 students.

Shortcomings:

1. It performs one email call, one DB write, and one push per student in a tight loop.
2. It is fully synchronous, so one slow recipient delays everyone else.
3. If the process crashes midway, some students are partially processed and some are skipped.
4. There is no retry policy, idempotency key, batching, or dead-letter handling.
5. Email, DB write, and push delivery are treated as if they belong to the same transaction, which they do not.

If `send_email` fails for 200 students midway, retry only those 200. Do not resend the 49,800 already successful deliveries.

Better design:

1. Write the notification once to the database in a transaction.
2. Enqueue delivery jobs in an outbox table or message queue.
3. Let background workers send email and in-app pushes asynchronously.
4. Retry failed jobs with exponential backoff.
5. Make each job idempotent using a batch id and student id.

Saving to DB and sending email should not happen in the same transaction. The DB write is a durable state change; email is an external side effect. Coupling them makes the transaction slow and fragile.

Revised pseudocode:

```text
function notify_all(student_ids, message):
		batch_id = create_uuid()

		begin transaction
				insert notification_batch(batch_id, message, status='queued')
				bulk insert notification rows for all student_ids
				bulk insert outbox rows for email and in-app delivery
		commit transaction

		enqueue batch_id for async workers

worker process(batch_id):
		for chunk in chunked(student_ids, 500):
				for student_id in chunk:
						if not delivery_already_completed(batch_id, student_id, 'email'):
								retry send_email(student_id, message)
								mark_delivery_success(batch_id, student_id, 'email')

						if not delivery_already_completed(batch_id, student_id, 'in_app'):
								push_to_app(student_id, message)
								mark_delivery_success(batch_id, student_id, 'in_app')
```

## Stage 6

Use a bounded min-heap to keep only the top `n` unread notifications in memory.

Priority model:

1. Placement beats Result.
2. Result beats Event.
3. Within the same type, newer notifications rank higher.

Efficient maintenance:

1. Keep a min-heap of size `n`.
2. When a new notification arrives, compute its score once.
3. If the heap is not full, insert it.
4. If the heap is full and the new score is higher than the root, replace the root.
5. This keeps updates at roughly $O(\log n)$ instead of re-sorting the entire list.

The frontend implementation uses the same idea in `notification-app-fe/src/utils/priority.js` to derive the top 10 notifications for the priority inbox.
