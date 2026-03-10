import { PrismaClient, BusType, TrafficSeverity } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.communityReport.deleteMany();
  await prisma.liveBusLocation.deleteMany();
  await prisma.bus.deleteMany();
  await prisma.busStop.deleteMany();
  await prisma.busRoute.deleteMany();
  await prisma.trafficZone.deleteMany();

  // Create Traffic Zones (Known congestion areas in Guwahati)
  const trafficZones = await Promise.all([
    prisma.trafficZone.create({
      data: {
        name: 'Maligaon Flyover Construction Zone',
        description: 'Major construction causing frequent delays on NH-31',
        latitude: 26.1500,
        longitude: 91.6900,
        radiusMeters: 800,
        severity: TrafficSeverity.SEVERE,
        isActive: true,
      },
    }),
    prisma.trafficZone.create({
      data: {
        name: 'Paltan Bazaar Junction',
        description: 'Heavy traffic during peak hours near Railway Station',
        latitude: 26.1815,
        longitude: 91.7500,
        radiusMeters: 500,
        severity: TrafficSeverity.HIGH,
        isActive: true,
      },
    }),
    prisma.trafficZone.create({
      data: {
        name: 'GS Road - Ganeshguri',
        description: 'Commercial area with high traffic density',
        latitude: 26.1700,
        longitude: 91.7800,
        radiusMeters: 600,
        severity: TrafficSeverity.MODERATE,
        isActive: true,
      },
    }),
    prisma.trafficZone.create({
      data: {
        name: 'Fancy Bazaar Bridge',
        description: 'Bridge traffic bottleneck near wholesale market',
        latitude: 26.1850,
        longitude: 91.7400,
        radiusMeters: 400,
        severity: TrafficSeverity.MODERATE,
        isActive: true,
      },
    }),
    prisma.trafficZone.create({
      data: {
        name: 'Khanapara Junction',
        description: 'Major intersection connecting to Nagaon highway',
        latitude: 26.1400,
        longitude: 91.8000,
        radiusMeters: 500,
        severity: TrafficSeverity.HIGH,
        isActive: true,
      },
    }),
    prisma.trafficZone.create({
      data: {
        name: 'Jalukbari T-Junction',
        description: 'University area junction with heavy student traffic',
        latitude: 26.1600,
        longitude: 91.7000,
        radiusMeters: 450,
        severity: TrafficSeverity.MODERATE,
        isActive: true,
      },
    }),
    prisma.trafficZone.create({
      data: {
        name: 'Six Mile Crossing',
        description: 'Commercial hub with frequent congestion',
        latitude: 26.1550,
        longitude: 91.7900,
        radiusMeters: 400,
        severity: TrafficSeverity.MODERATE,
        isActive: true,
      },
    }),
    prisma.trafficZone.create({
      data: {
        name: 'Bharalumukh Junction',
        description: 'River bridge approach with narrow lanes',
        latitude: 26.1780,
        longitude: 91.7350,
        radiusMeters: 350,
        severity: TrafficSeverity.HIGH,
        isActive: true,
      },
    }),
    prisma.trafficZone.create({
      data: {
        name: 'Uzan Bazaar Area',
        description: 'Old city area with narrow roads',
        latitude: 26.1820,
        longitude: 91.7480,
        radiusMeters: 300,
        severity: TrafficSeverity.LOW,
        isActive: true,
      },
    }),
  ]);

  // Comprehensive ASTC Bus Routes in Guwahati
  const routes = [
    // Route 1: Adabari to Paltan Bazaar (Main City Route)
    {
      routeNumber: '1',
      routeName: 'Adabari - Paltan Bazaar',
      startPoint: 'Adabari Bus Stand',
      endPoint: 'Paltan Bazaar',
      distance: 12.5,
      baseFare: 15,
      stops: [
        { name: 'Adabari Bus Stand', landmark: 'Adabari Market', latitude: 26.1350, longitude: 91.6800, isMajor: true },
        { name: 'Adabari Chariali', landmark: 'Traffic Point', latitude: 26.1380, longitude: 91.6820, isMajor: false },
        { name: 'Maligaon', landmark: 'Maligaon Chariali', latitude: 26.1480, longitude: 91.6870, isMajor: false },
        { name: 'Maligaon Flyover', landmark: 'Construction Zone', latitude: 26.1520, longitude: 91.6920, isMajor: false },
        { name: 'Jalukbari', landmark: 'Gauhati University Gate', latitude: 26.1600, longitude: 91.7000, isMajor: true },
        { name: 'Dharapur', landmark: 'Dharapur Chariali', latitude: 26.1680, longitude: 91.7150, isMajor: false },
        { name: 'Kahilipara', landmark: 'Kahilipara Road', latitude: 26.1720, longitude: 91.7250, isMajor: false },
        { name: 'Panbazar', landmark: 'Near DC Office', latitude: 26.1750, longitude: 91.7300, isMajor: false },
        { name: 'Fancy Bazaar', landmark: 'Wholesale Market', latitude: 26.1850, longitude: 91.7400, isMajor: true },
        { name: 'Paltan Bazaar', landmark: 'Railway Station', latitude: 26.1815, longitude: 91.7500, isMajor: true },
      ],
    },
    // Route 2: Paltan Bazaar to Khanapara
    {
      routeNumber: '2',
      routeName: 'Paltan Bazaar - Khanapara',
      startPoint: 'Paltan Bazaar',
      endPoint: 'Khanapara',
      distance: 10.0,
      baseFare: 12,
      stops: [
        { name: 'Paltan Bazaar', landmark: 'Railway Station', latitude: 26.1815, longitude: 91.7500, isMajor: true },
        { name: 'Latasil', landmark: 'Latasil Playground', latitude: 26.1780, longitude: 91.7550, isMajor: false },
        { name: 'Ulubari', landmark: 'Ulubari Chariali', latitude: 26.1750, longitude: 91.7620, isMajor: false },
        { name: 'Ganeshguri', landmark: 'Ganesh Mandir', latitude: 26.1700, longitude: 91.7800, isMajor: true },
        { name: 'Six Mile', landmark: 'Commercial Hub', latitude: 26.1550, longitude: 91.7900, isMajor: true },
        { name: 'Basistha Chariali', landmark: 'Basistha Temple Road', latitude: 26.1470, longitude: 91.7950, isMajor: false },
        { name: 'Khanapara', landmark: 'Veterinary College', latitude: 26.1400, longitude: 91.8000, isMajor: true },
      ],
    },
    // Route 3: Adabari to Six Mile (via GS Road)
    {
      routeNumber: '3',
      routeName: 'Adabari - Six Mile (GS Road)',
      startPoint: 'Adabari Bus Stand',
      endPoint: 'Six Mile',
      distance: 15.0,
      baseFare: 18,
      stops: [
        { name: 'Adabari Bus Stand', landmark: 'Adabari Market', latitude: 26.1350, longitude: 91.6800, isMajor: true },
        { name: 'Maligaon', landmark: 'Maligaon Chariali', latitude: 26.1500, longitude: 91.6900, isMajor: false },
        { name: 'Jalukbari', landmark: 'Gauhati University', latitude: 26.1600, longitude: 91.7000, isMajor: true },
        { name: 'Dharapur', landmark: 'Dharapur Chariali', latitude: 26.1680, longitude: 91.7150, isMajor: false },
        { name: 'Kahilipara', landmark: 'Kahilipara Road', latitude: 26.1720, longitude: 91.7250, isMajor: false },
        { name: 'Panbazar', landmark: 'DC Office', latitude: 26.1750, longitude: 91.7300, isMajor: false },
        { name: 'Paltan Bazaar', landmark: 'Railway Station', latitude: 26.1815, longitude: 91.7500, isMajor: true },
        { name: 'Latasil', landmark: 'Latasil Playground', latitude: 26.1780, longitude: 91.7550, isMajor: false },
        { name: 'Ganeshguri', landmark: 'Ganesh Mandir', latitude: 26.1700, longitude: 91.7800, isMajor: true },
        { name: 'Christian Basti', landmark: 'St. Mary\'s Church', latitude: 26.1620, longitude: 91.7850, isMajor: false },
        { name: 'Six Mile', landmark: 'Commercial Hub', latitude: 26.1550, longitude: 91.7900, isMajor: true },
      ],
    },
    // Route 4: Fancy Bazaar to Basistha
    {
      routeNumber: '4',
      routeName: 'Fancy Bazaar - Basistha',
      startPoint: 'Fancy Bazaar',
      endPoint: 'Basistha Temple',
      distance: 8.5,
      baseFare: 12,
      stops: [
        { name: 'Fancy Bazaar', landmark: 'Wholesale Market', latitude: 26.1850, longitude: 91.7400, isMajor: true },
        { name: 'Ulubari', landmark: 'Ulubari Chariali', latitude: 26.1750, longitude: 91.7550, isMajor: false },
        { name: 'Dispur', landmark: 'Secretariat', latitude: 26.1600, longitude: 91.7700, isMajor: true },
        { name: 'Ganeshguri', landmark: 'Ganesh Mandir', latitude: 26.1700, longitude: 91.7800, isMajor: true },
        { name: 'Six Mile', landmark: 'Commercial Hub', latitude: 26.1550, longitude: 91.7900, isMajor: true },
        { name: 'Basistha Chariali', landmark: 'Temple Road', latitude: 26.1470, longitude: 91.7950, isMajor: false },
        { name: 'Basistha Temple', landmark: 'Shiva Temple', latitude: 26.1300, longitude: 91.8100, isMajor: true },
      ],
    },
    // Route 5: Paltan Bazaar to Airport
    {
      routeNumber: '5',
      routeName: 'Paltan Bazaar - Airport',
      startPoint: 'Paltan Bazaar',
      endPoint: 'LGBI Airport',
      distance: 22.0,
      baseFare: 25,
      stops: [
        { name: 'Paltan Bazaar', landmark: 'Railway Station', latitude: 26.1815, longitude: 91.7500, isMajor: true },
        { name: 'Fancy Bazaar', landmark: 'Wholesale Market', latitude: 26.1850, longitude: 91.7400, isMajor: true },
        { name: 'Bharalumukh', landmark: 'Bridge Approach', latitude: 26.1780, longitude: 91.7350, isMajor: false },
        { name: 'Maligaon', landmark: 'Maligaon Chariali', latitude: 26.1500, longitude: 91.6900, isMajor: false },
        { name: 'Jalukbari', landmark: 'Gauhati University', latitude: 26.1600, longitude: 91.7000, isMajor: true },
        { name: 'Garchuk', landmark: 'ISBT', latitude: 26.1300, longitude: 91.6600, isMajor: true },
        { name: 'Nh 37 Junction', landmark: 'Highway Entry', latitude: 26.1200, longitude: 91.6300, isMajor: false },
        { name: 'Borjhar', landmark: 'Airport Road', latitude: 26.1100, longitude: 91.6100, isMajor: false },
        { name: 'LGBI Airport', landmark: 'Terminal', latitude: 26.1061, longitude: 91.5855, isMajor: true },
      ],
    },
    // Route 6: Khanapara to IIT Guwahati
    {
      routeNumber: '6',
      routeName: 'Khanapara - IIT Guwahati',
      startPoint: 'Khanapara',
      endPoint: 'IIT Guwahati',
      distance: 18.0,
      baseFare: 20,
      stops: [
        { name: 'Khanapara', landmark: 'Veterinary College', latitude: 26.1400, longitude: 91.8000, isMajor: true },
        { name: 'Basistha Chariali', landmark: 'Temple Road', latitude: 26.1470, longitude: 91.7950, isMajor: false },
        { name: 'Six Mile', landmark: 'Commercial Hub', latitude: 26.1550, longitude: 91.7900, isMajor: true },
        { name: 'Ganeshguri', landmark: 'Ganesh Mandir', latitude: 26.1700, longitude: 91.7800, isMajor: true },
        { name: 'Ulubari', landmark: 'Ulubari Chariali', latitude: 26.1750, longitude: 91.7620, isMajor: false },
        { name: 'Paltan Bazaar', landmark: 'Railway Station', latitude: 26.1815, longitude: 91.7500, isMajor: true },
        { name: 'Jalukbari', landmark: 'Gauhati University', latitude: 26.1600, longitude: 91.7000, isMajor: true },
        { name: 'Sualkuchi Turn', landmark: 'Silk Village Road', latitude: 26.1500, longitude: 91.6700, isMajor: false },
        { name: 'IIT Gate', landmark: 'Institute Main Gate', latitude: 26.1900, longitude: 91.6900, isMajor: true },
      ],
    },
    // Route 7: Paltan Bazaar to Amingaon (North Guwahati)
    {
      routeNumber: '7',
      routeName: 'Paltan Bazaar - Amingaon',
      startPoint: 'Paltan Bazaar',
      endPoint: 'Amingaon',
      distance: 16.0,
      baseFare: 18,
      stops: [
        { name: 'Paltan Bazaar', landmark: 'Railway Station', latitude: 26.1815, longitude: 91.7500, isMajor: true },
        { name: 'Fancy Bazaar', landmark: 'Wholesale Market', latitude: 26.1850, longitude: 91.7400, isMajor: true },
        { name: 'Bharalumukh', landmark: 'Bridge', latitude: 26.1780, longitude: 91.7350, isMajor: false },
        { name: 'Pandu', landmark: 'Pandu Port', latitude: 26.1700, longitude: 91.7100, isMajor: false },
        { name: 'Kamakhya Gate', landmark: 'Temple Road', latitude: 26.1650, longitude: 91.7050, isMajor: true },
        { name: 'Maligaon', landmark: 'Maligaon Chariali', latitude: 26.1500, longitude: 91.6900, isMajor: false },
        { name: 'Jalukbari', landmark: 'Gauhati University', latitude: 26.1600, longitude: 91.7000, isMajor: true },
        { name: 'North Guwahati Ghat', landmark: 'Ferry Point', latitude: 26.1750, longitude: 91.7200, isMajor: false },
        { name: 'Amingaon', landmark: 'North Guwahati', latitude: 26.2000, longitude: 91.6800, isMajor: true },
      ],
    },
    // Route 8: ISBT to Paltan Bazaar
    {
      routeNumber: '8',
      routeName: 'ISBT - Paltan Bazaar',
      startPoint: 'ISBT Guwahati',
      endPoint: 'Paltan Bazaar',
      distance: 14.0,
      baseFare: 15,
      stops: [
        { name: 'ISBT Guwahati', landmark: 'Interstate Bus Terminal', latitude: 26.1300, longitude: 91.6600, isMajor: true },
        { name: 'Garchuk', landmark: 'Garchuk Chariali', latitude: 26.1350, longitude: 91.6700, isMajor: false },
        { name: 'Jalukbari', landmark: 'Gauhati University', latitude: 26.1600, longitude: 91.7000, isMajor: true },
        { name: 'Maligaon', landmark: 'Maligaon Chariali', latitude: 26.1500, longitude: 91.6900, isMajor: false },
        { name: 'Kahilipara', landmark: 'Kahilipara Road', latitude: 26.1720, longitude: 91.7250, isMajor: false },
        { name: 'Panbazar', landmark: 'DC Office', latitude: 26.1750, longitude: 91.7300, isMajor: false },
        { name: 'Fancy Bazaar', landmark: 'Wholesale Market', latitude: 26.1850, longitude: 91.7400, isMajor: true },
        { name: 'Paltan Bazaar', landmark: 'Railway Station', latitude: 26.1815, longitude: 91.7500, isMajor: true },
      ],
    },
    // Route 9: Ganeshguri to Narengi
    {
      routeNumber: '9',
      routeName: 'Ganeshguri - Narengi',
      startPoint: 'Ganeshguri',
      endPoint: 'Narengi',
      distance: 9.0,
      baseFare: 12,
      stops: [
        { name: 'Ganeshguri', landmark: 'Ganesh Mandir', latitude: 26.1700, longitude: 91.7800, isMajor: true },
        { name: 'Christian Basti', landmark: 'Church Area', latitude: 26.1620, longitude: 91.7850, isMajor: false },
        { name: 'Six Mile', landmark: 'Commercial Hub', latitude: 26.1550, longitude: 91.7900, isMajor: true },
        { name: 'Geetanagar', landmark: 'Residential Area', latitude: 26.1450, longitude: 91.8050, isMajor: false },
        { name: 'Dispur Survey', landmark: 'Govt Colony', latitude: 26.1400, longitude: 91.8150, isMajor: false },
        { name: 'Narengi Tinali', landmark: 'Junction', latitude: 26.1350, longitude: 91.8250, isMajor: true },
        { name: 'Narengi', landmark: 'Narengi Market', latitude: 26.1300, longitude: 91.8300, isMajor: true },
      ],
    },
    // Route 10: Paltan Bazaar to Hengrabari
    {
      routeNumber: '10',
      routeName: 'Paltan Bazaar - Hengrabari',
      startPoint: 'Paltan Bazaar',
      endPoint: 'Hengrabari',
      distance: 7.0,
      baseFare: 10,
      stops: [
        { name: 'Paltan Bazaar', landmark: 'Railway Station', latitude: 26.1815, longitude: 91.7500, isMajor: true },
        { name: 'Latasil', landmark: 'Latasil Playground', latitude: 26.1780, longitude: 91.7550, isMajor: false },
        { name: 'Ulubari', landmark: 'Ulubari Chariali', latitude: 26.1750, longitude: 91.7620, isMajor: false },
        { name: 'Ganeshguri', landmark: 'Ganesh Mandir', latitude: 26.1700, longitude: 91.7800, isMajor: true },
        { name: 'Six Mile', landmark: 'Commercial Hub', latitude: 26.1550, longitude: 91.7900, isMajor: true },
        { name: 'Sijubari', landmark: 'Residential Area', latitude: 26.1480, longitude: 91.7850, isMajor: false },
        { name: 'Hengrabari', landmark: 'Hengrabari Chariali', latitude: 26.1400, longitude: 91.7750, isMajor: true },
      ],
    },
    // Route 11: Paltan Bazaar to Noonmati
    {
      routeNumber: '11',
      routeName: 'Paltan Bazaar - Noonmati',
      startPoint: 'Paltan Bazaar',
      endPoint: 'Noonmati',
      distance: 12.0,
      baseFare: 14,
      stops: [
        { name: 'Paltan Bazaar', landmark: 'Railway Station', latitude: 26.1815, longitude: 91.7500, isMajor: true },
        { name: 'Uzan Bazaar', landmark: 'Near Brahmaputra', latitude: 26.1800, longitude: 91.7450, isMajor: false },
        { name: 'Panbazar', landmark: 'DC Office', latitude: 26.1750, longitude: 91.7300, isMajor: false },
        { name: 'Chandmari', landmark: 'Chandmari Junction', latitude: 26.1650, longitude: 91.7550, isMajor: true },
        { name: 'Zoo Road', landmark: 'Assam State Zoo', latitude: 26.1550, longitude: 91.7600, isMajor: false },
        { name: 'Kahilipara', landmark: 'Kahilipara Road', latitude: 26.1450, longitude: 91.7550, isMajor: false },
        { name: 'Noonmati', landmark: 'Noonmati Refinery', latitude: 26.1350, longitude: 91.7450, isMajor: true },
      ],
    },
    // Route 12: Paltan Bazaar to Kamakhya Temple
    {
      routeNumber: '12',
      routeName: 'Paltan Bazaar - Kamakhya Temple',
      startPoint: 'Paltan Bazaar',
      endPoint: 'Kamakhya Temple',
      distance: 10.0,
      baseFare: 12,
      stops: [
        { name: 'Paltan Bazaar', landmark: 'Railway Station', latitude: 26.1815, longitude: 91.7500, isMajor: true },
        { name: 'Fancy Bazaar', landmark: 'Wholesale Market', latitude: 26.1850, longitude: 91.7400, isMajor: true },
        { name: 'Bharalumukh', landmark: 'Bridge', latitude: 26.1780, longitude: 91.7350, isMajor: false },
        { name: 'Pandu', landmark: 'Pandu Port', latitude: 26.1700, longitude: 91.7100, isMajor: false },
        { name: 'Kamakhya Gate', landmark: 'Temple Entry', latitude: 26.1650, longitude: 91.7050, isMajor: true },
        { name: 'Kamakhya Temple', landmark: 'Temple Complex', latitude: 26.1550, longitude: 91.7000, isMajor: true },
      ],
    },
    // Route 13: Adabari to Guwahati University
    {
      routeNumber: '13',
      routeName: 'Adabari - Gauhati University',
      startPoint: 'Adabari Bus Stand',
      endPoint: 'Gauhati University',
      distance: 8.0,
      baseFare: 10,
      stops: [
        { name: 'Adabari Bus Stand', landmark: 'Adabari Market', latitude: 26.1350, longitude: 91.6800, isMajor: true },
        { name: 'Adabari Chariali', landmark: 'Traffic Point', latitude: 26.1380, longitude: 91.6820, isMajor: false },
        { name: 'Maligaon', landmark: 'Maligaon Chariali', latitude: 26.1500, longitude: 91.6900, isMajor: false },
        { name: 'Jalukbari', landmark: 'Jalukbari T-Junction', latitude: 26.1600, longitude: 91.7000, isMajor: true },
        { name: 'Gauhati University', landmark: 'Campus Gate', latitude: 26.1550, longitude: 91.6950, isMajor: true },
      ],
    },
    // Route 14: Paltan Bazaar to Beltola
    {
      routeNumber: '14',
      routeName: 'Paltan Bazaar - Beltola',
      startPoint: 'Paltan Bazaar',
      endPoint: 'Beltola',
      distance: 11.0,
      baseFare: 14,
      stops: [
        { name: 'Paltan Bazaar', landmark: 'Railway Station', latitude: 26.1815, longitude: 91.7500, isMajor: true },
        { name: 'Latasil', landmark: 'Latasil Playground', latitude: 26.1780, longitude: 91.7550, isMajor: false },
        { name: 'Ulubari', landmark: 'Ulubari Chariali', latitude: 26.1750, longitude: 91.7620, isMajor: false },
        { name: 'Ganeshguri', landmark: 'Ganesh Mandir', latitude: 26.1700, longitude: 91.7800, isMajor: true },
        { name: 'Six Mile', landmark: 'Commercial Hub', latitude: 26.1550, longitude: 91.7900, isMajor: true },
        { name: 'Khanapara', landmark: 'Veterinary College', latitude: 26.1400, longitude: 91.8000, isMajor: true },
        { name: 'Beltola Chariali', landmark: 'Beltola Market', latitude: 26.1300, longitude: 91.8100, isMajor: true },
      ],
    },
    // Route 15: Paltan Bazaar to Hatigaon
    {
      routeNumber: '15',
      routeName: 'Paltan Bazaar - Hatigaon',
      startPoint: 'Paltan Bazaar',
      endPoint: 'Hatigaon',
      distance: 8.5,
      baseFare: 12,
      stops: [
        { name: 'Paltan Bazaar', landmark: 'Railway Station', latitude: 26.1815, longitude: 91.7500, isMajor: true },
        { name: 'Latasil', landmark: 'Latasil Playground', latitude: 26.1780, longitude: 91.7550, isMajor: false },
        { name: 'Chandmari', landmark: 'Chandmari Junction', latitude: 26.1650, longitude: 91.7550, isMajor: true },
        { name: 'Zoo Road', landmark: 'Assam State Zoo', latitude: 26.1550, longitude: 91.7600, isMajor: false },
        { name: 'Hatigaon Chariali', landmark: 'Market Area', latitude: 26.1450, longitude: 91.7650, isMajor: false },
        { name: 'Hatigaon', landmark: 'Hatigaon Area', latitude: 26.1350, longitude: 91.7700, isMajor: true },
      ],
    },
    // Route 16: ISBT to Khanapara (Express)
    {
      routeNumber: '16',
      routeName: 'ISBT - Khanapara Express',
      startPoint: 'ISBT Guwahati',
      endPoint: 'Khanapara',
      distance: 20.0,
      baseFare: 22,
      stops: [
        { name: 'ISBT Guwahati', landmark: 'Interstate Bus Terminal', latitude: 26.1300, longitude: 91.6600, isMajor: true },
        { name: 'Jalukbari', landmark: 'Jalukbari T-Junction', latitude: 26.1600, longitude: 91.7000, isMajor: true },
        { name: 'Paltan Bazaar', landmark: 'Railway Station', latitude: 26.1815, longitude: 91.7500, isMajor: true },
        { name: 'Ganeshguri', landmark: 'Ganesh Mandir', latitude: 26.1700, longitude: 91.7800, isMajor: true },
        { name: 'Six Mile', landmark: 'Commercial Hub', latitude: 26.1550, longitude: 91.7900, isMajor: true },
        { name: 'Khanapara', landmark: 'Veterinary College', latitude: 26.1400, longitude: 91.8000, isMajor: true },
      ],
    },
    // Route 17: Paltan Bazaar to Chandubi Lake (Tourist)
    {
      routeNumber: '17',
      routeName: 'Paltan Bazaar - Chandubi',
      startPoint: 'Paltan Bazaar',
      endPoint: 'Chandubi Lake',
      distance: 45.0,
      baseFare: 35,
      stops: [
        { name: 'Paltan Bazaar', landmark: 'Railway Station', latitude: 26.1815, longitude: 91.7500, isMajor: true },
        { name: 'Fancy Bazaar', landmark: 'Wholesale Market', latitude: 26.1850, longitude: 91.7400, isMajor: true },
        { name: 'Jalukbari', landmark: 'Jalukbari T-Junction', latitude: 26.1600, longitude: 91.7000, isMajor: true },
        { name: 'Garchuk', landmark: 'ISBT', latitude: 26.1300, longitude: 91.6600, isMajor: true },
        { name: 'Lohari', landmark: 'Lohari Village', latitude: 26.1000, longitude: 91.6300, isMajor: false },
        { name: 'Chandubi Lake', landmark: 'Tourist Spot', latitude: 26.0500, longitude: 91.6000, isMajor: true },
      ],
    },
    // Route 18: Paltan Bazaar to Sualkuchi (Silk Village)
    {
      routeNumber: '18',
      routeName: 'Paltan Bazaar - Sualkuchi',
      startPoint: 'Paltan Bazaar',
      endPoint: 'Sualkuchi',
      distance: 30.0,
      baseFare: 25,
      stops: [
        { name: 'Paltan Bazaar', landmark: 'Railway Station', latitude: 26.1815, longitude: 91.7500, isMajor: true },
        { name: 'Jalukbari', landmark: 'Jalukbari T-Junction', latitude: 26.1600, longitude: 91.7000, isMajor: true },
        { name: 'Sualkuchi Turn', landmark: 'Junction', latitude: 26.1500, longitude: 91.6700, isMajor: false },
        { name: 'Silk Village Entry', landmark: 'Sualkuchi', latitude: 26.1500, longitude: 91.6400, isMajor: false },
        { name: 'Sualkuchi', landmark: 'Silk Weaving Center', latitude: 26.1600, longitude: 91.6100, isMajor: true },
      ],
    },
    // Route 19: Adabari to Panbazar (Mini Bus)
    {
      routeNumber: '19',
      routeName: 'Adabari - Panbazar Mini',
      startPoint: 'Adabari Bus Stand',
      endPoint: 'Panbazar',
      distance: 9.0,
      baseFare: 10,
      stops: [
        { name: 'Adabari Bus Stand', landmark: 'Adabari Market', latitude: 26.1350, longitude: 91.6800, isMajor: true },
        { name: 'Maligaon', landmark: 'Maligaon Chariali', latitude: 26.1500, longitude: 91.6900, isMajor: false },
        { name: 'Jalukbari', landmark: 'Jalukbari T-Junction', latitude: 26.1600, longitude: 91.7000, isMajor: true },
        { name: 'Dharapur', landmark: 'Dharapur', latitude: 26.1680, longitude: 91.7150, isMajor: false },
        { name: 'Kahilipara', landmark: 'Kahilipara', latitude: 26.1720, longitude: 91.7250, isMajor: false },
        { name: 'Panbazar', landmark: 'DC Office', latitude: 26.1750, longitude: 91.7300, isMajor: true },
      ],
    },
    // Route 20: Paltan Bazaar to Bamunimaidam
    {
      routeNumber: '20',
      routeName: 'Paltan Bazaar - Bamunimaidam',
      startPoint: 'Paltan Bazaar',
      endPoint: 'Bamunimaidam',
      distance: 6.0,
      baseFare: 10,
      stops: [
        { name: 'Paltan Bazaar', landmark: 'Railway Station', latitude: 26.1815, longitude: 91.7500, isMajor: true },
        { name: 'Chandmari', landmark: 'Chandmari Junction', latitude: 26.1650, longitude: 91.7550, isMajor: true },
        { name: 'Bamunimaidam', landmark: 'GRA Complex', latitude: 26.1550, longitude: 91.7650, isMajor: true },
      ],
    },
    // Route 21: Khanapara to Basistha (Local)
    {
      routeNumber: '21',
      routeName: 'Khanapara - Basistha Local',
      startPoint: 'Khanapara',
      endPoint: 'Basistha Temple',
      distance: 5.0,
      baseFare: 8,
      stops: [
        { name: 'Khanapara', landmark: 'Veterinary College', latitude: 26.1400, longitude: 91.8000, isMajor: true },
        { name: 'Basistha Chariali', landmark: 'Temple Road', latitude: 26.1470, longitude: 91.7950, isMajor: false },
        { name: 'Basistha Temple', landmark: 'Shiva Temple', latitude: 26.1300, longitude: 91.8100, isMajor: true },
      ],
    },
    // Route 22: Paltan Bazaar to Dispur (Secretariat)
    {
      routeNumber: '22',
      routeName: 'Paltan Bazaar - Dispur',
      startPoint: 'Paltan Bazaar',
      endPoint: 'Dispur Secretariat',
      distance: 5.0,
      baseFare: 8,
      stops: [
        { name: 'Paltan Bazaar', landmark: 'Railway Station', latitude: 26.1815, longitude: 91.7500, isMajor: true },
        { name: 'Latasil', landmark: 'Latasil Playground', latitude: 26.1780, longitude: 91.7550, isMajor: false },
        { name: 'Ulubari', landmark: 'Ulubari Chariali', latitude: 26.1750, longitude: 91.7620, isMajor: false },
        { name: 'Ganeshguri', landmark: 'Ganesh Mandir', latitude: 26.1700, longitude: 91.7800, isMajor: true },
        { name: 'Dispur Secretariat', landmark: 'State Secretariat', latitude: 26.1600, longitude: 91.7700, isMajor: true },
      ],
    },
    // Route 23: Paltan Bazaar to Machkhowa
    {
      routeNumber: '23',
      routeName: 'Paltan Bazaar - Machkhowa',
      startPoint: 'Paltan Bazaar',
      endPoint: 'Machkhowa',
      distance: 4.0,
      baseFare: 8,
      stops: [
        { name: 'Paltan Bazaar', landmark: 'Railway Station', latitude: 26.1815, longitude: 91.7500, isMajor: true },
        { name: 'Fancy Bazaar', landmark: 'Wholesale Market', latitude: 26.1850, longitude: 91.7400, isMajor: true },
        { name: 'Machkhowa', landmark: 'Fish Market', latitude: 26.1880, longitude: 91.7350, isMajor: true },
      ],
    },
    // Route 24: Paltan Bazaar to Ulubari (Ring)
    {
      routeNumber: '24',
      routeName: 'Paltan Bazaar - Ulubari Ring',
      startPoint: 'Paltan Bazaar',
      endPoint: 'Ulubari',
      distance: 5.5,
      baseFare: 8,
      stops: [
        { name: 'Paltan Bazaar', landmark: 'Railway Station', latitude: 26.1815, longitude: 91.7500, isMajor: true },
        { name: 'Latasil', landmark: 'Latasil Playground', latitude: 26.1780, longitude: 91.7550, isMajor: false },
        { name: 'Ulubari', landmark: 'Ulubari Chariali', latitude: 26.1750, longitude: 91.7620, isMajor: true },
        { name: 'Tarun Nagar', landmark: 'Residential Area', latitude: 26.1680, longitude: 91.7700, isMajor: false },
        { name: 'Ganeshguri', landmark: 'Ganesh Mandir', latitude: 26.1700, longitude: 91.7800, isMajor: true },
      ],
    },
    // Route 25: Jalukbari to Narengi (Cross City)
    {
      routeNumber: '25',
      routeName: 'Jalukbari - Narengi Cross City',
      startPoint: 'Jalukbari',
      endPoint: 'Narengi',
      distance: 18.0,
      baseFare: 20,
      stops: [
        { name: 'Jalukbari', landmark: 'Gauhati University', latitude: 26.1600, longitude: 91.7000, isMajor: true },
        { name: 'Maligaon', landmark: 'Maligaon Chariali', latitude: 26.1500, longitude: 91.6900, isMajor: false },
        { name: 'Panbazar', landmark: 'DC Office', latitude: 26.1750, longitude: 91.7300, isMajor: false },
        { name: 'Paltan Bazaar', landmark: 'Railway Station', latitude: 26.1815, longitude: 91.7500, isMajor: true },
        { name: 'Chandmari', landmark: 'Chandmari Junction', latitude: 26.1650, longitude: 91.7550, isMajor: true },
        { name: 'Six Mile', landmark: 'Commercial Hub', latitude: 26.1550, longitude: 91.7900, isMajor: true },
        { name: 'Narengi Tinali', landmark: 'Junction', latitude: 26.1350, longitude: 91.8250, isMajor: true },
      ],
    },
    // Route 26: Airport City Express
    {
      routeNumber: '26',
      routeName: 'Airport City Express',
      startPoint: 'Paltan Bazaar',
      endPoint: 'LGBI Airport',
      distance: 20.0,
      baseFare: 30,
      stops: [
        { name: 'Paltan Bazaar', landmark: 'Railway Station', latitude: 26.1815, longitude: 91.7500, isMajor: true },
        { name: 'Ganeshguri', landmark: 'Ganesh Mandir', latitude: 26.1700, longitude: 91.7800, isMajor: true },
        { name: 'Jalukbari', landmark: 'Jalukbari T-Junction', latitude: 26.1600, longitude: 91.7000, isMajor: true },
        { name: 'ISBT', landmark: 'Interstate Terminal', latitude: 26.1300, longitude: 91.6600, isMajor: true },
        { name: 'LGBI Airport', landmark: 'Terminal', latitude: 26.1061, longitude: 91.5855, isMajor: true },
      ],
    },
    // Route 27: Paltan Bazaar to Garchuk (via NH37)
    {
      routeNumber: '27',
      routeName: 'Paltan Bazaar - Garchuk NH37',
      startPoint: 'Paltan Bazaar',
      endPoint: 'Garchuk',
      distance: 12.0,
      baseFare: 15,
      stops: [
        { name: 'Paltan Bazaar', landmark: 'Railway Station', latitude: 26.1815, longitude: 91.7500, isMajor: true },
        { name: 'Fancy Bazaar', landmark: 'Wholesale Market', latitude: 26.1850, longitude: 91.7400, isMajor: true },
        { name: 'Bharalumukh', landmark: 'Bridge', latitude: 26.1780, longitude: 91.7350, isMajor: false },
        { name: 'Maligaon', landmark: 'Maligaon Chariali', latitude: 26.1500, longitude: 91.6900, isMajor: false },
        { name: 'Jalukbari', landmark: 'Jalukbari T-Junction', latitude: 26.1600, longitude: 91.7000, isMajor: true },
        { name: 'Garchuk', landmark: 'ISBT Area', latitude: 26.1300, longitude: 91.6600, isMajor: true },
      ],
    },
    // Route 28: Paltan Bazaar to Kahilipara
    {
      routeNumber: '28',
      routeName: 'Paltan Bazaar - Kahilipara',
      startPoint: 'Paltan Bazaar',
      endPoint: 'Kahilipara',
      distance: 7.0,
      baseFare: 10,
      stops: [
        { name: 'Paltan Bazaar', landmark: 'Railway Station', latitude: 26.1815, longitude: 91.7500, isMajor: true },
        { name: 'Panbazar', landmark: 'DC Office', latitude: 26.1750, longitude: 91.7300, isMajor: false },
        { name: 'Kahilipara', landmark: 'Kahilipara Road', latitude: 26.1720, longitude: 91.7250, isMajor: true },
      ],
    },
    // Route 29: Paltan Bazaar to Silpukhuri
    {
      routeNumber: '29',
      routeName: 'Paltan Bazaar - Silpukhuri',
      startPoint: 'Paltan Bazaar',
      endPoint: 'Silpukhuri',
      distance: 4.5,
      baseFare: 8,
      stops: [
        { name: 'Paltan Bazaar', landmark: 'Railway Station', latitude: 26.1815, longitude: 91.7500, isMajor: true },
        { name: 'Uzan Bazaar', landmark: 'Near Brahmaputra', latitude: 26.1800, longitude: 91.7450, isMajor: false },
        { name: 'Silpukhuri', landmark: 'Silpukhuri Pond', latitude: 26.1820, longitude: 91.7400, isMajor: true },
      ],
    },
    // Route 30: Night Service - Paltan Bazaar to Airport
    {
      routeNumber: '30',
      routeName: 'Night Airport Service',
      startPoint: 'Paltan Bazaar',
      endPoint: 'LGBI Airport',
      distance: 22.0,
      baseFare: 35,
      stops: [
        { name: 'Paltan Bazaar', landmark: 'Railway Station', latitude: 26.1815, longitude: 91.7500, isMajor: true },
        { name: 'Jalukbari', landmark: 'Jalukbari T-Junction', latitude: 26.1600, longitude: 91.7000, isMajor: true },
        { name: 'ISBT', landmark: 'Interstate Terminal', latitude: 26.1300, longitude: 91.6600, isMajor: true },
        { name: 'LGBI Airport', landmark: 'Terminal', latitude: 26.1061, longitude: 91.5855, isMajor: true },
      ],
    },
  ];

  // Create routes and stops
  for (const routeData of routes) {
    const { stops, ...routeInfo } = routeData;
    
    const route = await prisma.busRoute.create({
      data: {
        ...routeInfo,
        isActive: true,
      },
    });

    for (let i = 0; i < stops.length; i++) {
      await prisma.busStop.create({
        data: {
          ...stops[i],
          sequence: i + 1,
          routeId: route.id,
        },
      });
    }
  }

  // Create buses for all routes
  const allRoutes = await prisma.busRoute.findMany();
  const busTypes = [BusType.STANDARD, BusType.AC, BusType.ELECTRIC, BusType.MINI];
  
  let busNumber = 1000;
  for (const route of allRoutes) {
    // Create 2-4 buses per route
    const numBuses = 2 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numBuses; i++) {
      const busType = busTypes[Math.floor(Math.random() * busTypes.length)];
      
      await prisma.bus.create({
        data: {
          busNumber: `AS-${busNumber++}`,
          busType: busType,
          capacity: busType === BusType.MINI ? 30 : busType === BusType.AC ? 45 : 50,
          routeId: route.id,
          isActive: true,
        },
      });
    }
  }

  console.log('✅ Seed data created successfully!');
  console.log(`📍 Created ${trafficZones.length} traffic congestion zones`);
  console.log(`🚌 Created ${routes.length} bus routes`);
  console.log(`🛑 Total stops: ${routes.reduce((sum, r) => sum + r.stops.length, 0)}`);
  
  const busCount = await prisma.bus.count();
  console.log(`🚍 Created ${busCount} buses`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
