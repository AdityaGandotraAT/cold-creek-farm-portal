import { useEffect, useState } from 'react';
import { changePasswordRequest } from '../../api/auth.js';
import { saveProfileRequest } from '../../api/settings.js';
import { getSession, saveSession } from '../../auth/session.js';
import FormField from '../../components/admin/clients/FormField.jsx';
import PageHeader from '../../components/admin/clients/PageHeader.jsx';
import '../../components/admin/clients/addClient.css';
import '../../components/admin/clients/clients.css';
import SettingsConfirmModal from '../../components/admin/settings/SettingsConfirmModal.jsx';
import SettingsPasswordModal from '../../components/admin/settings/SettingsPasswordModal.jsx';
import SettingsToggle from '../../components/admin/settings/SettingsToggle.jsx';
import '../../components/admin/settings/settings.css';
import {
  validateProfileSettings,
  validateVendorLockSettings,
} from '../../components/admin/settings/settingsForm.js';
import { defaultSettings, sessionTimeoutOptions } from '../../data/settingsMock.js';
import {
  getPortalSettingsState,
  loadPortalSettings,
  savePortalSettings,
} from '../../data/settingsStore.js';
import { getVendorSelectionLockDays } from '../../data/vendorSelectionLock.js';

function profileDefaults() {
  const session = getSession();
  const fullName = [session?.user?.firstName, session?.user?.lastName].filter(Boolean).join(' ');

  return {
    adminName: fullName || defaultSettings.adminName,
    profileEmail: session?.user?.email || defaultSettings.profileEmail,
    profilePhone: session?.user?.phone || defaultSettings.profilePhone,
  };
}

function settingsToState(record) {
  return {
    notifications: {
      emailNotifications: record?.emailNotifications !== false,
      clientNotifications: record?.clientNotifications !== false,
      vendorNotifications: Boolean(record?.vendorNotifications),
    },
    security: {
      sessionTimeout: record?.sessionTimeout || defaultSettings.sessionTimeout,
      loginSecurity: record?.loginSecurity !== false,
    },
    portal: {
      clientPortalEnabled: record?.clientPortalEnabled !== false,
      welcomeEmailEnabled: record?.welcomeEmailEnabled !== false,
      maintenanceMode: Boolean(record?.maintenanceMode),
    },
    vendorLock: {
      lockDays: String(record?.vendorLockDays || getVendorSelectionLockDays()),
    },
  };
}

function combinedPayload({ vendorLock, notifications, security, portal }) {
  return {
    vendorLockDays: Number.parseInt(String(vendorLock.lockDays), 10),
    emailNotifications: notifications.emailNotifications,
    clientNotifications: notifications.clientNotifications,
    vendorNotifications: notifications.vendorNotifications,
    sessionTimeout: security.sessionTimeout,
    loginSecurity: security.loginSecurity,
    clientPortalEnabled: portal.clientPortalEnabled,
    welcomeEmailEnabled: portal.welcomeEmailEnabled,
    maintenanceMode: portal.maintenanceMode,
  };
}

function SettingsPage() {
  const [profile, setProfile] = useState(profileDefaults);
  const [notifications, setNotifications] = useState({
    emailNotifications: defaultSettings.emailNotifications,
    clientNotifications: defaultSettings.clientNotifications,
    vendorNotifications: defaultSettings.vendorNotifications,
  });
  const [security, setSecurity] = useState({
    sessionTimeout: defaultSettings.sessionTimeout,
    loginSecurity: defaultSettings.loginSecurity,
  });
  const [portal, setPortal] = useState({
    clientPortalEnabled: defaultSettings.clientPortalEnabled,
    welcomeEmailEnabled: defaultSettings.welcomeEmailEnabled,
    maintenanceMode: defaultSettings.maintenanceMode,
  });
  const [vendorLock, setVendorLock] = useState({
    lockDays: String(getVendorSelectionLockDays()),
  });
  const [vendorLockErrors, setVendorLockErrors] = useState({});
  const [profileErrors, setProfileErrors] = useState({});
  const [saved, setSaved] = useState({});
  const [error, setError] = useState('');
  const [savingSection, setSavingSection] = useState('');
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        await loadPortalSettings();
        if (!active) {
          return;
        }
        const record = getPortalSettingsState();
        if (record) {
          const next = settingsToState(record);
          setNotifications(next.notifications);
          setSecurity(next.security);
          setPortal(next.portal);
          setVendorLock(next.vendorLock);
        }
        setProfile(profileDefaults());
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load settings');
        }
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  function markSaved(section) {
    setSaved((current) => ({ ...current, [section]: true }));
  }

  function clearSaved(section) {
    setSaved((current) => ({ ...current, [section]: false }));
  }

  function updateSection(setter, section, name, value) {
    setter((current) => ({ ...current, [name]: value }));
    clearSaved(section);
    setError('');
  }

  async function persistPortal(section) {
    setSavingSection(section);
    setError('');
    try {
      await savePortalSettings(
        combinedPayload({ vendorLock, notifications, security, portal }),
      );
      markSaved(section);
    } catch (err) {
      setError(err.message || 'Unable to save settings');
    } finally {
      setSavingSection('');
    }
  }

  async function handleSave(event, section, values, validate, setErrors) {
    event.preventDefault();
    const errors = validate ? validate(values) : {};
    setErrors?.(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    if (section === 'profile') {
      setSavingSection('profile');
      setError('');
      try {
        const result = await saveProfileRequest({
          adminName: values.adminName,
          profileEmail: values.profileEmail,
          profilePhone: values.profilePhone,
        });
        const session = getSession();
        if (session?.token && result.user) {
          saveSession(session.token, result.user, session.rememberMe, {
            sessionTimeout: session.sessionTimeout,
          });
        }
        setProfile({
          adminName: [result.user.firstName, result.user.lastName].filter(Boolean).join(' '),
          profileEmail: result.user.email,
          profilePhone: result.user.phone || '',
        });
        markSaved('profile');
      } catch (err) {
        setError(err.message || 'Unable to save profile');
      } finally {
        setSavingSection('');
      }
      return;
    }

    await persistPortal(section);
  }

  function handleMaintenanceConfirm() {
    setPortal((current) => ({ ...current, maintenanceMode: true }));
    setMaintenanceOpen(false);
    clearSaved('portal');
  }

  return (
    <div className="clients-page settings-page">
      <PageHeader
        title="Settings"
        description="Your admin profile and Cold Creek Farm portal preferences."
      />
      {error ? (
        <p className="client-form__error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="settings-stack">
        <form
          className="client-form__section settings-card"
          onSubmit={(event) =>
            handleSave(event, 'vendorLock', vendorLock, validateVendorLockSettings, setVendorLockErrors)
          }
          noValidate
        >
          <h3>Vendor Selection</h3>
          <p className="settings-note">
            Set the lock window for all bookings. Open or Locked then updates on the Bookings pages.
          </p>
          {saved.vendorLock ? (
            <p className="settings-saved" role="status">
              Settings saved successfully.
            </p>
          ) : null}
          <div className="client-form__grid">
            <FormField
              id="lockDays"
              label="Days before event to lock vendors"
              type="number"
              min={1}
              max={365}
              step={1}
              value={vendorLock.lockDays}
              onChange={(value) => updateSection(setVendorLock, 'vendorLock', 'lockDays', value)}
              error={vendorLockErrors.lockDays}
              required
              wide
            />
          </div>
          <div className="client-form__actions">
            <button className="clients-add" type="submit" disabled={savingSection === 'vendorLock'}>
              {savingSection === 'vendorLock' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        <form
          className="client-form__section settings-card"
          onSubmit={(event) =>
            handleSave(event, 'profile', profile, validateProfileSettings, setProfileErrors)
          }
          noValidate
        >
          <h3>My Profile</h3>
          <p className="settings-note">This name, email, and phone are used for your admin account.</p>
          {saved.profile ? (
            <p className="settings-saved" role="status">
              Settings saved successfully.
            </p>
          ) : null}
          <div className="client-form__grid">
            <FormField
              id="adminName"
              label="Admin Name"
              value={profile.adminName}
              onChange={(value) => updateSection(setProfile, 'profile', 'adminName', value)}
              error={profileErrors.adminName}
              required
            />
            <FormField
              id="profileEmail"
              label="Email"
              type="email"
              value={profile.profileEmail}
              onChange={(value) => updateSection(setProfile, 'profile', 'profileEmail', value)}
              error={profileErrors.profileEmail}
              required
            />
            <FormField
              id="profilePhone"
              label="Phone Number"
              type="tel"
              value={profile.profilePhone}
              onChange={(value) => updateSection(setProfile, 'profile', 'profilePhone', value)}
              wide
            />
          </div>
          <div className="client-form__actions">
            <button className="clients-add" type="submit" disabled={savingSection === 'profile'}>
              {savingSection === 'profile' ? 'Saving...' : 'Save Profile'}
            </button>
            <button className="client-form__cancel" type="button" onClick={() => setPasswordOpen(true)}>
              Change Password
            </button>
          </div>
        </form>

        <form
          className="client-form__section settings-card"
          onSubmit={(event) => handleSave(event, 'notifications', notifications)}
        >
          <h3>Notification Settings</h3>
          <p className="settings-note">
            Control which emails the portal sends. In-app admin notifications still appear either way.
          </p>
          {saved.notifications ? (
            <p className="settings-saved" role="status">
              Settings saved successfully.
            </p>
          ) : null}
          <div className="settings-toggles">
            <SettingsToggle
              id="emailNotifications"
              label="Email Notifications"
              hint="Send a farm copy of portal emails to the owner inbox."
              checked={notifications.emailNotifications}
              onChange={(value) =>
                updateSection(setNotifications, 'notifications', 'emailNotifications', value)
              }
            />
            <SettingsToggle
              id="clientNotifications"
              label="Client Notifications"
              hint="Email clients for welcome, booking, and vendor availability replies."
              checked={notifications.clientNotifications}
              onChange={(value) =>
                updateSection(setNotifications, 'notifications', 'clientNotifications', value)
              }
            />
            <SettingsToggle
              id="vendorNotifications"
              label="Vendor Notifications"
              hint="Email preferred vendors when a client selects them. Leave off until the portal is live."
              checked={notifications.vendorNotifications}
              onChange={(value) =>
                updateSection(setNotifications, 'notifications', 'vendorNotifications', value)
              }
            />
          </div>
          <div className="client-form__actions">
            <button className="clients-add" type="submit" disabled={savingSection === 'notifications'}>
              {savingSection === 'notifications' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        <form
          className="client-form__section settings-card"
          onSubmit={(event) => handleSave(event, 'security', security)}
        >
          <h3>Security</h3>
          <p className="settings-note">
            Session timeout signs idle admins out. Login security locks an account after five failed
            attempts.
          </p>
          {saved.security ? (
            <p className="settings-saved" role="status">
              Settings saved successfully.
            </p>
          ) : null}
          <div className="client-form__grid">
            <FormField
              id="sessionTimeout"
              label="Session Timeout"
              value={security.sessionTimeout}
              onChange={(value) => updateSection(setSecurity, 'security', 'sessionTimeout', value)}
              options={sessionTimeoutOptions}
              wide
            />
          </div>
          <div className="settings-toggles">
            <SettingsToggle
              id="loginSecurity"
              label="Enable Login Security"
              hint="Temporarily lock an account after five incorrect passwords."
              checked={security.loginSecurity}
              onChange={(value) => updateSection(setSecurity, 'security', 'loginSecurity', value)}
            />
          </div>
          <div className="client-form__actions">
            <button className="clients-add" type="submit" disabled={savingSection === 'security'}>
              {savingSection === 'security' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        <form
          className="client-form__section settings-card"
          onSubmit={(event) => handleSave(event, 'portal', portal)}
        >
          <h3>Portal Settings</h3>
          <p className="settings-note">
            These controls apply to every client. Maintenance still lets administrators sign in.
          </p>
          {saved.portal ? (
            <p className="settings-saved" role="status">
              Settings saved successfully.
            </p>
          ) : null}
          <div className="settings-toggles">
            <SettingsToggle
              id="clientPortalEnabled"
              label="Client Portal"
              hint="Allow clients to sign in to the client portal."
              checked={portal.clientPortalEnabled}
              onChange={(value) => updateSection(setPortal, 'portal', 'clientPortalEnabled', value)}
            />
            <SettingsToggle
              id="welcomeEmailEnabled"
              label="Welcome Email"
              hint="Send the welcome email when a client account is created."
              checked={portal.welcomeEmailEnabled}
              onChange={(value) =>
                updateSection(setPortal, 'portal', 'welcomeEmailEnabled', value)
              }
            />
            <SettingsToggle
              id="maintenanceMode"
              label="Maintenance Mode"
              hint="Temporarily prevent client access while maintenance is being performed."
              checked={portal.maintenanceMode}
              onChange={(value) => {
                if (value) {
                  setMaintenanceOpen(true);
                  return;
                }
                updateSection(setPortal, 'portal', 'maintenanceMode', false);
              }}
            />
          </div>
          <div className="client-form__actions">
            <button className="clients-add" type="submit" disabled={savingSection === 'portal'}>
              {savingSection === 'portal' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {passwordOpen ? (
        <SettingsPasswordModal
          onClose={() => setPasswordOpen(false)}
          onSubmit={async (values) => {
            await changePasswordRequest({
              currentPassword: values.currentPassword,
              newPassword: values.newPassword,
            });
          }}
        />
      ) : null}
      {maintenanceOpen ? (
        <SettingsConfirmModal
          title="Turn on maintenance mode?"
          message="Clients will not be able to sign in until you turn this off. Administrators can still use the portal."
          confirmLabel="Turn On"
          onConfirm={handleMaintenanceConfirm}
          onClose={() => setMaintenanceOpen(false)}
        />
      ) : null}
    </div>
  );
}

export default SettingsPage;
