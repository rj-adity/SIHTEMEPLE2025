import { Router } from 'express';
import { DatabaseManager } from '../database';

const router = Router();

// Get alerts
router.get('/', async (req, res) => {
  try {
    const db: DatabaseManager = req.app.locals.db;
    const { templeId, resolved } = req.query;
    
    const resolvedFilter = resolved === 'true' ? true : resolved === 'false' ? false : undefined;
    
    const alerts = await db.getAlerts(
      templeId as string,
      resolvedFilter
    );
    
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Create new alert
router.post('/', async (req, res) => {
  try {
    const db: DatabaseManager = req.app.locals.db;
    const { templeId, type, message, severity } = req.body;
    
    if (!templeId || !type || !message || !severity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const alert = await db.createAlert({
      templeId,
      type,
      message,
      severity
    });
    
    res.status(201).json(alert);
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// Resolve alert
router.patch('/:alertId/resolve', async (req, res) => {
  try {
    const db: DatabaseManager = req.app.locals.db;
    
    await db.resolveAlert(req.params.alertId);
    
    res.json({ success: true, message: 'Alert resolved' });
  } catch (error) {
    console.error('Error resolving alert:', error);
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
});

export { router as alertRoutes };