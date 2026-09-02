-- ADR-15 — give DSAQuestion its natural key.
--
-- (topic, title) is what identifies a question on the Striver sheet. Without a
-- unique constraint the catalogue seed had no key to upsert on, so both seed
-- scripts opened with `deleteMany()` and recreated every row. UserDSAProgress
-- cascades on questionId, so each re-seed silently destroyed the user's solved
-- history. This index is what lets the seed become an upsert.
--
-- Safe to apply: the 191-question sheet has no duplicate (topic, title) pairs,
-- and neither did the database at the time this was written.

CREATE UNIQUE INDEX "DSAQuestion_topic_title_key" ON "DSAQuestion"("topic", "title");
