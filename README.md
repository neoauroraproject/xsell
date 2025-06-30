# X-UI SELL Panel - Professional X-UI Management System

A professional web-based management panel for X-UI proxy servers with advanced user management, traffic monitoring, and multi-panel support designed for VPN/proxy service providers.

![X-UI SELL Panel Dashboard](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-brightgreen.svg)
![React](https://img.shields.io/badge/React-18+-blue.svg)

## 🚀 Quick Installation

**One-line installation command:**
```bash
curl -fsSL https://raw.githubusercontent.com/xsell/x-ui-sell-panel/main/install.sh | sudo bash
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
curl -fsSL https://raw.githubusercontent.com/xsell/x-ui-sell-panel/main/install.sh | sudo bash
```

### Method 2: Manual Installation
```bash
# Download the installer
wget https://raw.githubusercontent.com/xsell/x-ui-sell-panel/main/install.sh

# Make it executable
chmod +x install.sh

# Run the installer with menu
sudo ./install.sh
```

### Method 3: Git Clone Installation
```bash
# Clone the repository
git clone https://github.com/xsell/x-ui-sell-panel.git
cd x-ui-sell-panel

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

### X-UI Panel (Optional)
- **Panel URL**: X-UI panel URL
- **Username**: X-UI panel username
- **Password**: X-UI panel password

## 🔑 Default Access

After installation, access your panel at:
- **URL**: `https://your-domain.com` (or `http://your-domain.com` without SSL)
- **Username**: `admin` (or your custom username)
- **Password**: Your chosen password during installation

## 🎮 Service Management

### Systemd Commands
```bash
# Start X-UI SELL Panel
sudo systemctl start walpanel

# Stop X-UI SELL Panel
sudo systemctl stop walpanel

# Restart X-UI SELL Panel
sudo systemctl restart walpanel

# Check status
sudo systemctl status walpanel

# Enable auto-start on boot
sudo systemctl enable walpanel

# View real-time logs
sudo journalctl -u walpanel -f
```

### File Locations
```
📁 Installation Directory: /opt/walpanel/
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
├── 📄 /etc/systemd/system/walpanel.service    # Service file
├── 📄 /etc/nginx/sites-available/walpanel     # Nginx config
├── 📄 /var/log/walpanel-install.log          # Install log
└── 📁 /etc/letsencrypt/live/your-domain/      # SSL certificates
```

---

## 📄 Copyright

**Copyright © 2025 Design and developed by Hmray**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **📖 Documentation**: Comprehensive guides and tutorials
- **🐛 Issues**: [GitHub Issues](https://github.com/xsell/x-ui-sell-panel/issues) for bug reports
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/xsell/x-ui-sell-panel/discussions)
- **💬 Community**: Join our community for support and discussions

### Professional Support
For enterprise support, custom development, or consulting services, please contact us.

---

<div align="center">

**X-UI SELL Panel** - Professional X-UI Management Made Simple

[![GitHub stars](https://img.shields.io/github/stars/xsell/x-ui-sell-panel?style=social)](https://github.com/xsell/x-ui-sell-panel/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/xsell/x-ui-sell-panel?style=social)](https://github.com/xsell/x-ui-sell-panel/network/members)

**Copyright © 2025 Design and developed by Hmray**

</div>
