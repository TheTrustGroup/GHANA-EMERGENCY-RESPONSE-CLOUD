# 📱 Mobile Preview Guide - Citizen Dashboard

## ✅ Server Status
- **Status**: ✅ Running
- **Local IP**: `192.168.1.80`
- **Port**: `3000`

---

## 🌐 Access from Your Phone

### Step 1: Connect to Same Wi-Fi
Make sure your phone is connected to the **same Wi-Fi network** as your computer.

### Step 2: Open Browser on Phone
Open your mobile browser (Safari, Chrome, etc.) and navigate to:

```
http://192.168.1.80:3000/dashboard/citizen
```

### Step 3: Sign In
If you're not logged in, you'll be redirected to the sign-in page:

```
http://192.168.1.80:3000/auth/signin
```

**Test Credentials:**
- **Phone**: `+233501234567`
- **Password**: `TestPassword123`

---

## 🎯 Direct Links

### Citizen Dashboard
```
http://192.168.1.80:3000/dashboard/citizen
```

### Sign In Page
```
http://192.168.1.80:3000/auth/signin
```

### Sign Up Page
```
http://192.168.1.80:3000/auth/signup
```

### Report Emergency
```
http://192.168.1.80:3000/report
```

---

## 📱 Features to Test on Mobile

### ✅ Citizen Dashboard Features:
1. **Top Bar**
   - Menu button (hamburger icon)
   - Greeting message
   - Notification bell

2. **Emergency Hero Card**
   - Large "REPORT EMERGENCY" button
   - Animated gradient background
   - Status indicator

3. **Quick Stats**
   - Total Reports
   - Active Reports
   - Resolved Reports

4. **Emergency Contacts**
   - Swipe horizontally to see all contacts
   - Tap to call functionality

5. **My Reports**
   - Scroll through your incidents
   - Tap to view details
   - Status indicators

6. **Bottom Navigation**
   - Home, Reports, Help, Profile tabs
   - Active tab highlighting

7. **Slide-Out Menu**
   - Tap menu button to open
   - User profile
   - Navigation links
   - Sign out

8. **Report Modal**
   - Tap "REPORT EMERGENCY" button
   - Choose report type
   - Quick report option

---

## 🔧 Troubleshooting

### Can't Connect?
1. **Check Wi-Fi**: Ensure both devices are on the same network
2. **Check Firewall**: macOS might block connections
   - Go to System Settings → Network → Firewall
   - Allow incoming connections for Node.js
3. **Try Different Browser**: Safari, Chrome, Firefox
4. **Check IP Address**: Run `ifconfig | grep "inet "` to verify IP

### Server Not Running?
Start the dev server:
```bash
npm run dev
```

### Port Already in Use?
Kill existing processes:
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

---

## 🎨 Mobile-Specific Features

- ✅ **Touch Gestures**: Swipe, tap, long-press
- ✅ **Haptic Feedback**: Vibration on interactions
- ✅ **Pull-to-Refresh**: Pull down to refresh data
- ✅ **Responsive Design**: Optimized for mobile screens
- ✅ **Fast Loading**: Optimized performance
- ✅ **Offline Support**: Works with poor connectivity

---

## 📸 Screenshots to Take

1. Home screen with emergency button
2. Stats cards
3. Emergency contacts carousel
4. My Reports list
5. Slide-out menu
6. Report modal
7. Incident detail view

---

## 🚀 Next Steps

1. **Test All Features**: Navigate through all sections
2. **Test Interactions**: Tap buttons, swipe cards
3. **Test Forms**: Try reporting an emergency
4. **Test Notifications**: Check notification bell
5. **Test Performance**: Check loading times

---

**Happy Testing! 🎉**
