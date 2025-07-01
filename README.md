# X-UI SELL Panel - Professional X-UI Management System

A professional web-based management panel for X-UI proxy servers with advanced user management, traffic monitoring, and multi-panel support designed for VPN/proxy service providers.

![X-UI SELL Panel Dashboard](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-brightgreen.svg)
![React](https://img.shields.io/badge/React-18+-blue.svg)

## 🚀 Quick Installation

**One-line installation command:**
```bash
curl -fsSL https://raw.githubusercontent.com/neoauroraproject/xsell/main/install.sh -o install.sh && chmod +x install.sh && sudo ./install.sh
```

## ✨ Features

### 🎯 Core Features
- **Multi-Panel Management**: Manage multiple X-UI panels from a single interface
- **Advanced User Management**: Create, edit, delete, and monitor users across panels
- **Real-time Traffic Monitoring**: Live statistics and usage tracking
- **Role-based Access Control**: Super Admin and Regular Admin roles with traffic quotas
- **API Testing Suite**: Built-in tools to test all API endpoints and X-UI connections
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

### 👥 User Management
- **Bulk Operations**: Delete, extend expiry, reset traffic, add traffic for multiple users
- **Advanced Search & Filtering**: Filter by status, usage threshold, expiry range
- **Traffic History**: Complete audit logs of all user modifications
- **QR Code Generation**: Generate QR codes for client configurations
- **User Status Management**: Active/inactive/expired status tracking
- **Traffic Quotas**: Set and monitor individual user traffic limits

### 📊 Monitoring & Analytics
- **Real-time Bandwidth Monitoring**: Live upload/download statistics
- **Traffic Usage Charts**: Interactive graphs with daily/weekly/monthly views
- **Connection Logs**: Detailed user connection history and session tracking
- **System Resource Monitoring**: CPU, memory, and disk usage tracking
- **Live Panel Status**: Real-time monitoring of all connected X-UI panels
- **Performance Metrics**: Response times and system health indicators

### 🔧 Administration
- **Panel Connection Testing**: Verify X-UI panel connectivity before adding
- **Automated Backups**: Scheduled backups with restore functionality
- **SSL Certificate Management**: Automatic Let's Encrypt SSL setup and renewal
- **Multi-admin Support**: Create regular admins with traffic and time quotas
- **Comprehensive Audit Logging**: Track all administrative actions
- **Settings Management**: Configurable system settings and preferences

### 🛡️ Security Features
- **JWT Authentication**: Secure token-based authentication system
- **Role-based Permissions**: Granular access control for different admin levels
- **SSL/TLS Encryption**: Automatic HTTPS with security headers
- **Firewall Integration**: Automatic firewall configuration
- **Input Validation**: Server-side validation for all user inputs
- **Session Management**: Secure session handling with configurable timeouts

## 📋 Prerequisites

- **Operating System**: Ubuntu 18.04+ / Debian 10+ / CentOS 7+ / Rocky Linux 8+
- **Access**: Root/sudo access required
- **Domain**: Domain name (recommended for SSL)
- **X-UI Panels**: One or more X-UI panels to manage
- **Memory**: Minimum 1GB RAM
- **Storage**: Minimum 2GB free space

## 🔧 Installation Methods

### Method 1: One-Line Installation (Recommended)
```bash
curl -fsSL https://raw.githubusercontent.com/neoauroraproject/xsell/main/install.sh -o install.sh && chmod +x install.sh && sudo ./install.sh
```

### Method 2: Manual Installation
```bash
# Download the installer
wget https://raw.githubusercontent.com/neoauroraproject/xsell/main/install.sh

# Make it executable
chmod +x install.sh

# Run the installer with menu
sudo ./install.sh
```

### Method 3: Git Clone Installation
```bash
# Clone the repository
git clone https://github.com/neoauroraproject/xsell.git
cd xsell

# Run the installer
sudo ./install.sh
```

## 📱 Installation Menu

The installer provides an interactive menu with these options:

1. **🚀 Install X-UI SELL Panel** - Complete installation with all dependencies
2. **📦 Install Dependencies Only** - Install only required system packages
3. **🔄 Update X-UI SELL Panel** - Update to the latest version
4. **🗑️ Uninstall X-UI SELL Panel** - Complete removal of X-UI SELL Panel
5. **💾 Backup X-UI SELL Panel** - Create a backup of your installation
6. **📥 Restore X-UI SELL Panel** - Restore from a previous backup
7. **📊 View Service Status** - Check X-UI SELL Panel service status
8. **📋 View Logs** - Monitor X-UI SELL Panel logs in real-time
9. **❌ Exit** - Exit the installer

## ⚙️ Configuration

During installation, you'll configure:

### Basic Settings
- **Domain Name**: Your panel domain (e.g., `panel.example.com`)
- **Panel Port**: Frontend port (default: `3000`)
- **API Port**: Backend API port (default: `3001`)

### Admin Account
- **Username**: Admin username (default: `admin`)
- **Password**: Secure password (minimum 6 characters)

### SSL Certificate
- **Auto SSL**: Automatic Let's Encrypt certificate
- **Email**: Email for SSL certificate notifications

## 🔑 Default Access

After installation, access your panel at:
- **URL**: `https://your-domain.com` (or `http://your-domain.com` without SSL)
- **Username**: `admin` (or your custom username)
- **Password**: Your chosen password during installation

## 🎮 Service Management

### Systemd Commands
```bash
# Start X-UI SELL Panel
sudo systemctl start xsell

# Stop X-UI SELL Panel
sudo systemctl stop xsell

# Restart X-UI SELL Panel
sudo systemctl restart xsell

# Check status
sudo systemctl status xsell

# Enable auto-start on boot
sudo systemctl enable xsell

# View real-time logs
sudo journalctl -u xsell -f
```

### File Locations
```
📁 Installation Directory: /opt/xsell/
├── 📄 .env                    # Environment configuration
├── 📁 server/                 # Backend server files
│   ├── 📄 package.json       # Backend dependencies
│   ├── 📄 index.js           # Main server file
│   ├── 📁 config/            # Database and API config
│   ├── 📁 routes/            # API routes
│   ├── 📁 services/          # Business logic
│   └── 📄 database.sqlite    # SQLite database
├── 📁 src/                   # Frontend source files
├── 📁 dist/                  # Built frontend files
└── 📄 package.json          # Frontend dependencies

📁 System Files:
├── 📄 /etc/systemd/system/xsell.service    # Service file
├── 📄 /etc/nginx/sites-available/xsell     # Nginx config
├── 📄 /var/log/xsell-install.log          # Install log
└── 📁 /etc/letsencrypt/live/your-domain/      # SSL certificates
```

## 🔌 API Documentation

X-UI SELL Panel provides a comprehensive REST API:

### Authentication Endpoints
```http
POST   /api/auth/login           # Admin login
POST   /api/auth/logout          # Admin logout
GET    /api/auth/me              # Get current user
POST   /api/auth/change-password # Change password
```

### Panel Management
```http
GET    /api/panels               # List all panels
POST   /api/panels               # Create new panel
PUT    /api/panels/:id           # Update panel
DELETE /api/panels/:id           # Delete panel
```

### User Management
```http
GET    /api/users                # List all users
POST   /api/users                # Create new user
PUT    /api/users/:id            # Update user
DELETE /api/users/:id            # Delete user
```

### Admin Management
```http
GET    /api/admins               # List all admins (super admin only)
POST   /api/admins               # Create new admin (super admin only)
PUT    /api/admins/:id           # Update admin
DELETE /api/admins/:id           # Delete admin (super admin only)
```

### X-UI Integration
```http
POST   /api/xui/test-connection  # Test X-UI panel connection
GET    /api/xui/inbounds/:panelId # Get panel inbounds
GET    /api/xui/stats/:panelId   # Get panel statistics
POST   /api/xui/clients/:panelId # Create X-UI client
PUT    /api/xui/clients/:panelId/:clientId # Update X-UI client
DELETE /api/xui/clients/:panelId/:clientId # Delete X-UI client
```

### Settings Management
```http
GET    /api/settings             # Get all settings
GET    /api/settings/:key        # Get specific setting
PUT    /api/settings/:key        # Update setting
POST   /api/settings             # Create new setting
DELETE /api/settings/:key        # Delete setting
```

## 🛠️ Advanced Configuration

### Environment Variables
Edit `/opt/xsell/.env` to customize:

```bash
# Server Configuration
NODE_ENV=production
PORT=3001
FRONTEND_PORT=3000

# Database
DB_PATH=/opt/xsell/server/database.sqlite

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Domain Configuration
DOMAIN=your-domain.com
PANEL_URL=https://your-domain.com
```

### Nginx Configuration
Custom Nginx settings in `/etc/nginx/sites-available/xsell`:

```nginx
# Custom rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

server {
    # ... existing configuration ...
    
    # API rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        # ... existing proxy settings ...
    }
}
```

## 💾 Backup & Recovery

### Automatic Backups
```bash
# Create backup
sudo ./install.sh
# Select option 5

# Restore backup
sudo ./install.sh
# Select option 6
```

### Manual Database Backup
```bash
# Backup database
sudo cp /opt/xsell/server/database.sqlite /opt/xsell/server/database.backup.$(date +%Y%m%d_%H%M%S).sqlite

# Restore database
sudo systemctl stop xsell
sudo cp /opt/xsell/server/database.backup.YYYYMMDD_HHMMSS.sqlite /opt/xsell/server/database.sqlite
sudo systemctl start xsell
```

### Configuration Backup
```bash
# Backup configuration
sudo tar -czf xsell-config-$(date +%Y%m%d_%H%M%S).tar.gz -C /opt/xsell .env

# Backup entire installation
sudo tar -czf xsell-full-$(date +%Y%m%d_%H%M%S).tar.gz -C /opt xsell
```

## 🔄 Updating

### Automatic Update
```bash
sudo ./install.sh
# Select option 3 for update
```

### Manual Update
```bash
cd /opt/xsell
sudo systemctl stop xsell

# Backup current version
sudo cp -r /opt/xsell /opt/xsell.backup.$(date +%Y%m%d_%H%M%S)

# Update dependencies
cd server && sudo npm update
cd .. && sudo npm update && sudo npm run build

sudo systemctl start xsell
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Service Won't Start
```bash
# Check service status
sudo systemctl status xsell

# View detailed logs
sudo journalctl -u xsell -n 50

# Check file permissions
sudo chown -R xsell:xsell /opt/xsell
sudo systemctl restart xsell
```

#### 2. Database Connection Issues
```bash
# Check database file
ls -la /opt/xsell/server/database.sqlite

# Reset database permissions
sudo chown xsell:xsell /opt/xsell/server/database.sqlite
sudo chmod 644 /opt/xsell/server/database.sqlite
```

#### 3. Nginx Configuration Errors
```bash
# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/xsell_error.log
```

#### 4. SSL Certificate Issues
```bash
# Test certificate renewal
sudo certbot renew --dry-run

# Force certificate renewal
sudo certbot renew --force-renewal

# Check certificate status
sudo certbot certificates
```

#### 5. X-UI Connection Problems
```bash
# Test X-UI connection manually
curl -X POST http://your-xui-panel/login \
  -H "Content-Type: application/json" \
  -d '{"username":"your-username","password":"your-password"}'

# Check X-UI panel accessibility
curl -I http://your-xui-panel
```

### Log Files
```bash
# Application logs
sudo journalctl -u xsell -f

# Nginx access logs
sudo tail -f /var/log/nginx/xsell_access.log

# Nginx error logs
sudo tail -f /var/log/nginx/xsell_error.log

# Installation log
sudo tail -f /var/log/xsell-install.log
```

### Performance Optimization

#### Database Optimization
```bash
# Vacuum database
sudo sqlite3 /opt/xsell/server/database.sqlite "VACUUM;"

# Analyze database
sudo sqlite3 /opt/xsell/server/database.sqlite "ANALYZE;"
```

#### Memory Optimization
```bash
# Check memory usage
free -h
ps aux | grep node

# Restart service to free memory
sudo systemctl restart xsell
```

## 🗑️ Uninstalling

### Complete Removal
```bash
sudo ./install.sh
# Select option 4 for uninstall
```

### Manual Removal
```bash
# Stop and disable service
sudo systemctl stop xsell
sudo systemctl disable xsell
sudo rm /etc/systemd/system/xsell.service
sudo systemctl daemon-reload

# Remove Nginx configuration
sudo rm /etc/nginx/sites-available/xsell
sudo rm /etc/nginx/sites-enabled/xsell
sudo systemctl restart nginx

# Remove installation directory
sudo rm -rf /opt/xsell

# Remove user
sudo userdel xsell

# Remove SSL certificate (optional)
sudo certbot delete --cert-name your-domain.com
```

## 🔒 Security Best Practices

### Server Security
- Keep system packages updated
- Use strong passwords for admin accounts
- Enable firewall with minimal required ports
- Regular security audits and log monitoring
- Use SSL/TLS encryption for all connections

### Application Security
- Change default admin credentials immediately
- Use strong JWT secrets
- Regular database backups
- Monitor access logs for suspicious activity
- Keep X-UI SELL Panel updated to latest version

### X-UI Panel Security
- Use strong credentials for X-UI panels
- Limit X-UI panel access to X-UI SELL Panel server IP
- Regular X-UI panel updates
- Monitor X-UI panel logs

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Check service health
curl http://localhost:3001/api/health

# Check database connectivity
sudo sqlite3 /opt/xsell/server/database.sqlite ".tables"

# Check disk space
df -h /opt/xsell
```

### Regular Maintenance
```bash
# Weekly tasks
sudo systemctl restart xsell  # Restart service
sudo sqlite3 /opt/xsell/server/database.sqlite "VACUUM;"  # Optimize database

# Monthly tasks
sudo ./install.sh  # Check for updates (option 3)
sudo certbot renew  # Renew SSL certificates
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Setup
```bash
# Clone repository
git clone https://github.com/neoauroraproject/xsell.git
cd xsell

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd .. && npm install

# Start development servers
npm run server:dev  # Backend
npm run dev         # Frontend
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **📖 Documentation**: Comprehensive guides and tutorials
- **🐛 Issues**: [GitHub Issues](https://github.com/neoauroraproject/xsell/issues) for bug reports
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/neoauroraproject/xsell/discussions)
- **💬 Community**: Join our community for support and discussions

### Professional Support
For enterprise support, custom development, or consulting services, please contact us.

## 🙏 Acknowledgments

- **X-UI Project**: For the excellent X-UI panel
- **React Team**: For the amazing React framework
- **Node.js Community**: For the robust backend platform
- **Contributors**: All the amazing people who contribute to this project

---

## 📄 Copyright

**Copyright © 2025 Design and developed by Hmray**

---

<div align="center">

**X-UI SELL Panel** - Professional X-UI Management Made Simple

[![GitHub stars](https://img.shields.io/github/stars/neoauroraproject/xsell?style=social)](https://github.com/neoauroraproject/xsell/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/neoauroraproject/xsell?style=social)](https://github.com/neoauroraproject/xsell/network/members)

**Copyright © 2025 Design and developed by Hmray**

</div>