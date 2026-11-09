---
title: HTTP Status Codes
description: The codes you'll actually use, and which one to pick for an API.
icon: server
order: 2
---

## The five classes

| Range | Meaning |
|---|---|
| **1xx** | Informational (`101 Switching Protocols` for WebSockets) |
| **2xx** | Success |
| **3xx** | Redirect / use cache |
| **4xx** | Client did something wrong; retrying the same request won't help |
| **5xx** | Server failed; retrying later might work |

## 2xx Success

| Code | Use it when |
|---|---|
| `200 OK` | GET succeeded, or an update returns a body |
| `201 Created` | POST created a resource; add a `Location` header |
| `202 Accepted` | Work queued, will finish later (async jobs) |
| `204 No Content` | Success with no body (DELETE, some PUTs) |

## 3xx Redirects

| Code | Use it when |
|---|---|
| `301 Moved Permanently` | URL changed for good (SEO follows it) |
| `302 Found` / `307 Temporary Redirect` | Temporary; 307 keeps the method and body |
| `308 Permanent Redirect` | Like 301 but keeps the method |
| `304 Not Modified` | Client's cached copy (ETag / If-Modified-Since) is still valid |

## 4xx Client errors

| Code | Use it when |
|---|---|
| `400 Bad Request` | Malformed JSON, missing or invalid fields |
| `401 Unauthorized` | Not authenticated: no or bad token |
| `403 Forbidden` | Authenticated, but not allowed |
| `404 Not Found` | Resource doesn't exist (or you're hiding it) |
| `405 Method Not Allowed` | e.g. DELETE on a read-only route |
| `409 Conflict` | Duplicate, version conflict, state doesn't allow it |
| `410 Gone` | Existed, deleted for good |
| `413 Payload Too Large` | Upload over the limit |
| `415 Unsupported Media Type` | Wrong `Content-Type` |
| `422 Unprocessable Content` | Valid JSON but fails business validation |
| `429 Too Many Requests` | Rate limited; send `Retry-After` |

## 5xx Server errors

| Code | Use it when |
|---|---|
| `500 Internal Server Error` | Unhandled exception |
| `502 Bad Gateway` | Proxy got a bad response from upstream |
| `503 Service Unavailable` | Overloaded or in maintenance; send `Retry-After` |
| `504 Gateway Timeout` | Upstream didn't answer in time |

## Interview gotchas

- **401 vs 403**: 401 = "who are you?", 403 = "I know who you are, and no".
- **400 vs 422**: 400 for syntax, 422 for semantics. Many APIs just use 400; be consistent.
- **PUT / DELETE should be idempotent**: repeating them gives the same result. POST is not.
- **Don't return 200 with `{ error: ... }`**: clients, caches and monitoring rely on the status code.
