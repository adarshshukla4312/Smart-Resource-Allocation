// Mock data following PRD §9 Core Data Models — Extended for mobile app

export const SEVERITY_LEVELS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
export const URGENCY_LEVELS = ['IMMEDIATE', 'SAME_DAY', 'WITHIN_WEEK', 'NON_URGENT'];
export const REPORT_TYPES = ['DISTRESS', 'INFO_GATHERING', 'INCIDENT', 'RESOURCE_REQUEST', 'ROUTINE'];
export const TASK_STATUSES = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACTIVE', 'CLOSED', 'COMPLETED', 'REJECTED'];
export const CATEGORIES = ['Medical Emergency', 'Infrastructure', 'Food & Water', 'Education', 'Shelter', 'Environmental', 'Other'];
export const SKILLS = ['First Aid', 'Construction', 'Legal Aid', 'Teaching', 'Driving', 'Counselling', 'Tech Support', 'Medical Professional'];
export const INTERESTS = ['Medical Emergency', 'Infrastructure', 'Food & Water', 'Education', 'Shelter', 'Environmental', 'Child Welfare', 'Elder Care', 'Disability Support', 'Animal Welfare'];
export const DOCUMENT_TAGS = ['Survey', 'Field Report', 'Distress Report', 'Information Gathering', 'Incident Record', 'Historical Data', 'Photographic Evidence', 'Medical Report'];

// Current volunteer profile
export const currentVolunteerProfile = {
  uid: 'vol-001',
  role: 'VOLUNTEER',
  displayName: 'Arjun Mehta',
  photoURL: null,
  phone: '+91 98765 43210',
  homeLocation: { lat: 28.6200, lng: 77.2100, address: 'Connaught Place, Delhi' },
  interests: ['Infrastructure', 'Medical Emergency'],
  skills: ['First Aid', 'Construction'],
  availability: ['WEEKDAYS', 'WEEKENDS'],
  lastActiveAt: new Date().toISOString(),
  createdAt: '2026-01-15T10:00:00Z',
};

// Current employee profile
export const currentEmployeeProfile = {
  uid: 'emp-001',
  role: 'NGO_EMPLOYEE',
  displayName: 'Priya Sharma',
  photoURL: null,
  phone: '+91 87654 32100',
  homeLocation: { lat: 28.6139, lng: 77.2090, address: 'Riverside Colony, Delhi' },
  lastActiveAt: new Date().toISOString(),
  createdAt: '2025-11-01T08:00:00Z',
};

// Active tasks (volunteer feed)
export const mockActiveTasks = [
  {
    id: 'task-001',
    status: 'ACTIVE',
    reportType: 'DISTRESS',
    title: 'Flood Damage — Riverside Colony Block B',
    description: 'Severe waterlogging reported in Riverside Colony Block B. Multiple families displaced. Access roads submerged.',
    location: { lat: 28.6139, lng: 77.2090, address: 'Riverside Colony Block B, Delhi', geohash: 'ttnfv2' },
    aiAnalysis: {
      situationSummary: 'Severe flooding detected in residential area. Images show water level at approximately 3 feet in ground-floor residences. Displaced families visible in multiple photographs.',
      category: 'Infrastructure',
      severity: 'CRITICAL',
      urgency: 'IMMEDIATE',
      estimatedAffected: 450,
      keyObservations: [
        'Water level at ~3 feet in ground-floor residences',
        'Road infrastructure compromised — debris near drainage',
        'At least 12 families visibly displaced in images',
        'Medical supplies needed — elderly residents observed',
      ],
      processingStatus: 'DONE'
    },
    managementOverride: null,
    requiredSkills: ['First Aid', 'Construction'],
    maxVolunteers: 20,
    acceptedCount: 8,
    createdAt: '2026-04-24T10:00:00Z',
    matchScore: 0.92,
    distance: 2.3,
    thumbnail: null,
    mediaCount: { images: 6, shortVideos: 2, longVideos: 1, audio: 2 }
  },
  {
    id: 'task-003',
    status: 'ACTIVE',
    reportType: 'INFO_GATHERING',
    title: 'Community Health Survey — Sector 15 Slum Cluster',
    description: 'Baseline health survey of 200+ households. Focus on waterborne disease prevalence, vaccination coverage, and maternal health access.',
    location: { lat: 28.5672, lng: 77.3210, address: 'Sector 15 Slum Cluster, Noida', geohash: 'ttnfx1' },
    aiAnalysis: {
      situationSummary: 'Community health data collection initiative in dense urban settlement. Audio interviews reveal high prevalence of waterborne illness complaints.',
      category: 'Medical Emergency',
      severity: 'HIGH',
      urgency: 'SAME_DAY',
      estimatedAffected: 800,
      keyObservations: [
        'High waterborne illness complaints in audio interviews',
        'Limited access to vaccination centres reported',
        'Maternal health access gaps identified in 3+ sub-clusters',
        'Clean water source distance: average 1.2km'
      ],
      processingStatus: 'DONE'
    },
    managementOverride: { category: 'Medical Emergency', severity: 'HIGH', urgency: 'SAME_DAY' },
    requiredSkills: ['Medical Professional', 'Counselling'],
    maxVolunteers: 15,
    acceptedCount: 11,
    createdAt: '2026-04-23T09:00:00Z',
    matchScore: 0.78,
    distance: 8.5,
    thumbnail: null,
    mediaCount: { images: 8, shortVideos: 0, longVideos: 0, audio: 5 }
  },
  {
    id: 'task-006',
    status: 'ACTIVE',
    reportType: 'DISTRESS',
    title: 'Elderly Care — Abandoned Residents in Block C',
    description: 'Three elderly residents found living without caretaker support. Limited mobility, insufficient food supply, no access to medication.',
    location: { lat: 28.5921, lng: 77.2507, address: 'Block C, Sarita Vihar, Delhi', geohash: 'ttnfv1' },
    aiAnalysis: {
      situationSummary: 'Three elderly individuals (est. ages 70-85) found in isolated living conditions without adequate caretaker support. Visible signs of malnutrition and limited mobility.',
      category: 'Medical Emergency',
      severity: 'HIGH',
      urgency: 'IMMEDIATE',
      estimatedAffected: 3,
      keyObservations: [
        'Three elderly residents aged 70-85 years estimated',
        'Signs of malnutrition visible in photographic evidence',
        'Limited mobility — assistance needed for daily activities',
        'No medication access — chronic condition management at risk',
      ],
      processingStatus: 'DONE'
    },
    managementOverride: null,
    requiredSkills: ['Medical Professional', 'Counselling'],
    maxVolunteers: 5,
    acceptedCount: 4,
    createdAt: '2026-04-24T06:00:00Z',
    matchScore: 0.85,
    distance: 4.1,
    thumbnail: null,
    mediaCount: { images: 5, shortVideos: 1, longVideos: 0, audio: 2 }
  },
  {
    id: 'task-007',
    status: 'ACTIVE',
    reportType: 'RESOURCE_REQUEST',
    title: 'Clean Water Distribution — Ward 8',
    description: 'Ward 8 water supply contaminated due to pipe rupture. 300+ families need clean water distribution urgently.',
    location: { lat: 28.6340, lng: 77.2190, address: 'Ward 8, Central Delhi', geohash: 'ttnfv3' },
    aiAnalysis: {
      situationSummary: 'Water supply contamination in Ward 8 affecting 300+ families. Pipe rupture identified as cause. Municipal repair timeline: 72 hours.',
      category: 'Food & Water',
      severity: 'HIGH',
      urgency: 'IMMEDIATE',
      estimatedAffected: 300,
      keyObservations: [
        'Pipe rupture in main supply line',
        '300+ families without clean water access',
        'Municipal repair ETA: 72 hours',
        'Children and elderly most vulnerable',
      ],
      processingStatus: 'DONE'
    },
    managementOverride: null,
    requiredSkills: ['Driving'],
    maxVolunteers: 12,
    acceptedCount: 5,
    createdAt: '2026-04-25T07:00:00Z',
    matchScore: 0.65,
    distance: 6.8,
    thumbnail: null,
    mediaCount: { images: 3, shortVideos: 0, longVideos: 0, audio: 1 }
  },
  {
    id: 'task-008',
    status: 'ACTIVE',
    reportType: 'ROUTINE',
    title: 'School Supplies Drive — Govt. Girls School',
    description: 'Annual school supplies distribution for 200 students. Need volunteers to organize, sort, and distribute supplies at the school.',
    location: { lat: 28.6100, lng: 77.2300, address: 'Govt. Girls School, Lodi Colony, Delhi', geohash: 'ttnfv0' },
    aiAnalysis: {
      situationSummary: 'Scheduled school supplies distribution event for underserved students. 200 students to be served. Supplies include notebooks, pens, school bags.',
      category: 'Education',
      severity: 'LOW',
      urgency: 'WITHIN_WEEK',
      estimatedAffected: 200,
      keyObservations: [
        '200 students registered for supplies',
        'Event scheduled for weekend',
        'Supplies pre-sorted by grade level',
        'Volunteer headcount needed: 8-12',
      ],
      processingStatus: 'DONE'
    },
    managementOverride: null,
    requiredSkills: ['Teaching'],
    maxVolunteers: 12,
    acceptedCount: 3,
    createdAt: '2026-04-25T09:00:00Z',
    matchScore: 0.42,
    distance: 3.2,
    thumbnail: null,
    mediaCount: { images: 2, shortVideos: 0, longVideos: 0, audio: 0 }
  },
];

// Volunteer applications
export const myApplications = [
  {
    id: 'app-001',
    taskId: 'task-001',
    taskTitle: 'Flood Damage — Riverside Colony Block B',
    taskCategory: 'Infrastructure',
    taskSeverity: 'CRITICAL',
    matchScore: 0.92,
    status: 'ACCEPTED',
    distance: 2.3,
    appliedAt: '2026-04-24T11:00:00Z',
    respondedAt: '2026-04-24T13:00:00Z',
  },
  {
    id: 'app-006',
    taskId: 'task-006',
    taskTitle: 'Elderly Care — Abandoned Residents in Block C',
    taskCategory: 'Medical Emergency',
    taskSeverity: 'HIGH',
    matchScore: 0.85,
    status: 'ACCEPTED',
    distance: 4.1,
    appliedAt: '2026-04-24T08:00:00Z',
    respondedAt: '2026-04-24T10:00:00Z',
  },
  {
    id: 'app-007',
    taskId: 'task-007',
    taskTitle: 'Clean Water Distribution — Ward 8',
    taskCategory: 'Food & Water',
    taskSeverity: 'HIGH',
    matchScore: 0.65,
    status: 'APPLIED',
    distance: 6.8,
    appliedAt: '2026-04-25T08:00:00Z',
    respondedAt: null,
  },
];

// Employee reports
export const myReports = [
  {
    id: 'task-001',
    status: 'ACTIVE',
    reportType: 'DISTRESS',
    title: 'Flood Damage — Riverside Colony Block B',
    location: { address: 'Riverside Colony Block B, Delhi' },
    severity: 'CRITICAL',
    urgency: 'IMMEDIATE',
    createdAt: '2026-04-24T10:00:00Z',
    syncStatus: 'synced',
    mediaCount: { images: 6, audio: 2, shortVideos: 2, longVideos: 1 },
  },
  {
    id: 'task-004',
    status: 'SUBMITTED',
    reportType: 'INCIDENT',
    title: 'School Building Structural Damage — Govt. Primary School',
    location: { address: 'Govt. Primary School, Gurugram' },
    severity: 'HIGH',
    urgency: 'SAME_DAY',
    createdAt: '2026-04-24T11:30:00Z',
    syncStatus: 'synced',
    mediaCount: { images: 10, audio: 1, shortVideos: 3, longVideos: 0 },
  },
  {
    id: 'draft-001',
    status: 'DRAFT',
    reportType: 'ROUTINE',
    title: 'Weekly Patrol — Sector 7',
    location: { address: 'Sector 7, Dwarka, Delhi' },
    severity: 'LOW',
    urgency: 'NON_URGENT',
    createdAt: '2026-04-25T14:00:00Z',
    syncStatus: 'pending',
    mediaCount: { images: 2, audio: 0, shortVideos: 0, longVideos: 0 },
  },
];
