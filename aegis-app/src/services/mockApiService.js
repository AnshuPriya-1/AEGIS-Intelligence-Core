import kpisData from '../data/kpis.json';
import alertsData from '../data/alerts.json';
import eventsData from '../data/events.json';
import portsData from '../data/ports.json';
import routesData from '../data/routes.json';
import countriesData from '../data/countries.json';
import riskData from '../data/risk.json';
import signalsData from '../data/signals.json';
import timelineData from '../data/timeline.json';
import memoryData from '../data/memory.json';
import procurementData from '../data/procurement.json';
import oilPricesData from '../data/oil_prices.json';
import agentsData from '../data/agents.json';
import chartsData from '../data/charts.json';
import reportsData from '../data/reports.json';
import usersData from '../data/users.json';
import notificationsData from '../data/notifications.json';

export const mockApiService = {
  getKpis: () => Promise.resolve(kpisData),
  getAlerts: () => Promise.resolve(alertsData),
  getEvents: () => Promise.resolve(eventsData),
  getPorts: () => Promise.resolve(portsData),
  getRoutes: () => Promise.resolve(routesData),
  getCountries: () => Promise.resolve(countriesData),
  getRiskScore: () => Promise.resolve(riskData),
  getSignals: () => Promise.resolve(signalsData),
  getTimeline: () => Promise.resolve(timelineData),
  getMemory: () => Promise.resolve(memoryData),
  getProcurement: () => Promise.resolve(procurementData),
  getOilPrices: () => Promise.resolve(oilPricesData),
  getAgents: () => Promise.resolve(agentsData),
  getCharts: () => Promise.resolve(chartsData),
  getReports: () => Promise.resolve(reportsData),
  getCurrentUser: () => Promise.resolve(usersData.currentUser),
  getNotifications: () => Promise.resolve(notificationsData),
};
