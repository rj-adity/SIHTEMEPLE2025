import { Router } from 'express';
import { DatabaseManager } from '../database';

const router = Router();

// Get staff
router.get('/', async (req, res) => {
  try {
    const db: DatabaseManager = req.app.locals.db;
    const { templeId } = req.query;
    
    const staff = await db.getStaff(templeId as string);
    
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// Update staff status
router.patch('/:staffId/status', async (req, res) => {
  try {
    const db: DatabaseManager = req.app.locals.db;
    const { status, zone } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    await db.updateStaffStatus(req.params.staffId, status, zone);
    
    res.json({ success: true, message: 'Staff status updated' });
  } catch (error) {
    console.error('Error updating staff status:', error);
    res.status(500).json({ error: 'Failed to update staff status' });
  }
});

// Dispatch staff
router.post('/dispatch', async (req, res) => {
  try {
    const db: DatabaseManager = req.app.locals.db;
    const { staffIds, zone, type } = req.body;
    
    if (!staffIds || !Array.isArray(staffIds) || !zone) {
      return res.status(400).json({ error: 'Staff IDs and zone are required' });
    }
    
    // Update all specified staff to dispatched status
    const updatePromises = staffIds.map(staffId => 
      db.updateStaffStatus(staffId, 'dispatched', zone)
    );
    
    await Promise.all(updatePromises);
    
    // Create alert for dispatch
    await db.createAlert({
      templeId: 'dwarka', // Default temple - should be dynamic
      type: type || 'security',
      message: `${staffIds.length} staff members dispatched to ${zone}`,
      severity: 'medium'
    });
    
    res.json({ 
      success: true, 
      message: `${staffIds.length} staff members dispatched to ${zone}`,
      dispatchedStaff: staffIds,
      zone
    });
  } catch (error) {
    console.error('Error dispatching staff:', error);
    res.status(500).json({ error: 'Failed to dispatch staff' });
  }
});

export { router as staffRoutes };