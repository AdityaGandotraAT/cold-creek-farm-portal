const SESSION_KEY = 'ccf.session';

export function saveSession(token, user, rememberMe) {
  const payload = JSON.stringify({ token, user });

  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);

  if (rememberMe) {
    localStorage.setItem(SESSION_KEY, payload);
    return;
  }

  sessionStorage.setItem(SESSION_KEY, payload);
}

export function getSession() {
  const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
}
