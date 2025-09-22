import { Router } from 'express';
import { DatabaseManager } from '../database';

const router = Router();

// Create new ticket
router.post('/', async (req, res) => {
  try {
    const db: DatabaseManager = req.app.locals.db;
    const { templeId, name, phone, email, date, slot, count, amount } = req.body;
    
    // Validate required fields
    if (!templeId || !name || !phone || !date || !slot || !count || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Generate ticket ID
    const ticketId = `${templeId.toUpperCase().slice(0, 3)}-${Date.now().toString(36).toUpperCase()}`;
    
    const ticket = await db.createTicket({
      _id: ticketId,
      templeId,
      name,
      phone,
      email,
      date,
      slot,
      count,
      amount,
      status: 'confirmed'
    });
    
    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Get tickets
router.get('/', async (req, res) => {
  try {
    const db: DatabaseManager = req.app.locals.db;
    const { templeId, date } = req.query;
    
    const tickets = await db.getTickets(
      templeId as string,
      date as string
    );
    
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Get specific ticket
router.get('/:ticketId', async (req, res) => {
  try {
    const db: DatabaseManager = req.app.locals.db;
    const ticket = await db.getTicket(req.params.ticketId);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// Get available slots for a date
router.get('/slots/:templeId/:date', async (req, res) => {
  try {
    const db: DatabaseManager = req.app.locals.db;
    const { templeId, date } = req.params;
    
    // Get existing bookings for the date
    const existingTickets = await db.getTickets(templeId, date);
    
    // Define available slots
    const allSlots = [
      "06:00–08:00",
      "08:00–10:00", 
      "10:00–12:00",
      "12:00–14:00",
      "14:00–16:00",
      "16:00–18:00"
    ];
    
    // Calculate availability (simplified - assume 500 max per slot)
    const slotAvailability = allSlots.map(slot => {
      const booked = existingTickets
        .filter(ticket => ticket.slot === slot)
        .reduce((sum, ticket) => sum + ticket.count, 0);
      
      return {
        slot,
        available: Math.max(0, 500 - booked),
        total: 500,
        booked
      };
    });
    
    res.json({
      templeId,
      date,
      slots: slotAvailability
    });
  } catch (error) {
    console.error('Error fetching slot availability:', error);
    res.status(500).json({ error: 'Failed to fetch slot availability' });
  }
});

export { router as ticketRoutes };