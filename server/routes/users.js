import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all users
router.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await db.allAsync(`
      SELECT u.*, p.name as panel_name 
      FROM users u 
      LEFT JOIN panels p ON u.panel_id = p.id 
      ORDER BY u.created_at DESC
    `);
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.getAsync(`
      SELECT u.*, p.name as panel_name 
      FROM users u 
      LEFT JOIN panels p ON u.panel_id = p.id 
      WHERE u.id = ?
    `, [id]);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new user
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { panel_id, username, email, traffic_limit, expiry_date } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    const result = await db.runAsync(
      'INSERT INTO users (panel_id, username, email, traffic_limit, expiry_date) VALUES (?, ?, ?, ?, ?)',
      [panel_id, username, email, traffic_limit || 0, expiry_date]
    );

    const newUser = await db.getAsync(`
      SELECT u.*, p.name as panel_name 
      FROM users u 
      LEFT JOIN panels p ON u.panel_id = p.id 
      WHERE u.id = ?
    `, [result.lastID]);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { panel_id, username, email, traffic_limit, traffic_used, expiry_date, status } = req.body;

    const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await db.runAsync(
      `UPDATE users SET 
        panel_id = ?, username = ?, email = ?, traffic_limit = ?, 
        traffic_used = ?, expiry_date = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [
        panel_id !== undefined ? panel_id : user.panel_id,
        username || user.username,
        email !== undefined ? email : user.email,
        traffic_limit !== undefined ? traffic_limit : user.traffic_limit,
        traffic_used !== undefined ? traffic_used : user.traffic_used,
        expiry_date !== undefined ? expiry_date : user.expiry_date,
        status || user.status,
        id
      ]
    );

    const updatedUser = await db.getAsync(`
      SELECT u.*, p.name as panel_name 
      FROM users u 
      LEFT JOIN panels p ON u.panel_id = p.id 
      WHERE u.id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete user
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await db.runAsync('DELETE FROM users WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;