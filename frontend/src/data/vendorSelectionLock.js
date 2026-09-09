import {
  daysBetweenFarmISO,
  farmTodayISO,
  isFarmISODate,
  shiftFarmISODate,
} from './farmTime.js';

export const VENDOR_SELECTION_LOCK_DAYS = 90;

let currentLockDays = VENDOR_SELECTION_LOCK_DAYS;

export function getVendorSelectionLockDays() {
  return currentLockDays;
}

export function setVendorSelectionLockDays(days) {
  currentLockDays = Number.parseInt(String(days), 10);
  return currentLockDays;
}

export function getVendorSelectionLock(eventDate, now = new Date()) {
  if (!isFarmISODate(eventDate)) {
    return {
      status: 'Unknown',
      locked: true,
      deadlineDate: null,
      daysUntilDeadline: null,
      daysUntilEvent: null,
    };
  }

  const today = farmTodayISO(now);
  const deadlineDate = shiftFarmISODate(eventDate, -getVendorSelectionLockDays());
  const daysUntilDeadline = daysBetweenFarmISO(deadlineDate, today);
  const daysUntilEvent = daysBetweenFarmISO(eventDate, today);
  const locked = daysUntilDeadline <= 0;

  return {
    status: locked ? 'Locked' : 'Open',
    locked,
    deadlineDate,
    daysUntilDeadline,
    daysUntilEvent,
  };
}
