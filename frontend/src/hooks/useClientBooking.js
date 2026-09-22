import { useEffect, useState } from 'react';
import { fetchMyBooking } from '../api/clientPortal.js';

export function useClientBooking() {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const record = await fetchMyBooking();
        if (active) {
          setBooking(record);
        }
      } catch (err) {
        if (active) {
          setBooking(null);
          setError(err.message || 'Unable to load booking');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  return { booking, loading, error };
}
