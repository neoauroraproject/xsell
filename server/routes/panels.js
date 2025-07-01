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
    const { name, url, subUrl, username, password, vpsUsername, vpsPassword } = req.body;

    console.log('Creating panel with data:', { name, url, username, hasPassword: !!password });

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

    const result = await db.runAsync(
      'INSERT INTO panels (name, url, username, password, status) VALUES (?, ?, ?, ?, ?)',
      [name, url, username, password, 'active']
    );

    const newPanel = await db.getAsync('SELECT * FROM panels WHERE id = ?', [result.lastID]);

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
    const { name, url, subUrl, username, password, status } = req.body;

    const panel = await db.getAsync('SELECT * FROM panels WHERE id = ?', [id]);
    if (!panel) {
      return res.status(404).json({
        success: false,
        message: 'Panel not found'
      });
    }

    await db.runAsync(
      'UPDATE panels SET name = ?, url = ?, username = ?, password = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [
        name || panel.name, 
        url || panel.url, 
        username || panel.username, 
        password || panel.password, 
        status || panel.status, 
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

export default router;