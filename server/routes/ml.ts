import { Router } from 'express';
import fetch from 'node-fetch';

const router = Router();

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Get predictions from ML service
router.post('/predict', async (req, res) => {
  try {
    const { templeId, date, festivalMode } = req.body;
    
    if (!templeId || !date) {
      return res.status(400).json({ error: 'templeId and date are required' });
    }
    
    const response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        templeId,
        date,
        festivalMode: festivalMode || false
      })
    });
    
    if (!response.ok) {
      throw new Error(`ML service responded with status: ${response.status}`);
    }
    
    const predictions = await response.json();
    res.json(predictions);
    
  } catch (error) {
    console.error('Error calling ML service:', error);
    res.status(500).json({ 
      error: 'Failed to get predictions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get current temple status from ML service
router.get('/status/:templeId', async (req, res) => {
  try {
    const { templeId } = req.params;
    
    const response = await fetch(`${ML_SERVICE_URL}/temples/${templeId}/current-status`);
    
    if (!response.ok) {
      throw new Error(`ML service responded with status: ${response.status}`);
    }
    
    const status = await response.json();
    res.json(status);
    
  } catch (error) {
    console.error('Error getting temple status from ML service:', error);
    res.status(500).json({ 
      error: 'Failed to get temple status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Trigger surge simulation via ML service
router.post('/simulate/surge/:templeId', async (req, res) => {
  try {
    const { templeId } = req.params;
    
    const response = await fetch(`${ML_SERVICE_URL}/simulate/surge/${templeId}`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error(`ML service responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Also trigger WebSocket surge
    const wsManager = req.app.locals.wsManager;
    if (wsManager) {
      wsManager.triggerSurge(templeId);
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('Error triggering surge simulation:', error);
    res.status(500).json({ 
      error: 'Failed to trigger surge simulation',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as mlRoutes };