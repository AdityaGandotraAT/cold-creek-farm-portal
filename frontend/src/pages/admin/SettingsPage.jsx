import { useState } from 'react';
import { getSession } from '../../auth/session.js';
import FormField from '../../components/admin/clients/FormField.jsx';
import PageHeader from '../../components/admin/clients/PageHeader.jsx';
import '../../components/admin/clients/addClient.css';
import '../../components/admin/clients/clients.css';
import SettingsConfirmModal from '../../components/admin/settings/SettingsConfirmModal.jsx';
import SettingsPasswordModal from '../../components/admin/settings/SettingsPasswordModal.jsx';
import SettingsToggle from '../../components/admin/settings/SettingsToggle.jsx';
import '../../components/admin/settings/settings.css';
import { validateProfileSettings, validateVendorLockSettings } from '../../components/admin/settings/settingsForm.js';
import { defaultSettings, sessionTimeoutOptions } from '../../data/settingsMock.js';
import {
  getVendorSelectionLockDays,
  setVendorSelectionLockDays,
} from '../../data/vendorSelectionLock.js';

function profileDefaults() {
  const session = getSession();
  const fullName = [session?.user?.firstName, session?.user?.lastName].filter(Boolean).join(' ');

  return {
    adminName: fullName || defaultSettings.adminName,
    profileEmail: session?.user?.email || defaultSettings.profileEmail,
    profilePhone: defaultSettings.profilePhone,
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
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);

  function markSaved(section) {
    setSaved((current) => ({ ...current, [section]: true }));
  }

  function clearSaved(section) {
    setSaved((current) => ({ ...current, [section]: false }));
  }

  function updateSection(setter, section, name, value) {
    setter((current) => ({ ...current, [name]: value }));
    clearSaved(section);
  }

  function handleSave(event, section, values, validate, setErrors) {
    event.preventDefault();
    const errors = validate ? validate(values) : {};
    setErrors?.(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    if (section === 'vendorLock') {
      setVendorSelectionLockDays(values.lockDays);
    }
    markSaved(section);
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
            <button className="clients-add" type="submit">
              Save Changes
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
          <p className="settings-note">Your administrator profile for this portal session.</p>
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
            <button className="clients-add" type="submit">
              Save Profile
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
          <p className="settings-note">Choose which notification types are enabled. Email is not sent yet.</p>
          {saved.notifications ? (
            <p className="settings-saved" role="status">
              Settings saved successfully.
            </p>
          ) : null}
          <div className="settings-toggles">
            <SettingsToggle
              id="emailNotifications"
              label="Email Notifications"
              hint="Receive important portal notifications by email."
              checked={notifications.emailNotifications}
              onChange={(value) =>
                updateSection(setNotifications, 'notifications', 'emailNotifications', value)
              }
            />
            <SettingsToggle
              id="clientNotifications"
              label="Client Notifications"
              hint="Send email notifications related to client activity."
              checked={notifications.clientNotifications}
              onChange={(value) =>
                updateSection(setNotifications, 'notifications', 'clientNotifications', value)
              }
            />
            <SettingsToggle
              id="vendorNotifications"
              label="Vendor Notifications"
              hint="Send email notifications related to vendor activity."
              checked={notifications.vendorNotifications}
              onChange={(value) =>
                updateSection(setNotifications, 'notifications', 'vendorNotifications', value)
              }
            />
          </div>
          <div className="client-form__actions">
            <button className="clients-add" type="submit">
              Save Changes
            </button>
          </div>
        </form>

        <form
          className="client-form__section settings-card"
          onSubmit={(event) => handleSave(event, 'security', security)}
        >
          <h3>Security</h3>
          <p className="settings-note">Display-only preferences. Login and authentication are not changed here.</p>
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
              hint="Show extra login protection in the portal. This does not change the current sign-in process."
              checked={security.loginSecurity}
              onChange={(value) => updateSection(setSecurity, 'security', 'loginSecurity', value)}
            />
          </div>
          <div className="client-form__actions">
            <button className="clients-add" type="submit">
              Save Changes
            </button>
          </div>
        </form>

        <form
          className="client-form__section settings-card"
          onSubmit={(event) => handleSave(event, 'portal', portal)}
        >
          <h3>Portal Settings</h3>
          <p className="settings-note">Control client access and portal messaging. These toggles are local only.</p>
          {saved.portal ? (
            <p className="settings-saved" role="status">
              Settings saved successfully.
            </p>
          ) : null}
          <div className="settings-toggles">
            <SettingsToggle
              id="clientPortalEnabled"
              label="Client Portal"
              hint="Allow clients to access the client portal."
              checked={portal.clientPortalEnabled}
              onChange={(value) => updateSection(setPortal, 'portal', 'clientPortalEnabled', value)}
            />
            <SettingsToggle
              id="welcomeEmailEnabled"
              label="Welcome Email"
              hint="Send the welcome email when a client account is created."
              checked={portal.welcomeEmailEnabled}
              onChange={(value) => updateSection(setPortal, 'portal', 'welcomeEmailEnabled', value)}
            />
            <SettingsToggle
              id="maintenanceMode"
              label="Maintenance Mode"
              hint="Temporarily prevent portal access while maintenance is being performed."
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
            <button className="clients-add" type="submit">
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {passwordOpen ? <SettingsPasswordModal onClose={() => setPasswordOpen(false)} /> : null}
      {maintenanceOpen ? (
        <SettingsConfirmModal
          title="Turn on maintenance mode?"
          message="This is a preview only. Confirming will mark Maintenance Mode as on in this page. It will not take the portal offline."
          confirmLabel="Turn On"
          onConfirm={handleMaintenanceConfirm}
          onClose={() => setMaintenanceOpen(false)}
        />
      ) : null}
    </div>
  );
}

export default SettingsPage;
