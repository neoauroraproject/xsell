#!/bin/bash

# X-UI SELL Simple Installation Script by Hmray
# Version: 2.0.0
# Description: Simplified installation with minimal user input

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration variables
XSELL_DIR="/opt/xsell"
SERVICE_NAME="xsell"
NGINX_CONF="/etc/nginx/sites-available/xsell"
NGINX_ENABLED="/etc/nginx/sites-enabled/xsell"
LOG_FILE="/var/log/xsell-install.log"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}$1${NC}"
}

# Function to check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Function to detect OS and install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if command -v apt-get >/dev/null 2>&1; then
        # Ubuntu/Debian
        apt-get update -y >/dev/null 2>&1
        apt-get install -y curl wget nginx openssl sqlite3 >/dev/null 2>&1
        
        # Install Node.js 18.x
        if ! command -v node >/dev/null 2>&1; then
            curl -fsSL https://deb.nodesource.com/setup_18.x | bash - >/dev/null 2>&1
            apt-get install -y nodejs >/dev/null 2>&1
        fi
        
    elif command -v yum >/dev/null 2>&1; then
        # CentOS/RHEL
        yum update -y >/dev/null 2>&1
        yum install -y epel-release >/dev/null 2>&1
        yum install -y curl wget nginx openssl sqlite >/dev/null 2>&1
        
        # Install Node.js 18.x
        if ! command -v node >/dev/null 2>&1; then
            curl -fsSL https://rpm.nodesource.com/setup_18.x | bash - >/dev/null 2>&1
            yum install -y nodejs >/dev/null 2>&1
        fi
    else
        print_error "Unsupported operating system"
        exit 1
    fi
    
    print_success "Dependencies installed"
}

# Function to get user input (simplified)
get_user_input() {
    print_header "╔══════════════════════════════════════════════════════════════╗"
    print_header "║                    X-UI SELL Installer                      ║"
    print_header "║              Quick Setup - Only 4 Questions!                ║"
    print_header "╚══════════════════════════════════════════════════════════════╝"
    echo
    
    # Step 1: Domain
    while true; do
        read -p "1. Enter your domain (e.g., panel.example.com): " DOMAIN
        if [[ -n "$DOMAIN" && "$DOMAIN" =~ ^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
            break
        else
            print_error "Please enter a valid domain name"
        fi
    done
    
    # Step 2: Admin Username
    read -p "2. Admin username [default: admin]: " ADMIN_USERNAME
    ADMIN_USERNAME=${ADMIN_USERNAME:-admin}
    
    # Step 3: Admin Password
    while true; do
        read -s -p "3. Admin password (min 6 chars): " ADMIN_PASSWORD
        echo
        if [[ ${#ADMIN_PASSWORD} -ge 6 ]]; then
            break
        else
            print_error "Password must be at least 6 characters"
        fi
    done
    
    # Step 4: Panel Port
    read -p "4. Panel port [default: 3000]: " PANEL_PORT
    PANEL_PORT=${PANEL_PORT:-3000}
    
    # Auto-configure everything else
    API_PORT=3001
    INSTALL_SSL="y"
    SSL_EMAIL="admin@${DOMAIN}"
    
    echo
    print_success "Configuration complete! Installing..."
    echo "Domain: $DOMAIN"
    echo "Username: $ADMIN_USERNAME"
    echo "Port: $PANEL_PORT"
    echo "SSL: Enabled (auto)"
    echo
}

# Function to create project structure
create_project() {
    print_status "Creating project structure..."
    
    # Create directories
    mkdir -p "$XSELL_DIR"/{server,src,public,dist}
    
    # Create basic server
    cat > "$XSELL_DIR/server/index.js" << 'EOF'
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'xsell-secret-key-2025';

// Database setup
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

// Initialize database
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'super_admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  // Create default admin
  const hashedPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);
  db.run(`INSERT OR IGNORE INTO admins (username, email, password, role) VALUES (?, ?, ?, ?)`,
    [process.env.ADMIN_USERNAME || 'admin', 'admin@xsell.com', hashedPassword, 'super_admin']);
});

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'OK', message: 'X-UI SELL Panel API is running' });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }
  
  db.get('SELECT * FROM admins WHERE username = ? OR email = ?', [username, username], (err, user) => {
    if (err || !user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: { user: req.user }
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logout successful' });
});

// Mock data endpoints
app.get('/api/panels', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'Server-01',
        url: 'https://panel.example.com',
        status: 'online',
        cpuUsage: 45.2,
        ramUsage: 67.8,
        totalUsers: 25,
        activeUsers: 18,
        trafficGB: 450,
        createdAt: new Date().toISOString()
      }
    ]
  });
});

app.get('/api/users', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        username: 'user1',
        email: 'user1@example.com',
        enable: true,
        expiryTime: Date.now() + 30 * 24 * 60 * 60 * 1000,
        totalGB: 10 * 1024 * 1024 * 1024,
        up: Math.random() * 1024 * 1024 * 1024,
        down: Math.random() * 2 * 1024 * 1024 * 1024,
        createdBy: '1',
        createdAt: new Date().toISOString(),
        panelId: '1',
        inboundId: '1',
        subId: 'sub_1'
      }
    ]
  });
});

app.get('/api/admins', authenticateToken, (req, res) => {
  db.all('SELECT id, username, email, role, created_at FROM admins', (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, data: rows });
  });
});

app.get('/api/settings', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: [
      { key: 'app_name', value: 'X-UI SELL Panel', description: 'Application name' },
      { key: 'app_version', value: '1.0.0', description: 'Application version' }
    ]
  });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`X-UI SELL Panel API running on port ${PORT}`);
});
EOF

    # Create package.json for server
    cat > "$XSELL_DIR/server/package.json" << EOF
{
  "name": "xsell-server",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "sqlite3": "^5.1.6",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2"
  }
}
EOF

    # Create basic HTML file
    cat > "$XSELL_DIR/dist/index.html" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>X-UI SELL Panel</title>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const { useState, useEffect } = React;
        
        function App() {
            const [isAuthenticated, setIsAuthenticated] = useState(false);
            const [username, setUsername] = useState('admin');
            const [password, setPassword] = useState('admin123');
            const [loading, setLoading] = useState(false);
            const [error, setError] = useState('');
            
            useEffect(() => {
                const token = localStorage.getItem('auth_token');
                if (token) {
                    fetch('/api/auth/me', {
                        headers: { 'Authorization': \`Bearer \${token}\` }
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) setIsAuthenticated(true);
                        else localStorage.removeItem('auth_token');
                    })
                    .catch(() => localStorage.removeItem('auth_token'));
                }
            }, []);
            
            const handleLogin = async (e) => {
                e.preventDefault();
                setLoading(true);
                setError('');
                
                try {
                    const response = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        localStorage.setItem('auth_token', data.data.token);
                        setIsAuthenticated(true);
                    } else {
                        setError(data.message);
                    }
                } catch (err) {
                    setError('Connection failed');
                } finally {
                    setLoading(false);
                }
            };
            
            const handleLogout = () => {
                localStorage.removeItem('auth_token');
                setIsAuthenticated(false);
            };
            
            if (isAuthenticated) {
                return (
                    <div className="min-h-screen bg-gray-50">
                        <nav className="bg-white shadow">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="flex justify-between h-16">
                                    <div className="flex items-center">
                                        <h1 className="text-xl font-bold text-gray-900">X-UI SELL Panel</h1>
                                    </div>
                                    <div className="flex items-center">
                                        <button 
                                            onClick={handleLogout}
                                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </nav>
                        
                        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                            <div className="px-4 py-6 sm:px-0">
                                <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
                                    <div className="text-center">
                                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to X-UI SELL Panel</h2>
                                        <p className="text-gray-600 mb-8">Professional X-UI Management System</p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
                                            <div className="bg-white p-6 rounded-lg shadow">
                                                <h3 className="text-lg font-semibold mb-2">Panel Management</h3>
                                                <p className="text-gray-600">Manage your X-UI panels efficiently</p>
                                            </div>
                                            <div className="bg-white p-6 rounded-lg shadow">
                                                <h3 className="text-lg font-semibold mb-2">User Control</h3>
                                                <p className="text-gray-600">Advanced user management features</p>
                                            </div>
                                            <div className="bg-white p-6 rounded-lg shadow">
                                                <h3 className="text-lg font-semibold mb-2">Traffic Monitor</h3>
                                                <p className="text-gray-600">Real-time traffic monitoring</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-8">Copyright © 2025 Design and developed by Hmray</p>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                );
            }
            
            return (
                <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                    <div className="max-w-md w-full space-y-8">
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <div className="text-center mb-8">
                                <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                                    <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900">X-UI SELL Panel</h2>
                                <p className="mt-2 text-gray-600">Professional X-UI Management System</p>
                            </div>
                            
                            <form onSubmit={handleLogin} className="space-y-6">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                        {error}
                                    </div>
                                )}
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter username"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter password"
                                        required
                                    />
                                </div>
                                
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="text-sm text-blue-800">
                                        <p className="font-medium mb-1">Demo Credentials:</p>
                                        <p>Username: admin</p>
                                        <p>Password: admin123</p>
                                    </div>
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                                >
                                    {loading ? 'Signing in...' : 'Sign in'}
                                </button>
                            </form>
                        </div>
                        
                        <div className="text-center">
                            <p className="text-xs text-gray-500">Copyright © 2025 Design and developed by Hmray</p>
                        </div>
                    </div>
                </div>
            );
        }
        
        ReactDOM.render(<App />, document.getElementById('root'));
    </script>
</body>
</html>
EOF

    print_success "Project structure created"
}

# Function to install server dependencies
install_server_deps() {
    print_status "Installing server dependencies..."
    cd "$XSELL_DIR/server"
    npm install >/dev/null 2>&1
    print_success "Server dependencies installed"
}

# Function to create environment file
create_env_file() {
    print_status "Creating environment configuration..."
    
    cat > "$XSELL_DIR/.env" << EOF
NODE_ENV=production
PORT=$API_PORT
FRONTEND_PORT=$PANEL_PORT
DOMAIN=$DOMAIN
ADMIN_USERNAME=$ADMIN_USERNAME
ADMIN_PASSWORD=$ADMIN_PASSWORD
JWT_SECRET=$(openssl rand -base64 32)
EOF
    
    chmod 600 "$XSELL_DIR/.env"
    print_success "Environment configured"
}

# Function to create systemd service
create_systemd_service() {
    print_status "Creating system service..."
    
    cat > "/etc/systemd/system/$SERVICE_NAME.service" << EOF
[Unit]
Description=X-UI SELL Panel Management System
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$XSELL_DIR/server
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=$API_PORT
Environment=ADMIN_USERNAME=$ADMIN_USERNAME
Environment=ADMIN_PASSWORD=$ADMIN_PASSWORD

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable "$SERVICE_NAME" >/dev/null 2>&1
    print_success "System service created"
}

# Function to configure Nginx
configure_nginx() {
    print_status "Configuring web server..."
    
    # Stop any conflicting services
    systemctl stop apache2 >/dev/null 2>&1 || true
    systemctl disable apache2 >/dev/null 2>&1 || true
    
    # Create self-signed certificate
    mkdir -p /etc/ssl/{private,certs}
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/ssl/private/xsell.key \
        -out /etc/ssl/certs/xsell.crt \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=$DOMAIN" >/dev/null 2>&1
    
    # Create Nginx configuration
    cat > "$NGINX_CONF" << EOF
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;
    
    ssl_certificate /etc/ssl/certs/xsell.crt;
    ssl_certificate_key /etc/ssl/private/xsell.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    location / {
        root $XSELL_DIR/dist;
        try_files \$uri \$uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:$API_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    
    # Enable site
    ln -sf "$NGINX_CONF" "$NGINX_ENABLED"
    rm -f /etc/nginx/sites-enabled/default
    
    # Test and start Nginx
    nginx -t >/dev/null 2>&1
    systemctl restart nginx >/dev/null 2>&1
    systemctl enable nginx >/dev/null 2>&1
    
    print_success "Web server configured"
}

# Function to start services
start_services() {
    print_status "Starting services..."
    
    systemctl start "$SERVICE_NAME"
    
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        print_success "All services started"
    else
        print_error "Failed to start services"
        exit 1
    fi
}

# Function to display final information
display_final_info() {
    clear
    print_header "╔══════════════════════════════════════════════════════════════╗"
    print_header "║                  Installation Complete!                     ║"
    print_header "╚══════════════════════════════════════════════════════════════╝"
    echo
    print_success "X-UI SELL Panel has been installed successfully!"
    echo
    echo "🌐 Access URL: https://$DOMAIN"
    echo "👤 Username: $ADMIN_USERNAME"
    echo "🔑 Password: [Your chosen password]"
    echo
    echo "📋 Service Commands:"
    echo "   Start:   systemctl start $SERVICE_NAME"
    echo "   Stop:    systemctl stop $SERVICE_NAME"
    echo "   Status:  systemctl status $SERVICE_NAME"
    echo "   Logs:    journalctl -u $SERVICE_NAME -f"
    echo
    echo "📁 Installation Directory: $XSELL_DIR"
    echo "📄 Configuration: $XSELL_DIR/.env"
    echo
    print_header "Copyright © 2025 Design and developed by Hmray"
    echo
}

# Main installation function
main_install() {
    clear
    check_root
    get_user_input
    
    print_status "Starting installation..."
    install_dependencies
    create_project
    install_server_deps
    create_env_file
    create_systemd_service
    configure_nginx
    start_services
    display_final_info
}

# Run installation
main_install