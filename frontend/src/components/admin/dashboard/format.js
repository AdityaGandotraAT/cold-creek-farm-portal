import {
  formatFarmClock,
  formatFarmDate,
  formatFarmDateTime,
} from '../../../data/farmTime.js';

export function formatEventDate(isoDate) {
  return formatFarmDate(isoDate);
}

export function formatTimeRange(startTime, endTime) {
  return `${formatFarmClock(startTime)} - ${formatFarmClock(endTime)}`;
}

export function formatActivityTime(isoDateTime) {
  return formatFarmDateTime(isoDateTime);
}

export function bookingStatusTone(status) {
  if (status === 'Confirmed') {
    return 'confirmed';
  }

  if (status === 'Pending') {
    return 'pending';
  }

  return 'neutral';
}
