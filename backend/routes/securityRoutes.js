const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const {
  getSecurityDashboard,
  manageDevice,
  sendVerificationCode,
  verifyCode,
  smartLoginMonitoring
} = require('../middleware/smartSecurity');

// 🔐 Security Dashboard - Shows user's security overview
router.get('/dashboard', isAuthenticated, getSecurityDashboard);

// 📱 Device Management Routes
router.post('/devices/manage', isAuthenticated, manageDevice);

// 📧 Verification Routes
router.post('/verification/send', isAuthenticated, sendVerificationCode);
router.post('/verification/verify', isAuthenticated, verifyCode);

// 🔧 Security Settings Update
router.patch('/settings', isAuthenticated, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const allowedSettings = [
      'emailNotifications',
      'loginAlerts',
      'deviceManagement',
      'maxDevices'
    ];
    
    // Update only allowed settings
    allowedSettings.forEach(setting => {
      if (req.body[setting] !== undefined) {
        user.securitySettings[setting] = req.body[setting];
      }
    });
    
    user.addSecurityEvent(
      'settings_updated',
      'Security settings updated',
      req.deviceInfo,
      'low'
    );
    
    user.calculateSecurityScore();
    await user.save();
    
    res.json({
      success: true,
      message: 'Security settings updated',
      settings: user.securitySettings,
      securityScore: user.securityScore
    });
    
  } catch (error) {
    console.error('Security settings update error:', error);
    res.status(500).json({ error: 'Failed to update security settings' });
  }
});

// 📊 Security Events History
router.get('/events', isAuthenticated, async (req, res) => {
  try {
    const User = require('../models/User');
    const { page = 1, limit = 20, type } = req.query;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    let events = user.securityEvents;
    
    // Filter by type if specified
    if (type) {
      events = events.filter(event => event.type === type);
    }
    
    // Sort by newest first
    events.sort((a, b) => b.timestamp - a.timestamp);
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedEvents = events.slice(startIndex, endIndex);
    
    res.json({
      events: paginatedEvents,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(events.length / limit),
        totalEvents: events.length,
        hasNext: endIndex < events.length,
        hasPrev: page > 1
      }
    });
    
  } catch (error) {
    console.error('Security events error:', error);
    res.status(500).json({ error: 'Failed to fetch security events' });
  }
});

// 🎯 Educational Prompts Management
router.patch('/education/:promptType', isAuthenticated, async (req, res) => {
  try {
    const User = require('../models/User');
    const { promptType } = req.params;
    const { action } = req.body; // 'shown', 'dismissed'
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.educationPrompts[promptType]) {
      return res.status(400).json({ error: 'Invalid prompt type' });
    }
    
    if (action === 'shown') {
      user.educationPrompts[promptType].shown = true;
    } else if (action === 'dismissed') {
      user.educationPrompts[promptType].shown = true;
      user.educationPrompts[promptType].dismissedAt = new Date();
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: `Education prompt ${action}`,
      prompts: user.educationPrompts
    });
    
  } catch (error) {
    console.error('Education prompt error:', error);
    res.status(500).json({ error: 'Failed to update education prompt' });
  }
});

// 🔄 Account Recovery Check
router.post('/recovery/check', async (req, res) => {
  try {
    const User = require('../models/User');
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const user = await User.findOne({ email });
    
    // Don't reveal if user exists for security
    // But provide helpful recovery information
    const response = {
      success: true,
      message: 'If this email is registered, you will receive recovery instructions',
      recoveryOptions: [
        {
          type: 'email',
          description: 'Reset password via email',
          available: true
        },
        {
          type: 'security_questions',
          description: 'Answer security questions',
          available: false // Not implemented yet
        },
        {
          type: 'trusted_device',
          description: 'Verify from a trusted device',
          available: !!user && user.devices.some(d => d.isTrusted)
        }
      ]
    };
    
    if (user) {
      // Add recovery event
      user.addSecurityEvent(
        'recovery_requested',
        'Account recovery requested',
        { ip: req.ip },
        'medium'
      );
      await user.save();
    }
    
    res.json(response);
    
  } catch (error) {
    console.error('Recovery check error:', error);
    res.status(500).json({ error: 'Recovery check failed' });
  }
});
router.post("/smart",smartLoginMonitoring);

module.exports = router; 


