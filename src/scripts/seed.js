require('dotenv').config();
const { connectDB } = require('../config/db');
const Location = require('../models/Location');

(async () => {
  try {
    await connectDB();
    const sample = [
      { name: 'Hong Kong Cultural Centre', geo: { type: 'Point', coordinates: [114.169, 22.294] }, area: 'Tsim Sha Tsui' },
      { name: 'Sha Tin Town Hall', geo: { type: 'Point', coordinates: [114.189, 22.382] }, area: 'Sha Tin' },
      { name: 'Tsuen Wan Town Hall', geo: { type: 'Point', coordinates: [114.114, 22.373] }, area: 'Tsuen Wan' },
      { name: 'Kwai Tsing Theatre', geo: { type: 'Point', coordinates: [114.130, 22.356] }, area: 'Kwai Tsing' },
      { name: 'Yuen Long Theatre', geo: { type: 'Point', coordinates: [114.031, 22.444] }, area: 'Yuen Long' },
      { name: 'Tuen Mun Town Hall', geo: { type: 'Point', coordinates: [113.976, 22.392] }, area: 'Tuen Mun' },
      { name: 'Sai Wan Ho Civic Centre', geo: { type: 'Point', coordinates: [114.223, 22.282] }, area: 'Eastern' },
      { name: 'Sheung Wan Civic Centre', geo: { type: 'Point', coordinates: [114.148, 22.286] }, area: 'Central & Western' },
      { name: 'Ngau Chi Wan Civic Centre', geo: { type: 'Point', coordinates: [114.219, 22.336] }, area: 'Wong Tai Sin' },
      { name: 'Ko Shan Theatre', geo: { type: 'Point', coordinates: [114.179, 22.311] }, area: 'Kowloon City' }
    ];
    await Location.deleteMany({});
    await Location.insertMany(sample);
    console.log('Seeded 10 locations.');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();