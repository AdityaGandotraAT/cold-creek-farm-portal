export async function fetchVendorReplyPreview(token) {
  const response = await fetch(`/api/vendor-replies?token=${encodeURIComponent(token)}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'This vendor reply link is invalid');
  }
  return data;
}

export async function submitVendorReply({ token, decision }) {
  const response = await fetch('/api/vendor-replies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, decision }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Unable to save your reply');
  }
  return data;
}
