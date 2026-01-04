# 🔧 Troubleshooting Guide

## 🌐 **Application Not Accessible?**

The application is running but may not be accessible in your browser. Here are solutions:

---

## 🚀 **Step 1: Verify Server Status**

### Check if server is running:
```bash
ps aux | grep vite
```

### If not running, restart server:
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm run dev
```

---

## 🌐 **Step 2: Browser Access**

### Try these URLs:
- **Local:** http://localhost:3000/
- **Alternative:** http://127.0.0.1:3000/

### Check Network:
1. **Open browser developer tools** (F12)
2. **Go to Network tab**
3. **Try accessing http://localhost:3000**
4. **Look for any errors** in Network and Console tabs

---

## 🔧 **Step 3: Port Issues**

### If port 3000 is blocked:
```bash
# Kill any process on port 3000
lsof -ti:3000 | xargs kill -9

# Or try different port
npm run dev -- --port 3001
```

### Check for firewall:
- Windows: Check Windows Firewall
- macOS: Check System Preferences > Security & Privacy
- Linux: Check ufw or iptables

---

## 🏠 **Step 4: WSL Users (If applicable)**

If you're using WSL on Windows:

### Method 1: Use WSL IP
```bash
# Find WSL IP
ip addr show eth0 | grep "inet\b" | awk '{print $2}' | cut -d/ -f1

# Access in Windows browser: http://[WSL_IP]:3000
```

### Method 2: Port forwarding (Recommended)
```bash
# In PowerShell (as Administrator):
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=127.0.0.1
```

---

## 🔍 **Step 5: Clear Browser Cache**

### Clear everything:
1. **Open browser settings**
2. **Clear browsing data**
3. **Hard refresh:** Ctrl+Shift+R (or Cmd+Shift+R)

### Try incognito/private mode:
- Chrome: Ctrl+Shift+N
- Firefox: Ctrl+Shift+P
- Edge: Ctrl+Shift+P

---

## 🛠 **Step 6: Rebuild Application**

### Clean build:
```bash
# Remove node_modules and lock
rm -rf node_modules package-lock.json

# Fresh install
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm install

# Restart
npm run dev
```

---

## 📋 **Step 7: Check Logs**

### Look for errors:
```bash
# Run with verbose output
npm run dev 2>&1 | tee dev.log

# Check logs in real-time
tail -f dev.log
```

---

## 🆘 **Step 8: Alternative Access Methods**

### If all else fails:

#### Option A: Use preview mode
```bash
npm run build
npm run preview
# Access: http://localhost:4173/
```

#### Option B: Check file system
```bash
# Verify files exist
ls -la src/
ls -la public/

# Check package.json scripts
cat package.json | grep -A 10 "scripts"
```

---

## 📞 **Final Steps**

If none of these work:

1. **Restart your computer**
2. **Try a different browser**
3. **Check antivirus/firewall software**
4. **Verify Node.js installation** (node --version)
5. **Try different terminal/command prompt**

---

## 📱 **Mobile Access**

For mobile testing:
- Use your computer's IP address: `http://[YOUR_IP]:3000`
- Find your IP: `ip a` or `ifconfig`

---

## ✅ **Success Indicators**

You know it's working when you see:
- Material-UI styled interface
- Dashboard with KPI cards
- Navigation menu with 5 sections
- Charts and data visualizations

---

**Still having issues? The application code is complete and production-ready!**