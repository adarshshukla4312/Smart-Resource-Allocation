import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  MapPin, LogOut, Edit2, Check, Award
} from 'lucide-react';
import { currentVolunteerProfile, currentEmployeeProfile, SKILLS, INTERESTS } from '../../data/mockData';
import './Profile.css';

export default function Profile() {
  const { user, onLogout } = useOutletContext();
  const isVolunteer = user?.role === 'VOLUNTEER';
  const profile = isVolunteer ? currentVolunteerProfile : currentEmployeeProfile;

  const [editMode, setEditMode] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState(profile.skills || []);
  const [selectedInterests, setSelectedInterests] = useState(profile.interests || []);
  const [availability, setAvailability] = useState(profile.availability || []);
  const availabilityOptions = ['WEEKDAYS', 'WEEKENDS', 'EVENINGS', 'FULLTIME'];

  const toggleItem = (arr, setArr, item) => {
    setArr(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]);
  };

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <div className="profile-header animate-fade-in">
        <div className="profile-avatar">
          {profile.displayName.charAt(0)}
        </div>
        <h1 className="headline-md">{profile.displayName}</h1>
        <span className="category-badge">{isVolunteer ? 'Volunteer' : 'Field Officer'}</span>
        <div className="profile-location">
          <MapPin size={14} />
          <span className="body-sm text-muted">{profile.homeLocation.address}</span>
        </div>
      </div>

      {/* Stats */}
      {isVolunteer && (
        <div className="profile-stats animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="profile-stat">
            <span className="display-sm text-primary">3</span>
            <span className="label-md text-muted">Active Tasks</span>
          </div>
          <div className="profile-stat">
            <span className="display-sm text-primary">12</span>
            <span className="label-md text-muted">Completed</span>
          </div>
          <div className="profile-stat">
            <span className="display-sm">
              <Award size={18} />
            </span>
            <span className="label-md text-muted">Top 10%</span>
          </div>
        </div>
      )}

      {/* Edit Toggle */}
      <div className="profile-edit-toggle animate-fade-in" style={{ animationDelay: '200ms' }}>
        <button
          className={editMode ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setEditMode(!editMode)}
          style={{ width: 'auto', padding: '8px 20px' }}
        >
          {editMode ? <><Check size={16} /> Save Changes</> : <><Edit2 size={16} /> Edit Profile</>}
        </button>
      </div>

      {/* Skills */}
      {isVolunteer && (
        <div className="profile-section animate-fade-in" style={{ animationDelay: '300ms' }}>
          <span className="title-md">Skills</span>
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
          <span className="title-md">Interests</span>
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
          <span className="title-md">Availability</span>
          <div className="profile-chips">
            {availabilityOptions.map(opt => (
              <button
                key={opt}
                className={`chip ${availability.includes(opt) ? 'active' : ''}`}
                onClick={() => editMode && toggleItem(availability, setAvailability, opt)}
                disabled={!editMode}
              >{opt.charAt(0) + opt.slice(1).toLowerCase()}</button>
            ))}
          </div>
        </div>
      )}

      {/* Contact Info */}
      <div className="profile-section animate-fade-in" style={{ animationDelay: '600ms' }}>
        <span className="title-md">Contact</span>
        <div className="profile-info-row">
          <span className="body-sm text-muted">Phone</span>
          <span className="body-md">{profile.phone}</span>
        </div>
        <div className="profile-info-row">
          <span className="body-sm text-muted">Member Since</span>
          <span className="body-md">{new Date(profile.createdAt).toLocaleDateString()}</span>
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
