import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchVendorReplyPreview, submitVendorReply } from '../api/vendorReplies.js';
import logo from '../assets/ccf-logo.png';
import { formatFarmDate } from '../data/farmTime.js';
import './VendorReplyPage.css';

function labelForDecision(decision) {
  if (decision === 'accept') {
    return 'Accept';
  }
  if (decision === 'unavailable') {
    return 'Not available';
  }
  return '';
}

function VendorReplyPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const requestedDecision = searchParams.get('decision') || '';
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  const decision = useMemo(() => {
    if (requestedDecision === 'accept' || requestedDecision === 'unavailable') {
      return requestedDecision;
    }
    return '';
  }, [requestedDecision]);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!token) {
        setError('This vendor reply link is missing.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const data = await fetchVendorReplyPreview(token);
        if (active) {
          setPreview(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'This vendor reply link is invalid');
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
  }, [token]);

  async function handleSubmit(nextDecision) {
    if (saving || !token) {
      return;
    }

    setSaving(true);
    setError('');
    try {
      const data = await submitVendorReply({ token, decision: nextDecision });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Unable to save your reply');
    } finally {
      setSaving(false);
    }
  }

  const done = result || preview?.alreadyResponded;
  const status = result?.status || preview?.status;
  const accepted = status === 'Confirmed';
  const unavailable = status === 'Unavailable';

  return (
    <div className="vendor-reply">
      <div className="vendor-reply__card">
        <img className="vendor-reply__logo" src={logo} alt="Cold Creek Farm" />
        <p className="vendor-reply__kicker">Cold Creek Farm</p>
        <h1>Vendor availability</h1>

        {loading ? <p>Loading this request...</p> : null}
        {error ? (
          <p className="vendor-reply__error" role="alert">
            {error}
          </p>
        ) : null}

        {preview && !loading ? (
          <dl className="vendor-reply__facts">
            <div>
              <dt>Event</dt>
              <dd>{preview.eventName}</dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>{formatFarmDate(preview.eventDate)}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{preview.category}</dd>
            </div>
            <div>
              <dt>Vendor</dt>
              <dd>{preview.vendorName}</dd>
            </div>
          </dl>
        ) : null}

        {done ? (
          <p className="vendor-reply__done">
            {accepted
              ? 'Thank you. The client will be emailed that you accepted this date.'
              : unavailable
                ? 'Thank you. The client will be emailed to choose another vendor.'
                : 'This reply was already saved.'}
          </p>
        ) : null}

        {!loading && preview && !done ? (
          <>
            <p>
              {decision === 'accept'
                ? 'Confirm that you can take this event on the date above.'
                : decision === 'unavailable'
                  ? 'Confirm that you are not available on this date. The client will be asked to choose another vendor.'
                  : 'Please confirm whether you are available for this event.'}
            </p>
            <div className="vendor-reply__actions">
              {decision === 'unavailable' ? null : (
                <button
                  className="vendor-reply__accept"
                  type="button"
                  disabled={saving}
                  onClick={() => handleSubmit('accept')}
                >
                  {saving && decision !== 'unavailable' ? 'Saving...' : 'Accept'}
                </button>
              )}
              {decision === 'accept' ? null : (
                <button
                  className="vendor-reply__unavailable"
                  type="button"
                  disabled={saving}
                  onClick={() => handleSubmit('unavailable')}
                >
                  {saving ? 'Saving...' : 'Not available'}
                </button>
              )}
            </div>
            {decision ? (
              <p className="vendor-reply__hint">You chose {labelForDecision(decision)} from the email. Click to confirm.</p>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}

export default VendorReplyPage;
