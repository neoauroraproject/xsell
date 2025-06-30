import express from 'express';
import db from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all settings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const settings = await db.allAsync('SELECT * FROM settings ORDER BY key');
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get setting by key
router.get('/:key', authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await db.getAsync('SELECT * FROM settings WHERE key = ?', [key]);
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    res.json({
      success: true,
      data: setting
    });
  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update setting
router.put('/:key', authenticateToken, requireRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;

    const setting = await db.getAsync('SELECT * FROM settings WHERE key = ?', [key]);
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    await db.runAsync(
      'UPDATE settings SET value = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
      [value !== undefined ? value : setting.value, description || setting.description, key]
    );

    const updatedSetting = await db.getAsync('SELECT * FROM settings WHERE key = ?', [key]);

    res.json({
      success: true,
      message: 'Setting updated successfully',
      data: updatedSetting
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new setting
router.post('/', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const { key, value, description } = req.body;

    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Setting key is required'
      });
    }

    // Check if setting already exists
    const existingSetting = await db.getAsync('SELECT id FROM settings WHERE key = ?', [key]);
    if (existingSetting) {
      return res.status(400).json({
        success: false,
        message: 'Setting already exists'
      });
    }

    const result = await db.runAsync(
      'INSERT INTO settings (key, value, description) VALUES (?, ?, ?)',
      [key, value, description]
    );

    const newSetting = await db.getAsync('SELECT * FROM settings WHERE id = ?', [result.lastID]);

    res.status(201).json({
      success: true,
      message: 'Setting created successfully',
      data: newSetting
    });
  } catch (error) {
    console.error('Create setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete setting
router.delete('/:key', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const { key } = req.params;

    const setting = await db.getAsync('SELECT * FROM settings WHERE key = ?', [key]);
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    await db.runAsync('DELETE FROM settings WHERE key = ?', [key]);

    res.json({
      success: true,
      message: 'Setting deleted successfully'
    });
  } catch (error) {
    console.error('Delete setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;