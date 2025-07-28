import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all panels
router.get('/', authenticateToken, async (req, res) => {
  try {
    const panels = await db.allAsync('SELECT * FROM panels ORDER BY created_at DESC');
    
    res.json({
      success: true,
      data: panels
    });
  } catch (error) {
    console.error('Get panels error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get panel by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const panel = await db.getAsync('SELECT * FROM panels WHERE id = ?', [id]);
    
    if (!panel) {
      return res.status(404).json({
        success: false,
        message: 'Panel not found'
      });
    }

    res.json({
      success: true,
      data: panel
    });
  } catch (error) {
    console.error('Get panel error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new panel
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, url, subUrl, username, password, vpsUsername, vpsPassword, panel_type } = req.body;

    console.log('Creating panel with data:', { name, url, username, hasPassword: !!password, panel_type });

    if (!name || !url || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, URL, username, and password are required'
      });
    }

    // Check if panel with same name or URL already exists
    const existingPanel = await db.getAsync(
      'SELECT id FROM panels WHERE name = ? OR url = ?',
      [name, url]
    );

    if (existingPanel) {
      return res.status(400).json({
        success: false,
        message: 'Panel with this name or URL already exists'
      });
    }

    // Insert panel with all fields
    const result = await db.runAsync(
      `INSERT INTO panels (name, url, username, password, status, vpsUsername, vpsPassword, panel_type) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, url, username, password, 'active', vpsUsername || null, vpsPassword || null, panel_type || '3x-ui']
    );

    if (!result || !result.lastID) {
      throw new Error('Failed to insert panel - no ID returned');
    }

    const newPanel = await db.getAsync('SELECT * FROM panels WHERE id = ?', [result.lastID]);

    if (!newPanel) {
      throw new Error('Failed to retrieve created panel');
    }

    console.log('Panel created successfully:', newPanel);

    res.status(201).json({
      success: true,
      message: 'Panel created successfully',
      data: newPanel
    });
  } catch (error) {
    console.error('Create panel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create panel: ' + error.message
    });
  }
});

// Update panel
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url, subUrl, username, password, status, vpsUsername, vpsPassword, panel_type } = req.body;

    const panel = await db.getAsync('SELECT * FROM panels WHERE id = ?', [id]);
    if (!panel) {
      return res.status(404).json({
        success: false,
        message: 'Panel not found'
      });
    }

    await db.runAsync(
      `UPDATE panels SET name = ?, url = ?, username = ?, password = ?, status = ?, 
       vpsUsername = ?, vpsPassword = ?, panel_type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [
        name || panel.name, 
        url || panel.url, 
        username || panel.username, 
        password || panel.password, 
        status || panel.status,
        vpsUsername !== undefined ? vpsUsername : panel.vpsUsername,
        vpsPassword !== undefined ? vpsPassword : panel.vpsPassword,
        panel_type || panel.panel_type || '3x-ui',
        id
      ]
    );

    const updatedPanel = await db.getAsync('SELECT * FROM panels WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Panel updated successfully',
      data: updatedPanel
    });
  } catch (error) {
    console.error('Update panel error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete panel
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const panel = await db.getAsync('SELECT * FROM panels WHERE id = ?', [id]);
    if (!panel) {
      return res.status(404).json({
        success: false,
        message: 'Panel not found'
      });
    }

    await db.runAsync('DELETE FROM panels WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Panel deleted successfully'
    });
  } catch (error) {
    console.error('Delete panel error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create admin on panel
router.post('/:id/admins', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, traffic_limit_gb, time_limit_days, user_limit } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Check if panel exists
    const panel = await db.getAsync('SELECT * FROM panels WHERE id = ?', [id]);
    if (!panel) {
      return res.status(404).json({
        success: false,
        message: 'Panel not found'
      });
    }

    // Check if admin already exists on this panel
    const existingAdmin = await db.getAsync(
      'SELECT id FROM panel_admins WHERE panel_id = ? AND username = ?',
      [id, username]
    );

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this username already exists on this panel'
      });
    }

    // Create admin on the panel using panel service
    const { panelService } = await import('../services/panelService.js');
    const panelResult = await panelService.createPanelAdmin(id, {
      username,
      password,
      traffic_limit_gb,
      time_limit_days,
      user_limit
    });

    if (!panelResult.success) {
      return res.status(400).json({
        success: false,
        message: panelResult.message || 'Failed to create admin on panel'
      });
    }

    // Store admin info in our database
    const result = await db.runAsync(
      `INSERT INTO panel_admins (panel_id, username, password, traffic_limit_gb, time_limit_days, user_limit) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, username, password, traffic_limit_gb || 0, time_limit_days || 0, user_limit || 0]
    );

    const newAdmin = await db.getAsync(
      `SELECT pa.*, p.name as panel_name 
       FROM panel_admins pa 
       LEFT JOIN panels p ON pa.panel_id = p.id 
       WHERE pa.id = ?`,
      [result.lastID]
    );

    res.status(201).json({
      success: true,
      message: 'Panel admin created successfully',
      data: newAdmin
    });
  } catch (error) {
    console.error('Create panel admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create panel admin: ' + error.message
    });
  }
});

// Get panel admins
router.get('/:id/admins', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const admins = await db.allAsync(
      `SELECT pa.*, p.name as panel_name 
       FROM panel_admins pa 
       LEFT JOIN panels p ON pa.panel_id = p.id 
       WHERE pa.panel_id = ? 
       ORDER BY pa.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: admins
    });
  } catch (error) {
    console.error('Get panel admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update panel admin
router.put('/:id/admins/:adminId', authenticateToken, async (req, res) => {
  try {
    const { id, adminId } = req.params;
    const { traffic_limit_gb, time_limit_days, user_limit, status } = req.body;

    const admin = await db.getAsync(
      'SELECT * FROM panel_admins WHERE id = ? AND panel_id = ?',
      [adminId, id]
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Panel admin not found'
      });
    }

    await db.runAsync(
      `UPDATE panel_admins SET 
        traffic_limit_gb = ?, time_limit_days = ?, user_limit = ?, status = ?, 
        updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [
        traffic_limit_gb !== undefined ? traffic_limit_gb : admin.traffic_limit_gb,
        time_limit_days !== undefined ? time_limit_days : admin.time_limit_days,
        user_limit !== undefined ? user_limit : admin.user_limit,
        status || admin.status,
        adminId
      ]
    );

    const updatedAdmin = await db.getAsync(
      `SELECT pa.*, p.name as panel_name 
       FROM panel_admins pa 
       LEFT JOIN panels p ON pa.panel_id = p.id 
       WHERE pa.id = ?`,
      [adminId]
    );

    res.json({
      success: true,
      message: 'Panel admin updated successfully',
      data: updatedAdmin
    });
  } catch (error) {
    console.error('Update panel admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete panel admin
router.delete('/:id/admins/:adminId', authenticateToken, async (req, res) => {
  try {
    const { id, adminId } = req.params;

    const admin = await db.getAsync(
      'SELECT * FROM panel_admins WHERE id = ? AND panel_id = ?',
      [adminId, id]
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Panel admin not found'
      });
    }

    // Delete admin from panel using panel service
    const { panelService } = await import('../services/panelService.js');
    await panelService.deletePanelAdmin(id, admin.username);

    // Delete from our database
    await db.runAsync('DELETE FROM panel_admins WHERE id = ?', [adminId]);

    res.json({
      success: true,
      message: 'Panel admin deleted successfully'
    });
  } catch (error) {
    console.error('Delete panel admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add traffic to panel admin
router.post('/:id/admins/:adminId/add-traffic', authenticateToken, async (req, res) => {
  try {
    const { id, adminId } = req.params;
    const { amount_gb } = req.body;

    if (!amount_gb || amount_gb <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid traffic amount is required'
      });
    }

    const admin = await db.getAsync(
      'SELECT * FROM panel_admins WHERE id = ? AND panel_id = ?',
      [adminId, id]
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Panel admin not found'
      });
    }

    // Update traffic limit
    await db.runAsync(
      'UPDATE panel_admins SET traffic_limit_gb = traffic_limit_gb + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [amount_gb, adminId]
    );

    const updatedAdmin = await db.getAsync(
      `SELECT pa.*, p.name as panel_name 
       FROM panel_admins pa 
       LEFT JOIN panels p ON pa.panel_id = p.id 
       WHERE pa.id = ?`,
      [adminId]
    );

    res.json({
      success: true,
      message: `Added ${amount_gb}GB traffic to admin`,
      data: updatedAdmin
    });
  } catch (error) {
    console.error('Add traffic to panel admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add time to panel admin
router.post('/:id/admins/:adminId/add-time', authenticateToken, async (req, res) => {
  try {
    const { id, adminId } = req.params;
    const { days } = req.body;

    if (!days || days <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid number of days is required'
      });
    }

    const admin = await db.getAsync(
      'SELECT * FROM panel_admins WHERE id = ? AND panel_id = ?',
      [adminId, id]
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Panel admin not found'
      });
    }

    // Update time limit
    await db.runAsync(
      'UPDATE panel_admins SET time_limit_days = time_limit_days + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [days, adminId]
    );

    const updatedAdmin = await db.getAsync(
      `SELECT pa.*, p.name as panel_name 
       FROM panel_admins pa 
       LEFT JOIN panels p ON pa.panel_id = p.id 
       WHERE pa.id = ?`,
      [adminId]
    );

    res.json({
      success: true,
      message: `Added ${days} days to admin`,
      data: updatedAdmin
    });
  } catch (error) {
    console.error('Add time to panel admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;