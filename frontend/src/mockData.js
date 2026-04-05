// mockData.js — Mirrors exact data inserted into Oracle DB via seed_data.sql
// This data is used by the UI when no backend server is running.

export const plans = [
  { plan_id: 1, plan_name: 'Basic',  duration_months: 1,  price: 1000, description: 'Gym access. Locker facility.' },
  { plan_id: 2, plan_name: 'Pro',    duration_months: 3,  price: 2500, description: 'Gym access. Locker. Diet consultation.' },
  { plan_id: 3, plan_name: 'Elite',  duration_months: 12, price: 8000, description: 'All access. Personal trainer. Spa.' },
];

export const trainers = [
  { trainer_id: 1, name: 'Alex Johnson', specialization: 'Bodybuilding and Powerlifting', phone: '9876543210', email: 'alex@ironforge.com', total_members: 2 },
  { trainer_id: 2, name: 'Sarah Miller', specialization: 'Cardio and CrossFit',          phone: '9876543211', email: 'sarah@ironforge.com', total_members: 1 },
];

export let members = [
  { member_id: 1, name: 'John Doe',     phone: '9898989898', email: 'john@email.com',  gender: 'Male',   join_date: '2025-10-01', expiry_date: '2026-05-01', plan_id: 2, trainer_id: 1, status: 'Active',        plan_name: 'Pro',   trainer_name: 'Alex Johnson' },
  { member_id: 2, name: 'Jane Smith',   phone: '7878787878', email: 'jane@email.com',  gender: 'Female', join_date: '2025-12-05', expiry_date: '2026-04-08', plan_id: 1, trainer_id: null, status: 'Expiring Soon', plan_name: 'Basic', trainer_name: null },
  { member_id: 3, name: 'Mike Tyson',   phone: '8888888888', email: 'mike@email.com',  gender: 'Male',   join_date: '2025-01-15', expiry_date: '2026-01-15', plan_id: 3, trainer_id: 2, status: 'Expired',       plan_name: 'Elite', trainer_name: 'Sarah Miller' },
  { member_id: 4, name: 'Priya Sharma', phone: '9999988888', email: 'priya@email.com', gender: 'Female', join_date: '2026-01-10', expiry_date: '2026-07-10', plan_id: 2, trainer_id: 1, status: 'Active',        plan_name: 'Pro',   trainer_name: 'Alex Johnson' },
  { member_id: 5, name: 'Ravi Kumar',   phone: '7777766666', email: 'ravi@email.com',  gender: 'Male',   join_date: '2026-02-01', expiry_date: '2026-03-01', plan_id: 1, trainer_id: null, status: 'Expired',       plan_name: 'Basic', trainer_name: null },
];

export let payments = [
  { payment_id: 1, member_id: 1, member_name: 'John Doe',     plan_name: 'Pro',   amount: 2500, payment_date: '2026-01-01', payment_mode: 'UPI',  status: 'Paid' },
  { payment_id: 2, member_id: 2, member_name: 'Jane Smith',   plan_name: 'Basic', amount: 1000, payment_date: '2025-12-05', payment_mode: 'Cash', status: 'Paid' },
  { payment_id: 3, member_id: 3, member_name: 'Mike Tyson',   plan_name: 'Elite', amount: 8000, payment_date: '2025-01-15', payment_mode: 'Card', status: 'Paid' },
  { payment_id: 4, member_id: 3, member_name: 'Mike Tyson',   plan_name: 'Elite', amount: 8000, payment_date: '2026-01-15', payment_mode: 'UPI',  status: 'Pending' },
  { payment_id: 5, member_id: 4, member_name: 'Priya Sharma', plan_name: 'Pro',   amount: 2500, payment_date: '2026-01-10', payment_mode: 'Cash', status: 'Paid' },
  { payment_id: 6, member_id: 5, member_name: 'Ravi Kumar',   plan_name: 'Basic', amount: 1000, payment_date: '2026-02-01', payment_mode: 'UPI',  status: 'Paid' },
];

export let attendance = [
  { attendance_id: 1, member_id: 1, member_name: 'John Doe',     check_in_date: '2026-04-05', check_in_time: '07:15:00', status: 'Present' },
  { attendance_id: 2, member_id: 2, member_name: 'Jane Smith',   check_in_date: '2026-04-05', check_in_time: '08:30:00', status: 'Present' },
  { attendance_id: 3, member_id: 1, member_name: 'John Doe',     check_in_date: '2026-04-04', check_in_time: '07:10:00', status: 'Present' },
  { attendance_id: 4, member_id: 4, member_name: 'Priya Sharma', check_in_date: '2026-04-04', check_in_time: '09:00:00', status: 'Present' },
  { attendance_id: 5, member_id: 1, member_name: 'John Doe',     check_in_date: '2026-04-03', check_in_time: '07:30:00', status: 'Present' },
  { attendance_id: 6, member_id: 4, member_name: 'Priya Sharma', check_in_date: '2026-04-03', check_in_time: '09:15:00', status: 'Present' },
];

export let equipment = [
  { equipment_id: 1, name: 'Treadmill 1',    category: 'Cardio',       status: 'Working' },
  { equipment_id: 2, name: 'Treadmill 2',    category: 'Cardio',       status: 'Maintenance' },
  { equipment_id: 3, name: 'Leg Press',      category: 'Strength',     status: 'Working' },
  { equipment_id: 4, name: 'Dumbbell Set',   category: 'Free Weights', status: 'Working' },
  { equipment_id: 5, name: 'Pull-up Bar',    category: 'Bodyweight',   status: 'Working' },
  { equipment_id: 6, name: 'Rowing Machine', category: 'Cardio',       status: 'Maintenance' },
];
