-- ================================================================
-- GYM MANAGEMENT SYSTEM - COMPLETE ORACLE SQL SCHEMA
-- Compatible with: Oracle 12c and above
-- ================================================================

-- NOTE: Oracle does not support CREATE DATABASE inside SQL scripts
-- First run this in SQL*Plus or SQL Developer:
--   CREATE USER gym_admin IDENTIFIED BY password123;
--   GRANT ALL PRIVILEGES TO gym_admin;
--   CONNECT gym_admin/password123;
-- (or just run below under your current schema/user)

-- ================================================================
-- CLEANUP: Drop tables if they already exist (run if re-creating)
-- ================================================================
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Batch_Members   CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Batches         CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Member_Workouts CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Workouts        CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Progress        CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Attendance      CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Payments        CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Members         CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Trainers        CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Plans           CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Users           CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Equipment       CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/


-- ================================================================
-- TABLE 1: Users (Admin / Trainer Login)
-- ================================================================
CREATE TABLE Users (
    user_id     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username    VARCHAR2(100)  NOT NULL UNIQUE,
    password    VARCHAR2(255)  NOT NULL,
    role        VARCHAR2(20)   DEFAULT 'Trainer' NOT NULL,
    created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_user_role CHECK (role IN ('Admin', 'Trainer'))
);

-- ================================================================
-- TABLE 2: Plans (Membership Plans)
-- ================================================================
CREATE TABLE Plans (
    plan_id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    plan_name        VARCHAR2(100)   NOT NULL,
    duration_months  NUMBER(3)       NOT NULL,
    price            NUMBER(10, 2)   NOT NULL,
    description      CLOB,
    created_at       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- TABLE 3: Trainers
-- ================================================================
CREATE TABLE Trainers (
    trainer_id       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name             VARCHAR2(150)  NOT NULL,
    specialization   VARCHAR2(150),
    phone            VARCHAR2(20)   UNIQUE,
    email            VARCHAR2(150)  UNIQUE,
    hire_date        DATE,
    status           VARCHAR2(20)   DEFAULT 'Active',
    created_at       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_trainer_status CHECK (status IN ('Active', 'Inactive'))
);

-- ================================================================
-- TABLE 4: Members
-- References: Plans, Trainers
-- ================================================================
CREATE TABLE Members (
    member_id    NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name         VARCHAR2(150)  NOT NULL,
    phone        VARCHAR2(20)   NOT NULL UNIQUE,
    email        VARCHAR2(150)  UNIQUE,
    address      CLOB,
    dob          DATE,
    gender       VARCHAR2(10),
    join_date    DATE           DEFAULT SYSDATE NOT NULL,
    expiry_date  DATE,
    plan_id      NUMBER,
    trainer_id   NUMBER,
    status       VARCHAR2(20)   DEFAULT 'Active',
    created_at   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_member_gender CHECK (gender IN ('Male', 'Female', 'Other')),
    CONSTRAINT chk_member_status CHECK (status IN ('Active', 'Expiring Soon', 'Expired')),

    CONSTRAINT fk_member_plan
        FOREIGN KEY (plan_id)    REFERENCES Plans(plan_id)    ON DELETE SET NULL,

    CONSTRAINT fk_member_trainer
        FOREIGN KEY (trainer_id) REFERENCES Trainers(trainer_id) ON DELETE SET NULL
);

-- ================================================================
-- TABLE 5: Payments
-- References: Members (ON DELETE CASCADE)
-- ================================================================
CREATE TABLE Payments (
    payment_id     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    member_id      NUMBER         NOT NULL,
    amount         NUMBER(10, 2)  NOT NULL,
    payment_date   DATE           DEFAULT SYSDATE NOT NULL,
    payment_mode   VARCHAR2(30)   DEFAULT 'Cash',
    status         VARCHAR2(20)   DEFAULT 'Paid',
    notes          VARCHAR2(255),
    created_at     TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_pay_mode   CHECK (payment_mode IN ('Cash', 'Card', 'UPI', 'Net Banking')),
    CONSTRAINT chk_pay_status CHECK (status IN ('Paid', 'Pending', 'Failed')),

    CONSTRAINT fk_payment_member
        FOREIGN KEY (member_id) REFERENCES Members(member_id) ON DELETE CASCADE
);

-- ================================================================
-- TABLE 6: Attendance
-- References: Members (ON DELETE CASCADE)
-- ================================================================
CREATE TABLE Attendance (
    attendance_id  NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    member_id      NUMBER        NOT NULL,
    check_in_date  DATE          DEFAULT SYSDATE NOT NULL,
    check_in_time  VARCHAR2(10)  DEFAULT TO_CHAR(SYSDATE, 'HH24:MI:SS'),
    status         VARCHAR2(20)  DEFAULT 'Present',

    -- One entry per member per day
    CONSTRAINT uniq_attendance  UNIQUE (member_id, check_in_date),
    CONSTRAINT chk_att_status   CHECK  (status IN ('Present', 'Absent')),

    CONSTRAINT fk_attendance_member
        FOREIGN KEY (member_id) REFERENCES Members(member_id) ON DELETE CASCADE
);

-- ================================================================
-- TABLE 7: Equipment
-- ================================================================
CREATE TABLE Equipment (
    equipment_id   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name           VARCHAR2(150)  NOT NULL,
    category       VARCHAR2(100),
    purchase_date  DATE,
    status         VARCHAR2(20)   DEFAULT 'Working',
    notes          VARCHAR2(255),
    created_at     TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_equip_status CHECK (status IN ('Working', 'Maintenance', 'Retired'))
);

-- ================================================================
-- TABLE 8: Workouts
-- ================================================================
CREATE TABLE Workouts (
    workout_id   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name         VARCHAR2(150)  NOT NULL,
    target       VARCHAR2(100),
    description  CLOB,
    created_at   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- TABLE 9: Member_Workouts (Many-to-Many)
-- ================================================================
CREATE TABLE Member_Workouts (
    id             NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    member_id      NUMBER  NOT NULL,
    workout_id     NUMBER  NOT NULL,
    assigned_date  DATE    DEFAULT SYSDATE,

    CONSTRAINT fk_mw_member  FOREIGN KEY (member_id)  REFERENCES Members(member_id)  ON DELETE CASCADE,
    CONSTRAINT fk_mw_workout FOREIGN KEY (workout_id) REFERENCES Workouts(workout_id) ON DELETE CASCADE
);

-- ================================================================
-- TABLE 10: Progress (Weight / BMI Tracking)
-- ================================================================
CREATE TABLE Progress (
    progress_id    NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    member_id      NUMBER         NOT NULL,
    recorded_date  DATE           DEFAULT SYSDATE NOT NULL,
    weight_kg      NUMBER(5, 2),
    bmi            NUMBER(4, 2),
    body_fat_pct   NUMBER(4, 2),
    notes          CLOB,

    CONSTRAINT fk_progress_member
        FOREIGN KEY (member_id) REFERENCES Members(member_id) ON DELETE CASCADE
);

-- ================================================================
-- TABLE 11: Batches (Time Slots)
-- ================================================================
CREATE TABLE Batches (
    batch_id    NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        VARCHAR2(100)  NOT NULL,
    start_time  VARCHAR2(10)   NOT NULL,
    end_time    VARCHAR2(10)   NOT NULL,
    trainer_id  NUMBER,
    capacity    NUMBER(3)      DEFAULT 20,
    created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_batch_trainer
        FOREIGN KEY (trainer_id) REFERENCES Trainers(trainer_id) ON DELETE SET NULL
);

-- ================================================================
-- TABLE 12: Batch_Members (Many-to-Many)
-- ================================================================
CREATE TABLE Batch_Members (
    id         NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    batch_id   NUMBER  NOT NULL,
    member_id  NUMBER  NOT NULL,
    joined_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uniq_batch_member UNIQUE (batch_id, member_id),

    CONSTRAINT fk_bm_batch  FOREIGN KEY (batch_id)  REFERENCES Batches(batch_id)  ON DELETE CASCADE,
    CONSTRAINT fk_bm_member FOREIGN KEY (member_id) REFERENCES Members(member_id) ON DELETE CASCADE
);

-- ================================================================
-- ALL TABLES CREATED SUCCESSFULLY!
-- Now run: seed_data.sql
-- ================================================================
