export const FARM_TIME_ZONE = 'America/New_York';

function pad(value) {
  return String(value).padStart(2, '0');
}

function farmParts(now = new Date()) {
  const map = {};

  for (const part of new Intl.DateTimeFormat('en-US', {
    timeZone: FARM_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)) {
    if (part.type !== 'literal') {
      map[part.type] = part.value;
    }
  }

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
  };
}

export function farmTodayISO(now = new Date()) {
  const parts = farmParts(now);
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
}

export function farmHour(now = new Date()) {
  return farmParts(now).hour;
}

export function formatFarmToday(now = new Date()) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: FARM_TIME_ZONE,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(now);
}

export function formatFarmDate(isoDate) {
  if (!isoDate) {
    return '';
  }

  const [year, month, day] = isoDate.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

export function formatFarmClock(time) {
  const [hour, minute] = String(time).split(':').map(Number);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(1970, 0, 1, hour, minute)));
}

export function formatFarmDateTime(isoDateTime) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: FARM_TIME_ZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(isoDateTime));
}

export function shiftFarmISODate(isoDate, days) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function daysBetweenFarmISO(laterISO, earlierISO) {
  const later = Date.parse(`${laterISO}T00:00:00Z`);
  const earlier = Date.parse(`${earlierISO}T00:00:00Z`);
  return Math.round((later - earlier) / 86400000);
}

export function isFarmISODate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function isFarmISOOnOrBeforeToday(isoDate, now = new Date()) {
  return daysBetweenFarmISO(farmTodayISO(now), isoDate) >= 0;
}
