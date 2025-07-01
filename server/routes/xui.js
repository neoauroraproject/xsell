import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { xuiService } from '../services/xuiService.js';

const router = express.Router();

// Test X-UI connection
router.post('/test-connection', authenticateToken, async (req, res) => {
  try {
    const { url, username, password } = req.body;

    console.log('Testing X-UI connection:', { url, username, hasPassword: !!password });

    if (!url || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'URL, username, and password are required'
      });
    }

    const result = await xuiService.testConnection(url, username, password);

    console.log('Connection test result:', result);

    res.json({
      success: result.success,
      message: result.message,
      data: result.data || null
    });
  } catch (error) {
    console.error('X-UI connection test error:', error);
    res.status(500).json({
      success: false,
      message: 'Connection test failed',
      error: error.message
    });
  }
});

// Get X-UI system stats
router.get('/stats/:panelId', authenticateToken, async (req, res) => {
  try {
    const { panelId } = req.params;
    console.log('Getting stats for panel:', panelId);
    
    const stats = await xuiService.getSystemStats(panelId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get X-UI stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system stats',
      error: error.message
    });
  }
});

// Get X-UI inbounds
router.get('/inbounds/:panelId', authenticateToken, async (req, res) => {
  try {
    const { panelId } = req.params;
    console.log('Getting inbounds for panel:', panelId);
    
    const inbounds = await xuiService.getInbounds(panelId);

    res.json({
      success: true,
      data: inbounds
    });
  } catch (error) {
    console.error('Get X-UI inbounds error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inbounds',
      error: error.message
    });
  }
});

// Get X-UI inbound traffic
router.get('/traffic/:panelId', authenticateToken, async (req, res) => {
  try {
    const { panelId } = req.params;
    console.log('Getting traffic for panel:', panelId);
    
    const traffic = await xuiService.getInboundTraffic(panelId);

    res.json({
      success: true,
      data: traffic
    });
  } catch (error) {
    console.error('Get X-UI traffic error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get traffic data',
      error: error.message
    });
  }
});

// Download panel database
router.get('/database/:panelId', authenticateToken, async (req, res) => {
  try {
    const { panelId } = req.params;
    console.log('Downloading database for panel:', panelId);
    
    const response = await xuiService.downloadDatabase(panelId);
    
    // Set appropriate headers for file download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="panel-${panelId}-database.db"`);
    
    // Pipe the response stream to the client
    response.data.pipe(res);
  } catch (error) {
    console.error('Download database error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download database',
      error: error.message
    });
  }
});

// Create X-UI client
router.post('/clients/:panelId', authenticateToken, async (req, res) => {
  try {
    const { panelId } = req.params;
    const clientData = req.body;

    const result = await xuiService.createClient(panelId, clientData);

    res.json({
      success: true,
      message: 'Client created successfully',
      data: result
    });
  } catch (error) {
    console.error('Create X-UI client error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create client',
      error: error.message
    });
  }
});

// Update X-UI client
router.put('/clients/:panelId/:clientId', authenticateToken, async (req, res) => {
  try {
    const { panelId, clientId } = req.params;
    const clientData = req.body;

    const result = await xuiService.updateClient(panelId, clientId, clientData);

    res.json({
      success: true,
      message: 'Client updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Update X-UI client error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update client',
      error: error.message
    });
  }
});

// Delete X-UI client
router.delete('/clients/:panelId/:clientId', authenticateToken, async (req, res) => {
  try {
    const { panelId, clientId } = req.params;

    const result = await xuiService.deleteClient(panelId, clientId);

    res.json({
      success: true,
      message: 'Client deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Delete X-UI client error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete client',
      error: error.message
    });
  }
});

// Reset client traffic
router.post('/clients/:panelId/:clientId/reset-traffic', authenticateToken, async (req, res) => {
  try {
    const { panelId, clientId } = req.params;

    const result = await xuiService.resetClientTraffic(panelId, clientId);

    res.json({
      success: true,
      message: 'Client traffic reset successfully',
      data: result
    });
  } catch (error) {
    console.error('Reset client traffic error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset client traffic',
      error: error.message
    });
  }
});

export default router;