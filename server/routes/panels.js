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
    const { name, url, username, password } = req.body;

    if (!name || !url || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const result = await db.runAsync(
      'INSERT INTO panels (name, url, username, password) VALUES (?, ?, ?, ?)',
      [name, url, username, password]
    );

    const newPanel = await db.getAsync('SELECT * FROM panels WHERE id = ?', [result.lastID]);

    res.status(201).json({
      success: true,
      message: 'Panel created successfully',
      data: newPanel
    });
  } catch (error) {
    console.error('Create panel error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update panel
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url, username, password, status } = req.body;

    const panel = await db.getAsync('SELECT * FROM panels WHERE id = ?', [id]);
    if (!panel) {
      return res.status(404).json({
        success: false,
        message: 'Panel not found'
      });
    }

    await db.runAsync(
      'UPDATE panels SET name = ?, url = ?, username = ?, password = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name || panel.name, url || panel.url, username || panel.username, password || panel.password, status || panel.status, id]
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