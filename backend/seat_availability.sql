-- ============================================================
-- RAILWAY RESERVATION SYSTEM — SEAT AVAILABILITY SYSTEM
-- Rolling 10-day schedule with pg_cron automation
-- Compatible with Neon PostgreSQL
-- ============================================================


-- ============================================================
-- PART 1: SCHEMA CHANGES
-- Run these once to fix existing tables
-- ============================================================

-- 1a. Fix journey_date in bookings — change String to DATE
--     (Skip if already DATE type)
ALTER TABLE bookings
    ALTER COLUMN journey_date TYPE DATE
    USING journey_date::DATE;

-- 1b. Fix journey_date in waiting_list — same fix
ALTER TABLE waiting_list
    ALTER COLUMN journey_date TYPE DATE
    USING journey_date::DATE;

-- 1c. Add composite index on bookings for fast per-date queries
CREATE INDEX IF NOT EXISTS idx_bookings_train_date_class
    ON bookings (train_id, journey_date, seat_class);

CREATE INDEX IF NOT EXISTS idx_bookings_journey_date
    ON bookings (journey_date);

CREATE INDEX IF NOT EXISTS idx_bookings_status
    ON bookings (status);

-- 1d. Add composite index on waiting_list
CREATE INDEX IF NOT EXISTS idx_wl_train_date_class
    ON waiting_list (train_id, journey_date, seat_class);


-- ============================================================
-- PART 2: CREATE seat_availability TABLE
-- One row per (train_id, journey_date, seat_class)
-- ============================================================

CREATE TABLE IF NOT EXISTS seat_availability (
    id                  SERIAL PRIMARY KEY,

    -- Foreign key to trains master table
    train_id            INTEGER NOT NULL
                            REFERENCES trains(id) ON DELETE CASCADE,

    -- The specific date this availability record is for
    journey_date        DATE NOT NULL,

    -- Seat class: GENERAL, SLEEPER, AC_3, AC_2, AC_1
    seat_class          VARCHAR(20) NOT NULL
                            CHECK (seat_class IN ('GENERAL','SLEEPER','AC_3','AC_2','AC_1')),

    -- Copied from trains table at generation time
    -- Allows per-date fare overrides (e.g. Tatkal pricing) in future
    fare                NUMERIC(10,2) NOT NULL DEFAULT 0,

    -- Seat counts
    total_seats         INTEGER NOT NULL DEFAULT 0,
    available_seats     INTEGER NOT NULL DEFAULT 0,
    booked_seats        INTEGER NOT NULL DEFAULT 0,
    wl_count            INTEGER NOT NULL DEFAULT 0,  -- current waitlist depth

    -- Metadata
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- CRITICAL: prevent duplicate records for same train+date+class
    CONSTRAINT uq_seat_availability
        UNIQUE (train_id, journey_date, seat_class),

    -- Data integrity: available + booked must not exceed total
    CONSTRAINT chk_seats_valid
        CHECK (available_seats >= 0
           AND booked_seats >= 0
           AND available_seats + booked_seats <= total_seats)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_sa_train_date
    ON seat_availability (train_id, journey_date);

CREATE INDEX IF NOT EXISTS idx_sa_journey_date
    ON seat_availability (journey_date);

CREATE INDEX IF NOT EXISTS idx_sa_available
    ON seat_availability (journey_date, available_seats)
    WHERE available_seats > 0;

-- Auto-update updated_at on any row change
CREATE OR REPLACE FUNCTION update_seat_availability_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sa_updated_at ON seat_availability;
CREATE TRIGGER trg_sa_updated_at
    BEFORE UPDATE ON seat_availability
    FOR EACH ROW EXECUTE FUNCTION update_seat_availability_timestamp();


-- ============================================================
-- PART 3: CORE FUNCTION — generate_seat_availability()
-- Generates availability rows for the next N days
-- Skips days the train doesn't run (days_of_operation)
-- Uses ON CONFLICT to prevent duplicates (idempotent)
-- ============================================================

CREATE OR REPLACE FUNCTION generate_seat_availability(days_ahead INTEGER DEFAULT 10)
RETURNS TABLE(
    inserted_rows   INTEGER,
    skipped_rows    INTEGER,
    trains_processed INTEGER
)
LANGUAGE plpgsql AS $$
DECLARE
    v_train         RECORD;
    v_date          DATE;
    v_day_name      TEXT;
    v_inserted      INTEGER := 0;
    v_skipped       INTEGER := 0;
    v_trains        INTEGER := 0;
    v_end_date      DATE := CURRENT_DATE + days_ahead;

    -- Seat class config: (class_name, seats_per_class)
    -- Seats are split proportionally from train.total_seats
    v_classes       TEXT[] := ARRAY['GENERAL','SLEEPER','AC_3','AC_2','AC_1'];
    v_class         TEXT;
    v_fare          NUMERIC;
    v_class_seats   INTEGER;
    v_rows_before   INTEGER;
    v_rows_after    INTEGER;
BEGIN
    -- Loop every active train
    FOR v_train IN
        SELECT id, train_number, train_name,
               total_seats, days_of_operation,
               price_general, price_sleeper,
               price_ac3, price_ac2, price_ac1
        FROM trains
        WHERE is_active = TRUE
    LOOP
        v_trains := v_trains + 1;

        -- Loop each date from today to today+days_ahead
        v_date := CURRENT_DATE;
        WHILE v_date < v_end_date LOOP

            -- Get short day name (Mon, Tue, Wed...)
            v_day_name := TO_CHAR(v_date, 'Dy');  -- e.g. 'Mon'

            -- Check if this train runs on this day
            -- days_of_operation is stored as "Mon,Wed,Fri,Sat"
            IF v_train.days_of_operation ILIKE ('%' || v_day_name || '%') THEN

                -- Insert one row per seat class
                FOREACH v_class IN ARRAY v_classes LOOP

                    -- Get fare and seat count for this class
                    CASE v_class
                        WHEN 'GENERAL' THEN
                            v_fare        := COALESCE(v_train.price_general, 0);
                            -- General: ~20% of total seats
                            v_class_seats := GREATEST(0, ROUND(v_train.total_seats * 0.20));
                        WHEN 'SLEEPER' THEN
                            v_fare        := COALESCE(v_train.price_sleeper, 0);
                            -- Sleeper: ~40% of total seats
                            v_class_seats := GREATEST(0, ROUND(v_train.total_seats * 0.40));
                        WHEN 'AC_3' THEN
                            v_fare        := COALESCE(v_train.price_ac3, 0);
                            -- AC3: ~20% of total seats
                            v_class_seats := GREATEST(0, ROUND(v_train.total_seats * 0.20));
                        WHEN 'AC_2' THEN
                            v_fare        := COALESCE(v_train.price_ac2, 0);
                            -- AC2: ~12% of total seats
                            v_class_seats := GREATEST(0, ROUND(v_train.total_seats * 0.12));
                        WHEN 'AC_1' THEN
                            v_fare        := COALESCE(v_train.price_ac1, 0);
                            -- AC1: ~8% of total seats
                            v_class_seats := GREATEST(0, ROUND(v_train.total_seats * 0.08));
                        ELSE
                            v_fare        := 0;
                            v_class_seats := 0;
                    END CASE;

                    -- Skip classes with 0 fare (train doesn't offer this class)
                    IF v_fare > 0 AND v_class_seats > 0 THEN

                        GET DIAGNOSTICS v_rows_before = ROW_COUNT;

                        INSERT INTO seat_availability (
                            train_id, journey_date, seat_class,
                            fare, total_seats, available_seats,
                            booked_seats, wl_count, is_active
                        )
                        VALUES (
                            v_train.id, v_date, v_class,
                            v_fare, v_class_seats, v_class_seats,
                            0, 0, TRUE
                        )
                        -- If record already exists, do nothing (idempotent)
                        ON CONFLICT (train_id, journey_date, seat_class)
                        DO NOTHING;

                        GET DIAGNOSTICS v_rows_after = ROW_COUNT;

                        IF v_rows_after > 0 THEN
                            v_inserted := v_inserted + 1;
                        ELSE
                            v_skipped := v_skipped + 1;
                        END IF;

                    END IF;

                END LOOP; -- classes

            END IF; -- days_of_operation check

            v_date := v_date + INTERVAL '1 day';

        END LOOP; -- dates

    END LOOP; -- trains

    RETURN QUERY SELECT v_inserted, v_skipped, v_trains;
END;
$$;


-- ============================================================
-- PART 4: CLEANUP FUNCTION — cleanup_old_availability()
-- Deletes past records (before today) from seat_availability
-- Keeps all future records intact
-- ============================================================

CREATE OR REPLACE FUNCTION cleanup_old_availability()
RETURNS TABLE(deleted_rows INTEGER)
LANGUAGE plpgsql AS $$
DECLARE
    v_deleted INTEGER;
BEGIN
    DELETE FROM seat_availability
    WHERE journey_date < CURRENT_DATE;

    GET DIAGNOSTICS v_deleted = ROW_COUNT;

    RAISE NOTICE 'Cleaned up % old seat_availability records', v_deleted;

    RETURN QUERY SELECT v_deleted;
END;
$$;


-- ============================================================
-- PART 5: MAIN ROLLING SCHEDULE PROCEDURE
-- Called daily by pg_cron
-- 1. Deletes past records
-- 2. Generates next 10 days
-- ============================================================

CREATE OR REPLACE PROCEDURE maintain_rolling_schedule()
LANGUAGE plpgsql AS $$
DECLARE
    v_deleted   INTEGER;
    v_inserted  INTEGER;
    v_skipped   INTEGER;
    v_trains    INTEGER;
BEGIN
    RAISE NOTICE '[%] Starting rolling schedule maintenance...', NOW();

    -- Step 1: Clean up past records
    SELECT deleted_rows INTO v_deleted
    FROM cleanup_old_availability();

    RAISE NOTICE '[%] Deleted % past records', NOW(), v_deleted;

    -- Step 2: Generate next 10 days
    SELECT inserted_rows, skipped_rows, trains_processed
    INTO v_inserted, v_skipped, v_trains
    FROM generate_seat_availability(10);

    RAISE NOTICE '[%] Generated % new records, skipped % existing, across % trains',
        NOW(), v_inserted, v_skipped, v_trains;

    RAISE NOTICE '[%] Rolling schedule maintenance complete.', NOW();
END;
$$;


-- ============================================================
-- PART 6: BOOKING INTEGRATION FUNCTIONS
-- Use these from your FastAPI backend instead of modifying
-- trains.available_seats directly
-- ============================================================

-- 6a. Reserve seats — called when a booking is CONFIRMED
--     Returns TRUE if reservation succeeded, FALSE if not enough seats
CREATE OR REPLACE FUNCTION reserve_seats(
    p_train_id      INTEGER,
    p_journey_date  DATE,
    p_seat_class    VARCHAR(20),
    p_num_seats     INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql AS $$
DECLARE
    v_available INTEGER;
BEGIN
    -- Lock the row for update to prevent race conditions
    SELECT available_seats INTO v_available
    FROM seat_availability
    WHERE train_id = p_train_id
      AND journey_date = p_journey_date
      AND seat_class = p_seat_class
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE NOTICE 'No availability record for train % on % class %',
            p_train_id, p_journey_date, p_seat_class;
        RETURN FALSE;
    END IF;

    IF v_available < p_num_seats THEN
        RETURN FALSE;  -- Not enough seats
    END IF;

    UPDATE seat_availability
    SET available_seats = available_seats - p_num_seats,
        booked_seats    = booked_seats + p_num_seats
    WHERE train_id = p_train_id
      AND journey_date = p_journey_date
      AND seat_class = p_seat_class;

    RETURN TRUE;
END;
$$;


-- 6b. Release seats — called when a booking is CANCELLED
CREATE OR REPLACE FUNCTION release_seats(
    p_train_id      INTEGER,
    p_journey_date  DATE,
    p_seat_class    VARCHAR(20),
    p_num_seats     INTEGER
)
RETURNS VOID
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE seat_availability
    SET available_seats = LEAST(total_seats, available_seats + p_num_seats),
        booked_seats    = GREATEST(0, booked_seats - p_num_seats)
    WHERE train_id = p_train_id
      AND journey_date = p_journey_date
      AND seat_class = p_seat_class;

    -- Also promote first WL booking if seats freed up
    -- (Optional: implement WL promotion logic here)
END;
$$;


-- 6c. Add to waitlist — increments wl_count
CREATE OR REPLACE FUNCTION add_to_waitlist(
    p_train_id      INTEGER,
    p_journey_date  DATE,
    p_seat_class    VARCHAR(20)
)
RETURNS INTEGER  -- Returns the WL number assigned
LANGUAGE plpgsql AS $$
DECLARE
    v_wl_number INTEGER;
BEGIN
    UPDATE seat_availability
    SET wl_count = wl_count + 1
    WHERE train_id = p_train_id
      AND journey_date = p_journey_date
      AND seat_class = p_seat_class
    RETURNING wl_count INTO v_wl_number;

    RETURN COALESCE(v_wl_number, 1);
END;
$$;


-- ============================================================
-- PART 7: QUERY HELPERS
-- Useful views and queries for your API
-- ============================================================

-- View: availability summary per train per date
CREATE OR REPLACE VIEW v_train_availability AS
SELECT
    t.id            AS train_id,
    t.train_number,
    t.train_name,
    t.source,
    t.destination,
    t.departure_time,
    t.arrival_time,
    t.duration,
    sa.journey_date,
    sa.seat_class,
    sa.fare,
    sa.total_seats,
    sa.available_seats,
    sa.booked_seats,
    sa.wl_count,
    CASE
        WHEN sa.available_seats > 0 THEN 'AVAILABLE'
        WHEN sa.wl_count > 0        THEN 'WAITLISTED'
        ELSE                             'SOLD_OUT'
    END AS availability_status
FROM seat_availability sa
JOIN trains t ON t.id = sa.train_id
WHERE sa.journey_date >= CURRENT_DATE
  AND t.is_active = TRUE
ORDER BY sa.journey_date, t.train_number, sa.seat_class;


-- ============================================================
-- PART 8: pg_cron SCHEDULED JOB
-- Runs daily at 00:05 IST (18:35 UTC previous day)
-- Neon supports pg_cron — enable it in Neon dashboard first:
--   Extensions > pg_cron > Enable
-- ============================================================

-- Enable pg_cron extension (run once as superuser)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the rolling maintenance to run every day at 00:05 IST
-- IST = UTC+5:30, so 00:05 IST = 18:35 UTC
SELECT cron.schedule(
    'rolling-schedule-maintenance',   -- job name (unique)
    '35 18 * * *',                    -- cron expression: 18:35 UTC = 00:05 IST
    $$CALL maintain_rolling_schedule()$$
);

-- To verify the job was created:
-- SELECT * FROM cron.job;

-- To manually run the job right now (for testing):
-- CALL maintain_rolling_schedule();

-- To remove the job if needed:
-- SELECT cron.unschedule('rolling-schedule-maintenance');


-- ============================================================
-- PART 9: INITIAL DATA POPULATION
-- Run once after creating the table to populate first 10 days
-- ============================================================

-- Populate initial 10 days of availability
CALL maintain_rolling_schedule();

-- Verify the data was created
SELECT
    t.train_number,
    t.train_name,
    sa.journey_date,
    sa.seat_class,
    sa.available_seats,
    sa.fare
FROM seat_availability sa
JOIN trains t ON t.id = sa.train_id
ORDER BY sa.journey_date, t.train_number, sa.seat_class
LIMIT 50;


-- ============================================================
-- PART 10: USEFUL MAINTENANCE QUERIES
-- ============================================================

-- Check current schedule coverage
SELECT
    MIN(journey_date) AS earliest_date,
    MAX(journey_date) AS latest_date,
    COUNT(DISTINCT journey_date) AS days_covered,
    COUNT(*) AS total_records,
    COUNT(DISTINCT train_id) AS trains_covered
FROM seat_availability
WHERE journey_date >= CURRENT_DATE;

-- Check availability for a specific route and date
-- (Replace values as needed)
SELECT * FROM v_train_availability
WHERE source ILIKE '%New Delhi%'
  AND destination ILIKE '%Mumbai%'
  AND journey_date = CURRENT_DATE + 3;

-- Check pg_cron job status
SELECT
    jobid,
    jobname,
    schedule,
    command,
    active
FROM cron.job
WHERE jobname = 'rolling-schedule-maintenance';

-- View recent job run history
SELECT
    runid,
    jobid,
    status,
    return_message,
    start_time,
    end_time
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;
