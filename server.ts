import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JWT_SECRET = process.env.JWT_SECRET || 'sitalax-super-secret-key-change-in-prod';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Database
const db = new Database('sitalax.db');
db.pragma('journal_mode = WAL');

// Setup Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS clinics (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    timezone TEXT DEFAULT 'UTC',
    slotDuration INTEGER DEFAULT 15,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    clinicId TEXT NOT NULL,
    role TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT UNIQUE,
    password_hash TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(clinicId) REFERENCES clinics(id)
  );

  CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    clinicId TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    address TEXT,
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(clinicId) REFERENCES clinics(id)
  );

  CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY,
    clinicId TEXT NOT NULL,
    userId TEXT NOT NULL,
    specialization TEXT,
    consultationFee REAL DEFAULT 0,
    workingHours TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(clinicId) REFERENCES clinics(id),
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    clinicId TEXT NOT NULL,
    doctorId TEXT NOT NULL,
    patientId TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'Booked',
    source TEXT DEFAULT 'Walk-in',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(clinicId) REFERENCES clinics(id),
    FOREIGN KEY(doctorId) REFERENCES doctors(id),
    FOREIGN KEY(patientId) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS automations (
    id TEXT PRIMARY KEY,
    clinicId TEXT NOT NULL,
    type TEXT NOT NULL,
    enabled INTEGER DEFAULT 1,
    delayHours INTEGER DEFAULT 0,
    messageTemplate TEXT,
    FOREIGN KEY(clinicId) REFERENCES clinics(id)
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    clinicId TEXT NOT NULL,
    appointmentId TEXT,
    patientId TEXT NOT NULL,
    consultationFee REAL DEFAULT 0,
    procedureFee REAL DEFAULT 0,
    medicineFee REAL DEFAULT 0,
    discount REAL DEFAULT 0,
    tax REAL DEFAULT 0,
    total REAL DEFAULT 0,
    status TEXT DEFAULT 'Pending',
    paymentMethod TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(clinicId) REFERENCES clinics(id),
    FOREIGN KEY(appointmentId) REFERENCES appointments(id),
    FOREIGN KEY(patientId) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS automation_logs (
    id TEXT PRIMARY KEY,
    clinicId TEXT NOT NULL,
    patientId TEXT NOT NULL,
    appointmentId TEXT,
    type TEXT NOT NULL,
    sentAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bot_sessions (
    id TEXT PRIMARY KEY,
    clinicId TEXT NOT NULL,
    phone TEXT NOT NULL,
    patientId TEXT,
    state TEXT NOT NULL,
    data TEXT,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(clinicId) REFERENCES clinics(id)
  );

  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    clinicName TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Add new columns to clinics table if they don't exist (safe migrations)
try { db.exec("ALTER TABLE clinics ADD COLUMN whatsappProvider TEXT DEFAULT 'none'"); } catch(e) {}
try { db.exec("ALTER TABLE clinics ADD COLUMN whatsappApiKey TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE clinics ADD COLUMN whatsappPhone TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE clinics ADD COLUMN googleReviewLink TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN password_hash TEXT"); } catch(e) {}
try { db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)"); } catch(e) {}

// Ensure demo user exists and has a password hash
const demoUser = db.prepare('SELECT * FROM users WHERE email = ?').get('smith@smilecare.com') as any;
const defaultPassword = bcrypt.hashSync('password123', 10);

if (!demoUser) {
  const clinicId = 'C101';
  const existingClinic = db.prepare('SELECT * FROM clinics WHERE id = ?').get(clinicId);
  if (!existingClinic) {
    db.prepare('INSERT INTO clinics (id, name, address, phone) VALUES (?, ?, ?, ?)').run(clinicId, 'Smile Care Clinic', '123 Main St', '555-0100');
  }
  
  const ownerId = 'U101';
  db.prepare('INSERT INTO users (id, clinicId, role, name, phone, email, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?)').run(ownerId, clinicId, 'Owner', 'Dr. Smith', '555-0101', 'smith@smilecare.com', defaultPassword);
  
  const doctorId = 'D101';
  const existingDoctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(doctorId);
  if (!existingDoctor) {
    db.prepare('INSERT INTO doctors (id, clinicId, userId, specialization, consultationFee, workingHours) VALUES (?, ?, ?, ?, ?, ?)').run(doctorId, clinicId, ownerId, 'General Dentist', 500, 'Mon-Sat 10am-7pm');
  }
} else if (!demoUser.password_hash) {
  // Fix existing demo user missing password hash
  db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(defaultPassword, 'smith@smilecare.com');
}

// Seed initial data if empty
const patientCount = db.prepare('SELECT COUNT(*) as count FROM patients WHERE clinicId = ?').get('C101') as { count: number };
if (patientCount.count <= 1) {
  const clinicId = 'C101';
  
  // Clear existing dummy data to avoid conflicts
  db.prepare('DELETE FROM invoices WHERE clinicId = ?').run(clinicId);
  db.prepare('DELETE FROM appointments WHERE clinicId = ?').run(clinicId);
  db.prepare('DELETE FROM patients WHERE clinicId = ?').run(clinicId);

  const doctorId = 'D101';
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Patients
  const patients = [
    { id: 'P101', name: 'Rahul Kumar', phone: '9876543210', age: 30, gender: 'Male', address: '123 MG Road, Bangalore' },
    { id: 'P102', name: 'Priya Sharma', phone: '9876543211', age: 28, gender: 'Female', address: '456 Indiranagar, Bangalore' },
    { id: 'P103', name: 'Amit Singh', phone: '9876543212', age: 45, gender: 'Male', address: '789 Koramangala, Bangalore' },
    { id: 'P104', name: 'Sneha Gupta', phone: '9876543213', age: 35, gender: 'Female', address: '101 Whitefield, Bangalore' },
    { id: 'P105', name: 'Vikram Patel', phone: '9876543214', age: 50, gender: 'Male', address: '202 Jayanagar, Bangalore' }
  ];

  const insertPatient = db.prepare('INSERT INTO patients (id, clinicId, name, phone, age, gender, address) VALUES (?, ?, ?, ?, ?, ?, ?)');
  patients.forEach(p => insertPatient.run(p.id, clinicId, p.name, p.phone, p.age, p.gender, p.address));

  // Appointments
  const appointments = [
    { id: 'A101', patientId: 'P101', date: yesterdayStr, time: '10:00', status: 'Completed', source: 'Walk-in' },
    { id: 'A102', patientId: 'P102', date: yesterdayStr, time: '11:30', status: 'Completed', source: 'Online' },
    { id: 'A103', patientId: 'P103', date: todayStr, time: '09:00', status: 'Completed', source: 'Walk-in' },
    { id: 'A104', patientId: 'P104', date: todayStr, time: '14:00', status: 'Booked', source: 'Online' },
    { id: 'A105', patientId: 'P105', date: todayStr, time: '16:30', status: 'Booked', source: 'Walk-in' },
    { id: 'A106', patientId: 'P101', date: tomorrowStr, time: '10:00', status: 'Booked', source: 'Online' }
  ];

  const insertAppointment = db.prepare('INSERT INTO appointments (id, clinicId, doctorId, patientId, date, time, status, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  appointments.forEach(a => insertAppointment.run(a.id, clinicId, doctorId, a.patientId, a.date, a.time, a.status, a.source));

  // Invoices
  const invoices = [
    { id: 'INV101', patientId: 'P101', appointmentId: 'A101', consultationFee: 500, procedureFee: 1500, medicineFee: 0, status: 'Paid' },
    { id: 'INV102', patientId: 'P102', appointmentId: 'A102', consultationFee: 500, procedureFee: 0, medicineFee: 200, status: 'Paid' },
    { id: 'INV103', patientId: 'P103', appointmentId: 'A103', consultationFee: 500, procedureFee: 3000, medicineFee: 500, status: 'Pending' }
  ];

  const insertInvoice = db.prepare('INSERT INTO invoices (id, clinicId, appointmentId, patientId, consultationFee, procedureFee, medicineFee, total, status, paymentMethod) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  invoices.forEach(i => {
    const total = i.consultationFee + i.procedureFee + i.medicineFee;
    insertInvoice.run(i.id, clinicId, i.appointmentId, i.patientId, i.consultationFee, i.procedureFee, i.medicineFee, total, i.status, i.status === 'Paid' ? 'UPI' : null);
  });
}

// Public Booking API (No Auth Required)
const publicRouter = express.Router();

const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 booking requests per windowMs
  message: { error: 'Too many booking requests from this IP, please try again later.' }
});

publicRouter.get('/clinics/:id', (req, res) => {
  const clinic = db.prepare('SELECT id, name, address, phone FROM clinics WHERE id = ?').get(req.params.id);
  if (!clinic) return res.status(404).json({ error: 'Clinic not found' });
  
  const doctors = db.prepare(`
    SELECT d.id, d.specialization, d.consultationFee, u.name 
    FROM doctors d JOIN users u ON d.userId = u.id 
    WHERE d.clinicId = ?
  `).all(req.params.id);
  
  res.json({ clinic, doctors });
});

function getAvailableSlots(clinicId: string, doctorId: string, date: string) {
  const clinic = db.prepare('SELECT slotDuration FROM clinics WHERE id = ?').get(clinicId) as any;
  const doctor = db.prepare('SELECT workingHours FROM doctors WHERE id = ? AND clinicId = ?').get(doctorId, clinicId) as any;

  if (!clinic || !doctor) return null;

  let startHour = 9;
  let endHour = 17;
  const match = doctor.workingHours?.match(/(\d+)(am|pm)?\s*-\s*(\d+)(am|pm)?/i);
  if (match) {
    startHour = parseInt(match[1]);
    if (match[2] && match[2].toLowerCase() === 'pm' && startHour !== 12) startHour += 12;
    else if (match[2] && match[2].toLowerCase() === 'am' && startHour === 12) startHour = 0;
    
    endHour = parseInt(match[3]);
    if (match[4] && match[4].toLowerCase() === 'pm' && endHour !== 12) endHour += 12;
    else if (match[4] && match[4].toLowerCase() === 'am' && endHour === 12) endHour = 0;
  }

  const slotDuration = clinic.slotDuration || 15;
  const slots = [];
  
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += slotDuration) {
      const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }

  const booked = db.prepare(`
    SELECT time FROM appointments 
    WHERE doctorId = ? AND date = ? AND status != 'Cancelled'
  `).all(doctorId, date) as any[];
  const bookedTimes = new Set(booked.map(b => b.time));

  return slots.filter(slot => !bookedTimes.has(slot));
}

publicRouter.get('/clinics/:clinicId/doctors/:doctorId/slots', (req, res) => {
  const { clinicId, doctorId } = req.params;
  const { date } = req.query;

  if (!date) return res.status(400).json({ error: 'Date is required' });

  const availableSlots = getAvailableSlots(clinicId, doctorId, date as string);
  if (!availableSlots) return res.status(404).json({ error: 'Not found' });

  res.json({ availableSlots });
});

publicRouter.post('/appointments', bookingLimiter, (req, res) => {
  const { clinicId, doctorId, patientName, patientPhone, date, time } = req.body;
  
  try {
    // 0. Check for conflicts
    const existingApt = db.prepare('SELECT id FROM appointments WHERE doctorId = ? AND date = ? AND time = ? AND status != ?').get(doctorId, date, time, 'Cancelled');
    if (existingApt) {
      return res.status(400).json({ error: 'This time slot is already booked.' });
    }

    // 1. Find or create patient
    let patient = db.prepare('SELECT id FROM patients WHERE clinicId = ? AND phone = ? AND LOWER(name) = LOWER(?)').get(clinicId, patientPhone, patientName) as any;
    let patientId = patient?.id;
    
    if (!patientId) {
      patientId = 'P' + Date.now();
      db.prepare('INSERT INTO patients (id, clinicId, name, phone) VALUES (?, ?, ?, ?)').run(patientId, clinicId, patientName, patientPhone);
    }

    // 2. Create appointment
    const id = 'A' + Date.now();
    db.prepare('INSERT INTO appointments (id, clinicId, doctorId, patientId, date, time, source) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, clinicId, doctorId, patientId, date, time, 'Online');
      
    // 3. Trigger immediate confirmation automation
    triggerAutomation(clinicId, 'confirmation', patientPhone, patientName, date, time);
      
    res.json({ id, status: 'Booked' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to book online appointment' });
  }
});

publicRouter.post('/prebook', async (req, res) => {
  const { name, clinicName, email, phone, notes } = req.body;
  
  if (!name || !clinicName || !email || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const id = 'L' + Date.now();
    db.prepare('INSERT INTO leads (id, name, clinicName, email, phone, notes) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, name, clinicName, email, phone, notes || '');

    // Attempt to send email notification
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER || '"SitaLax System" <noreply@sitalax.com>',
      to: 'Opssitalax@gmail.com',
      subject: `New Pre-book Lead: ${clinicName}`,
      text: `A new clinic has requested early access to SitaLax!\n\nDetails:\nName: ${name}\nClinic: ${clinicName}\nEmail: ${email}\nPhone: ${phone}\nNotes: ${notes || 'None'}\n\nPlease contact them to set up their account.`,
    };

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions);
      console.log(`[EMAIL SENT] Lead notification sent for ${clinicName}`);
    } else {
      console.log(`[MOCK EMAIL] New Lead Received (Configure SMTP to send real emails):`);
      console.log(mailOptions.text);
    }

    res.json({ success: true, message: 'Lead saved successfully' });
  } catch (error) {
    console.error('Failed to process prebook lead', error);
    // We still return success if it was saved to the DB but email failed
    res.json({ success: true, warning: 'Saved to DB but email notification failed.' });
  }
});

// WhatsApp Bot Webhook
publicRouter.post('/webhooks/whatsapp', async (req, res) => {
  const body = req.body;
  let fromPhone = body.From || body.from || '';
  let toPhone = body.To || body.to || '';
  let messageText = (body.Body || body.text?.body || '').trim();

  fromPhone = fromPhone.replace('whatsapp:', '').replace('+', '').trim();
  toPhone = toPhone.replace('whatsapp:', '').replace('+', '').trim();

  if (!fromPhone) return res.status(400).send('Missing phone number');

  // Find clinic by whatsappPhone or fallback to first clinic for MVP testing
  let clinic = db.prepare('SELECT * FROM clinics WHERE whatsappPhone = ? OR phone = ?').get(toPhone, toPhone) as any;
  if (!clinic) {
    clinic = db.prepare('SELECT * FROM clinics LIMIT 1').get() as any;
    if (!clinic) return res.status(404).send('Clinic not found');
  }
  const clinicId = clinic.id;

  // Find or create patient
  let patient = db.prepare('SELECT * FROM patients WHERE phone = ? AND clinicId = ?').get(fromPhone, clinicId) as any;
  let patientId = patient?.id;
  let patientName = patient?.name || 'there';

  if (!patientId) {
    patientId = 'P' + Date.now();
    db.prepare('INSERT INTO patients (id, clinicId, name, phone) VALUES (?, ?, ?, ?)').run(patientId, clinicId, 'New Patient', fromPhone);
    patientName = 'New Patient';
  }

  let session = db.prepare('SELECT * FROM bot_sessions WHERE phone = ? AND clinicId = ?').get(fromPhone, clinicId) as any;
  
  const sendReply = (msg: string) => {
    sendWhatsAppMessage(clinic, fromPhone, msg);
    res.status(200).send('OK');
  };

  if (messageText.toLowerCase() === 'cancel' || messageText.toLowerCase() === 'reset') {
    db.prepare('DELETE FROM bot_sessions WHERE phone = ? AND clinicId = ?').run(fromPhone, clinicId);
    return sendReply('Session reset. Say "Hi" to start over.');
  }

  if (!session) {
    db.prepare('INSERT INTO bot_sessions (id, clinicId, phone, patientId, state, data) VALUES (?, ?, ?, ?, ?, ?)').run(
      'S' + Date.now(), clinicId, fromPhone, patientId, 'GREETING', '{}'
    );
    return sendReply(`Hi ${patientName}, welcome to ${clinic.name}! Reply '1' to book an appointment.`);
  }

  let data = JSON.parse(session.data || '{}');
  let nextState = session.state;
  let replyMsg = '';

  try {
    if (session.state === 'GREETING') {
      if (messageText === '1') {
        const doctors = db.prepare('SELECT d.id, u.name FROM doctors d JOIN users u ON d.userId = u.id WHERE d.clinicId = ?').all(clinicId) as any[];
        if (doctors.length === 1) {
          data.doctorId = doctors[0].id;
          nextState = 'AWAITING_DATE';
          replyMsg = `Great! You'll be seeing ${doctors[0].name}. Please reply with the date you'd like to visit (e.g., YYYY-MM-DD) or say 'Tomorrow'.`;
        } else {
          nextState = 'AWAITING_DOCTOR';
          replyMsg = 'Please reply with the number of the doctor you want to see:\n' + doctors.map((d, i) => `${i + 1}. ${d.name}`).join('\n');
          data.doctorsList = doctors.map(d => d.id);
        }
      } else {
        replyMsg = `Please reply '1' to book an appointment.`;
      }
    } 
    else if (session.state === 'AWAITING_DOCTOR') {
      const idx = parseInt(messageText) - 1;
      if (!isNaN(idx) && data.doctorsList && data.doctorsList[idx]) {
        data.doctorId = data.doctorsList[idx];
        nextState = 'AWAITING_DATE';
        replyMsg = `Doctor selected. Please reply with the date you'd like to visit (e.g., YYYY-MM-DD) or say 'Tomorrow'.`;
      } else {
        replyMsg = `Invalid selection. Please reply with a valid number.`;
      }
    }
    else if (session.state === 'AWAITING_DATE') {
      let targetDate = messageText;
      if (messageText.toLowerCase() === 'tomorrow') {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        targetDate = d.toISOString().split('T')[0];
      } else if (messageText.toLowerCase() === 'today') {
        targetDate = new Date().toISOString().split('T')[0];
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
        replyMsg = `Please use the format YYYY-MM-DD, like '2026-10-15' or say 'Tomorrow'.`;
      } else {
        const slots = getAvailableSlots(clinicId, data.doctorId, targetDate);
        if (!slots || slots.length === 0) {
          replyMsg = `Sorry, no slots available on ${targetDate}. Please reply with another date.`;
        } else {
          data.date = targetDate;
          data.slotsList = slots.slice(0, 5);
          nextState = 'AWAITING_TIME';
          replyMsg = `Available slots on ${targetDate}:\n` + data.slotsList.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n') + `\nReply with the number of the slot.`;
        }
      }
    }
    else if (session.state === 'AWAITING_TIME') {
      const idx = parseInt(messageText) - 1;
      if (!isNaN(idx) && data.slotsList && data.slotsList[idx]) {
        const selectedTime = data.slotsList[idx];
        
        const aptId = 'A' + Date.now();
        db.prepare('INSERT INTO appointments (id, clinicId, doctorId, patientId, date, time, source) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .run(aptId, clinicId, data.doctorId, patientId, data.date, selectedTime, 'WhatsApp Bot');
        
        triggerAutomation(clinicId, 'confirmation', fromPhone, patientName, data.date, selectedTime);

        db.prepare('DELETE FROM bot_sessions WHERE id = ?').run(session.id);
        return sendReply(`✅ Confirmed! Your appointment is booked for ${data.date} at ${selectedTime}. See you then!`);
      } else {
        replyMsg = `Invalid selection. Please reply with a valid slot number.`;
      }
    }

    db.prepare('UPDATE bot_sessions SET state = ?, data = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(nextState, JSON.stringify(data), session.id);
    sendReply(replyMsg);

  } catch (err) {
    console.error('Bot error', err);
    sendReply('Sorry, something went wrong. Reply "cancel" to start over.');
  }
});

app.use('/api/public', publicRouter);

// Auth & Onboarding API
const authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
  const { clinicName, clinicPhone, clinicAddress, doctorName, email, password } = req.body;
  
  if (!clinicName || !doctorName || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const clinicId = 'C' + Date.now();
    const userId = 'U' + Date.now();
    const doctorId = 'D' + Date.now();
    const passwordHash = await bcrypt.hash(password, 10);

    db.transaction(() => {
      db.prepare('INSERT INTO clinics (id, name, address, phone) VALUES (?, ?, ?, ?)').run(clinicId, clinicName, clinicAddress || '', clinicPhone || '');
      db.prepare('INSERT INTO users (id, clinicId, role, name, email, password_hash) VALUES (?, ?, ?, ?, ?, ?)').run(userId, clinicId, 'Owner', doctorName, email, passwordHash);
      db.prepare('INSERT INTO doctors (id, clinicId, userId, specialization, workingHours) VALUES (?, ?, ?, ?, ?)').run(doctorId, clinicId, userId, 'General', 'Mon-Sat 9am-5pm');
    })();

    const token = jwt.sign({ userId, clinicId, role: 'Owner' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: userId, name: doctorName, email, role: 'Owner', clinicId } });
  } catch (error) {
    console.error('Registration error', error);
    res.status(500).json({ error: 'Failed to register clinic' });
  }
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id, clinicId: user.clinicId, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, clinicId: user.clinicId } });
  } catch (error) {
    console.error('Login error', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

authRouter.post('/demo-login', async (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get('smith@smilecare.com') as any;
    if (!user) {
      return res.status(404).json({ error: 'Demo user not found' });
    }

    const token = jwt.sign({ userId: user.id, clinicId: user.clinicId, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, clinicId: user.clinicId } });
  } catch (error) {
    console.error('Demo login error', error);
    res.status(500).json({ error: 'Failed to login to demo' });
  }
});

authRouter.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = db.prepare('SELECT id, name, email, role, clinicId FROM users WHERE id = ?').get(decoded.userId) as any;
    if (!user) return res.status(401).json({ error: 'User not found' });
    
    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.use('/api/auth', authRouter);

// API Routes
const apiRouter = express.Router();

// Middleware to authenticate and attach clinicId
apiRouter.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.headers['x-clinic-id'] = decoded.clinicId;
    req.headers['x-user-id'] = decoded.userId;
    req.headers['x-user-role'] = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// Patients API
apiRouter.get('/patients', (req, res) => {
  const clinicId = req.headers['x-clinic-id'];
  const patients = db.prepare('SELECT * FROM patients WHERE clinicId = ? ORDER BY createdAt DESC').all(clinicId);
  res.json(patients);
});

apiRouter.post('/patients', (req, res) => {
  const clinicId = req.headers['x-clinic-id'];
  const { name, phone, age, gender, address, notes } = req.body;
  const id = 'P' + Date.now();
  
  try {
    db.prepare('INSERT INTO patients (id, clinicId, name, phone, age, gender, address, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, clinicId, name, phone, age, gender, address, notes);
    res.json({ id, name, phone });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create patient' });
  }
});

// Appointments API
apiRouter.get('/appointments', (req, res) => {
  const clinicId = req.headers['x-clinic-id'];
  const appointments = db.prepare(`
    SELECT a.*, p.name as patientName, p.phone as patientPhone, d.specialization as doctorSpecialization, u.name as doctorName
    FROM appointments a
    JOIN patients p ON a.patientId = p.id
    JOIN doctors d ON a.doctorId = d.id
    JOIN users u ON d.userId = u.id
    WHERE a.clinicId = ?
    ORDER BY a.date ASC, a.time ASC
  `).all(clinicId);
  res.json(appointments);
});

apiRouter.post('/appointments', (req, res) => {
  const clinicId = req.headers['x-clinic-id'];
  const { doctorId, patientId, date, time, source = 'Walk-in' } = req.body;
  const id = 'A' + Date.now();
  
  try {
    db.prepare('INSERT INTO appointments (id, clinicId, doctorId, patientId, date, time, source) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, clinicId, doctorId, patientId, date, time, source);
      
    // Trigger immediate confirmation automation
    const patient = db.prepare('SELECT name, phone FROM patients WHERE id = ?').get(patientId) as any;
    if (patient) {
      triggerAutomation(clinicId as string, 'confirmation', patient.phone, patient.name, date, time);
    }
    
    res.json({ id, status: 'Booked' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

apiRouter.put('/appointments/:id/status', (req, res) => {
  const clinicId = req.headers['x-clinic-id'];
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    db.prepare('UPDATE appointments SET status = ? WHERE id = ? AND clinicId = ?').run(status, id, clinicId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Invoices API
apiRouter.get('/invoices', (req, res) => {
  const clinicId = req.headers['x-clinic-id'];
  const invoices = db.prepare(`
    SELECT i.*, p.name as patientName
    FROM invoices i
    JOIN patients p ON i.patientId = p.id
    WHERE i.clinicId = ?
    ORDER BY i.createdAt DESC
  `).all(clinicId);
  res.json(invoices);
});

apiRouter.post('/invoices', (req, res) => {
  const clinicId = req.headers['x-clinic-id'];
  const { patientId, consultationFee, procedureFee, medicineFee, discount, tax, paymentMethod } = req.body;
  const id = 'INV' + Date.now();
  
  const subtotal = Number(consultationFee || 0) + Number(procedureFee || 0) + Number(medicineFee || 0);
  const totalAfterDiscount = subtotal - Number(discount || 0);
  const total = totalAfterDiscount + (totalAfterDiscount * Number(tax || 0) / 100);

  try {
    db.prepare('INSERT INTO invoices (id, clinicId, patientId, consultationFee, procedureFee, medicineFee, discount, tax, total, paymentMethod, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, clinicId, patientId, consultationFee || 0, procedureFee || 0, medicineFee || 0, discount || 0, tax || 0, total, paymentMethod, 'Paid');
    res.json({ id, total });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Doctors API
apiRouter.get('/doctors', (req, res) => {
  const clinicId = req.headers['x-clinic-id'];
  const doctors = db.prepare(`
    SELECT d.*, u.name, u.email, u.phone
    FROM doctors d
    JOIN users u ON d.userId = u.id
    WHERE d.clinicId = ?
  `).all(clinicId);
  res.json(doctors);
});

apiRouter.post('/doctors', (req, res) => {
  const clinicId = req.headers['x-clinic-id'];
  const { name, email, phone, specialization, consultationFee, workingHours } = req.body;
  
  try {
    db.transaction(() => {
      const userId = 'U' + Date.now();
      db.prepare('INSERT INTO users (id, clinicId, role, name, phone, email) VALUES (?, ?, ?, ?, ?, ?)').run(userId, clinicId, 'Doctor', name, phone, email);
      
      const doctorId = 'D' + Date.now();
      db.prepare('INSERT INTO doctors (id, clinicId, userId, specialization, consultationFee, workingHours) VALUES (?, ?, ?, ?, ?, ?)').run(doctorId, clinicId, userId, specialization, consultationFee, workingHours);
    })();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create doctor' });
  }
});

// Automations API
apiRouter.get('/automations', (req, res) => {
  const clinicId = req.headers['x-clinic-id'];
  const automations = db.prepare('SELECT * FROM automations WHERE clinicId = ?').all(clinicId);
  res.json(automations);
});

apiRouter.post('/automations', (req, res) => {
  const clinicId = req.headers['x-clinic-id'];
  const { type, enabled, delayHours, messageTemplate } = req.body;
  const id = 'AUTO' + Date.now();
  
  try {
    db.prepare('INSERT OR REPLACE INTO automations (id, clinicId, type, enabled, delayHours, messageTemplate) VALUES (COALESCE((SELECT id FROM automations WHERE clinicId = ? AND type = ?), ?), ?, ?, ?, ?, ?)')
      .run(clinicId, type, id, clinicId, type, enabled ? 1 : 0, delayHours, messageTemplate);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save automation' });
  }
});

// Settings API
apiRouter.get('/settings', (req, res) => {
  const clinicId = req.headers['x-clinic-id'];
  const clinic = db.prepare('SELECT * FROM clinics WHERE id = ?').get(clinicId);
  res.json(clinic);
});

apiRouter.put('/settings', (req, res) => {
  const clinicId = req.headers['x-clinic-id'];
  const { name, phone, address, whatsappProvider, whatsappApiKey, whatsappPhone, googleReviewLink } = req.body;
  
  try {
    db.prepare(`
      UPDATE clinics 
      SET name = ?, phone = ?, address = ?, whatsappProvider = ?, whatsappApiKey = ?, whatsappPhone = ?, googleReviewLink = ?
      WHERE id = ?
    `).run(name, phone, address, whatsappProvider, whatsappApiKey, whatsappPhone, googleReviewLink, clinicId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Dashboard Stats API
apiRouter.get('/dashboard/stats', (req, res) => {
  const clinicId = req.headers['x-clinic-id'];
  const today = new Date().toISOString().split('T')[0];
  
  const totalPatients = db.prepare('SELECT COUNT(*) as count FROM patients WHERE clinicId = ?').get(clinicId) as { count: number };
  const todayAppointments = db.prepare('SELECT COUNT(*) as count FROM appointments WHERE clinicId = ? AND date = ?').get(clinicId, today) as { count: number };
  const pendingInvoices = db.prepare('SELECT COUNT(*) as count FROM invoices WHERE clinicId = ? AND status = ?').get(clinicId, 'Pending') as { count: number };
  
  const revenueResult = db.prepare('SELECT SUM(total) as revenue FROM invoices WHERE clinicId = ? AND status = ?').get(clinicId, 'Paid') as { revenue: number };
  
  // Recent Appointments
  const recentAppointments = db.prepare(`
    SELECT a.id, a.date, a.time, a.status, p.name as patientName
    FROM appointments a
    JOIN patients p ON a.patientId = p.id
    WHERE a.clinicId = ? AND a.date >= ?
    ORDER BY a.date ASC, a.time ASC
    LIMIT 5
  `).all(clinicId, today);

  // Revenue Chart Data (Last 7 days)
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    const dayRevenue = db.prepare(`
      SELECT SUM(i.total) as revenue 
      FROM invoices i
      JOIN appointments a ON i.appointmentId = a.id
      WHERE i.clinicId = ? AND i.status = 'Paid' AND a.date = ?
    `).get(clinicId, dateStr) as { revenue: number };
    
    chartData.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: dayRevenue.revenue || 0
    });
  }

  res.json({
    totalPatients: totalPatients.count,
    todayAppointments: todayAppointments.count,
    pendingInvoices: pendingInvoices.count,
    revenue: revenueResult.revenue || 0,
    recentAppointments,
    revenueChart: chartData
  });
});

app.use('/api', apiRouter);

// Background Worker for Automations
async function sendWhatsAppMessage(clinic: any, phone: string, message: string) {
  if (!clinic.whatsappProvider || clinic.whatsappProvider === 'none') {
    console.log(`[MOCK WHATSAPP] To ${phone}: ${message}`);
    return true; // Mock success
  }

  try {
    if (clinic.whatsappProvider === 'twilio') {
      console.log(`[TWILIO API CALL] Sending to ${phone} using Twilio...`);
      // Real implementation would be:
      // await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, { ... })
    } else if (clinic.whatsappProvider === 'meta') {
      console.log(`[META API CALL] Sending to ${phone} using Meta Cloud API...`);
      // Real implementation would be:
      // await fetch(`https://graph.facebook.com/v17.0/${clinic.whatsappPhone}/messages`, { ... })
    }
    return true;
  } catch (error) {
    console.error('Failed to send WhatsApp message', error);
    return false;
  }
}

function triggerAutomation(clinicId: string, type: string, phone: string, patientName: string, date: string, time: string) {
  const rule = db.prepare('SELECT * FROM automations WHERE clinicId = ? AND type = ? AND enabled = 1').get(clinicId, type) as any;
  const clinic = db.prepare('SELECT * FROM clinics WHERE id = ?').get(clinicId) as any;
  
  if (rule && clinic) {
    let msg = rule.messageTemplate
      .replace(/{patientName}/g, patientName)
      .replace(/{date}/g, date)
      .replace(/{time}/g, time)
      .replace(/{reviewLink}/g, clinic.googleReviewLink || 'our Google page');
      
    sendWhatsAppMessage(clinic, phone, msg);
    
    // Log it so we don't send it again (for cron jobs)
    db.prepare('INSERT INTO automation_logs (id, clinicId, patientId, type) VALUES (?, ?, ?, ?)')
      .run('LOG' + Date.now(), clinicId, 'UNKNOWN', type);
  }
}

// Cron job to check for reminders, recalls, and no-shows
setInterval(() => {
  const now = new Date();
  const clinics = db.prepare('SELECT * FROM clinics').all() as any[];

  for (const clinic of clinics) {
    const rules = db.prepare('SELECT * FROM automations WHERE clinicId = ? AND enabled = 1').all(clinic.id) as any[];
    const rulesByType = rules.reduce((acc, r) => ({...acc, [r.type]: r}), {});

    // Helper to process a specific rule
    const processRule = (type: string, query: string, params: any[]) => {
      if (!rulesByType[type]) return;
      const rule = rulesByType[type];
      
      const appointments = db.prepare(query).all(...params) as any[];
      
      for (const apt of appointments) {
        // Check if already sent
        const log = db.prepare('SELECT id FROM automation_logs WHERE appointmentId = ? AND type = ?').get(apt.id, type);
        if (log) continue;

        let msg = rule.messageTemplate
          .replace(/{patientName}/g, apt.patientName)
          .replace(/{date}/g, apt.date)
          .replace(/{time}/g, apt.time)
          .replace(/{reviewLink}/g, clinic.googleReviewLink || 'our Google page');

        sendWhatsAppMessage(clinic, apt.patientPhone, msg);

        db.prepare('INSERT INTO automation_logs (id, clinicId, patientId, appointmentId, type) VALUES (?, ?, ?, ?, ?)')
          .run('LOG' + Date.now() + Math.random(), clinic.id, apt.patientId, apt.id, type);
      }
    };

    // Timezone-aware date calculations
    const clinicTimezone = clinic.timezone || 'UTC';
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: clinicTimezone,
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
    
    const formatToYMD = (dateObj: Date) => {
      const parts = formatter.formatToParts(dateObj);
      const y = parts.find(p => p.type === 'year')?.value;
      const m = parts.find(p => p.type === 'month')?.value;
      const d = parts.find(p => p.type === 'day')?.value;
      return `${y}-${m}-${d}`;
    };

    const todayStr = formatToYMD(now);

    // 1. 24h Reminder (Appointments tomorrow)
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = formatToYMD(tomorrow);
    processRule('reminder', `
      SELECT a.*, p.name as patientName, p.phone as patientPhone 
      FROM appointments a JOIN patients p ON a.patientId = p.id 
      WHERE a.clinicId = ? AND a.date = ? AND a.status IN ('Booked', 'Confirmed')
    `, [clinic.id, tomorrowStr]);

    // 2. Post-visit review (Completed today)
    processRule('post_visit_review', `
      SELECT a.*, p.name as patientName, p.phone as patientPhone 
      FROM appointments a JOIN patients p ON a.patientId = p.id 
      WHERE a.clinicId = ? AND a.date = ? AND a.status = 'Completed'
    `, [clinic.id, todayStr]);

    // 3. No-show reschedule (Marked as No Show today)
    processRule('no_show_reschedule', `
      SELECT a.*, p.name as patientName, p.phone as patientPhone 
      FROM appointments a JOIN patients p ON a.patientId = p.id 
      WHERE a.clinicId = ? AND a.date = ? AND a.status = 'No Show'
    `, [clinic.id, todayStr]);

    // 4. 6-Month Recall (Completed 6 months ago)
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const sixMonthsAgoStr = formatToYMD(sixMonthsAgo);
    processRule('recall_6_months', `
      SELECT a.*, p.name as patientName, p.phone as patientPhone 
      FROM appointments a JOIN patients p ON a.patientId = p.id 
      WHERE a.clinicId = ? AND a.date = ? AND a.status = 'Completed'
    `, [clinic.id, sixMonthsAgoStr]);
  }
}, 60000); // Run every minute

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
