-- ================================================================
-- GYM MANAGEMENT SYSTEM - SEED DATA (Oracle SQL) — FIXED VERSION
-- Uses subqueries instead of hardcoded IDs to handle identity sequences
-- SET DEFINE OFF disables substitution variable prompts in SQL*Plus / LiveSQL
SET DEFINE OFF;
-- Run AFTER schema.sql
-- ================================================================

-- ----------------------------------------------------------------
-- Users
-- ----------------------------------------------------------------
INSERT INTO Users (username, password, role) VALUES ('admin',         'admin123',  'Admin');
INSERT INTO Users (username, password, role) VALUES ('trainer_alex',  'alex123',   'Trainer');
INSERT INTO Users (username, password, role) VALUES ('trainer_sarah', 'sarah123',  'Trainer');

-- ----------------------------------------------------------------
-- Plans
-- ----------------------------------------------------------------
INSERT INTO Plans (plan_name, duration_months, price, description)
VALUES ('Basic', 1, 1000.00, 'Gym access + locker facility');

INSERT INTO Plans (plan_name, duration_months, price, description)
VALUES ('Pro', 3, 2500.00, 'Gym access + locker + diet consultation');

INSERT INTO Plans (plan_name, duration_months, price, description)
VALUES ('Elite', 12, 8000.00, 'All access + personal trainer + spa');

-- ----------------------------------------------------------------
-- Trainers
-- ----------------------------------------------------------------
INSERT INTO Trainers (name, specialization, phone, email, hire_date)
VALUES ('Alex Johnson', 'Bodybuilding and Powerlifting', '9876543210', 'alex@ironforge.com', DATE '2023-01-15');

INSERT INTO Trainers (name, specialization, phone, email, hire_date)
VALUES ('Sarah Miller', 'Cardio and CrossFit', '9876543211', 'sarah@ironforge.com', DATE '2023-03-20');

-- ----------------------------------------------------------------
-- Members  (use plan_name/phone to resolve FKs — no hardcoded IDs)
-- ----------------------------------------------------------------
INSERT INTO Members (name, phone, email, gender, join_date, expiry_date, plan_id, trainer_id, status)
VALUES ('John Doe', '9898989898', 'john@email.com', 'Male', DATE '2025-10-01', DATE '2026-05-01',
    (SELECT plan_id FROM Plans WHERE plan_name = 'Pro'),
    (SELECT trainer_id FROM Trainers WHERE phone = '9876543210'),
    'Active');

INSERT INTO Members (name, phone, email, gender, join_date, expiry_date, plan_id, trainer_id, status)
VALUES ('Jane Smith', '7878787878', 'jane@email.com', 'Female', DATE '2025-12-05', DATE '2026-04-08',
    (SELECT plan_id FROM Plans WHERE plan_name = 'Basic'),
    NULL,
    'Expiring Soon');

INSERT INTO Members (name, phone, email, gender, join_date, expiry_date, plan_id, trainer_id, status)
VALUES ('Mike Tyson', '8888888888', 'mike@email.com', 'Male', DATE '2025-01-15', DATE '2026-01-15',
    (SELECT plan_id FROM Plans WHERE plan_name = 'Elite'),
    (SELECT trainer_id FROM Trainers WHERE phone = '9876543211'),
    'Expired');

INSERT INTO Members (name, phone, email, gender, join_date, expiry_date, plan_id, trainer_id, status)
VALUES ('Priya Sharma', '9999988888', 'priya@email.com', 'Female', DATE '2026-01-10', DATE '2026-07-10',
    (SELECT plan_id FROM Plans WHERE plan_name = 'Pro'),
    (SELECT trainer_id FROM Trainers WHERE phone = '9876543210'),
    'Active');

INSERT INTO Members (name, phone, email, gender, join_date, expiry_date, plan_id, trainer_id, status)
VALUES ('Ravi Kumar', '7777766666', 'ravi@email.com', 'Male', DATE '2026-02-01', DATE '2026-03-01',
    (SELECT plan_id FROM Plans WHERE plan_name = 'Basic'),
    NULL,
    'Expired');

-- ----------------------------------------------------------------
-- Payments  (resolve member_id via phone — no hardcoded IDs)
-- ----------------------------------------------------------------
INSERT INTO Payments (member_id, amount, payment_date, payment_mode, status)
VALUES ((SELECT member_id FROM Members WHERE phone = '9898989898'), 2500.00, DATE '2026-01-01', 'UPI', 'Paid');

INSERT INTO Payments (member_id, amount, payment_date, payment_mode, status)
VALUES ((SELECT member_id FROM Members WHERE phone = '7878787878'), 1000.00, DATE '2025-12-05', 'Cash', 'Paid');

INSERT INTO Payments (member_id, amount, payment_date, payment_mode, status)
VALUES ((SELECT member_id FROM Members WHERE phone = '8888888888'), 8000.00, DATE '2025-01-15', 'Card', 'Paid');

INSERT INTO Payments (member_id, amount, payment_date, payment_mode, status)
VALUES ((SELECT member_id FROM Members WHERE phone = '8888888888'), 8000.00, DATE '2026-01-15', 'UPI', 'Pending');

INSERT INTO Payments (member_id, amount, payment_date, payment_mode, status)
VALUES ((SELECT member_id FROM Members WHERE phone = '9999988888'), 2500.00, DATE '2026-01-10', 'Cash', 'Paid');

INSERT INTO Payments (member_id, amount, payment_date, payment_mode, status)
VALUES ((SELECT member_id FROM Members WHERE phone = '7777766666'), 1000.00, DATE '2026-02-01', 'UPI', 'Paid');

-- ----------------------------------------------------------------
-- Attendance  (resolve member_id via phone)
-- ----------------------------------------------------------------
INSERT INTO Attendance (member_id, check_in_date, check_in_time, status)
VALUES ((SELECT member_id FROM Members WHERE phone = '9898989898'), DATE '2026-04-05', '07:15:00', 'Present');

INSERT INTO Attendance (member_id, check_in_date, check_in_time, status)
VALUES ((SELECT member_id FROM Members WHERE phone = '7878787878'), DATE '2026-04-05', '08:30:00', 'Present');

INSERT INTO Attendance (member_id, check_in_date, check_in_time, status)
VALUES ((SELECT member_id FROM Members WHERE phone = '9898989898'), DATE '2026-04-04', '07:10:00', 'Present');

INSERT INTO Attendance (member_id, check_in_date, check_in_time, status)
VALUES ((SELECT member_id FROM Members WHERE phone = '9999988888'), DATE '2026-04-04', '09:00:00', 'Present');

INSERT INTO Attendance (member_id, check_in_date, check_in_time, status)
VALUES ((SELECT member_id FROM Members WHERE phone = '9898989898'), DATE '2026-04-03', '07:30:00', 'Present');

INSERT INTO Attendance (member_id, check_in_date, check_in_time, status)
VALUES ((SELECT member_id FROM Members WHERE phone = '9999988888'), DATE '2026-04-03', '09:15:00', 'Present');

-- ----------------------------------------------------------------
-- Equipment
-- ----------------------------------------------------------------
INSERT INTO Equipment (name, category, purchase_date, status)
VALUES ('Treadmill 1',    'Cardio',       DATE '2023-06-01', 'Working');
INSERT INTO Equipment (name, category, purchase_date, status)
VALUES ('Treadmill 2',    'Cardio',       DATE '2023-06-01', 'Maintenance');
INSERT INTO Equipment (name, category, purchase_date, status)
VALUES ('Leg Press',      'Strength',     DATE '2023-08-15', 'Working');
INSERT INTO Equipment (name, category, purchase_date, status)
VALUES ('Dumbbell Set',   'Free Weights', DATE '2022-01-10', 'Working');
INSERT INTO Equipment (name, category, purchase_date, status)
VALUES ('Pull-up Bar',    'Bodyweight',   DATE '2022-01-10', 'Working');
INSERT INTO Equipment (name, category, purchase_date, status)
VALUES ('Rowing Machine', 'Cardio',       DATE '2024-01-01', 'Maintenance');

-- ----------------------------------------------------------------
-- Workouts
-- ----------------------------------------------------------------
INSERT INTO Workouts (name, target, description)
VALUES ('Beginner Full Body', 'Overall Fitness', '3x per week full body routine for beginners');
INSERT INTO Workouts (name, target, description)
VALUES ('PPL Strength Split', 'Hypertrophy', 'Push Pull Legs - 6 day advanced split');
INSERT INTO Workouts (name, target, description)
VALUES ('Cardio Blast', 'Fat Loss', '45-minute high intensity cardio circuit');

-- ----------------------------------------------------------------
-- Member_Workouts (resolve via phone/name)
-- ----------------------------------------------------------------
INSERT INTO Member_Workouts (member_id, workout_id, assigned_date)
VALUES (
    (SELECT member_id FROM Members WHERE phone = '9898989898'),
    (SELECT workout_id FROM Workouts WHERE name = 'PPL Strength Split'),
    DATE '2026-01-05'
);
INSERT INTO Member_Workouts (member_id, workout_id, assigned_date)
VALUES (
    (SELECT member_id FROM Members WHERE phone = '7878787878'),
    (SELECT workout_id FROM Workouts WHERE name = 'Beginner Full Body'),
    DATE '2025-12-10'
);
INSERT INTO Member_Workouts (member_id, workout_id, assigned_date)
VALUES (
    (SELECT member_id FROM Members WHERE phone = '9999988888'),
    (SELECT workout_id FROM Workouts WHERE name = 'Beginner Full Body'),
    DATE '2026-01-12'
);

-- ----------------------------------------------------------------
-- Progress (resolve via phone)
-- ----------------------------------------------------------------
INSERT INTO Progress (member_id, recorded_date, weight_kg, bmi, body_fat_pct)
VALUES ((SELECT member_id FROM Members WHERE phone = '9898989898'), DATE '2026-01-01', 85.0, 26.5, 20.0);
INSERT INTO Progress (member_id, recorded_date, weight_kg, bmi, body_fat_pct)
VALUES ((SELECT member_id FROM Members WHERE phone = '9898989898'), DATE '2026-02-01', 83.0, 25.9, 19.5);
INSERT INTO Progress (member_id, recorded_date, weight_kg, bmi, body_fat_pct)
VALUES ((SELECT member_id FROM Members WHERE phone = '9898989898'), DATE '2026-03-01', 81.5, 25.4, 18.8);
INSERT INTO Progress (member_id, recorded_date, weight_kg, bmi, body_fat_pct)
VALUES ((SELECT member_id FROM Members WHERE phone = '9999988888'), DATE '2026-01-10', 62.0, 23.1, 25.0);
INSERT INTO Progress (member_id, recorded_date, weight_kg, bmi, body_fat_pct)
VALUES ((SELECT member_id FROM Members WHERE phone = '9999988888'), DATE '2026-02-10', 61.0, 22.7, 24.5);

-- ----------------------------------------------------------------
-- Batches
-- ----------------------------------------------------------------
INSERT INTO Batches (name, start_time, end_time, trainer_id, capacity)
VALUES ('Morning Cardio', '06:00', '07:00',
    (SELECT trainer_id FROM Trainers WHERE phone = '9876543211'), 15);
INSERT INTO Batches (name, start_time, end_time, trainer_id, capacity)
VALUES ('Morning Strength', '07:30', '09:00',
    (SELECT trainer_id FROM Trainers WHERE phone = '9876543210'), 10);
INSERT INTO Batches (name, start_time, end_time, trainer_id, capacity)
VALUES ('Evening Strength', '18:00', '20:00',
    (SELECT trainer_id FROM Trainers WHERE phone = '9876543210'), 20);
INSERT INTO Batches (name, start_time, end_time, trainer_id, capacity)
VALUES ('Evening Yoga', '19:00', '20:00',
    (SELECT trainer_id FROM Trainers WHERE phone = '9876543211'), 12);

-- ----------------------------------------------------------------
-- Batch_Members (resolve via phone/batch name)
-- ----------------------------------------------------------------
INSERT INTO Batch_Members (batch_id, member_id)
VALUES (
    (SELECT batch_id FROM Batches WHERE name = 'Morning Cardio'),
    (SELECT member_id FROM Members WHERE phone = '7878787878')
);
INSERT INTO Batch_Members (batch_id, member_id)
VALUES (
    (SELECT batch_id FROM Batches WHERE name = 'Morning Strength'),
    (SELECT member_id FROM Members WHERE phone = '9898989898')
);
INSERT INTO Batch_Members (batch_id, member_id)
VALUES (
    (SELECT batch_id FROM Batches WHERE name = 'Morning Strength'),
    (SELECT member_id FROM Members WHERE phone = '9999988888')
);
INSERT INTO Batch_Members (batch_id, member_id)
VALUES (
    (SELECT batch_id FROM Batches WHERE name = 'Evening Strength'),
    (SELECT member_id FROM Members WHERE phone = '9898989898')
);
INSERT INTO Batch_Members (batch_id, member_id)
VALUES (
    (SELECT batch_id FROM Batches WHERE name = 'Evening Strength'),
    (SELECT member_id FROM Members WHERE phone = '8888888888')
);

-- Commit everything
COMMIT;

-- ================================================================
-- VERIFY: Run these after seeding to confirm data is correct
-- ================================================================
SELECT 'Plans'    AS tbl, COUNT(*) AS rows_inserted FROM Plans     UNION ALL
SELECT 'Trainers',        COUNT(*)                  FROM Trainers  UNION ALL
SELECT 'Members',         COUNT(*)                  FROM Members   UNION ALL
SELECT 'Payments',        COUNT(*)                  FROM Payments  UNION ALL
SELECT 'Attendance',      COUNT(*)                  FROM Attendance UNION ALL
SELECT 'Equipment',       COUNT(*)                  FROM Equipment;
