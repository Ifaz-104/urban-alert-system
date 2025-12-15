// backend/scripts/seedEmergencyContacts.js
/**
 * This script seeds the database with default emergency contacts
 * Run with: node scripts/seedEmergencyContacts.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const EmergencyContact = require('../models/EmergencyContact');

const seedContacts = [
  // POLICE
  {
    name: 'Emergency Police',
    type: 'police',
    phone: ['911', '100'],
    icon: '🚔',
    description: 'Emergency police response - Dial immediately for crimes in progress',
    priority: 1,
    available24x7: true,
    country: 'Global',
  },

  // FIRE DEPARTMENT
  {
    name: 'Emergency Fire Department',
    type: 'fire',
    phone: ['911', '101'],
    icon: '🚒',
    description: 'Fire emergencies and rescue operations',
    priority: 2,
    available24x7: true,
    country: 'Global',
  },

  // MEDICAL/AMBULANCE
  {
    name: 'Emergency Ambulance/Medical',
    type: 'medical',
    phone: ['911', '102'],
    icon: '🚑',
    description: 'Medical emergencies and ambulance services',
    priority: 3,
    available24x7: true,
    country: 'Global',
  },

  // DISASTER MANAGEMENT
  {
    name: 'Disaster Management Authority',
    type: 'disaster',
    phone: ['1077'],
    icon: '⚠️',
    description: 'Disaster relief and emergency management services',
    priority: 4,
    available24x7: true,
    country: 'Global',
  },

  // POISON CONTROL
  {
    name: 'Poison Control Center',
    type: 'medical',
    phone: ['1800-116-117'],
    icon: '☠️',
    description: 'Poisoning and toxic exposure emergencies',
    priority: 5,
    available24x7: true,
    country: 'Global',
  },

  // MENTAL HEALTH CRISIS
  {
    name: 'Mental Health Crisis Helpline',
    type: 'medical',
    phone: ['1800-599-0019'],
    icon: '💙',
    description: 'Mental health support and suicide prevention',
    priority: 6,
    available24x7: true,
    country: 'Global',
  },

  // WOMEN SAFETY
  {
    name: 'Women Safety Helpline',
    type: 'police',
    phone: ['1091', '1800-121-6050'],
    icon: '👩',
    description: 'Support and assistance for women in distress',
    priority: 7,
    available24x7: true,
    country: 'Global',
  },

  // CHILD PROTECTION
  {
    name: 'Child Helpline',
    type: 'custom',
    phone: ['1098'],
    icon: '👧',
    description: 'Support for children in need or distress',
    priority: 8,
    available24x7: true,
    country: 'Global',
  },

  // DISASTER HELPLINE
  {
    name: 'National Disaster Management Authority',
    type: 'disaster',
    phone: ['1070'],
    website: 'https://ndma.gov.in',
    icon: '⚠️',
    description: 'Natural disaster alerts and relief information',
    priority: 9,
    available24x7: true,
    country: 'Global',
  },

  // WILDLIFE EMERGENCY
  {
    name: 'Wildlife SOS',
    type: 'custom',
    phone: ['9871963060'],
    email: 'contactus@wildlifesos.org',
    icon: '🐅',
    description: 'Wildlife rescue and conflict resolution',
    priority: 10,
    available24x7: true,
    country: 'Global',
  },
];

async function seedDatabase() {
  try {
    // Connect to database
    await connectDB();

    // Check if contacts already exist
    const existingCount = await EmergencyContact.countDocuments();

    if (existingCount > 0) {
      console.log(`ℹ️  Database already contains ${existingCount} emergency contacts. Skipping seed.`);
      console.log('💡 To reset, run: node scripts/clearEmergencyContacts.js');
      process.exit(0);
    }

    // Insert seed data
    const result = await EmergencyContact.insertMany(seedContacts);

    console.log(`✅ Successfully seeded ${result.length} emergency contacts!`);
    console.log('\nContacts added:');
    result.forEach((contact) => {
      console.log(`  • ${contact.icon} ${contact.name} - ${contact.phone.join(', ')}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
