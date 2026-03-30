---
title: 'BLOB Fields in Databases: When to Store Binary Data and When Not To'
description: 'From a 2015 Stack Overflow answer on MySQL and Firebird BLOB types to the object storage era of 2026 — why the answer to "how to store files in a database" is now "don''t."'
date: 2026-03-29
tags: ['databases', 'stackoverflow', 'architecture', 'storage']
lang: 'en'
---

# BLOB Fields in Databases: When to Store Binary Data and When Not To

In 2015, I answered a question on [Stack Overflow in Portuguese](https://pt.stackoverflow.com/questions/100802) about BLOB fields in MySQL and Firebird. The person wanted to understand what BLOBs were, which types existed, and when to use them. I wrote a detailed answer covering BLOB variants, size limits, Firebird's segment size concept, and the limitations of binary columns. It scored 14 upvotes — a solid reference answer.

Back then, storing files directly in the database was common practice. Eleven years later, it almost never is. Here's what changed, and what the gap teaches us about architecture decisions.

## The 2015 Answer: BLOB Types and Their Limits

BLOB stands for **Binary Large Object**. It's a column type designed to store raw binary data — images, PDFs, serialized objects, anything that isn't text. In MySQL, there are four BLOB variants:

| Type       | Max Size  |
| ---------- | --------- |
| TINYBLOB   | 255 bytes |
| BLOB       | ~64 KB    |
| MEDIUMBLOB | ~16 MB    |
| LONGBLOB   | ~4 GB     |

Each type uses a different number of bytes to store the length prefix, which is why the limits scale the way they do.

For Firebird, I explained the concept of **segment size** — a parameter that controls how binary data is read and written in chunks. The default segment size is 80 bytes, which is absurdly small for anything beyond trivial data. You'd typically set it to something like 16384 (16 KB) to get reasonable read/write performance. Firebird doesn't have the TINY/MEDIUM/LONG variants; it uses a single BLOB type with sub-types (0 for binary, 1 for text).

I also covered the limitations that apply to BLOBs across databases:

- **Can't be used as primary keys.** Binary data can't be indexed efficiently for uniqueness checks.
- **Can't be used in ORDER BY or GROUP BY.** You can't sort by a blob of bytes.
- **No default values.** Most databases won't let you set a default for a BLOB column.
- **Performance degrades with size.** Every query that touches the table pays the cost, even if you don't SELECT the BLOB column (depending on storage engine and row format).

That answer was accurate and useful. If you were building a PHP app in 2015 and needed to store user-uploaded profile pictures, putting them in a MEDIUMBLOB column was a perfectly reasonable approach.

## Why It Worked Then

In 2015, the alternatives to database storage weren't great for small teams. AWS S3 existed, but it required managing IAM credentials, setting up bucket policies, and dealing with SDKs that felt heavy for a simple file upload. Most PHP hosting didn't even support the AWS SDK out of the box.

Storing files in the database had real advantages: everything was in one place, backups captured everything, and ACID guarantees meant your file and its metadata were always consistent. If you deleted a user record, the file went with it. No orphaned files on disk, no broken references.

For a small app with a few hundred users uploading profile pictures, this was fine. The database stayed small enough that nobody noticed the overhead.

## The 2026 Reality: Object Storage Won

Fast forward to 2026, and the answer to "should I store files in a database?" is almost always **no**. Object storage services became the default:

- **Amazon S3** — the original, now with dozens of storage classes for every access pattern
- **Cloudflare R2** — zero egress fees, S3-compatible API
- **Google Cloud Storage**, **Azure Blob Storage**, **MinIO** for self-hosted

These services are purpose-built for binary data. They handle replication, CDN distribution, access control, and lifecycle management. A database is purpose-built for structured, queryable data. Using a database to store binary blobs is like using a spreadsheet as a file system — it works, but you're fighting the tool.

## The Economics Tell the Story

Let's put numbers on it. Say you have 1 TB of user-uploaded files.

**Object storage (S3 Standard):** ~$23/month for storage. Retrieval is pennies per thousand requests. Cloudflare R2 makes egress free entirely.

**Database storage (PostgreSQL on RDS):** That 1 TB of BLOBs means your database is at least 1 TB. Your `db.r6g.xlarge` instance costs ~$350/month. Backups now take hours instead of minutes. Point-in-time recovery stores snapshots of your entire 1 TB database. Replication doubles the storage cost. And every `pg_dump` makes you hold your breath.

But it's not just cost. It's operational pain:

- **Backup time** scales linearly with database size. A 1 TB database takes dramatically longer to back up than a 50 GB database with file references.
- **Replication lag** increases because every INSERT with a 5 MB image is a 5 MB write to the WAL that replicas need to replay.
- **Query performance** suffers even on unrelated tables if the database engine can't keep its working set in memory because BLOBs are eating the buffer pool.
- **Migration complexity** increases. Try running `ALTER TABLE` on a table with 500 GB of blob data.

## The Modern Pattern

The architecture that won is simple:

1. **Upload the file to object storage** (S3, R2, GCS) — get back a key or path
2. **Store the key/URL in the database** — a simple VARCHAR column
3. **Generate signed URLs for access control** — temporary, expiring URLs that grant read access without exposing your bucket

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  filename VARCHAR(255) NOT NULL,
  content_type VARCHAR(127) NOT NULL,
  storage_key VARCHAR(512) NOT NULL,  -- "uploads/2026/03/abc123.pdf"
  size_bytes BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

The file lives in object storage. The metadata lives in the database. Each system does what it's good at. Signed URLs mean you can serve files directly from the CDN without routing through your application server — better performance, lower cost, simpler architecture.

## When BLOBs Are Still Right

There are legitimate cases where storing binary data in the database makes sense:

- **SQLite for local/embedded apps.** If your app is a desktop tool or a mobile app using SQLite, storing small files in the database keeps everything in a single file. No file system to manage, no sync issues.
- **Small binary configs or cryptographic keys.** A 256-byte encryption key or a 2 KB JSON config blob is fine in a database column. The overhead is negligible and you get transactional consistency.
- **Embedded thumbnails under ~100 KB.** If you're generating tiny preview images and need them tightly coupled to a record, a small BLOB avoids the round-trip to object storage.
- **When you need ACID guarantees on the file itself.** If a file and its metadata must be atomically consistent — updated together, rolled back together — a BLOB in a transaction gives you that. Object storage is eventually consistent for cross-service operations.

The threshold I use: if the binary data is under 100 KB and you need transactional consistency, a BLOB is reasonable. Above that, object storage almost always wins.

## Key Takeaway

My 2015 answer explained _how_ to store binary data in a database. If I rewrote it today, I'd lead with _whether you should_.

The question isn't "which BLOB type do I need?" — it's "should this data live in the database at all?" And for files, the answer in 2026 is almost always no. Use object storage, store a reference, and let each system do what it was designed for.

The BLOB types still exist. The segment sizes and limitations I documented haven't changed. But the ecosystem around databases evolved to the point where the right answer to "how do I store files in my database?" is usually "you store them somewhere else and keep a pointer."

Understanding why is what separates choosing a tool from just using whatever's in front of you.
