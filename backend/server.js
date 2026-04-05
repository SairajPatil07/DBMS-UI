// server.js — Gym Management System Express API
const express = require('express');
const cors    = require('cors');
const db      = require('./db');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ================================================================
// ROUTE: Health Check
// ================================================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Gym DBMS API is running' });
});

// ================================================================
// ROUTE: DASHBOARD — Aggregate queries across Members, Payments, Plans
// ================================================================
app.get('/api/dashboard', async (req, res) => {
  try {
    const [total, active, expiring, revenue] = await Promise.all([
      db.execute(`SELECT COUNT(*) AS TOTAL_MEMBERS FROM Members`),
      db.execute(`SELECT COUNT(*) AS ACTIVE_MEMBERS FROM Members WHERE status = 'Active'`),
      db.execute(`SELECT COUNT(*) AS EXPIRING_SOON FROM Members
                  WHERE expiry_date BETWEEN SYSDATE AND SYSDATE + 7 AND status != 'Expired'`),
      db.execute(`SELECT NVL(SUM(amount), 0) AS MONTHLY_REVENUE FROM Payments
                  WHERE EXTRACT(MONTH FROM payment_date) = EXTRACT(MONTH FROM SYSDATE)
                    AND EXTRACT(YEAR  FROM payment_date) = EXTRACT(YEAR  FROM SYSDATE)
                    AND status = 'Paid'`),
    ]);

    // Revenue trend - last 6 months
    const trend = await db.execute(`
      SELECT TO_CHAR(payment_date, 'Mon') AS MONTH_LABEL, SUM(amount) AS REVENUE
      FROM Payments
      WHERE status = 'Paid' AND payment_date >= ADD_MONTHS(SYSDATE, -6)
      GROUP BY TO_CHAR(payment_date, 'Mon'), EXTRACT(YEAR FROM payment_date), EXTRACT(MONTH FROM payment_date)
      ORDER BY EXTRACT(YEAR FROM payment_date), EXTRACT(MONTH FROM payment_date)
    `);

    res.json({
      totalMembers:   total.rows[0].TOTAL_MEMBERS,
      activeMembers:  active.rows[0].ACTIVE_MEMBERS,
      expiringSoon:   expiring.rows[0].EXPIRING_SOON,
      monthlyRevenue: revenue.rows[0].MONTHLY_REVENUE,
      revenueTrend:   trend.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ================================================================
// ROUTE: MEMBERS — GET all (LEFT JOIN Plans)
// ================================================================
app.get('/api/members', async (req, res) => {
  try {
    const { search, status } = req.query;

    let sql = `
      SELECT m.member_id, m.name, m.phone, m.email, m.gender,
             m.join_date, m.expiry_date, m.status,
             p.plan_name, p.price AS plan_price,
             t.name AS trainer_name
      FROM Members m
      LEFT OUTER JOIN Plans    p ON m.plan_id    = p.plan_id
      LEFT OUTER JOIN Trainers t ON m.trainer_id = t.trainer_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (LOWER(m.name) LIKE :search OR m.phone LIKE :search)`;
      params.push(`%${search.toLowerCase()}%`);
    }
    if (status && status !== 'All') {
      sql += ` AND m.status = :status`;
      params.push(status);
    }

    sql += ` ORDER BY m.join_date DESC`;
    const result = await db.execute(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ================================================================
// ROUTE: MEMBERS — GET single profile (multi-table JOIN)
// ================================================================
app.get('/api/members/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [memberRes, paymentsRes, attendanceRes] = await Promise.all([
      // JOIN: Members + Plans + Trainers
      db.execute(`
        SELECT m.member_id, m.name, m.phone, m.email, m.gender,
               m.join_date, m.expiry_date, m.status,
               p.plan_name, p.price AS plan_price, p.duration_months,
               t.name AS trainer_name, t.specialization
        FROM Members m
        LEFT OUTER JOIN Plans    p ON m.plan_id    = p.plan_id
        LEFT OUTER JOIN Trainers t ON m.trainer_id = t.trainer_id
        WHERE m.member_id = :id
      `, [id]),

      // JOIN: Payments for this member
      db.execute(`
        SELECT payment_id, amount, payment_date, payment_mode, status
        FROM Payments
        WHERE member_id = :id
        ORDER BY payment_date DESC
      `, [id]),

      // Attendance count this month
      db.execute(`
        SELECT COUNT(*) AS DAYS_PRESENT
        FROM Attendance
        WHERE member_id = :id
          AND EXTRACT(MONTH FROM check_in_date) = EXTRACT(MONTH FROM SYSDATE)
          AND EXTRACT(YEAR  FROM check_in_date) = EXTRACT(YEAR  FROM SYSDATE)
      `, [id]),
    ]);

    if (!memberRes.rows.length) return res.status(404).json({ error: 'Member not found' });

    res.json({
      ...memberRes.rows[0],
      payments:       paymentsRes.rows,
      attendanceCount: attendanceRes.rows[0].DAYS_PRESENT,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ================================================================
// ROUTE: MEMBERS — POST (Add new member)
// ================================================================
app.post('/api/members', async (req, res) => {
  try {
    const { name, phone, email, gender, plan_id, trainer_id } = req.body;
    const result = await db.execute(
      `INSERT INTO Members (name, phone, email, gender, join_date, expiry_date, plan_id, trainer_id, status)
       VALUES (:name, :phone, :email, :gender, SYSDATE,
               ADD_MONTHS(SYSDATE, (SELECT duration_months FROM Plans WHERE plan_id = :plan_id)),
               :plan_id, :trainer_id, 'Active')
       RETURNING member_id INTO :member_id`,
      {
        name, phone, email: email || null, gender,
        plan_id: plan_id || null,
        trainer_id: trainer_id || null,
        member_id: { type: 2002, dir: 3003 } // oracledb.NUMBER, BIND_OUT
      },
      { autoCommit: true }
    );
    res.status(201).json({ message: 'Member added', member_id: result.outBinds.member_id[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ================================================================
// ROUTE: MEMBERS — DELETE (Cascades to Payments & Attendance)
// ================================================================
app.delete('/api/members/:id', async (req, res) => {
  try {
    await db.execute(
      `DELETE FROM Members WHERE member_id = :id`,
      [req.params.id],
      { autoCommit: true }
    );
    res.json({ message: 'Member deleted (cascade: payments & attendance removed)' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ================================================================
// ROUTE: PLANS
// ================================================================
app.get('/api/plans', async (req, res) => {
  try {
    const result = await db.execute(`SELECT * FROM Plans ORDER BY price ASC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/plans', async (req, res) => {
  try {
    const { plan_name, duration_months, price, description } = req.body;
    await db.execute(
      `INSERT INTO Plans (plan_name, duration_months, price, description)
       VALUES (:plan_name, :duration_months, :price, :description)`,
      { plan_name, duration_months, price, description },
      { autoCommit: true }
    );
    res.status(201).json({ message: 'Plan created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================================================================
// ROUTE: TRAINERS — with member count (Aggregate JOIN)
// ================================================================
app.get('/api/trainers', async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT t.trainer_id, t.name, t.specialization, t.phone, t.email, t.status,
             COUNT(m.member_id) AS total_members
      FROM Trainers t
      LEFT OUTER JOIN Members m ON t.trainer_id = m.trainer_id
      GROUP BY t.trainer_id, t.name, t.specialization, t.phone, t.email, t.status
      ORDER BY t.name
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/trainers', async (req, res) => {
  try {
    const { name, specialization, phone, email } = req.body;
    await db.execute(
      `INSERT INTO Trainers (name, specialization, phone, email)
       VALUES (:name, :specialization, :phone, :email)`,
      { name, specialization, phone, email },
      { autoCommit: true }
    );
    res.status(201).json({ message: 'Trainer added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================================================================
// ROUTE: PAYMENTS
// ================================================================
app.get('/api/payments', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT pay.payment_id, m.name AS member_name, p.plan_name,
             pay.amount, pay.payment_date, pay.payment_mode, pay.status
      FROM Payments pay
      JOIN Members m ON pay.member_id = m.member_id
      LEFT OUTER JOIN Plans p ON m.plan_id = p.plan_id
      WHERE 1=1
    `;
    const params = [];
    if (status && status !== 'All') {
      sql += ` AND pay.status = :status`;
      params.push(status);
    }
    sql += ` ORDER BY pay.payment_date DESC`;
    const result = await db.execute(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/payments', async (req, res) => {
  try {
    const { member_id, amount, payment_mode } = req.body;

    // Step 1: Insert payment
    await db.execute(
      `INSERT INTO Payments (member_id, amount, payment_date, payment_mode, status)
       VALUES (:member_id, :amount, SYSDATE, :payment_mode, 'Paid')`,
      { member_id, amount, payment_mode },
      { autoCommit: false }
    );

    // Step 2: Auto-update member status (simulating a trigger / transaction)
    await db.execute(
      `UPDATE Members SET status = 'Active',
         expiry_date = ADD_MONTHS(SYSDATE,
           (SELECT duration_months FROM Plans WHERE plan_id = (SELECT plan_id FROM Members WHERE member_id = :member_id))
         )
       WHERE member_id = :member_id`,
      { member_id },
      { autoCommit: true }
    );

    res.status(201).json({ message: 'Payment recorded. Member status updated to Active.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================================================================
// ROUTE: ATTENDANCE
// ================================================================
app.get('/api/attendance', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    const result = await db.execute(`
      SELECT a.attendance_id, m.name AS member_name, m.phone,
             a.check_in_date, a.check_in_time, a.status
      FROM Attendance a
      JOIN Members m ON a.member_id = m.member_id
      WHERE TRUNC(a.check_in_date) = TO_DATE(:date, 'YYYY-MM-DD')
      ORDER BY a.check_in_time ASC
    `, [targetDate]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/attendance', async (req, res) => {
  try {
    const { member_id } = req.body;
    // MERGE prevents duplicate entries for same member on same day
    await db.execute(`
      MERGE INTO Attendance a
      USING (SELECT :member_id AS mid FROM DUAL) src
      ON (a.member_id = src.mid AND a.check_in_date = TRUNC(SYSDATE))
      WHEN NOT MATCHED THEN
        INSERT (member_id, check_in_date, check_in_time, status)
        VALUES (src.mid, TRUNC(SYSDATE), TO_CHAR(SYSDATE, 'HH24:MI:SS'), 'Present')
    `, [member_id], { autoCommit: true });
    res.status(201).json({ message: 'Attendance marked' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================================================================
// ROUTE: EQUIPMENT
// ================================================================
app.get('/api/equipment', async (req, res) => {
  try {
    const result = await db.execute(`SELECT * FROM Equipment ORDER BY status ASC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/equipment/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await db.execute(
      `UPDATE Equipment SET status = :status WHERE equipment_id = :id`,
      { status, id: req.params.id },
      { autoCommit: true }
    );
    res.json({ message: 'Equipment status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================================================================
// ROUTE: NOTIFICATIONS — query-based alerts
// ================================================================
app.get('/api/notifications', async (req, res) => {
  try {
    const [expiring, pending, inactive] = await Promise.all([
      db.execute(`
        SELECT name, phone, expiry_date, (expiry_date - TRUNC(SYSDATE)) AS days_left
        FROM Members
        WHERE expiry_date BETWEEN TRUNC(SYSDATE) AND TRUNC(SYSDATE) + 3
          AND status != 'Expired'
      `),
      db.execute(`
        SELECT m.name AS member_name, m.phone, p.amount
        FROM Payments p JOIN Members m ON p.member_id = m.member_id
        WHERE p.status = 'Pending'
      `),
      db.execute(`
        SELECT m.name, m.phone, MAX(a.check_in_date) AS last_seen
        FROM Members m
        LEFT OUTER JOIN Attendance a ON m.member_id = a.member_id
        WHERE m.status = 'Active'
        GROUP BY m.member_id, m.name, m.phone
        HAVING (TRUNC(SYSDATE) - MAX(a.check_in_date)) >= 7 OR MAX(a.check_in_date) IS NULL
      `),
    ]);

    const notifications = [
      ...expiring.rows.map(r => ({ type: 'warning', message: `${r.NAME}'s membership expires in ${r.DAYS_LEFT} day(s)` })),
      ...pending.rows.map(r  => ({ type: 'danger',  message: `Payment of ₹${r.AMOUNT} pending for ${r.MEMBER_NAME}` })),
      ...inactive.rows.map(r => ({ type: 'info',    message: `${r.NAME} hasn't checked in recently` })),
    ];

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================================================================
// START SERVER
// ================================================================
async function startServer() {
  await db.initialize();
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

startServer();
