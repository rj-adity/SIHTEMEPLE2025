import { Router } from 'express';
import { DatabaseManager } from '../database';

const router = Router();

// Get all temples
router.get('/', async (req, res) => {
  try {
    const db: DatabaseManager = req.app.locals.db;
    const temples = await db.getTemples();
    res.json(temples);
  } catch (error) {
    console.error('Error fetching temples:', error);
    res.status(500).json({ error: 'Failed to fetch temples' });
  }
});

// Get specific temple
router.get('/:templeId', async (req, res) => {
  try {
    const db: DatabaseManager = req.app.locals.db;
    const temple = await db.getTemple(req.params.templeId);
    
    if (!temple) {
      return res.status(404).json({ error: 'Temple not found' });
    }
    
    res.json(temple);
  } catch (error) {
    console.error('Error fetching temple:', error);
    res.status(500).json({ error: 'Failed to fetch temple' });
  }
});

// Update temple status
router.patch('/:templeId/status', async (req, res) => {
  try {
    const db: DatabaseManager = req.app.locals.db;
    const { currentVisitors, queueLength, avgWaitTime, occupancyPercent } = req.body;
    
    const updates: any = {};
    if (currentVisitors !== undefined) updates.currentVisitors = currentVisitors;
    if (queueLength !== undefined) updates.queueLength = queueLength;
    if (avgWaitTime !== undefined) updates.avgWaitTime = avgWaitTime;
    if (occupancyPercent !== undefined) updates.occupancyPercent = occupancyPercent;
    
    await db.updateTempleStatus(req.params.templeId, updates);
    
    res.json({ success: true, message: 'Temple status updated' });
  } catch (error) {
    console.error('Error updating temple status:', error);
    res.status(500).json({ error: 'Failed to update temple status' });
  }
});

// Simulate crowd surge
router.post('/:templeId/simulate/surge', async (req, res) => {
  try {
    const { templeId } = req.params;
    const wsManager = req.app.locals.wsManager;
    
    // Trigger WebSocket surge simulation
    wsManager.triggerSurge(templeId);
    
    res.json({ 
      success: true, 
      message: `Crowd surge simulation triggered for ${templeId}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error simulating surge:', error);
    res.status(500).json({ error: 'Failed to simulate surge' });
  }
});

// Get temple analytics
router.get('/:templeId/analytics', async (req, res) => {
  try {
    const db: DatabaseManager = req.app.locals.db;
    const days = parseInt(req.query.days as string) || 7;
    
    const stats = await db.getVisitorStats(req.params.templeId, days);
    
    res.json({
      templeId: req.params.templeId,
      period: `${days} days`,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export { router as templeRoutes };