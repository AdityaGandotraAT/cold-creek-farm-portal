import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSession, getSession } from './session.js';

function timeoutToMs(label) {
  if (label === '15 minutes') {
    return 15 * 60 * 1000;
  }
  if (label === '1 hour') {
    return 60 * 60 * 1000;
  }
  if (label === '4 hours') {
    return 4 * 60 * 60 * 1000;
  }
  return 30 * 60 * 1000;
}

export function useSessionTimeout() {
  const navigate = useNavigate();

  useEffect(() => {
    const session = getSession();
    if (!session?.token || session.rememberMe) {
      return undefined;
    }

    const limit = timeoutToMs(session.sessionTimeout);
    let lastActive = Date.now();

    function onActivity() {
      lastActive = Date.now();
    }

    function onTick() {
      if (Date.now() - lastActive >= limit) {
        clearSession();
        navigate('/login', { replace: true });
      }
    }

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((name) => window.addEventListener(name, onActivity));
    const timer = window.setInterval(onTick, 15000);

    return () => {
      events.forEach((name) => window.removeEventListener(name, onActivity));
      window.clearInterval(timer);
    };
  }, [navigate]);
}
