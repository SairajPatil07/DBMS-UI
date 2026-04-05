-- ================================================================
-- GYM MANAGEMENT SYSTEM - ALL IMPORTANT QUERIES (Oracle SQL)
-- Connect to your Oracle schema before running these queries
-- ================================================================


-- ================================================================
-- SECTION 1: DASHBOARD AGGREGATE QUERIES
-- ================================================================

-- Q1: Total members
SELECT COUNT(*) AS total_members FROM Members;

-- Q2: Active members
SELECT COUNT(*) AS active_members FROM Members WHERE status = 'Active';

-- Q3: Members expiring within 7 days
SELECT COUNT(*) AS expiring_soon
FROM Members
WHERE expiry_date BETWEEN SYSDATE AND SYSDATE + 7;

-- Q4: Monthly revenue (current month)
SELECT SUM(amount) AS monthly_revenue
FROM Payments
WHERE EXTRACT(MONTH FROM payment_date) = EXTRACT(MONTH FROM SYSDATE)
  AND EXTRACT(YEAR  FROM payment_date) = EXTRACT(YEAR  FROM SYSDATE)
  AND status = 'Paid';

-- Q5: Revenue trend (last 6 months)
SELECT
    TO_CHAR(payment_date, 'Mon YYYY') AS month_label,
    SUM(amount) AS revenue
FROM Payments
WHERE status = 'Paid'
  AND payment_date >= ADD_MONTHS(SYSDATE, -6)
GROUP BY TO_CHAR(payment_date, 'Mon YYYY'), EXTRACT(YEAR FROM payment_date), EXTRACT(MONTH FROM payment_date)
ORDER BY EXTRACT(YEAR FROM payment_date), EXTRACT(MONTH FROM payment_date);


-- ================================================================
-- SECTION 2: MEMBER QUERIES
-- ================================================================

-- Q6: All members with their plan name (LEFT OUTER JOIN)
SELECT
    m.member_id,
    m.name,
    m.phone,
    m.status,
    m.join_date,
    m.expiry_date,
    p.plan_name,
    p.price
FROM Members m
LEFT OUTER JOIN Plans p ON m.plan_id = p.plan_id
ORDER BY m.join_date DESC;

-- Q7: Full member profile — JOIN across Members, Plans, Trainers
SELECT
    m.member_id,
    m.name          AS member_name,
    m.phone,
    m.email,
    m.gender,
    m.join_date,
    m.expiry_date,
    m.status,
    p.plan_name,
    p.price         AS plan_price,
    p.duration_months,
    t.name          AS trainer_name,
    t.specialization
FROM Members m
LEFT OUTER JOIN Plans    p ON m.plan_id    = p.plan_id
LEFT OUTER JOIN Trainers t ON m.trainer_id = t.trainer_id
WHERE m.member_id = 1;               -- Change member ID as needed

-- Q8: Search member by name or phone (case-insensitive)
SELECT
    m.member_id, m.name, m.phone, m.status, p.plan_name
FROM Members m
LEFT OUTER JOIN Plans p ON m.plan_id = p.plan_id
WHERE LOWER(m.name)  LIKE '%john%'
   OR m.phone LIKE '%989%';

-- Q9: Add a new member (use subquery for plan_id — never hardcode identity IDs)
INSERT INTO Members (name, phone, email, gender, join_date, expiry_date, plan_id, trainer_id, status)
VALUES ('New Member', '9000011111', 'new@email.com', 'Male', SYSDATE, ADD_MONTHS(SYSDATE, 1),
    (SELECT plan_id FROM Plans WHERE plan_name = 'Basic'),
    NULL, 'Active');
COMMIT;

-- Q10: Update member details
UPDATE Members
SET name = 'Updated Name', phone = '9000099999'
WHERE member_id = 1;
COMMIT;

-- Q11: Delete a member (Cascades to Payments and Attendance)
DELETE FROM Members WHERE member_id = 5;
COMMIT;


-- ================================================================
-- SECTION 3: PAYMENT QUERIES
-- ================================================================

-- Q12: All payments with member name (INNER JOIN)
SELECT
    pay.payment_id,
    m.name          AS member_name,
    pay.amount,
    pay.payment_date,
    pay.payment_mode,
    pay.status
FROM Payments pay
JOIN Members m ON pay.member_id = m.member_id
ORDER BY pay.payment_date DESC;

-- Q13: Pending payments with member contact
SELECT
    pay.payment_id,
    m.name   AS member_name,
    m.phone,
    pay.amount,
    pay.payment_date
FROM Payments pay
JOIN Members m ON pay.member_id = m.member_id
WHERE pay.status = 'Pending';

-- Q14a: Record a new payment
INSERT INTO Payments (member_id, amount, payment_date, payment_mode, status)
VALUES (3, 8000.00, SYSDATE, 'UPI', 'Paid');
COMMIT;

-- Q14b: Update member status to Active after payment
UPDATE Members SET status = 'Active' WHERE member_id = 3;
COMMIT;

-- Q15: Payments within a date range
SELECT * FROM Payments
WHERE payment_date BETWEEN DATE '2026-01-01' AND DATE '2026-03-31'
ORDER BY payment_date DESC;


-- ================================================================
-- SECTION 4: ATTENDANCE QUERIES
-- ================================================================

-- Q16: Mark attendance (handles duplicate for same day with MERGE)
MERGE INTO Attendance a
USING (SELECT 1 AS member_id FROM DUAL) src
ON (a.member_id = 1 AND a.check_in_date = TRUNC(SYSDATE))
WHEN NOT MATCHED THEN
    INSERT (member_id, check_in_date, check_in_time, status)
    VALUES (1, TRUNC(SYSDATE), TO_CHAR(SYSDATE, 'HH24:MI:SS'), 'Present');
COMMIT;

-- Q17: Today's check-ins with member details
SELECT
    a.attendance_id,
    m.name          AS member_name,
    m.phone,
    a.check_in_date,
    a.check_in_time,
    a.status
FROM Attendance a
JOIN Members m ON a.member_id = m.member_id
WHERE a.check_in_date = TRUNC(SYSDATE)
ORDER BY a.check_in_time ASC;

-- Q18: Attendance count per member this month
SELECT
    m.member_id,
    m.name,
    COUNT(a.attendance_id) AS days_present
FROM Members m
LEFT OUTER JOIN Attendance a
    ON m.member_id = a.member_id
    AND EXTRACT(MONTH FROM a.check_in_date) = EXTRACT(MONTH FROM SYSDATE)
    AND EXTRACT(YEAR  FROM a.check_in_date) = EXTRACT(YEAR  FROM SYSDATE)
GROUP BY m.member_id, m.name
ORDER BY days_present DESC;


-- ================================================================
-- SECTION 5: TRAINER QUERIES
-- ================================================================

-- Q19: All trainers with their total assigned member count
SELECT
    t.trainer_id,
    t.name          AS trainer_name,
    t.specialization,
    t.phone,
    COUNT(m.member_id) AS total_members_assigned
FROM Trainers t
LEFT OUTER JOIN Members m ON t.trainer_id = m.trainer_id
GROUP BY t.trainer_id, t.name, t.specialization, t.phone;

-- Q20: Members assigned to a specific trainer
SELECT
    m.member_id, m.name, m.phone, m.status, p.plan_name
FROM Members m
LEFT OUTER JOIN Plans p ON m.plan_id = p.plan_id
WHERE m.trainer_id = 1;


-- ================================================================
-- SECTION 6: EQUIPMENT QUERIES
-- ================================================================

-- Q21: All equipment
SELECT * FROM Equipment ORDER BY status ASC;

-- Q22: Count by status
SELECT status, COUNT(*) AS total FROM Equipment GROUP BY status;

-- Q23: Toggle equipment status
UPDATE Equipment SET status = 'Working'     WHERE equipment_id = 2;
UPDATE Equipment SET status = 'Maintenance' WHERE equipment_id = 1;
COMMIT;


-- ================================================================
-- SECTION 7: WORKOUT AND BATCH QUERIES
-- ================================================================

-- Q24: Members and their assigned workouts (3-table JOIN)
SELECT
    w.name      AS workout_name,
    m.name      AS member_name,
    mw.assigned_date
FROM Member_Workouts mw
JOIN Workouts w ON mw.workout_id = w.workout_id
JOIN Members  m ON mw.member_id  = m.member_id;

-- Q25: Batch schedule with trainer and enrolled members
SELECT
    b.name       AS batch_name,
    b.start_time,
    b.end_time,
    t.name       AS trainer_name,
    m.name       AS member_name
FROM Batch_Members bm
JOIN Batches  b ON bm.batch_id  = b.batch_id
JOIN Members  m ON bm.member_id = m.member_id
LEFT OUTER JOIN Trainers t ON b.trainer_id = t.trainer_id
ORDER BY b.start_time;

-- Q26: Progress tracking for a member
SELECT
    m.name,
    pr.recorded_date,
    pr.weight_kg,
    pr.bmi,
    pr.body_fat_pct
FROM Progress pr
JOIN Members m ON pr.member_id = m.member_id
WHERE pr.member_id = 1
ORDER BY pr.recorded_date ASC;


-- ================================================================
-- SECTION 8: NOTIFICATION QUERIES
-- ================================================================

-- Q27: Members expiring within 3 days
SELECT
    member_id,
    name,
    phone,
    expiry_date,
    (expiry_date - TRUNC(SYSDATE)) AS days_left
FROM Members
WHERE expiry_date BETWEEN TRUNC(SYSDATE) AND TRUNC(SYSDATE) + 3
  AND status != 'Expired';

-- Q28: Members with pending payments
SELECT
    m.name      AS member_name,
    m.phone,
    p.amount    AS pending_amount,
    p.payment_date
FROM Payments p
JOIN Members m ON p.member_id = m.member_id
WHERE p.status = 'Pending';

-- Q29: Members who haven't checked in for 7+ days ("Inactive" alert)
SELECT
    m.member_id,
    m.name,
    m.phone,
    MAX(a.check_in_date)                            AS last_seen,
    (TRUNC(SYSDATE) - MAX(a.check_in_date))         AS days_absent
FROM Members m
LEFT OUTER JOIN Attendance a ON m.member_id = a.member_id
WHERE m.status = 'Active'
GROUP BY m.member_id, m.name, m.phone
HAVING (TRUNC(SYSDATE) - MAX(a.check_in_date)) >= 7
    OR MAX(a.check_in_date) IS NULL
ORDER BY days_absent DESC NULLS LAST;


-- ================================================================
-- SECTION 9: TRIGGER (Auto-update member status after payment)
-- ================================================================

CREATE OR REPLACE TRIGGER trg_payment_after_insert
AFTER INSERT ON Payments
FOR EACH ROW
BEGIN
    IF :NEW.status = 'Paid' THEN
        UPDATE Members
        SET status = 'Active',
            expiry_date = ADD_MONTHS(SYSDATE,
                (SELECT duration_months FROM Plans
                 WHERE plan_id = (SELECT plan_id FROM Members WHERE member_id = :NEW.member_id))
            )
        WHERE member_id = :NEW.member_id;
    END IF;
END;
/


-- ================================================================
-- SECTION 10: VIEWS (Saved Virtual Tables)
-- ================================================================

-- V1: Full member view (JOIN across Members + Plans + Trainers)
CREATE OR REPLACE VIEW vw_member_details AS
SELECT
    m.member_id,
    m.name          AS member_name,
    m.phone,
    m.email,
    m.status,
    m.join_date,
    m.expiry_date,
    p.plan_name,
    p.price         AS plan_price,
    t.name          AS trainer_name,
    t.specialization
FROM Members m
LEFT OUTER JOIN Plans    p ON m.plan_id    = p.plan_id
LEFT OUTER JOIN Trainers t ON m.trainer_id = t.trainer_id;

-- Use the view:
SELECT * FROM vw_member_details;

-- V2: Payment summary view
CREATE OR REPLACE VIEW vw_payment_summary AS
SELECT
    pay.payment_id,
    m.name         AS member_name,
    p.plan_name,
    pay.amount,
    pay.payment_date,
    pay.payment_mode,
    pay.status
FROM Payments pay
JOIN Members m ON pay.member_id = m.member_id
LEFT OUTER JOIN Plans p ON m.plan_id = p.plan_id;

SELECT * FROM vw_payment_summary WHERE status = 'Pending';

-- ================================================================
-- ALL QUERIES COMPLETE!
-- ================================================================
