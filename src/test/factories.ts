/**
 * Test Data Factories
 * Generate realistic test data for tests
 */

import { UserRole, IncidentSeverity, IncidentStatus, AgencyType } from '@prisma/client';

// Use a simple mock for faker to avoid ES module issues in tests
const faker = {
  string: {
    uuid: () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    numeric: (length: number) => Math.floor(Math.random() * Math.pow(10, length)).toString(),
  },
  internet: {
    email: () => `test${Math.random().toString(36).substring(2, 11)}@example.com`,
  },
  person: {
    fullName: () => `Test User ${Math.random().toString(36).substring(2, 7)}`,
  },
  location: {
    streetAddress: () => `${Math.floor(Math.random() * 9999)} Test Street`,
    city: () => `Test City ${Math.random().toString(36).substring(2, 5)}`,
  },
  number: {
    float: (options: { min: number; max: number; precision: number }) => {
      const value = Math.random() * (options.max - options.min) + options.min;
      return Math.round(value / options.precision) * options.precision;
    },
    int: (options: { min: number; max: number }) => {
      return Math.floor(Math.random() * (options.max - options.min + 1)) + options.min;
    },
  },
  helpers: {
    arrayElement: <T>(array: T[]): T => {
      return array[Math.floor(Math.random() * array.length)]!;
    },
  },
  company: {
    name: () => `Test Company ${Math.random().toString(36).substring(2, 7)}`,
  },
  lorem: {
    sentence: () => 'This is a test sentence.',
    paragraph: () => 'This is a test paragraph with multiple sentences. It contains some test content.',
  },
};

/**
 * Create a mock user
 */
export function createMockUser(overrides?: Partial<any>) {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    phone: `+233${faker.string.numeric(9)}`,
    role: UserRole.CITIZEN,
    agencyId: null,
    isActive: true,
    emailVerified: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock incident
 */
export function createMockIncident(overrides?: Partial<any>) {
  // Ghana coordinates bounds
  const minLat = 4.0;
  const maxLat = 11.0;
  const minLng = -3.0;
  const maxLng = 1.0;

  return {
    id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    category: faker.helpers.arrayElement([
      'Fire',
      'Medical Emergency',
      'Accident',
      'Natural Disaster',
      'Crime',
      'Infrastructure Failure',
      'Other',
    ]),
    severity: IncidentSeverity.MEDIUM,
    status: IncidentStatus.REPORTED,
    latitude: faker.number.float({ min: minLat, max: maxLat, precision: 0.0001 }),
    longitude: faker.number.float({ min: minLng, max: maxLng, precision: 0.0001 }),
    location: faker.location.streetAddress(),
    region: faker.helpers.arrayElement([
      'Greater Accra',
      'Ashanti',
      'Western',
      'Eastern',
      'Central',
      'Volta',
      'Northern',
    ]),
    district: faker.location.city(),
    reportedById: faker.string.uuid(),
    assignedAgencyId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock agency
 */
export function createMockAgency(overrides?: Partial<any>) {
  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    type: AgencyType.POLICE,
    contactPhone: `+233${faker.string.numeric(9)}`,
    contactEmail: faker.internet.email(),
    address: faker.location.streetAddress(),
    region: faker.helpers.arrayElement([
      'Greater Accra',
      'Ashanti',
      'Western',
      'Eastern',
      'Central',
      'Volta',
      'Northern',
    ]),
    district: faker.location.city(),
    latitude: faker.number.float({ min: 4.0, max: 11.0, precision: 0.0001 }),
    longitude: faker.number.float({ min: -3.0, max: 1.0, precision: 0.0001 }),
    coverageRadius: faker.number.int({ min: 5, max: 50 }),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock dispatch assignment
 */
export function createMockDispatch(overrides?: Partial<any>) {
  return {
    id: faker.string.uuid(),
    incidentId: faker.string.uuid(),
    agencyId: faker.string.uuid(),
    responderId: faker.string.uuid(),
    status: 'dispatched',
    priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']),
    dispatchedAt: new Date(),
    acceptedAt: null,
    completedAt: null,
    estimatedArrival: null,
    notes: faker.lorem.sentence(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock notification
 */
export function createMockNotification(overrides?: Partial<any>) {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    title: faker.lorem.sentence(),
    message: faker.lorem.paragraph(),
    type: faker.helpers.arrayElement([
      'INCIDENT_CREATED',
      'INCIDENT_ASSIGNED',
      'DISPATCH_ASSIGNMENT',
      'STATUS_UPDATE',
      'MESSAGE_RECEIVED',
    ]),
    isRead: false,
    relatedEntityType: 'Incident',
    relatedEntityId: faker.string.uuid(),
    sentViaSms: false,
    createdAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock message
 */
export function createMockMessage(overrides?: Partial<any>) {
  return {
    id: faker.string.uuid(),
    incidentId: faker.string.uuid(),
    senderId: faker.string.uuid(),
    content: faker.lorem.paragraph(),
    mediaUrls: [],
    isUrgent: false,
    isSystemMessage: false,
    createdAt: new Date(),
    ...overrides,
  };
}

