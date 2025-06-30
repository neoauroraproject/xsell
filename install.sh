#!/bin/bash

# X-UI SELL Installation Script by Hmray
# Version: 1.0.0
# Description: Complete installation script for X-UI SELL Panel Management System

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Configuration variables
WALPANEL_DIR="/opt/walpanel"
SERVICE_NAME="walpanel"
NGINX_CONF="/etc/nginx/sites-available/walpanel"
NGINX_ENABLED="/etc/nginx/sites-enabled/walpanel"
LOG_FILE="/var/log/walpanel-install.log"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}$1${NC}"
}

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Function to check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Function to detect OS
detect_os() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        print_error "Cannot detect operating system"
        exit 1
    fi
    
    print_status "Detected OS: $OS $VER"
    log_message "Detected OS: $OS $VER"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install dependencies based on OS
install_dependencies() {
    print_header "Installing Dependencies..."
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        # Update package list
        print_status "Updating package list..."
        apt-get update -y
        
        # Install required packages
        print_status "Installing required packages..."
        apt-get install -y curl wget git nginx certbot python3-certbot-nginx ufw sqlite3 unzip
        
        # Install Node.js 18.x
        if ! command_exists node; then
            print_status "Installing Node.js..."
            curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
            apt-get install -y nodejs
        else
            print_warning "Node.js already installed"
        fi
        
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]] || [[ "$OS" == *"Rocky"* ]]; then
        # Update package list
        print_status "Updating package list..."
        yum update -y
        
        # Install EPEL repository
        yum install -y epel-release
        
        # Install required packages
        print_status "Installing required packages..."
        yum install -y curl wget git nginx certbot python3-certbot-nginx firewalld sqlite unzip
        
        # Install Node.js 18.x
        if ! command_exists node; then
            print_status "Installing Node.js..."
            curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
            yum install -y nodejs
        else
            print_warning "Node.js already installed"
        fi
        
    else
        print_error "Unsupported operating system: $OS"
        exit 1
    fi
    
    # Verify installations
    if command_exists node && command_exists npm && command_exists nginx; then
        print_success "All dependencies installed successfully"
        print_status "Node.js version: $(node --version)"
        print_status "NPM version: $(npm --version)"
        print_status "Nginx version: $(nginx -v 2>&1)"
    else
        print_error "Failed to install some dependencies"
        exit 1
    fi
}

# Function to get user input
get_user_input() {
    print_header "Configuration Setup"
    
    # Domain name
    while true; do
        read -p "Enter your domain name (e.g., panel.example.com): " DOMAIN
        if [[ -n "$DOMAIN" ]]; then
            break
        else
            print_warning "Domain name cannot be empty"
        fi
    done
    
    # Panel port
    read -p "Enter panel port [default: 3000]: " PANEL_PORT
    PANEL_PORT=${PANEL_PORT:-3000}
    
    # API port
    read -p "Enter API port [default: 3001]: " API_PORT
    API_PORT=${API_PORT:-3001}
    
    # Admin username
    while true; do
        read -p "Enter admin username [default: admin]: " ADMIN_USERNAME
        ADMIN_USERNAME=${ADMIN_USERNAME:-admin}
        if [[ -n "$ADMIN_USERNAME" ]]; then
            break
        fi
    done
    
    # Admin password
    while true; do
        read -s -p "Enter admin password (min 6 characters): " ADMIN_PASSWORD
        echo
        if [[ ${#ADMIN_PASSWORD} -ge 6 ]]; then
            read -s -p "Confirm admin password: " ADMIN_PASSWORD_CONFIRM
            echo
            if [[ "$ADMIN_PASSWORD" == "$ADMIN_PASSWORD_CONFIRM" ]]; then
                break
            else
                print_warning "Passwords do not match"
            fi
        else
            print_warning "Password must be at least 6 characters long"
        fi
    done
    
    # SSL certificate
    read -p "Do you want to install SSL certificate? (y/n) [default: y]: " INSTALL_SSL
    INSTALL_SSL=${INSTALL_SSL:-y}
    
    # Email for SSL
    if [[ "$INSTALL_SSL" == "y" ]]; then
        while true; do
            read -p "Enter email for SSL certificate: " SSL_EMAIL
            if [[ -n "$SSL_EMAIL" ]]; then
                break
            else
                print_warning "Email cannot be empty for SSL certificate"
            fi
        done
    fi
    
    # X-UI Panel Configuration (Optional)
    read -p "Do you want to configure X-UI panel connection now? (y/n) [default: n]: " CONFIGURE_XUI
    CONFIGURE_XUI=${CONFIGURE_XUI:-n}
    
    if [[ "$CONFIGURE_XUI" == "y" ]]; then
        read -p "Enter X-UI panel URL: " XUI_URL
        read -p "Enter X-UI panel username: " XUI_USERNAME
        read -s -p "Enter X-UI panel password: " XUI_PASSWORD
        echo
    fi
    
    # Summary
    print_header "Configuration Summary"
    echo "Domain: $DOMAIN"
    echo "Panel Port: $PANEL_PORT"
    echo "API Port: $API_PORT"
    echo "Admin Username: $ADMIN_USERNAME"
    echo "Install SSL: $INSTALL_SSL"
    if [[ "$INSTALL_SSL" == "y" ]]; then
        echo "SSL Email: $SSL_EMAIL"
    fi
    if [[ "$CONFIGURE_XUI" == "y" ]]; then
        echo "X-UI URL: $XUI_URL"
        echo "X-UI Username: $XUI_USERNAME"
    fi
    
    read -p "Continue with installation? (y/n): " CONFIRM
    if [[ "$CONFIRM" != "y" ]]; then
        print_error "Installation cancelled"
        exit 1
    fi
}

# Function to create walpanel user
create_user() {
    print_status "Creating walpanel user..."
    
    if ! id "walpanel" &>/dev/null; then
        useradd -r -s /bin/false -d "$WALPANEL_DIR" walpanel
        print_success "User 'walpanel' created"
    else
        print_warning "User 'walpanel' already exists"
    fi
}

# Function to download and install X-UI SELL Panel
install_walpanel() {
    print_header "Installing X-UI SELL Panel by Hmray..."
    
    # Get the current script directory (where the project files are located)
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    # Create directory
    print_status "Creating installation directory..."
    mkdir -p "$WALPANEL_DIR"
    
    # Copy server directory and its contents
    print_status "Copying server files..."
    if [[ -d "$SCRIPT_DIR/server" ]]; then
        cp -r "$SCRIPT_DIR/server" "$WALPANEL_DIR/"
        print_success "Server files copied"
    else
        print_error "Server directory not found in $SCRIPT_DIR"
        exit 1
    fi
    
    # Copy frontend source files
    print_status "Copying frontend source files..."
    if [[ -d "$SCRIPT_DIR/src" ]] && [[ -f "$SCRIPT_DIR/package.json" ]]; then
        # Copy all frontend related files
        cp -r "$SCRIPT_DIR/src" "$WALPANEL_DIR/"
        cp -r "$SCRIPT_DIR/public" "$WALPANEL_DIR/" 2>/dev/null || true
        cp "$SCRIPT_DIR/package.json" "$WALPANEL_DIR/"
        cp "$SCRIPT_DIR/package-lock.json" "$WALPANEL_DIR/" 2>/dev/null || true
        cp "$SCRIPT_DIR/vite.config.ts" "$WALPANEL_DIR/" 2>/dev/null || true
        cp "$SCRIPT_DIR/tsconfig.json" "$WALPANEL_DIR/" 2>/dev/null || true
        cp "$SCRIPT_DIR/tsconfig.app.json" "$WALPANEL_DIR/" 2>/dev/null || true
        cp "$SCRIPT_DIR/tsconfig.node.json" "$WALPANEL_DIR/" 2>/dev/null || true
        cp "$SCRIPT_DIR/tailwind.config.js" "$WALPANEL_DIR/" 2>/dev/null || true
        cp "$SCRIPT_DIR/postcss.config.js" "$WALPANEL_DIR/" 2>/dev/null || true
        cp "$SCRIPT_DIR/eslint.config.js" "$WALPANEL_DIR/" 2>/dev/null || true
        cp "$SCRIPT_DIR/index.html" "$WALPANEL_DIR/" 2>/dev/null || true
        print_success "Frontend files copied"
    else
        print_error "Frontend files not found in $SCRIPT_DIR"
        exit 1
    fi
    
    # Install backend dependencies
    print_status "Installing backend dependencies..."
    cd "$WALPANEL_DIR/server"
    npm install
    print_success "Backend dependencies installed"
    
    # Install frontend dependencies and build
    print_status "Installing frontend dependencies..."
    cd "$WALPANEL_DIR"
    npm install
    
    print_status "Building frontend..."
    npm run build
    print_success "Frontend built successfully"
    
    # Set permissions
    chown -R walpanel:walpanel "$WALPANEL_DIR"
    chmod -R 755 "$WALPANEL_DIR"
    
    print_success "X-UI SELL Panel by Hmray installed successfully"
}

# Function to create environment file
create_env_file() {
    print_status "Creating environment configuration..."
    
    # Generate JWT secret
    JWT_SECRET=$(openssl rand -base64 32)
    
    cat > "$WALPANEL_DIR/.env" << EOF
# X-UI SELL Panel Configuration by Hmray
NODE_ENV=production
PORT=$API_PORT
FRONTEND_PORT=$PANEL_PORT

# Database
DB_PATH=$WALPANEL_DIR/server/database.sqlite

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h

# Admin Configuration
ADMIN_USERNAME=$ADMIN_USERNAME
ADMIN_PASSWORD=$ADMIN_PASSWORD

# Domain Configuration
DOMAIN=$DOMAIN
PANEL_URL=https://$DOMAIN

# X-UI Configuration (if provided)
EOF
    
    if [[ "$CONFIGURE_XUI" == "y" ]]; then
        cat >> "$WALPANEL_DIR/.env" << EOF
XUI_URL=$XUI_URL
XUI_USERNAME=$XUI_USERNAME
XUI_PASSWORD=$XUI_PASSWORD
EOF
    fi
    
    # Set permissions
    chown walpanel:walpanel "$WALPANEL_DIR/.env"
    chmod 600 "$WALPANEL_DIR/.env"
    
    print_success "Environment file created"
}

# Function to create systemd service
create_systemd_service() {
    print_status "Creating systemd service..."
    
    cat > "/etc/systemd/system/$SERVICE_NAME.service" << EOF
[Unit]
Description=X-UI SELL Panel Management System by Hmray
After=network.target

[Service]
Type=simple
User=walpanel
WorkingDirectory=$WALPANEL_DIR/server
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=$WALPANEL_DIR/.env

# Security settings
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$WALPANEL_DIR

[Install]
WantedBy=multi-user.target
EOF
    
    # Reload systemd and enable service
    systemctl daemon-reload
    systemctl enable "$SERVICE_NAME"
    
    print_success "Systemd service created and enabled"
}

# Function to configure Nginx
configure_nginx() {
    print_header "Configuring Nginx..."
    
    # Backup existing default config if it exists
    if [[ -f /etc/nginx/sites-enabled/default ]]; then
        print_status "Backing up default Nginx configuration..."
        mv /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.backup
    fi
    
    # Create Nginx configuration
    cat > "$NGINX_CONF" << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;
    
    # SSL Configuration (will be updated by certbot)
    ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
    ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Frontend (React app)
    location / {
        root $WALPANEL_DIR/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:$API_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Logs
    access_log /var/log/nginx/walpanel_access.log;
    error_log /var/log/nginx/walpanel_error.log;
}
EOF
    
    # Enable the site
    ln -sf "$NGINX_CONF" "$NGINX_ENABLED"
    
    # Test Nginx configuration
    if nginx -t; then
        print_success "Nginx configuration is valid"
    else
        print_error "Nginx configuration is invalid"
        exit 1
    fi
    
    # Restart Nginx
    systemctl restart nginx
    systemctl enable nginx
    
    print_success "Nginx configured and restarted"
}

# Function to configure firewall
configure_firewall() {
    print_header "Configuring Firewall..."
    
    if command_exists ufw; then
        # Ubuntu/Debian firewall
        print_status "Configuring UFW firewall..."
        ufw --force enable
        ufw allow ssh
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw allow "$API_PORT"/tcp
        print_success "UFW firewall configured"
        
    elif command_exists firewall-cmd; then
        # CentOS/RHEL firewall
        print_status "Configuring firewalld..."
        systemctl enable firewalld
        systemctl start firewalld
        firewall-cmd --permanent --add-service=ssh
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --permanent --add-port="$API_PORT"/tcp
        firewall-cmd --reload
        print_success "Firewalld configured"
        
    else
        print_warning "No supported firewall found. Please configure manually."
    fi
}

# Function to install SSL certificate
install_ssl() {
    if [[ "$INSTALL_SSL" == "y" ]]; then
        print_header "Installing SSL Certificate..."
        
        # Stop nginx temporarily
        systemctl stop nginx
        
        # Get certificate
        print_status "Obtaining SSL certificate from Let's Encrypt..."
        if certbot certonly --standalone -d "$DOMAIN" --email "$SSL_EMAIL" --agree-tos --non-interactive; then
            print_success "SSL certificate obtained successfully"
            
            # Update Nginx configuration with real certificate paths
            sed -i "s|ssl_certificate .*|ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;|" "$NGINX_CONF"
            sed -i "s|ssl_certificate_key .*|ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;|" "$NGINX_CONF"
            
            # Add SSL security settings
            cat >> "$NGINX_CONF" << EOF

    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;
EOF
            
            # Setup auto-renewal
            (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
            
        else
            print_error "Failed to obtain SSL certificate"
            print_warning "Continuing with self-signed certificate"
        fi
        
        # Start nginx
        systemctl start nginx
    fi
}

# Function to initialize database
initialize_database() {
    print_status "Initializing database..."
    
    cd "$WALPANEL_DIR/server"
    
    # Run database migration
    if node scripts/migrate.js; then
        print_success "Database initialized successfully"
    else
        print_error "Failed to initialize database"
        exit 1
    fi
}

# Function to start services
start_services() {
    print_header "Starting Services..."
    
    # Start X-UI SELL Panel service
    print_status "Starting X-UI SELL Panel service..."
    systemctl start "$SERVICE_NAME"
    
    # Check service status
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        print_success "X-UI SELL Panel service started successfully"
    else
        print_error "Failed to start X-UI SELL Panel service"
        print_status "Checking service logs..."
        journalctl -u "$SERVICE_NAME" --no-pager -n 20
        exit 1
    fi
    
    # Restart Nginx to ensure everything is working
    systemctl restart nginx
    
    print_success "All services started successfully"
}

# Function to display final information
display_final_info() {
    print_header "Installation Complete!"
    
    echo
    print_success "X-UI SELL Panel by Hmray has been installed successfully!"
    echo
    echo "Access Information:"
    echo "=================="
    if [[ "$INSTALL_SSL" == "y" ]]; then
        echo "Panel URL: https://$DOMAIN"
    else
        echo "Panel URL: http://$DOMAIN"
    fi
    echo "Admin Username: $ADMIN_USERNAME"
    echo "Admin Password: [hidden]"
    echo
    echo "Service Management:"
    echo "=================="
    echo "Start service:   systemctl start $SERVICE_NAME"
    echo "Stop service:    systemctl stop $SERVICE_NAME"
    echo "Restart service: systemctl restart $SERVICE_NAME"
    echo "Service status:  systemctl status $SERVICE_NAME"
    echo "View logs:       journalctl -u $SERVICE_NAME -f"
    echo
    echo "File Locations:"
    echo "==============="
    echo "Installation:    $WALPANEL_DIR"
    echo "Configuration:   $WALPANEL_DIR/.env"
    echo "Database:        $WALPANEL_DIR/server/database.sqlite"
    echo "Nginx config:    $NGINX_CONF"
    echo "Install log:     $LOG_FILE"
    echo
    if [[ "$INSTALL_SSL" == "y" ]]; then
        echo "SSL Certificate: /etc/letsencrypt/live/$DOMAIN/"
        echo "Auto-renewal:    Configured via crontab"
        echo
    fi
    
    print_warning "Please save your admin credentials in a secure location!"
    print_status "You can now access X-UI SELL Panel at your domain."
    echo
    print_header "Copyright © 2025 Design and developed by Hmray"
}

# Function to show menu
show_menu() {
    clear
    print_header "╔══════════════════════════════════════════════════════════════╗"
    print_header "║                    X-UI SELL Installer                      ║"
    print_header "║              Professional X-UI Management v1.0.0            ║"
    print_header "║                  Design by Hmray                            ║"
    print_header "╚══════════════════════════════════════════════════════════════╝"
    echo
    echo "Please select an option:"
    echo
    echo "1) Install X-UI SELL Panel (Full Installation)"
    echo "2) Install Dependencies Only"
    echo "3) Update X-UI SELL Panel"
    echo "4) Uninstall X-UI SELL Panel"
    echo "5) Backup X-UI SELL Panel"
    echo "6) Restore X-UI SELL Panel"
    echo "7) View Service Status"
    echo "8) View Logs"
    echo "9) Exit"
    echo
    read -p "Enter your choice [1-9]: " choice
}

# Function to install dependencies only
install_dependencies_only() {
    print_header "Installing Dependencies Only..."
    detect_os
    install_dependencies
    print_success "Dependencies installed successfully!"
}

# Function to update X-UI SELL Panel
update_walpanel() {
    print_header "Updating X-UI SELL Panel..."
    
    if [[ ! -d "$WALPANEL_DIR" ]]; then
        print_error "X-UI SELL Panel is not installed"
        return 1
    fi
    
    # Stop service
    print_status "Stopping X-UI SELL Panel service..."
    systemctl stop "$SERVICE_NAME"
    
    # Backup current installation
    print_status "Creating backup..."
    cp -r "$WALPANEL_DIR" "$WALPANEL_DIR.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Update code (this would download new version in real scenario)
    print_status "Updating X-UI SELL Panel..."
    cd "$WALPANEL_DIR/server"
    npm update
    
    cd "$WALPANEL_DIR"
    npm update
    npm run build
    
    # Restart service
    print_status "Starting X-UI SELL Panel service..."
    systemctl start "$SERVICE_NAME"
    
    print_success "X-UI SELL Panel updated successfully!"
}

# Function to uninstall X-UI SELL Panel
uninstall_walpanel() {
    print_header "Uninstalling X-UI SELL Panel..."
    
    read -p "Are you sure you want to uninstall X-UI SELL Panel? This will remove all data! (y/N): " confirm
    if [[ "$confirm" != "y" ]]; then
        print_status "Uninstall cancelled"
        return 0
    fi
    
    # Stop and disable service
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        systemctl stop "$SERVICE_NAME"
    fi
    systemctl disable "$SERVICE_NAME" 2>/dev/null || true
    rm -f "/etc/systemd/system/$SERVICE_NAME.service"
    systemctl daemon-reload
    
    # Remove Nginx configuration
    rm -f "$NGINX_CONF" "$NGINX_ENABLED"
    systemctl restart nginx
    
    # Remove installation directory
    rm -rf "$WALPANEL_DIR"
    
    # Remove user
    userdel walpanel 2>/dev/null || true
    
    # Remove SSL certificate (optional)
    read -p "Do you want to remove SSL certificates? (y/N): " remove_ssl
    if [[ "$remove_ssl" == "y" ]]; then
        certbot delete --cert-name "$DOMAIN" 2>/dev/null || true
    fi
    
    print_success "X-UI SELL Panel uninstalled successfully!"
}

# Function to backup X-UI SELL Panel
backup_walpanel() {
    print_header "Backing up X-UI SELL Panel..."
    
    if [[ ! -d "$WALPANEL_DIR" ]]; then
        print_error "X-UI SELL Panel is not installed"
        return 1
    fi
    
    BACKUP_DIR="/opt/walpanel-backups"
    BACKUP_FILE="$BACKUP_DIR/walpanel-backup-$(date +%Y%m%d_%H%M%S).tar.gz"
    
    mkdir -p "$BACKUP_DIR"
    
    print_status "Creating backup archive..."
    tar -czf "$BACKUP_FILE" -C "$(dirname "$WALPANEL_DIR")" "$(basename "$WALPANEL_DIR")"
    
    print_success "Backup created: $BACKUP_FILE"
}

# Function to restore X-UI SELL Panel
restore_walpanel() {
    print_header "Restoring X-UI SELL Panel..."
    
    BACKUP_DIR="/opt/walpanel-backups"
    
    if [[ ! -d "$BACKUP_DIR" ]]; then
        print_error "No backups found"
        return 1
    fi
    
    echo "Available backups:"
    ls -la "$BACKUP_DIR"/*.tar.gz 2>/dev/null || {
        print_error "No backup files found"
        return 1
    }
    
    read -p "Enter backup file path: " backup_file
    
    if [[ ! -f "$backup_file" ]]; then
        print_error "Backup file not found"
        return 1
    fi
    
    # Stop service
    systemctl stop "$SERVICE_NAME" 2>/dev/null || true
    
    # Restore backup
    print_status "Restoring from backup..."
    tar -xzf "$backup_file" -C "$(dirname "$WALPANEL_DIR")"
    
    # Start service
    systemctl start "$SERVICE_NAME"
    
    print_success "X-UI SELL Panel restored successfully!"
}

# Function to view service status
view_service_status() {
    print_header "X-UI SELL Panel Service Status"
    
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        print_success "X-UI SELL Panel service is running"
    else
        print_error "X-UI SELL Panel service is not running"
    fi
    
    echo
    systemctl status "$SERVICE_NAME" --no-pager
}

# Function to view logs
view_logs() {
    print_header "X-UI SELL Panel Logs"
    echo "Press Ctrl+C to exit log view"
    echo
    journalctl -u "$SERVICE_NAME" -f
}

# Main installation function
main_install() {
    print_header "Starting X-UI SELL Panel Installation by Hmray..."
    
    # Create log file
    touch "$LOG_FILE"
    log_message "Installation started"
    
    # Run installation steps
    check_root
    detect_os
    get_user_input
    install_dependencies
    create_user
    install_walpanel
    create_env_file
    create_systemd_service
    configure_nginx
    configure_firewall
    install_ssl
    initialize_database
    start_services
    display_final_info
    
    log_message "Installation completed successfully"
}

# Main script logic
main() {
    while true; do
        show_menu
        case $choice in
            1)
                main_install
                read -p "Press Enter to continue..."
                ;;
            2)
                check_root
                install_dependencies_only
                read -p "Press Enter to continue..."
                ;;
            3)
                check_root
                update_walpanel
                read -p "Press Enter to continue..."
                ;;
            4)
                check_root
                uninstall_walpanel
                read -p "Press Enter to continue..."
                ;;
            5)
                backup_walpanel
                read -p "Press Enter to continue..."
                ;;
            6)
                check_root
                restore_walpanel
                read -p "Press Enter to continue..."
                ;;
            7)
                view_service_status
                read -p "Press Enter to continue..."
                ;;
            8)
                view_logs
                ;;
            9)
                print_status "Goodbye!"
                echo
                print_header "Copyright © 2025 Design and developed by Hmray"
                exit 0
                ;;
            *)
                print_error "Invalid option. Please try again."
                read -p "Press Enter to continue..."
                ;;
        esac
    done
}

# Run main function
main "$@"