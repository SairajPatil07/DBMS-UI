// services.js — Uses mock data mirroring the Oracle DB (no backend required)
// All operations simulate SQL queries: JOINs, Aggregates, Cascade Deletes, Transactions

import {
  plans, trainers, members, payments, attendance, equipment
} from './mockData';

// ----------------------------------------------------------------
// DASHBOARD — Simulates aggregate queries across 3 tables
// SELECT COUNT, SUM, GROUP BY from Members + Payments + Plans
// ----------------------------------------------------------------
export const getDashboardStats = async () => {
  const totalMembers  = members.length;
  const activeMembers = members.filter(m => m.status === 'Active').length;
  const expiringSoon  = members.filter(m => m.status === 'Expiring Soon').length;
  const monthlyRevenue = payments
    .filter(p => p.status === 'Paid' && p.payment_date.startsWith('2026'))
    .reduce((sum, p) => sum + p.amount, 0);

  // Simulate: GROUP BY month revenue trend
  const revenueTrend = [
    { MONTH_LABEL: 'Jan', REVENUE: 10500 },
    { MONTH_LABEL: 'Feb', REVENUE: 8000  },
    { MONTH_LABEL: 'Mar', REVENUE: 12500 },
    { MONTH_LABEL: 'Apr', REVENUE: monthlyRevenue },
  ];

  return { totalMembers, activeMembers, expiringSoon, monthlyRevenue, revenueTrend };
};

// ----------------------------------------------------------------
// NOTIFICATIONS — Simulates notification queries
// ----------------------------------------------------------------
export const getNotifications = async () => {
  const today = new Date();
  const notifications = [];

  members.forEach(m => {
    const expiry = new Date(m.expiry_date);
    const diff   = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    if (diff >= 0 && diff <= 3) {
      notifications.push({ type: 'warning', message: `${m.name}'s membership expires in ${diff} day(s)` });
    }
  });

  payments.filter(p => p.status === 'Pending').forEach(p => {
    notifications.push({ type: 'danger', message: `Payment of ₹${p.amount} pending for ${p.member_name}` });
  });

  return notifications;
};

// ----------------------------------------------------------------
// MEMBERS — GET all (simulates LEFT JOIN Members + Plans + Trainers)
// ----------------------------------------------------------------
export const getMembersList = async (search = '', status = 'All') => {
  return members.filter(m => {
    const matchSearch = !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search);
    const matchStatus = status === 'All' || m.status === status;
    return matchSearch && matchStatus;
  });
};

// ----------------------------------------------------------------
// MEMBERS — GET profile (simulates multi-table JOIN)
// ----------------------------------------------------------------
export const getMemberProfile = async (id) => {
  const member = members.find(m => m.member_id === parseInt(id));
  if (!member) return null;

  const plan    = plans.find(p => p.plan_id === member.plan_id);
  const trainer = trainers.find(t => t.trainer_id === member.trainer_id);
  const memberPayments   = payments.filter(p => p.member_id === member.member_id);
  const memberAttendance = attendance.filter(a => a.member_id === member.member_id);

  return {
    ...member,
    plan_name:        plan?.plan_name,
    plan_price:       plan?.price,
    duration_months:  plan?.duration_months,
    trainer_name:     trainer?.name || null,
    specialization:   trainer?.specialization || null,
    payments:         memberPayments,
    attendanceCount:  memberAttendance.length,
  };
};

// ----------------------------------------------------------------
// MEMBERS — POST (simulates INSERT INTO Members)
// ----------------------------------------------------------------
export const addMember = async (data) => {
  const plan    = plans.find(p => p.plan_id === parseInt(data.plan_id));
  const trainer = trainers.find(t => t.trainer_id === parseInt(data.trainer_id));
  const newId   = Math.max(...members.map(m => m.member_id)) + 1;
  const expiry  = plan
    ? new Date(Date.now() + plan.duration_months * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    : null;

  const newMember = {
    member_id:    newId,
    name:         data.name,
    phone:        data.phone,
    email:        data.email || null,
    gender:       data.gender,
    join_date:    new Date().toISOString().split('T')[0],
    expiry_date:  expiry,
    plan_id:      parseInt(data.plan_id) || null,
    trainer_id:   parseInt(data.trainer_id) || null,
    status:       'Active',
    plan_name:    plan?.plan_name || 'None',
    trainer_name: trainer?.name   || null,
  };
  members.push(newMember);
  return { message: 'Member added', member_id: newId };
};

// ----------------------------------------------------------------
// MEMBERS — DELETE (simulates ON DELETE CASCADE)
// Cascades to Payments + Attendance (like FK in Oracle)
// ----------------------------------------------------------------
export const deleteMember = async (id) => {
  const idx = members.findIndex(m => m.member_id === parseInt(id));
  if (idx > -1) {
    members.splice(idx, 1);
    // Cascade: remove related payments
    const toKeepPay = payments.filter(p => p.member_id !== parseInt(id));
    payments.length = 0;
    toKeepPay.forEach(p => payments.push(p));
    // Cascade: remove related attendance
    const toKeepAtt = attendance.filter(a => a.member_id !== parseInt(id));
    attendance.length = 0;
    toKeepAtt.forEach(a => attendance.push(a));
  }
  return { message: 'Member deleted (cascade: payments and attendance removed)' };
};

// ----------------------------------------------------------------
// PLANS
// ----------------------------------------------------------------
export const getPlans = async () => plans;

export const addPlan = async (data) => {
  const newId = Math.max(...plans.map(p => p.plan_id)) + 1;
  plans.push({ plan_id: newId, ...data, price: parseFloat(data.price), duration_months: parseInt(data.duration_months) });
  return { message: 'Plan created' };
};

// ----------------------------------------------------------------
// TRAINERS — with member count (simulates COUNT aggregate)
// ----------------------------------------------------------------
export const getTrainers = async () => {
  return trainers.map(t => ({
    ...t,
    TOTAL_MEMBERS: members.filter(m => m.trainer_id === t.trainer_id).length,
  }));
};

export const addTrainer = async (data) => {
  const newId = Math.max(...trainers.map(t => t.trainer_id)) + 1;
  trainers.push({ trainer_id: newId, ...data, total_members: 0 });
  return { message: 'Trainer added' };
};

// ----------------------------------------------------------------
// PAYMENTS — filter by status
// ----------------------------------------------------------------
export const getPayments = async (status = 'All') => {
  return payments
    .filter(p => status === 'All' || p.status === status)
    .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
};

// ----------------------------------------------------------------
// PAYMENTS — POST (simulates INSERT + UPDATE Members.status trigger)
// ----------------------------------------------------------------
export const addPayment = async (member_id, amount, payment_mode = 'Cash') => {
  const member  = members.find(m => m.member_id === parseInt(member_id));
  const newId   = Math.max(...payments.map(p => p.payment_id)) + 1;
  const newPay  = {
    payment_id:   newId,
    member_id:    parseInt(member_id),
    member_name:  member?.name || 'Unknown',
    plan_name:    member?.plan_name || '',
    amount:       parseFloat(amount),
    payment_date: new Date().toISOString().split('T')[0],
    payment_mode,
    status:       'Paid',
  };
  payments.push(newPay);

  // Simulate TRIGGER: trg_payment_after_insert — auto-update member status
  if (member) {
    member.status = 'Active';
    const plan = plans.find(p => p.plan_id === member.plan_id);
    if (plan) {
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + plan.duration_months);
      member.expiry_date = expiry.toISOString().split('T')[0];
    }
  }
  return { message: 'Payment recorded. Member status updated to Active (Trigger simulation).' };
};

// ----------------------------------------------------------------
// ATTENDANCE — GET by date
// ----------------------------------------------------------------
export const getAttendance = async (date = '') => {
  const target = date || new Date().toISOString().split('T')[0];
  return attendance.filter(a => a.check_in_date === target);
};

// ----------------------------------------------------------------
// ATTENDANCE — POST (simulates MERGE — no duplicates per day)
// ----------------------------------------------------------------
export const markAttendance = async (member_id) => {
  const today  = new Date().toISOString().split('T')[0];
  const exists = attendance.find(a => a.member_id === parseInt(member_id) && a.check_in_date === today);
  if (exists) return { message: 'Already marked present today' };

  const member = members.find(m => m.member_id === parseInt(member_id));
  const newId  = attendance.length > 0 ? Math.max(...attendance.map(a => a.attendance_id)) + 1 : 1;
  attendance.unshift({
    attendance_id: newId,
    member_id:     parseInt(member_id),
    member_name:   member?.name || 'Unknown',
    check_in_date: today,
    check_in_time: new Date().toTimeString().split(' ')[0],
    status:        'Present',
  });
  return { message: 'Attendance marked' };
};

// ----------------------------------------------------------------
// EQUIPMENT
// ----------------------------------------------------------------
export const getEquipment = async () => [...equipment];

export const updateEquipmentStatus = async (id, status) => {
  const eq = equipment.find(e => e.equipment_id === parseInt(id));
  if (eq) eq.status = status;
  return { message: 'Equipment updated' };
};
