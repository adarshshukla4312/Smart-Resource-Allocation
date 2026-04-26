import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  MapPin, LogOut, Edit2, Check, Award, MessageSquare, Heart
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
    <div className="profile-page animate-fade-in">
      <div className="profile-header">
        <div className="profile-avatar-circle">
          {profile.displayName.charAt(0)}
        </div>
        <div className="profile-identity">
          <h1 className="display-sm serif">{profile.displayName}</h1>
          <div className="profile-badge-row">
            <span className="match-tag">{isVolunteer ? 'Volunteer' : 'Field Officer'}</span>
            <div className="profile-location-meta">
              <MapPin size={12} />
              <span className="label-lg">{profile.homeLocation.address.split(',')[0]}</span>
            </div>
          </div>
        </div>
      </div>

      {isVolunteer && (
        <div className="profile-stats-row">
          <div className="stat-card">
            <div className="stat-label label-lg">Active Tasks</div>
            <div className="stat-value serif">3</div>
            <div className="stat-icon-bubble"><MessageSquare size={16} /></div>
          </div>
          <div className="stat-card">
            <div className="stat-label label-lg">Completed</div>
            <div className="stat-value serif">12</div>
            <div className="stat-icon-bubble"><Check size={16} /></div>
          </div>
          <div className="stat-card">
            <div className="stat-label label-lg">Ranking</div>
            <div className="stat-value serif">#4</div>
            <div className="stat-icon-bubble"><Award size={16} /></div>
          </div>
        </div>
      )}

      <div className="profile-content">
        <div className="section-header">
          <h2 className="title-md serif">Personal Settings</h2>
          <button
            className={`label-lg ${editMode ? 'text-primary' : 'text-muted'}`}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'SAVE CHANGES' : 'EDIT PROFILE'}
          </button>
        </div>

        {isVolunteer && (
          <>
            <div className="profile-section">
              <span className="label-lg section-label">SKILLS</span>
              <div className="chip-row">
                {SKILLS.map(skill => (
                  <button
                    key={skill}
                    className={`filter-chip ${selectedSkills.includes(skill) ? 'active' : ''}`}
                    onClick={() => editMode && toggleItem(selectedSkills, setSelectedSkills, skill)}
                    disabled={!editMode}
                  >{skill}</button>
                ))}
              </div>
            </div>

            <div className="profile-section">
              <span className="label-lg section-label">INTERESTS</span>
              <div className="chip-row">
                {INTERESTS.map(interest => (
                  <button
                    key={interest}
                    className={`filter-chip ${selectedInterests.includes(interest) ? 'active' : ''}`}
                    onClick={() => editMode && toggleItem(selectedInterests, setSelectedInterests, interest)}
                    disabled={!editMode}
                  >{interest}</button>
                ))}
              </div>
            </div>

            <div className="profile-section">
              <span className="label-lg section-label">AVAILABILITY</span>
              <div className="chip-row">
                {availabilityOptions.map(opt => (
                  <button
                    key={opt}
                    className={`filter-chip ${availability.includes(opt) ? 'active' : ''}`}
                    onClick={() => editMode && toggleItem(availability, setAvailability, opt)}
                    disabled={!editMode}
                  >{opt.charAt(0) + opt.slice(1).toLowerCase()}</button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="profile-section">
          <span className="label-lg section-label">CONTACT INFORMATION</span>
          <div className="contact-info-list">
            <div className="contact-item">
              <span className="label-lg">Phone</span>
              <span className="body-md">{profile.phone}</span>
            </div>
            <div className="contact-item">
              <span className="label-lg">Member Since</span>
              <span className="body-md">{new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <button className="logout-btn-editorial" onClick={onLogout}>
          <LogOut size={18} />
          <span className="label-lg">Sign Out of Console</span>
        </button>
      </div>
    </div>
  );
}
