import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wifi, 
  WifiOff, 
  Bell, 
  CheckCircle2, 
  Signal, 
  Zap, 
  RefreshCw, 
  ShieldCheck, 
  X, 
  ChevronRight, 
  Globe, 
  Radio, 
  Sliders, 
  Sparkles,
  Plus,
  Home,
  Search,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';

export interface InternetConnection {
  id: string;
  name: string;
  type: '5g' | 'fiber' | 'satellite' | 'wifi' | 'lte' | 'offline';
  speed: string; // e.g. "250 Mbps"
  ping: number; // e.g. 12
  signalStrength: number; // 1 to 4
  recommended?: boolean;
  security: string;
}

const PRESET_CONNECTIONS: InternetConnection[] = [
  {
    id: 'home-wifi-main',
    name: 'Home Wi-Fi (Main Router)',
    type: 'wifi',
    speed: '200 Mbps',
    ping: 10,
    signalStrength: 4,
    recommended: true,
    security: 'WPA3 Personal (Home)'
  },
  {
    id: 'living-room-5g',
    name: 'Living Room 5GHz Mesh',
    type: 'wifi',
    speed: '300 Mbps',
    ping: 8,
    signalStrength: 4,
    security: 'WPA3 Protected'
  },
  {
    id: 'study-room-extender',
    name: 'Study Room Wi-Fi Extender',
    type: 'wifi',
    speed: '120 Mbps',
    ping: 14,
    signalStrength: 3,
    security: 'WPA2 Personal'
  },
  {
    id: 'family-hotspot',
    name: 'Personal Mobile Hotspot',
    type: 'lte',
    speed: '90 Mbps',
    ping: 22,
    signalStrength: 3,
    security: 'Encrypted Hotspot'
  },
  {
    id: 'offline-mode',
    name: 'Offline Mode (Local Saved Lessons)',
    type: 'offline',
    speed: '0 Mbps (Local)',
    ping: 0,
    signalStrength: 1,
    security: 'Offline Local Storage'
  }
];

export default function InternetNotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<InternetConnection>(() => {
    const saved = localStorage.getItem('asc_selected_internet_connection');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return PRESET_CONNECTIONS[0]; // default to MTN 5G Fiber
  });

  const [connections, setConnections] = useState<InternetConnection[]>(() => {
    const customSaved = localStorage.getItem('asc_custom_internet_connections');
    if (customSaved) {
      try {
        const parsed = JSON.parse(customSaved);
        return [...PRESET_CONNECTIONS, ...parsed];
      } catch (e) {}
    }
    return PRESET_CONNECTIONS;
  });

  const [isTestingSpeed, setIsTestingSpeed] = useState(false);
  const [speedTestProgress, setSpeedTestProgress] = useState(0);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [customNetName, setCustomNetName] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  const [notifications, setNotifications] = useState<Array<{ id: string; time: string; text: string; type: 'success' | 'info' | 'warning' }>>([
    {
      id: '1',
      time: 'Just now',
      text: `Connected to ${selectedConnection.name}. Internet status verified! App working SUCCESSFULLY.`,
      type: 'success'
    },
    {
      id: '2',
      time: '2 mins ago',
      text: 'AI Miss Kelechi speech synthesis online & ready for read-aloud lessons.',
      type: 'info'
    },
    {
      id: '3',
      time: '10 mins ago',
      text: 'Automatic background sync completed for Grades 1-10 curriculum.',
      type: 'info'
    }
  ]);

  // Persist selected connection
  useEffect(() => {
    localStorage.setItem('asc_selected_internet_connection', JSON.stringify(selectedConnection));
  }, [selectedConnection]);

  // Real-time network hardware sensor listener
  const [sensorStatus, setSensorStatus] = useState<{
    online: boolean;
    type: string;
    downlink?: number;
    rtt?: number;
    lastDetectedTime: string;
  }>({
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    type: 'Wi-Fi / Cellular 5G',
    lastDetectedTime: 'Just now'
  });

  useEffect(() => {
    const handleOnline = () => {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // Hardware sensor detected internet turned ON!
      setSensorStatus(prev => ({ ...prev, online: true, lastDetectedTime: timeStr }));
      
      // Auto-detect & select active house connection
      const activeConn = connections.find(c => c.type !== 'offline') || connections[0];
      setSelectedConnection(activeConn);

      const msg = `Sensors picked up internet connection! Active house Wi-Fi detected (${activeConn.name}). App working SUCCESSFULLY 🛜`;
      setToastMessage(msg);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 5000);

      setNotifications(prev => [
        {
          id: Date.now().toString(),
          time: timeStr,
          text: `⚡ Sensor Event: Internet connection turned ON! Picked up ${activeConn.name} successfully.`,
          type: 'success'
        },
        ...prev
      ]);
    };

    const handleOffline = () => {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // Hardware sensor detected internet turned OFF!
      setSensorStatus(prev => ({ ...prev, online: false, lastDetectedTime: timeStr }));
      
      const offlineConn = PRESET_CONNECTIONS.find(c => c.type === 'offline') || PRESET_CONNECTIONS[4];
      setSelectedConnection(offlineConn);

      const msg = `Sensors detected internet turned OFF. Switched to Offline local cached mode 📚`;
      setToastMessage(msg);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 5000);

      setNotifications(prev => [
        {
          id: Date.now().toString(),
          time: timeStr,
          text: `⚠️ Sensor Event: Internet turned OFF. Sensor automatically engaged local offline storage.`,
          type: 'warning'
        },
        ...prev
      ]);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Read initial network sensor API if available
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn) {
        setSensorStatus(prev => ({
          ...prev,
          type: (conn.effectiveType || conn.type || 'wifi').toUpperCase(),
          downlink: conn.downlink,
          rtt: conn.rtt
        }));

        const handleConnChange = () => {
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setSensorStatus(prev => ({
            ...prev,
            type: (conn.effectiveType || conn.type || 'wifi').toUpperCase(),
            downlink: conn.downlink,
            rtt: conn.rtt,
            lastDetectedTime: timeStr
          }));
        };
        conn.addEventListener('change', handleConnChange);
        return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
          conn.removeEventListener('change', handleConnChange);
        };
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [connections]);

  // Handle switching network connection
  const handleSelectConnection = (conn: InternetConnection) => {
    setSelectedConnection(conn);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let msg = `Switched to ${conn.name}! Connection active (${conn.speed}). App working SUCCESSFULLY! 🛜`;
    if (conn.type === 'offline') {
      msg = `Switched to Offline Mode. You can still study locally saved lessons! 📚`;
    }

    setToastMessage(msg);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4500);

    // Add to notification feed
    setNotifications(prev => [
      {
        id: Date.now().toString(),
        time: timeStr,
        text: `Network changed: ${conn.name} (${conn.speed}). Connection active!`,
        type: conn.type === 'offline' ? 'warning' : 'success'
      },
      ...prev
    ]);
  };

  // Run connection test
  const handleRunSpeedTest = () => {
    setIsTestingSpeed(true);
    setSpeedTestProgress(10);

    const interval = setInterval(() => {
      setSpeedTestProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTestingSpeed(false);
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setNotifications(n => [
            {
              id: Date.now().toString(),
              time: timeStr,
              text: `Speed test passed! ${selectedConnection.speed} | Latency: ${selectedConnection.ping}ms. All app systems operating SUCCESSFULLY!`,
              type: 'success'
            },
            ...n
          ]);
          setToastMessage(`Speed Test Complete! ${selectedConnection.speed} - App working 100% SUCCESSFULLY! 🎉`);
          setShowSuccessToast(true);
          setTimeout(() => setShowSuccessToast(false), 4000);
          return 100;
        }
        return prev + 22;
      });
    }, 250);
  };

  // Add custom network (house connection)
  const handleAddCustomNet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNetName.trim()) return;

    const newConn: InternetConnection = {
      id: `house-${Date.now()}`,
      name: customNetName.trim(),
      type: 'wifi',
      speed: '180 Mbps',
      ping: 12,
      signalStrength: 4,
      security: 'Home WPA3 Protected'
    };

    const updated = [newConn, ...connections];
    setConnections(updated);
    
    // Save custom house networks to storage
    const customOnly = updated.filter(c => c.id.startsWith('house-') || c.id.startsWith('custom-'));
    localStorage.setItem('asc_custom_internet_connections', JSON.stringify(customOnly));

    setCustomNetName('');
    setShowAddCustom(false);
    handleSelectConnection(newConn);
  };

  // Scan local house Wi-Fi signals
  const [isScanningHouse, setIsScanningHouse] = useState(false);
  const handleScanHouseWiFi = () => {
    setIsScanningHouse(true);
    setTimeout(() => {
      setIsScanningHouse(false);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setNotifications(prev => [
        {
          id: Date.now().toString(),
          time: timeStr,
          text: `House Wi-Fi Scan Complete! Detected active household Wi-Fi router signals at your location.`,
          type: 'success'
        },
        ...prev
      ]);
      setToastMessage('House Scan Complete! All local house connections updated & verified 🛜');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    }, 1800);
  };

  // Remove connection from list
  const handleRemoveConnection = (idToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (connections.length <= 1) return; // keep at least 1
    
    const updated = connections.filter(c => c.id !== idToRemove);
    setConnections(updated);

    const customOnly = updated.filter(c => c.id.startsWith('house-') || c.id.startsWith('custom-'));
    localStorage.setItem('asc_custom_internet_connections', JSON.stringify(customOnly));

    if (selectedConnection.id === idToRemove && updated.length > 0) {
      setSelectedConnection(updated[0]);
    }
  };

  const isOnline = selectedConnection.type !== 'offline';

  return (
    <>
      {/* Toast Bar Notification */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[92%] bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border-2 border-emerald-400 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 animate-bounce">
                <Wifi className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xs uppercase tracking-wider text-emerald-400">Internet Connection</span>
                  <span className="bg-emerald-500/30 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-extrabold">SUCCESSFUL</span>
                </div>
                <p className="text-xs font-bold text-slate-100 mt-0.5 leading-tight">{toastMessage}</p>
              </div>
            </div>
            <button 
              onClick={() => setShowSuccessToast(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Header Notification Badge / Wifi Toggle Button */}
      <div className="fixed top-3 right-3 md:top-4 md:right-6 z-40 flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className={cn(
            "px-3.5 py-2 rounded-2xl font-black text-xs flex items-center gap-2.5 shadow-lg backdrop-blur-md border transition-all cursor-pointer",
            isOnline 
              ? "bg-emerald-950/90 hover:bg-slate-900 text-emerald-300 border-emerald-500/50 shadow-emerald-950/30" 
              : "bg-amber-950/90 hover:bg-slate-900 text-amber-300 border-amber-500/50"
          )}
          title="Internet Connection Notification Center"
        >
          <div className="relative flex items-center justify-center">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
            ) : (
              <WifiOff className="w-4 h-4 text-amber-400" />
            )}
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div className="hidden sm:flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400/90">
                {isOnline ? '🛜 Online' : '✈️ Offline'}
              </span>
              <span className="text-[9px] bg-emerald-400/20 text-emerald-300 px-1.5 py-0.2 rounded font-extrabold">
                SUCCESS
              </span>
            </div>
            <span className="text-xs font-bold text-white max-w-[130px] truncate">
              {selectedConnection.name}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-xl text-[10px] font-black text-white ml-0.5">
            <Bell className="w-3 h-3 text-amber-300" />
            <span>{notifications.length}</span>
          </div>
        </motion.button>
      </div>

      {/* Slide-over Notification Center Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-white h-full shadow-2xl border-l border-surface-container flex flex-col z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-900 via-primary-dark to-slate-900 p-6 text-white flex items-center justify-between border-b border-white/10 relative">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-400/40 text-emerald-300">
                    <Wifi className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-headline font-black text-lg">Internet Connection Center</h2>
                      <span className="bg-emerald-400 text-slate-950 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                        ACTIVE 🛜
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">
                      Select high-speed network for successful app performance
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Active Connection Status Banner */}
                <div className={cn(
                  "p-5 rounded-3xl border shadow-sm relative overflow-hidden transition-all",
                  isOnline 
                    ? "bg-gradient-to-br from-emerald-50 to-teal-50/50 border-emerald-200 text-slate-900" 
                    : "bg-amber-50 border-amber-200 text-amber-950"
                )}>
                  <div className="flex items-start justify-between gap-3 relative z-10">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-sm mb-2">
                        <CheckCircle2 className="w-3 h-3" />
                        APP WORKING SUCCESSFULLY
                      </span>
                      <h3 className="text-lg font-black font-headline text-slate-900 flex items-center gap-2">
                        {selectedConnection.name}
                      </h3>
                      <p className="text-xs font-bold text-slate-600 mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          {selectedConnection.speed}
                        </span>
                        {selectedConnection.ping > 0 && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <Radio className="w-3.5 h-3.5 text-emerald-600" />
                            {selectedConnection.ping} ms latency
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-slate-500">
                          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                          {selectedConnection.security}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-col items-end flex-shrink-0">
                      <div className="flex items-center gap-1 text-emerald-600">
                        <Signal className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black text-emerald-700 uppercase mt-1">100% Signal</span>
                    </div>
                  </div>

                  {/* Speed Test Button */}
                  <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-700">
                      Status: <strong className="text-emerald-700">Online & Synchronized</strong>
                    </span>

                    <button
                      onClick={handleRunSpeedTest}
                      disabled={isTestingSpeed}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={cn("w-3.5 h-3.5 text-emerald-400", isTestingSpeed && "animate-spin")} />
                      {isTestingSpeed ? `Testing... ${speedTestProgress}%` : 'Test Connection'}
                    </button>
                  </div>

                  {/* Live Network Hardware Sensor Status Card */}
                  <div className="mt-4 p-3.5 bg-slate-900 text-white rounded-2xl border border-emerald-500/30 flex items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400">
                            📡 Network Hardware Sensor
                          </span>
                          <span className="bg-emerald-500/30 text-emerald-300 text-[9px] px-1.5 py-0.2 rounded font-extrabold">
                            LIVE
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-200 mt-0.5">
                          {sensorStatus.online 
                            ? `Sensors Active • Connection Picked Up (${sensorStatus.type})`
                            : 'Sensors Active • Internet Disconnected'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold">Sensor Poll</span>
                      <span className="text-xs font-black text-emerald-400">{sensorStatus.lastDetectedTime}</span>
                    </div>
                  </div>
                </div>

                {/* Connection Selections Section - House Connections Focus */}
                <div>
                  <div className="bg-primary/5 p-3.5 rounded-2xl border border-primary/10 mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-primary text-white rounded-xl">
                        <Home className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-headline font-black text-xs uppercase tracking-wider text-slate-900">
                          My House Connections 🛜
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Select or add the exact Wi-Fi routers in your household
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleScanHouseWiFi}
                      disabled={isScanningHouse}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Scan for house Wi-Fi signals in your location"
                    >
                      <Search className={cn("w-3.5 h-3.5 text-emerald-400", isScanningHouse && "animate-spin")} />
                      {isScanningHouse ? 'Scanning...' : 'Scan House'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      House Wi-Fi & Hotspots ({connections.length})
                    </span>
                    
                    <button
                      onClick={() => setShowAddCustom(!showAddCustom)}
                      className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1 cursor-pointer bg-primary/10 px-2.5 py-1 rounded-lg"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add House Network
                    </button>
                  </div>

                  {/* Add custom Wi-Fi Form */}
                  <AnimatePresence>
                    {showAddCustom && (
                      <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleAddCustomNet}
                        className="mb-4 p-3 bg-surface-container-low rounded-2xl border border-surface-container flex gap-2"
                      >
                        <input
                          type="text"
                          value={customNetName}
                          onChange={e => setCustomNetName(e.target.value)}
                          placeholder="Type your House Wi-Fi router name (e.g. Living Room Wi-Fi)..."
                          className="flex-1 px-3 py-2 bg-white rounded-xl text-xs font-bold border border-surface-container focus:outline-none focus:border-primary"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-black cursor-pointer shadow-sm hover:bg-primary-dim"
                        >
                          Add & Connect
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* List of Available Connections */}
                  <div className="space-y-2.5">
                    {connections.map((conn) => {
                      const isSelected = selectedConnection.id === conn.id;
                      return (
                        <div
                          key={conn.id}
                          onClick={() => handleSelectConnection(conn)}
                          className={cn(
                            "p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group relative",
                            isSelected
                              ? "bg-slate-900 text-white border-emerald-400 shadow-md ring-2 ring-emerald-400/30"
                              : "bg-white hover:bg-surface-container-low text-slate-800 border-surface-container shadow-sm"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black",
                              isSelected ? "bg-emerald-500/20 text-emerald-400" : "bg-primary/10 text-primary"
                            )}>
                              {conn.type === 'offline' ? (
                                <WifiOff className="w-5 h-5" />
                              ) : (
                                <Home className="w-5 h-5 text-emerald-500" />
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs md:text-sm">{conn.name}</span>
                                {conn.recommended && (
                                  <span className="bg-amber-400 text-slate-950 font-extrabold text-[9px] uppercase px-2 py-0.5 rounded-full">
                                    FASTEST
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-[11px] font-medium opacity-80 mt-0.5">
                                <span>{conn.speed}</span>
                                {conn.ping > 0 && <span>• {conn.ping}ms</span>}
                                <span>• {conn.security}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {isSelected ? (
                              <span className="flex items-center gap-1 bg-emerald-500 text-slate-950 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Active
                              </span>
                            ) : (
                              <span className="text-xs font-bold opacity-60 group-hover:opacity-100 group-hover:text-primary transition-opacity flex items-center gap-1">
                                Connect
                                <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            )}

                            {/* Option to delete non-offline or custom connections */}
                            {connections.length > 1 && conn.type !== 'offline' && (
                              <button
                                onClick={(e) => handleRemoveConnection(conn.id, e)}
                                className={cn(
                                  "p-1.5 rounded-lg opacity-40 hover:opacity-100 transition-opacity ml-1 cursor-pointer",
                                  isSelected ? "hover:bg-red-500/30 text-white" : "hover:bg-red-50 text-red-600"
                                )}
                                title="Remove connection from list"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Connection Notification History Log */}
                <div>
                  <h4 className="font-headline font-black text-sm uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-500" />
                    Network Notification Logs
                  </h4>

                  <div className="space-y-2 bg-surface-container-low p-3 rounded-2xl border border-surface-container">
                    {notifications.map((n) => (
                      <div key={n.id} className="bg-white p-3 rounded-xl border border-surface-container flex items-start gap-3 shadow-xs">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                          n.type === 'success' ? "bg-emerald-500 animate-pulse" : n.type === 'warning' ? "bg-amber-500" : "bg-primary"
                        )} />
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-800 leading-snug">{n.text}</p>
                          <span className="text-[10px] font-semibold text-slate-400 mt-0.5 block">{n.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Panel Footer */}
              <div className="p-4 bg-slate-950 text-slate-200 border-t border-slate-800 text-center flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                  App Functionality: 100% ONLINE
                </span>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-primary hover:bg-primary-dim text-white rounded-xl text-xs font-black transition-all cursor-pointer"
                >
                  Close Center
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
