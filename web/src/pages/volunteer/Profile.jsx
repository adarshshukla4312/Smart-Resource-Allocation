import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  MapPin, LogOut, Edit2, Check, Award
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { SKILLS, INTERESTS } from '../../data/mockData';
import './Profile.css';

export default function Profile() {
  const { onLogout } = useOutletContext();
  const { userProfile, updateProfile } = useAuth();
  
  const isVolunteer = userProfile?.role === 'VOLUNTEER';
  const displayName = userProfile?.displayName || userProfile?.name || 'User';

  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [editedAddress, setEditedAddress] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [availability, setAvailability] = useState([]);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const times = ['Morning', 'Afternoon', 'Evening'];
  const [travelRadius, setTravelRadius] = useState(10);
  const [resumeName, setResumeName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setEditedName(userProfile.displayName || userProfile.name || '');
      setEditedPhone(userProfile.phone || '');
      setEditedAddress(userProfile.homeLocation?.address || '');
      setLat(userProfile.homeLocation?.lat || 0);
      setLng(userProfile.homeLocation?.lng || 0);
      setSelectedSkills(userProfile.skills || []);
      setSelectedInterests(userProfile.interests || []);
      setAvailability(userProfile.availability || []);
      setTravelRadius(userProfile.travelRadius || 10);
      setResumeName(userProfile.resumeUrl ? 'resume.pdf' : '');
    }
  }, [userProfile]);

  const toggleItem = (arr, setArr, item) => {
    setArr(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        if (!editedAddress) setEditedAddress(`Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`);
        setIsLocating(false);
      },
      (error) => {
        alert("Unable to retrieve your location");
        setIsLocating(false);
      }
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        displayName: editedName,
        phone: editedPhone,
        homeLocation: {
          address: editedAddress,
          lat: lat,
          lng: lng
        },
        skills: selectedSkills,
        interests: selectedInterests,
        availability: availability,
        travelRadius: Number(travelRadius)
      });
      setEditMode(false);
    } catch (error) {
      console.error("Error saving profile", error);
      alert("Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleEdit = () => {
    if (editMode) {
      handleSave();
    } else {
      setEditMode(true);
    }
  };

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <div className="profile-header animate-fade-in">
        <div className="profile-avatar">
          {(editedName || 'U').charAt(0).toUpperCase()}
        </div>
        <div className="profile-header-info">
          {editMode ? (
            <input 
              className="headline-md" 
              style={{ color: 'var(--on-surface)', background: 'transparent', border: '1px solid var(--outline)', borderRadius: '4px', padding: '4px', width: '100%', marginBottom: '8px' }} 
              value={editedName} 
              onChange={e => setEditedName(e.target.value)} 
            />
          ) : (
            <h1 className="headline-md" style={{ color: 'var(--on-surface)' }}>{editedName}</h1>
          )}
          <span className="category-badge">{isVolunteer ? 'Volunteer' : 'Field Officer'}</span>
          <div className="profile-location">
            <MapPin size={14} />
            {editMode ? (
              <div style={{ display: 'flex', gap: '8px', width: '100%', alignItems: 'center' }}>
                <input 
                  className="body-sm text-muted" 
                  style={{ background: 'transparent', border: '1px solid var(--outline)', borderRadius: '4px', padding: '4px', width: '100%', flex: 1 }} 
                  value={editedAddress} 
                  onChange={e => setEditedAddress(e.target.value)} 
                  placeholder="Address or detect location"
                />
                <button 
                  className="btn-secondary btn-sm"
                  onClick={detectLocation}
                  disabled={isLocating}
                  style={{ whiteSpace: 'nowrap', padding: '4px 8px' }}
                >
                  {isLocating ? 'Locating...' : 'Detect'}
                </button>
              </div>
            ) : (
              <span className="body-sm text-muted">{editedAddress || 'No location set'}</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {isVolunteer && (
        <div className="profile-stats animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="profile-stat">
            <span className="display-sm text-primary">0</span>
            <span className="label-md text-muted">Active Tasks</span>
          </div>
          <div className="profile-stat">
            <span className="display-sm text-primary">0</span>
            <span className="label-md text-muted">Completed</span>
          </div>
          <div className="profile-stat">
            <span className="display-sm" style={{ color: 'var(--on-surface)' }}>
              <Award size={18} />
            </span>
            <span className="label-md text-muted">Newcomer</span>
          </div>
        </div>
      )}

      {/* Edit Toggle */}
      <div className="profile-edit-toggle animate-fade-in" style={{ animationDelay: '200ms' }}>
        <button
          className={editMode ? 'btn-primary' : 'btn-secondary'}
          onClick={handleToggleEdit}
          disabled={isSaving}
          style={{ width: 'auto', padding: '8px 20px' }}
        >
          {isSaving ? 'Saving...' : editMode ? <><Check size={16} /> Save Changes</> : <><Edit2 size={16} /> Edit Profile</>}
        </button>
      </div>

      {/* Skills */}
      {isVolunteer && (
        <div className="profile-section animate-fade-in" style={{ animationDelay: '300ms' }}>
          <span className="title-md" style={{ color: 'var(--on-surface)' }}>Skills</span>
          <div className="profile-chips">
            {SKILLS.map(skill => (
              <button
                key={skill}
                className={`chip ${selectedSkills.includes(skill) ? 'active' : ''}`}
                onClick={() => editMode && toggleItem(selectedSkills, setSelectedSkills, skill)}
                disabled={!editMode}
              >{skill}</button>
            ))}
          </div>
        </div>
      )}

      {/* Interests */}
      {isVolunteer && (
        <div className="profile-section animate-fade-in" style={{ animationDelay: '400ms' }}>
          <span className="title-md" style={{ color: 'var(--on-surface)' }}>Interests</span>
          <div className="profile-chips">
            {INTERESTS.map(interest => (
              <button
                key={interest}
                className={`chip ${selectedInterests.includes(interest) ? 'active' : ''}`}
                onClick={() => editMode && toggleItem(selectedInterests, setSelectedInterests, interest)}
                disabled={!editMode}
              >{interest}</button>
            ))}
          </div>
        </div>
      )}

      {/* Availability */}
      {isVolunteer && (
        <div className="profile-section animate-fade-in" style={{ animationDelay: '500ms' }}>
          <span className="title-md" style={{ color: 'var(--on-surface)' }}>Weekly Availability</span>
          <div className="availability-grid" style={{ marginTop: '12px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', color: 'var(--on-surface)' }}>
              <thead>
                <tr>
                  <th style={{ padding: '8px', borderBottom: '1px solid var(--outline)', color: 'var(--muted)' }}></th>
                  {days.map(day => <th key={day} style={{ padding: '8px', borderBottom: '1px solid var(--outline)', fontWeight: 'normal' }}>{day}</th>)}
                </tr>
              </thead>
              <tbody>
                {times.map(time => (
                  <tr key={time}>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--outline)', textAlign: 'left', color: 'var(--muted)' }}>{time}</td>
                    {days.map(day => {
                      const key = `${day}-${time}`;
                      const isSelected = availability.includes(key);
                      return (
                        <td key={key} style={{ padding: '8px', borderBottom: '1px solid var(--outline)' }}>
                          <button
                            className={`availability-cell ${isSelected ? 'active' : ''}`}
                            style={{
                              width: '24px', height: '24px', borderRadius: '4px',
                              background: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                              border: 'none', cursor: editMode ? 'pointer' : 'default',
                              opacity: editMode ? 1 : (isSelected ? 1 : 0.3)
                            }}
                            onClick={() => editMode && toggleItem(availability, setAvailability, key)}
                            disabled={!editMode}
                            aria-label={`${day} ${time}`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Preferences */}
      {isVolunteer && (
        <div className="profile-section animate-fade-in" style={{ animationDelay: '550ms' }}>
          <span className="title-md" style={{ color: 'var(--on-surface)' }}>Preferences</span>
          <div className="profile-info-row" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '8px' }}>
              <span className="body-sm text-muted">Max Travel Radius</span>
              <span className="body-md" style={{ color: 'var(--primary)' }}>{travelRadius} km</span>
            </div>
            <input 
              type="range" 
              min="1" max="50" 
              value={travelRadius} 
              onChange={e => setTravelRadius(e.target.value)} 
              disabled={!editMode}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
          </div>
        </div>
      )}

      {/* Resume Upload */}
      {isVolunteer && (
        <div className="profile-section animate-fade-in" style={{ animationDelay: '575ms' }}>
          <span className="title-md" style={{ color: 'var(--on-surface)' }}>Resume / CV</span>
          <div style={{ 
            marginTop: '12px', border: '1px dashed var(--outline)', borderRadius: '8px', padding: '24px', 
            textAlign: 'center', background: 'rgba(255,255,255,0.02)', position: 'relative'
          }}>
            {resumeName ? (
              <div style={{ color: 'var(--primary)' }}>
                <Check size={24} style={{ margin: '0 auto 8px' }} />
                <p className="body-sm">{resumeName}</p>
                {editMode && <button className="btn-secondary" style={{ marginTop: '8px', padding: '4px 12px' }} onClick={() => setResumeName('')}>Remove</button>}
              </div>
            ) : (
              <div>
                <p className="body-sm text-muted" style={{ marginBottom: '12px' }}>Upload your resume (PDF, DOCX) to help us match you with specialized tasks.</p>
                <button className="btn-secondary" disabled={!editMode} style={{ width: 'auto', margin: '0 auto', padding: '8px 16px' }} onClick={() => document.getElementById('resume-upload').click()}>
                  Browse Files
                </button>
                <input 
                  id="resume-upload" 
                  type="file" 
                  accept=".pdf,.docx" 
                  style={{ display: 'none' }} 
                  onChange={e => { if (e.target.files[0]) setResumeName(e.target.files[0].name); }} 
                  disabled={!editMode}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact Info */}
      <div className="profile-section animate-fade-in" style={{ animationDelay: '600ms' }}>
        <span className="title-md" style={{ color: 'var(--on-surface)' }}>Contact</span>
        <div className="profile-info-row">
          <span className="body-sm text-muted">Phone</span>
          {editMode ? (
             <input 
               className="body-md" 
               style={{ color: 'var(--on-surface)', background: 'transparent', border: '1px solid var(--outline)', borderRadius: '4px', padding: '2px', textAlign: 'right' }} 
               value={editedPhone} 
               onChange={e => setEditedPhone(e.target.value)} 
             />
          ) : (
             <span className="body-md" style={{ color: 'var(--on-surface)' }}>{editedPhone || 'No phone set'}</span>
          )}
        </div>
        <div className="profile-info-row">
          <span className="body-sm text-muted">Member Since</span>
          <span className="body-md" style={{ color: 'var(--on-surface)' }}>{userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Unknown'}</span>
        </div>
      </div>

      {/* Logout */}
      <div className="profile-logout animate-fade-in" style={{ animationDelay: '700ms' }}>
        <button className="btn-danger" onClick={onLogout} id="profile-logout">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
