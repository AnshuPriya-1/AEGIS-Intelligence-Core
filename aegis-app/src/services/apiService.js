// src/services/apiService.js
//
// Module 4.1 — Service Layer Swap
//
// Drop-in replacement for mockApiService.js. Every method here returns the
// same shape mockApiService already returned, so no component needs to
// change its rendering logic — only its import.
//
// Behavior:
//   - If VITE_USE_MOCK_API=true (or unset), every call goes straight to the
//     bundled mock JSON — identical to the old mockApiService.
//   - If VITE_USE_MOCK_API=false, calls hit the real backend. If a call
//     fails (network error, backend down, cold start on Render, etc.) it
//     transparently falls back to the mock JSON instead of throwing, so a
//     flaky connection never breaks the live demo.
//
// This file does NOT delete or modify mockApiService.js — it wraps it.

import { mockApiService } from './mockApiService';

// Endpoints Module 3 actually built a real backend for.
// Anything not in this list always serves from mock — that's for you to
// build out in a later module if you want (users, notifications, agents,
// reports, charts, countries/ports/routes are still frontend-only demo data).
const BUILT_ENDPOINTS = new Set([
  'getRiskScore', 'getShap', 'getProcurement', 'getDecisions',
  'getTimeline', 'getMemory', 'getExtendedMemory', 'getSignals',
  'getAlerts', 'getOilPrices', 'getKpis', 'getExecutiveBrief',
]);

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const WS_URL = import.meta.env.VITE_WS_URL || API_BASE.replace(/^http/, 'ws') + '/api/ws/live';
const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';

async function fetchJson(path, options = {}, timeoutMs = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, signal: controller.signal });
    if (!res.ok) {
      let detail = `${path} responded ${res.status}`;
      try {
        const body = await res.json();
        if (body?.detail) detail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail);
      } catch {
        // response wasn't JSON — keep the generic message
      }
      const err = new Error(detail);
      err.status = res.status;
      throw err;
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// Wraps a real-backend call with a mock fallback, honoring the global toggle.
function withFallback(name, realFn, mockFn) {
  return async (...args) => {
    if (USE_MOCK || !BUILT_ENDPOINTS.has(name)) {
      return mockFn(...args);
    }
    try {
      return await realFn(...args);
    } catch (err) {
      console.warn(`[apiService] ${name} failed live, falling back to mock:`, err.message);
      return mockFn(...args);
    }
  };
}

// Mock-only extras (real endpoints exist, but there was no mock method for
// these in the original mockApiService — pull straight from the JSON files
// so the fallback still works).
import shapData from '../data/shap.json';
import decisionsData from '../data/decisions.json';
import extendedMemoryData from '../data/extended_memory.json';

export const apiService = {
  // ---- pass-through, unchanged from mockApiService ----
  getEvents: mockApiService.getEvents,
  getPorts: mockApiService.getPorts,
  getRoutes: mockApiService.getRoutes,
  getCountries: mockApiService.getCountries,
  getAgents: mockApiService.getAgents,
  getCharts: mockApiService.getCharts,
  getReports: mockApiService.getReports,
  getCurrentUser: mockApiService.getCurrentUser,
  getNotifications: mockApiService.getNotifications,

  // ---- real-backed, with mock fallback ----
  getRiskScore: withFallback('getRiskScore',
    () => fetchJson('/api/risk'),
    mockApiService.getRiskScore),

  getShap: withFallback('getShap',
    () => fetchJson('/api/shap'),
    () => Promise.resolve(shapData)),

  getProcurement: withFallback('getProcurement',
    () => fetchJson('/api/procurement'),
    mockApiService.getProcurement),

  getDecisions: withFallback('getDecisions',
    () => fetchJson('/api/decisions'),
    () => Promise.resolve(decisionsData)),

  getTimeline: withFallback('getTimeline',
    () => fetchJson('/api/timeline'),
    mockApiService.getTimeline),

  getMemory: withFallback('getMemory',
    () => fetchJson('/api/memory'),
    mockApiService.getMemory),

  getExtendedMemory: withFallback('getExtendedMemory',
    () => fetchJson('/api/extended_memory'),
    () => Promise.resolve(extendedMemoryData)),

  getSignals: withFallback('getSignals',
    () => fetchJson('/api/signals'),
    mockApiService.getSignals),

  getAlerts: withFallback('getAlerts',
    () => fetchJson('/api/alerts'),
    mockApiService.getAlerts),

  getOilPrices: withFallback('getOilPrices',
    () => fetchJson('/api/oil-prices'),
    mockApiService.getOilPrices),

  getKpis: withFallback('getKpis',
    () => fetchJson('/api/kpis'),
    mockApiService.getKpis),

  getExecutiveBrief: withFallback('getExecutiveBrief',
    () => fetchJson('/api/executive-brief'),
    () => Promise.resolve({ brief: 'Executive Brief generation requires a live backend connection.' })),

  // ---- Scenario Engine (Module 3.3) ----
  runSimulation: (input) =>
    fetchJson('/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }),

  // ---- Live WebSocket channel (Module 3.7 / 4.2) ----
  // Returns the raw WebSocket so callers can .close() it; onMessage receives
  // the parsed JSON payload for every broadcast (risk_update or simulation).
  connectLiveSocket(onMessage, onError) {
    if (USE_MOCK) return null; // no live socket in pure demo/mock mode
    const socket = new WebSocket(WS_URL);
    socket.onmessage = (evt) => {
      try {
        onMessage(JSON.parse(evt.data));
      } catch (e) {
        console.warn('[apiService] malformed WS message', e);
      }
    };
    socket.onerror = (evt) => onError?.(evt);
    return socket;
  },

  isLiveModeAvailable: !USE_MOCK,

  // ---- Auth (real backend only — there's nothing to "mock" about an account) ----
  async signup({ name, email, password, role, department }) {
    const data = await fetchJson('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, department }),
    });
    localStorage.setItem('aegis_token', data.access_token);
    localStorage.setItem('aegis_user', JSON.stringify(data.user));
    return data;
  },

  async login({ email, password }) {
    const data = await fetchJson('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('aegis_token', data.access_token);
    localStorage.setItem('aegis_user', JSON.stringify(data.user));
    return data;
  },

  async fetchMe() {
    const token = localStorage.getItem('aegis_token');
    if (!token) throw new Error('Not authenticated');
    return fetchJson('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  logout() {
    localStorage.removeItem('aegis_token');
    localStorage.removeItem('aegis_user');
  },

  getStoredUser() {
    const raw = localStorage.getItem('aegis_user');
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('aegis_token');
  },
};
