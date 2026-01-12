/**
 * Mock Mapbox GL
 */

export default {
  Map: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    off: jest.fn(),
    remove: jest.fn(),
    getSource: jest.fn(),
    addSource: jest.fn(),
    addLayer: jest.fn(),
    removeLayer: jest.fn(),
    removeSource: jest.fn(),
    fitBounds: jest.fn(),
    setCenter: jest.fn(),
    setZoom: jest.fn(),
    getCenter: jest.fn().mockReturnValue({ lng: -1.0232, lat: 7.9465 }),
    getZoom: jest.fn().mockReturnValue(6),
  })),
  Marker: jest.fn().mockImplementation(() => ({
    setLngLat: jest.fn().mockReturnThis(),
    addTo: jest.fn().mockReturnThis(),
    remove: jest.fn(),
    setPopup: jest.fn().mockReturnThis(),
  })),
  Popup: jest.fn().mockImplementation(() => ({
    setHTML: jest.fn().mockReturnThis(),
    setLngLat: jest.fn().mockReturnThis(),
    addTo: jest.fn().mockReturnThis(),
  })),
  LngLatBounds: jest.fn().mockImplementation(() => ({
    extend: jest.fn().mockReturnThis(),
    getNorth: jest.fn().mockReturnValue(11.0),
    getSouth: jest.fn().mockReturnValue(4.0),
    getEast: jest.fn().mockReturnValue(1.0),
    getWest: jest.fn().mockReturnValue(-3.0),
  })),
  accessToken: 'test-token',
};

