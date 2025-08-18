const mongoose = require("mongoose");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function() { return !this.googleId; } }, // Only required if not Google OAuth
  googleId: { type: String,unique:true, sparse: true }, // For Google OAuth users
  role: { type: String, enum: ["student", "canteen", "campus", "admin"], required: true },
  campus: { type: mongoose.Schema.Types.ObjectId, ref: "Campus", required: function() { return !this.googleId; } }, // Only required if not Google OAuth
  canteenId: { type: mongoose.Schema.Types.ObjectId, ref: "Canteen" },
  profileImage: { type: String },
  phone: { type: String }, // Required for all except canteen
  bio: { type: String },
  address: { type: String },
  dateOfBirth: { type: Date },
  isDeleted: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  is_verified: { type: Boolean, default: false }, 

  subscription:{
    type:String,
    default:null
  },
  // 🔐 Smart Security Features
    
  devices: [{
    deviceId: { type: String, required: true },
    deviceName: { type: String, required: true },
    deviceType: { type: String, enum: ['mobile', 'desktop', 'tablet', 'unknown'], default: 'unknown' },
    browser: { type: String },
    os: { type: String },
    location: {
      ip: String,
      city: String,
      country: String,
      campus: String
    },
    lastActive: { type: Date, default: Date.now },
    firstSeen: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    isTrusted: { type: Boolean, default: false },
    sessionCount: { type: Number, default: 1 }
  }],

  securityEvents: [{
    type: { 
      type: String, 
      enum: ['login', 'suspicious_login', 'new_device', 'password_change', 'failed_login', 'verification_sent', 'account_locked', 'device_removed', 'profile_update', 'profile_image_update'],
      required: true 
    },
    description: String,
    deviceInfo: {
      deviceId: String,
      ip: String,
      userAgent: String,
      location: String
    },
    riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    resolved: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
  }],

  securitySettings: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
    loginAlerts: { type: Boolean, default: true },
    deviceManagement: { type: Boolean, default: true },
    autoLockout: { type: Boolean, default: false }, // Gentle approach - disabled by default
    maxDevices: { type: Number, default: 5 }, // Generous limit for campus life
    trustedDevices: [String] // Device IDs that user has explicitly trusted
  },

  verificationCodes: [{
    code: String,
    type: { type: String, enum: ['email', 'sms', 'device_verification'] },
    purpose: String,
    expiresAt: Date,
    used: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],

  // Account Recovery & Security Stats
  securityScore: { type: Number, default: 100, min: 0, max: 100 },
  lastPasswordChange: { type: Date, default: Date.now },
  suspiciousActivityCount: { type: Number, default: 0 },
  accountLockUntil: Date,
  educationPrompts: {
    passwordSecurity: { shown: { type: Boolean, default: false }, dismissedAt: Date },
    deviceManagement: { shown: { type: Boolean, default: false }, dismissedAt: Date },
    twoFactor: { shown: { type: Boolean, default: false }, dismissedAt: Date }
  }
}, { timestamps: true });

// 🔒 Security Methods
UserSchema.methods.getresetpass = function(){
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
    return resetToken;
}

// Smart device management
UserSchema.methods.addDevice = function(deviceInfo) {
    const existingDevice = this.devices.find(d => d.deviceId === deviceInfo.deviceId);
    
    if (existingDevice) {
        existingDevice.lastActive = new Date();
        existingDevice.sessionCount += 1;
        existingDevice.isActive = true;
    } else {
        // Clean up old inactive devices if we exceed limit
        if (this.devices.length >= this.securitySettings.maxDevices) {
            this.devices.sort((a, b) => a.lastActive - b.lastActive);
            this.devices.splice(0, this.devices.length - this.securitySettings.maxDevices + 1);
        }
        
        this.devices.push({
            deviceId: deviceInfo.deviceId,
            deviceName: deviceInfo.deviceName || 'Unknown Device',
            deviceType: deviceInfo.deviceType || 'unknown',
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            location: deviceInfo.location || {},
            isTrusted: false
        });
    }
};

// Add security event
UserSchema.methods.addSecurityEvent = function(eventType, description, deviceInfo = {}, riskLevel = 'low') {
    // Serialize location object to string for storage
    let locationString = '';
    if (deviceInfo.location) {
        if (typeof deviceInfo.location === 'string') {
            locationString = deviceInfo.location;
        } else {
            locationString = `${deviceInfo.location.city || 'Unknown'}, ${deviceInfo.location.country || 'Unknown'}`;
        }
    }
    
    const securityEvent = {
        type: eventType,
        description,
        deviceInfo: {
            deviceId: deviceInfo.deviceId || '',
            ip: deviceInfo.ip || deviceInfo.location?.ip || '',
            userAgent: deviceInfo.userAgent || '',
            location: locationString
        },
        riskLevel,
        timestamp: new Date()
    };
    
    this.securityEvents.push(securityEvent);
    if(eventType==="suspicious_login" || riskLevel === 'high'){
      this.suspiciousActivityCount+=1;
    }
    
    // Keep only last 50 events to prevent bloat
    if (this.securityEvents.length > 50) {
        this.securityEvents = this.securityEvents.slice(-50);
    }
};

// Calculate security score
UserSchema.methods.calculateSecurityScore = function() {
    let score = 100;
    
    // Deduct points for security issues
    if (!this.password || this.password.length < 8) score -= 20;
    if (this.suspiciousActivityCount > 0) score -= (this.suspiciousActivityCount * 5);
    if (this.devices.length > 3) score -= 5; // Slight penalty for many devices
    if (!this.securitySettings.emailNotifications) score -= 10;
    
    // Add points for good practices
    if (this.securitySettings.twoFactorEnabled) score += 15;
    if (this.devices.some(d => d.isTrusted)) score += 10;
    if (this.lastPasswordChange > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) score += 10; // Recent password change
    
    this.securityScore = Math.max(0, Math.min(100, score));
    return this.securityScore;
};

// Check if activity is suspicious
UserSchema.methods.isSuspiciousActivity = function(newDeviceInfo) {
    const recentEvents = this.securityEvents.filter(
        event => event.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    
    // Red flags (but not blocking)
    const suspiciousFactors = [
        // Many new devices in short time
        this.devices.filter(d => d.firstSeen > new Date(Date.now() - 60 * 60 * 1000)).length > 2,
        
        // Rapid location changes
        recentEvents.filter(e => e.type === 'login').length > 5,
        
        // Recent failed login attempts
        recentEvents.filter(e => e.type === 'failed_login').length > 3,
        
        // Too many suspicious events
        recentEvents.filter(e => e.riskLevel === 'high').length > 1
    ];
    
    return suspiciousFactors.filter(Boolean).length >= 2;
};

module.exports = mongoose.model("User", UserSchema);
