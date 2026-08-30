#!/usr/bin/env bash
#
# Take a restorable dump of the tracker's database (M0-5).
#
# Run this before every migration marked destructive in docs/LLD_v2.md §3
# (MA-4, MA-11, MB-5). Those three rewrite a year of personal history in
# place, and ADR-10's safety net is only half tests — the other half is being
# able to put the data back.
#
# Usage:
#   scripts/backup.sh                       # dump the dev database
#   scripts/backup.sh --label pre-MA-4      # tag the file with the migration
#   scripts/backup.sh --verify              # dump, then restore into a scratch
#                                           # database and drop it, proving the
#                                           # dump actually restores
#   scripts/backup.sh --restore <file>      # restore a dump (asks first)
#
# The dump is taken with `pg_dump` *inside* the postgres container, so no
# postgres client is needed on the host.

set -euo pipefail

CONTAINER="${PPT_POSTGRES_CONTAINER:-ppt_postgres}"
DB_USER="${PPT_DB_USER:-postgres}"
DB_NAME="${PPT_DB_NAME:-personal_progress_assistant}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${PPT_BACKUP_DIR:-$REPO_ROOT/backups}"

LABEL=""
VERIFY=0
RESTORE_FILE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --label)   LABEL="$2"; shift 2 ;;
    --verify)  VERIFY=1; shift ;;
    --restore) RESTORE_FILE="$2"; shift 2 ;;
    -h|--help) sed -n '2,25p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
done

die() { echo "ERROR: $*" >&2; exit 1; }

command -v docker >/dev/null 2>&1 || die "docker is not on PATH."

docker inspect --format '{{.State.Running}}' "$CONTAINER" 2>/dev/null | grep -q true \
  || die "Container '$CONTAINER' is not running. Start it with: docker-compose up -d postgres"

# ----------------------------------------------------------------- restore ---
if [[ -n "$RESTORE_FILE" ]]; then
  [[ -f "$RESTORE_FILE" ]] || die "No such dump: $RESTORE_FILE"

  echo "About to REPLACE the contents of '$DB_NAME' with:"
  echo "  $RESTORE_FILE"
  read -r -p "This destroys the current data. Type the database name to confirm: " confirm
  [[ "$confirm" == "$DB_NAME" ]] || die "Not confirmed — nothing was changed."

  # --clean --if-exists in the dump drops each object before recreating it.
  gunzip -c "$RESTORE_FILE" \
    | docker exec -i "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 >/dev/null
  echo "Restored $DB_NAME from $RESTORE_FILE"
  exit 0
fi

# -------------------------------------------------------------------- dump ---
mkdir -p "$BACKUP_DIR"

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
SUFFIX=""
[[ -n "$LABEL" ]] && SUFFIX="-$(echo "$LABEL" | tr -cs '[:alnum:]._-' '-' | sed 's/-*$//')"
OUTFILE="$BACKUP_DIR/${DB_NAME}-${STAMP}${SUFFIX}.sql.gz"

echo "Dumping '$DB_NAME' from container '$CONTAINER'..."
docker exec "$CONTAINER" pg_dump \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --clean --if-exists --no-owner --no-privileges \
  | gzip > "$OUTFILE"

# A zero-byte or truncated dump is worse than none, because it looks like a
# backup. Fail loudly rather than leave one lying around.
gunzip -t "$OUTFILE" 2>/dev/null || { rm -f "$OUTFILE"; die "Dump is not a valid gzip file."; }
LINES="$(gunzip -c "$OUTFILE" | wc -l | tr -d ' ')"
[[ "$LINES" -gt 20 ]] || { rm -f "$OUTFILE"; die "Dump has only $LINES lines — it did not complete."; }

SIZE="$(du -h "$OUTFILE" | cut -f1)"
echo "Wrote $OUTFILE ($SIZE, $LINES lines)"

# ------------------------------------------------------------------ verify ---
# "Backup runs and produces a restorable dump" (LLD_v2 §7, M0-5). A dump nobody
# has restored is a hypothesis, so --verify actually restores it into a scratch
# database and drops it again.
if [[ "$VERIFY" -eq 1 ]]; then
  SCRATCH="ppt_restore_check_$$"
  echo "Verifying by restoring into scratch database '$SCRATCH'..."

  cleanup() {
    docker exec "$CONTAINER" psql -U "$DB_USER" -d postgres \
      -c "DROP DATABASE IF EXISTS \"$SCRATCH\"" >/dev/null 2>&1 || true
  }
  trap cleanup EXIT

  docker exec "$CONTAINER" psql -U "$DB_USER" -d postgres -c "CREATE DATABASE \"$SCRATCH\"" >/dev/null

  # The dump's DROP statements target objects that do not exist yet in an empty
  # scratch database, so ON_ERROR_STOP is off for the restore itself; the table
  # count below is the real assertion.
  gunzip -c "$OUTFILE" \
    | docker exec -i "$CONTAINER" psql -U "$DB_USER" -d "$SCRATCH" >/dev/null 2>&1

  SRC_TABLES="$(docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -tAc \
    "SELECT count(*) FROM information_schema.tables WHERE table_schema='public'")"
  DST_TABLES="$(docker exec "$CONTAINER" psql -U "$DB_USER" -d "$SCRATCH" -tAc \
    "SELECT count(*) FROM information_schema.tables WHERE table_schema='public'")"

  [[ "$SRC_TABLES" == "$DST_TABLES" ]] \
    || die "Restore check failed: source has $SRC_TABLES tables, restored copy has $DST_TABLES."

  SRC_USERS="$(docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -tAc 'SELECT count(*) FROM "User"')"
  DST_USERS="$(docker exec "$CONTAINER" psql -U "$DB_USER" -d "$SCRATCH" -tAc 'SELECT count(*) FROM "User"')"

  [[ "$SRC_USERS" == "$DST_USERS" ]] \
    || die "Restore check failed: source has $SRC_USERS users, restored copy has $DST_USERS."

  echo "Verified: $DST_TABLES tables and $DST_USERS users restored cleanly."
fi
