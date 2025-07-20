const User = require('../models/User');
const SendNotification=require("../utils/sendNotification");
const crypto = require('crypto');
const UAParser = require('ua-parser-js'); // For parsing user agent

// 🧠 Smart Device Information Extraction
const extractDeviceInfo = (req) => {
  const parser = new UAParser(req.headers['user-agent']);
  const result = parser.getResult();
  
  // Create a unique but anonymous device fingerprint
  const deviceFingerprint = crypto
    .createHash('sha256')
    .update(`${result.browser.name}-${result.os.name}-${req.headers['user-agent']}-${req.headers['accept-language']}`)
    .digest('hex')
    .substring(0, 16);

  return {
    deviceId: deviceFingerprint,
    deviceName: `${result.browser.name} on ${result.os.name}`,
    deviceType: result.device.type || (result.os.name === 'iOS' || result.os.name === 'Android' ? 'mobile' : 'desktop'),
    browser: `${result.browser.name} ${result.browser.version}`,
    os: `${result.os.name} ${result.os.version}`,
    location: {
      ip: req.ip || req.connection.remoteAddress,
      // Note: In production, you'd use a GeoIP service for location
      city: 'Unknown',
      country: 'Unknown',
      campus: 'Unknown'
    }
  };
};

// 🔍 Smart Login Monitoring Middleware
const smartLoginMonitoring = async (req, res, next) => {
  try {
    const deviceInfo = extractDeviceInfo(req);
    req.deviceInfo = deviceInfo;
    // If this is a login attempt, track it
    if (req.path.includes('/login') && req.method === 'POST') {
      const { email } = req.body;
      
      if (email) {
        const user = await User.findOne({ email });
        
        if (user) {
          // Check for suspicious activity BEFORE allowing login
          const isSuspicious = user.isSuspiciousActivity(deviceInfo);
          
          if (isSuspicious && user.securitySettings.loginAlerts) {
            // Log the suspicious attempt but don't block it
            user.addSecurityEvent(
              'suspicious_login',
              `Login attempt from ${deviceInfo.deviceName} flagged as suspicious`,
              deviceInfo,
              'medium'
            );
            
            req.requiresVerification = true;
            req.suspiciousReason = 'Multiple red flags detected - verification recommended';
          }
          
          // Track new device detection
          const OtherUserWithSameDevice= await User.find({"devices.deviceId":deviceInfo.deviceId,
            _id:{
              $ne:user._id
            }
          })
          if(OtherUserWithSameDevice.length>0){
            const previousEmails=OtherUserWithSameDevice.map(u=>u.email).join(",");
              const Admin=await User.findOne({role:"Admin"});
              if(Admin){
                  await SendNotification(Admin._id,"Suspected Device Reuse",`User ${user.email} logged in from a device previously used by: ${previousEmails}`);
              }

              user.addSecurityEvent(
              'suspicious_login',
              `Device reused from another account (previously used by: ${previousEmails})`,
              deviceInfo,
              'high'
            );

            req.requiresVerification = true;
            req.suspiciousReason = 'Device previously used by another user';
          
          }

          const existingDevice = user.devices.find(d => d.deviceId === deviceInfo.deviceId);
          if (!existingDevice) {
            user.addSecurityEvent(
              'new_device',
              `New device detected: ${deviceInfo.deviceName}`,
              deviceInfo,
              'low'
            );
            
            req.isNewDevice = true;
          }
          // else{
          //   const Admin=await User.findOne({role:"Admin"});
          //   await SendNotification(Admin._id,"Suspected User",`User Loggedin with new Id ${user.email}`);
          // }
          
          await user.save();
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Smart monitoring error:', error);
    // Don't break the flow if monitoring fails
    next();
  }
};

// 🛡️ Post-Login Device Registration
const registerDeviceOnLogin = async (req, res, next) => {
  try {
    if (req.user && req.deviceInfo) {
      const user = await User.findById(req.user.id);
      
      if (user) {
        // Register/update device
        user.addDevice(req.deviceInfo);
        
        // Add login event
        user.addSecurityEvent(
          'login',
          `Successful login from ${req.deviceInfo.deviceName}`,
          req.deviceInfo,
          req.requiresVerification ? 'medium' : 'low'
        );
        
        // Update security score
        user.calculateSecurityScore();
        
        await user.save();
        
        // Attach device info to response for frontend
        res.locals.deviceRegistered = true;
        res.locals.securityScore = user.securityScore;
        res.locals.requiresVerification = req.requiresVerification;
        res.locals.isNewDevice = req.isNewDevice;
      }
    }
    
    next();
  } catch (error) {
    console.error('Device registration error:', error);
    next();
  }
};

// 🔐 Gentle Verification Check
const checkVerificationRequired = (req, res, next) => {
  // Only suggest verification, never block
  if (req.requiresVerification || req.isNewDevice) {
    res.locals.securityPrompt = {
      type: req.requiresVerification ? 'verification_recommended' : 'new_device_detected',
      message: req.requiresVerification 
        ? 'We noticed some unusual activity. Would you like to verify this login?' 
        : 'New device detected! Consider adding it to your trusted devices.',
      severity: req.requiresVerification ? 'medium' : 'low',
      actions: [
        { type: 'verify_email', label: 'Verify via Email' },
        { type: 'trust_device', label: 'Trust this Device' },
        { type: 'dismiss', label: 'Continue Normally' }
      ]
    };
  }
  
  next();
};

// 📊 Security Dashboard Data
const getSecurityDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Calculate current security score
    const securityScore = user.calculateSecurityScore();
    
    // Get recent security events
    const recentEvents = user.securityEvents
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
    
    // Active devices
    const activeDevices = user.devices
      .filter(d => d.isActive)
      .sort((a, b) => b.lastActive - a.lastActive);
    
    // Security recommendations
    const recommendations = [];
    
    if (!user.securitySettings.twoFactorEnabled) {
      recommendations.push({
        type: 'enable_2fa',
        title: 'Enable Two-Factor Authentication',
        description: 'Add an extra layer of security to your account',
        impact: 'high',
        action: 'security_settings'
      });
    }
    
    if (user.devices.length > 3 && user.devices.filter(d => d.isTrusted).length === 0) {
      recommendations.push({
        type: 'trust_devices',
        title: 'Mark Trusted Devices',
        description: 'Identify your regular devices for smoother login experience',
        impact: 'medium',
        action: 'device_management'
      });
    }
    
    if (user.lastPasswordChange < new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)) {
      recommendations.push({
        type: 'password_update',
        title: 'Update Your Password',
        description: 'Your password is over 6 months old',
        impact: 'medium',
        action: 'password_change'
      });
    }
    
    res.json({
      securityScore,
      scoreCategory: securityScore >= 80 ? 'excellent' : securityScore >= 60 ? 'good' : 'needs_improvement',
      devices: activeDevices,
      recentEvents,
      recommendations,
      settings: user.securitySettings
    });
    
  } catch (error) {
    console.error('Security dashboard error:', error);
    res.status(500).json({ error: 'Failed to load security dashboard' });
  }
};

// 🔧 Device Management Actions
const manageDevice = async (req, res) => {
  try {
    const { deviceId, action } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const device = user.devices.find(d => d.deviceId === deviceId);
    
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    switch (action) {
      case 'trust':
        device.isTrusted = true;
        user.addSecurityEvent('device_trusted', `Device ${device.deviceName} marked as trusted`, { deviceId }, 'low');
        break;
        
      case 'remove':
        user.devices = user.devices.filter(d => d.deviceId !== deviceId);
        user.addSecurityEvent('device_removed', `Device ${device.deviceName} removed from account`, { deviceId }, 'low');
        break;
        
      case 'rename':
        const { newName } = req.body;
        if (newName) {
          device.deviceName = newName;
          user.addSecurityEvent('device_renamed', `Device renamed to ${newName}`, { deviceId }, 'low');
        }
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
    
    user.calculateSecurityScore();
    await user.save();
    
    res.json({ 
      success: true, 
      message: `Device ${action} successful`,
      securityScore: user.securityScore 
    });
    
  } catch (error) {
    console.error('Device management error:', error);
    res.status(500).json({ error: 'Device management failed' });
  }
};

// 📧 Send Verification Code (Gentle)
const sendVerificationCode = async (req, res) => {
  try {
    const { purpose = 'login_verification' } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Generate friendly verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store verification code
    user.verificationCodes.push({
      code: crypto.createHash('sha256').update(code).digest('hex'),
      type: 'email',
      purpose,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    });
    
    user.addSecurityEvent('verification_sent', `Verification code sent for ${purpose}`, req.deviceInfo, 'low');
    await user.save();
    
    // TODO: Send email with verification code
    // For now, we'll just log it (in production, integrate with email service)
    console.log(`Verification code for ${user.email}: ${code}`);
    
    res.json({
      success: true,
      message: 'Verification code sent to your email',
      expiresIn: 15 * 60 // 15 minutes in seconds
    });
    
  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
};

// ✅ Verify Code
const verifyCode = async (req, res) => {
  try {
    const { code, purpose = 'login_verification' } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
    const verificationRecord = user.verificationCodes.find(vc => 
      vc.code === hashedCode && 
      vc.purpose === purpose && 
      !vc.used && 
      vc.expiresAt > new Date()
    );
    
    if (!verificationRecord) {
      user.addSecurityEvent('verification_failed', `Invalid verification code for ${purpose}`, req.deviceInfo, 'medium');
      await user.save();
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }
    
    // Mark as used
    verificationRecord.used = true;
    
    // Add successful verification event
    user.addSecurityEvent('verification_success', `Successfully verified ${purpose}`, req.deviceInfo, 'low');
    
    // If verifying a device, mark it as trusted
    if (purpose === 'device_verification' && req.deviceInfo) {
      const device = user.devices.find(d => d.deviceId === req.deviceInfo.deviceId);
      if (device) {
        device.isTrusted = true;
      }
    }
    
    user.calculateSecurityScore();
    await user.save();
    
    res.json({
      success: true,
      message: 'Verification successful',
      securityScore: user.securityScore
    });
    
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
};

module.exports = {
  smartLoginMonitoring,
  registerDeviceOnLogin,
  checkVerificationRequired,
  getSecurityDashboard,
  manageDevice,
  sendVerificationCode,
  verifyCode,
  extractDeviceInfo
}; 