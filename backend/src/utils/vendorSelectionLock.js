const FARM_TIME_ZONE = 'America/New_York';
export const VENDOR_SELECTION_LOCK_DAYS = 90;

let configuredLockDays = VENDOR_SELECTION_LOCK_DAYS;

export function configureVendorSelectionLockDays(days) {
  const parsed = Number.parseInt(String(days), 10);
  if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 365) {
    configuredLockDays = parsed;
  }
  return configuredLockDays;
}

export function getConfiguredVendorSelectionLockDays() {
  return configuredLockDays;
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function farmTodayISO(now = new Date()) {
  const map = {};
  for (const part of new Intl.DateTimeFormat('en-US', {
    timeZone: FARM_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)) {
    if (part.type !== 'literal') {
      map[part.type] = part.value;
    }
  }
  return `${map.year}-${map.month}-${map.day}`;
}

function shiftFarmISODate(isoDate, days) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function daysBetweenFarmISO(laterISO, earlierISO) {
  const later = Date.parse(`${laterISO}T00:00:00Z`);
  const earlier = Date.parse(`${earlierISO}T00:00:00Z`);
  return Math.round((later - earlier) / 86400000);
}

function isFarmISODate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) {
    return false;
  }
  const [year, month, day] = String(value).split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
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
  const deadlineDate = shiftFarmISODate(eventDate, -configuredLockDays);
  const daysUntilDeadline = daysBetweenFarmISO(deadlineDate, today);
  const daysUntilEvent = daysBetweenFarmISO(eventDate, today);

  return {
    status: daysUntilDeadline <= 0 ? 'Locked' : 'Open',
    locked: daysUntilDeadline <= 0,
    deadlineDate,
    daysUntilDeadline,
    daysUntilEvent,
  };
}
