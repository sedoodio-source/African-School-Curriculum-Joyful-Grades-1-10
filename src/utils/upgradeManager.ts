import { useState, useEffect } from 'react';
import { User } from '../types';

export interface UpgradeStatus {
  isUpgraded: boolean;
  hasUsedFreeUpgrade: boolean;
  lastUpgradeTimestamp: number | null;
  expiryTimestamp: number | null;
  daysRemaining: number;
  canUpgrade: boolean;
  cost: number; // 0 for free first upgrade, 1000 for subsequent upgrades
  tier: 'free_welcome' | 'monthly_paid' | 'none';
}

const STORAGE_KEY_PREFIX = 'asc_upgrade_status_';

export function getUpgradeStatus(user?: User | null): UpgradeStatus {
  if (!user) {
    return {
      isUpgraded: false,
      hasUsedFreeUpgrade: false,
      lastUpgradeTimestamp: null,
      expiryTimestamp: null,
      daysRemaining: 0,
      canUpgrade: true,
      cost: 0,
      tier: 'none'
    };
  }

  const key = `${STORAGE_KEY_PREFIX}${user.id}`;
  const saved = localStorage.getItem(key);

  if (!saved) {
    // New registered user who has not yet claimed their free upgrade
    return {
      isUpgraded: false,
      hasUsedFreeUpgrade: false,
      lastUpgradeTimestamp: null,
      expiryTimestamp: null,
      daysRemaining: 0,
      canUpgrade: true,
      cost: 0,
      tier: 'none'
    };
  }

  try {
    const data = JSON.parse(saved);
    const now = Date.now();
    const expiry = data.expiryTimestamp ? Number(data.expiryTimestamp) : null;
    const hasUsedFree = Boolean(data.hasUsedFreeUpgrade);
    
    // Check if the current month upgrade is active
    const isActive = expiry !== null && now < expiry;
    const daysRemaining = isActive && expiry ? Math.max(0, Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))) : 0;

    return {
      isUpgraded: isActive,
      hasUsedFreeUpgrade: hasUsedFree,
      lastUpgradeTimestamp: data.lastUpgradeTimestamp ? Number(data.lastUpgradeTimestamp) : null,
      expiryTimestamp: expiry,
      daysRemaining,
      canUpgrade: !isActive, // User can only upgrade once a month (when expired or not yet upgraded)
      cost: hasUsedFree ? 1000 : 0,
      tier: isActive ? (data.tier || 'monthly_paid') : 'none'
    };
  } catch {
    return {
      isUpgraded: false,
      hasUsedFreeUpgrade: false,
      lastUpgradeTimestamp: null,
      expiryTimestamp: null,
      daysRemaining: 0,
      canUpgrade: true,
      cost: 0,
      tier: 'none'
    };
  }
}

export function activateUpgrade(user: User, method: 'free' | 'paid_1000'): UpgradeStatus {
  const key = `${STORAGE_KEY_PREFIX}${user.id}`;
  const now = Date.now();
  const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
  const expiry = now + ONE_MONTH_MS;

  const newRecord = {
    hasUsedFreeUpgrade: true,
    lastUpgradeTimestamp: now,
    expiryTimestamp: expiry,
    tier: method === 'free' ? 'free_welcome' : 'monthly_paid',
    lastPaymentAmount: method === 'free' ? 0 : 1000,
    updatedAt: now
  };

  localStorage.setItem(key, JSON.stringify(newRecord));
  
  // Dispatch event for instant UI synchronization
  window.dispatchEvent(new CustomEvent('app_upgrade_status_changed', { detail: { userId: user.id } }));

  return getUpgradeStatus(user);
}

export function simulateExpireUpgrade(user: User): UpgradeStatus {
  const key = `${STORAGE_KEY_PREFIX}${user.id}`;
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  const expiredRecord = {
    hasUsedFreeUpgrade: true,
    lastUpgradeTimestamp: now - (31 * ONE_DAY_MS),
    expiryTimestamp: now - (1 * ONE_DAY_MS), // Expired 1 day ago
    tier: 'monthly_paid',
    lastPaymentAmount: 1000,
    updatedAt: now
  };

  localStorage.setItem(key, JSON.stringify(expiredRecord));
  window.dispatchEvent(new CustomEvent('app_upgrade_status_changed', { detail: { userId: user.id } }));
  return getUpgradeStatus(user);
}

export function resetUpgradeStatus(user: User): UpgradeStatus {
  const key = `${STORAGE_KEY_PREFIX}${user.id}`;
  localStorage.removeItem(key);
  window.dispatchEvent(new CustomEvent('app_upgrade_status_changed', { detail: { userId: user.id } }));
  return getUpgradeStatus(user);
}

export function useUpgradeStatus(user?: User | null) {
  const [status, setStatus] = useState<UpgradeStatus>(() => getUpgradeStatus(user));

  useEffect(() => {
    setStatus(getUpgradeStatus(user));

    const handleUpdate = () => {
      setStatus(getUpgradeStatus(user));
    };

    window.addEventListener('app_upgrade_status_changed', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('app_upgrade_status_changed', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [user?.id]);

  return status;
}
