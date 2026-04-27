/**
 * useFirestoreData — real-time Firestore data hooks.
 * Replaces mock data imports with live Firestore onSnapshot listeners.
 */
import { useState, useEffect } from 'react';
import {
  db, collection, doc, query, where, orderBy, limit,
  onSnapshot, getDocs, getDoc
} from '../firebase';

/**
 * Real-time listener for a Firestore collection with optional filters.
 */
export function useCollection(collectionPath, filters = [], sortField = 'createdAt', sortDir = 'desc', maxLimit = 50) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let q = collection(db, collectionPath);
    let constraints = [];

    filters.forEach(([field, op, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        constraints.push(where(field, op, value));
      }
    });

    if (sortField) constraints.push(orderBy(sortField, sortDir));
    if (maxLimit) constraints.push(limit(maxLimit));

    const queryRef = query(q, ...constraints);

    const unsub = onSnapshot(queryRef, (snapshot) => {
      const results = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setData(results);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    return () => unsub();
  }, [collectionPath, JSON.stringify(filters), sortField, sortDir, maxLimit]);

  return { data, loading, error };
}

/**
 * Real-time listener for a single Firestore document.
 */
export function useDocument(collectionPath, docId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!docId) { setLoading(false); return; }

    const docRef = doc(db, collectionPath, docId);
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setData({ id: snap.id, ...snap.data() });
      } else {
        setData(null);
      }
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    return () => unsub();
  }, [collectionPath, docId]);

  return { data, loading, error };
}

/**
 * Hook for task queue (management) — real-time listener on SUBMITTED + UNDER_REVIEW tasks.
 */
export function useTaskQueue() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'tasks'),
      where('status', 'in', ['SUBMITTED', 'UNDER_REVIEW']),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { tasks, loading };
}

/**
 * Hook for all tasks (management dashboard).
 */
export function useAllTasks(statusFilter = null) {
  const filters = statusFilter ? [['status', '==', statusFilter]] : [];
  return useCollection('tasks', filters);
}

/**
 * Hook for volunteer applications on a specific task.
 */
export function useTaskApplications(taskId) {
  const filters = taskId ? [['taskId', '==', taskId]] : [];
  return useCollection('applications', filters, 'matchScore', 'desc');
}

/**
 * Hook for a volunteer's own applications.
 */
export function useMyApplications(volunteerId) {
  const filters = volunteerId ? [['volunteerId', '==', volunteerId]] : [];
  return useCollection('applications', filters, 'appliedAt', 'desc');
}

/**
 * Hook for employee's own reports.
 */
export function useMyReports(employeeId) {
  const filters = employeeId ? [['employeeId', '==', employeeId]] : [];
  return useCollection('tasks', filters);
}

/**
 * Hook for dashboard stats.
 */
export function useDashboardStats() {
  const [stats, setStats] = useState({ activeTasks: 0, pendingReview: 0, completedTasks: 0, activeVolunteers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to tasks collection for real-time stats
    const unsub = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      let active = 0, pending = 0, completed = 0;
      snapshot.docs.forEach((d) => {
        const s = d.data().status;
        if (s === 'ACTIVE') active++;
        if (['SUBMITTED', 'UNDER_REVIEW'].includes(s)) pending++;
        if (s === 'COMPLETED') completed++;
      });
      setStats((prev) => ({ ...prev, activeTasks: active, pendingReview: pending, completedTasks: completed }));
      setLoading(false);
    });

    // Get volunteer count
    const volQuery = query(collection(db, 'users'), where('role', '==', 'VOLUNTEER'));
    getDocs(volQuery).then((snap) => {
      setStats((prev) => ({ ...prev, activeVolunteers: snap.size }));
    });

    return () => unsub();
  }, []);

  return { stats, loading };
}

/**
 * Hook for task media subcollection — real-time listener.
 * Queries tasks/{taskId}/media for all uploaded media items.
 */
export function useTaskMedia(taskId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!taskId) { setLoading(false); return; }

    const mediaRef = collection(db, 'tasks', taskId, 'media');
    const q = query(mediaRef, orderBy('uploadedAt', 'asc'));

    const unsub = onSnapshot(q, (snapshot) => {
      setData(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => {
      // If subcollection doesn't exist yet, just return empty
      setData([]);
      setLoading(false);
    });

    return () => unsub();
  }, [taskId]);

  return { data, loading };
}
