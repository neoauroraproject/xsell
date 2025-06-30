import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all admins
router.get('/', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const admins = await db.allAsync(
      'SELECT id, username, email, role, created_at, updated_at FROM admins ORDER BY created_at DESC'
    );
    
    res.json({
      success: true,
      data: admins
    });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get admin by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Users can only view their own profile unless they're super_admin
    if (req.user.role !== 'super_admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const admin = await db.getAsync(
      'SELECT id, username, email, role, created_at, updated_at FROM admins WHERE id = ?',
      [id]
    );
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('Get admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new admin
router.post('/', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const { username, email, password, role = 'admin' } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required'
      });
    }

    // Check if username or email already exists
    const existingAdmin = await db.getAsync(
      'SELECT id FROM admins WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.runAsync(
      'INSERT INTO admins (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );

    const newAdmin = await db.getAsync(
      'SELECT id, username, email, role, created_at, updated_at FROM admins WHERE id = ?',
      [result.lastID]
    );

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: newAdmin
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update admin
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role } = req.body;

    // Users can only update their own profile unless they're super_admin
    if (req.user.role !== 'super_admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const admin = await db.getAsync('SELECT * FROM admins WHERE id = ?', [id]);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Only super_admin can change roles
    const newRole = req.user.role === 'super_admin' ? (role || admin.role) : admin.role;

    await db.runAsync(
      'UPDATE admins SET username = ?, email = ?, role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [username || admin.username, email || admin.email, newRole, id]
    );

    const updatedAdmin = await db.getAsync(
      'SELECT id, username, email, role, created_at, updated_at FROM admins WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Admin updated successfully',
      data: updatedAdmin
    });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete admin
router.delete('/:id', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const admin = await db.getAsync('SELECT * FROM admins WHERE id = ?', [id]);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    await db.runAsync('DELETE FROM admins WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;