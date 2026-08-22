import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CURRENCY_RATES = [
  { code: 'USD', symbol: '$', rateAgainstUSD: 1.0 },
  { code: 'EUR', symbol: '€', rateAgainstUSD: 0.92 },
  { code: 'GBP', symbol: '£', rateAgainstUSD: 0.79 },
  { code: 'INR', symbol: '₹', rateAgainstUSD: 83.2 },
  { code: 'JPY', symbol: '¥', rateAgainstUSD: 155.0 },
  { code: 'CAD', symbol: 'CA$', rateAgainstUSD: 1.36 }
];

const CITIES_DATA = [
  {
    name: 'Paris',
    country: 'France',
    region: 'Europe',
    costIndex: 'high',
    popularityScore: 9.8,
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80',
    description: 'The City of Light, famous for romantic architecture, high fashion, world-class gastronomy, and iconic art museums.',
    activities: [
      { name: 'Eiffel Tower Summit Access', category: 'Sightseeing', cost: 35.0, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&w=800&q=80', description: 'Take the elevator to the top floor of Paris’s iconic landmark for panoramic city views.' },
      { name: 'Louvre Museum Guided Masterpieces Tour', category: 'Culture', cost: 65.0, durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1565099824688-e93eb20fe622?auto=format&fit=crop&w=800&q=80', description: 'Discover Mona Lisa, Venus de Milo, and Winged Victory with an expert art historian.' },
      { name: 'Le Marais Bakery & Food Tasting Walk', category: 'Food', cost: 45.0, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80', description: 'Sample fresh croissants, artisanal cheeses, French macarons, and wine.' }
    ]
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    region: 'Asia',
    costIndex: 'medium',
    popularityScore: 9.9,
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80',
    description: 'A captivating metropolis blending neon-lit ultramodern skyscrapers with historic Shinto shrines and street food culture.',
    activities: [
      { name: 'Tsukiji Outer Market Sushi Masterclass', category: 'Food', cost: 75.0, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80', description: 'Learn authentic nigiri crafting from master chefs using fresh morning catch.' },
      { name: 'teamLab Planets Digital Art Immersion', category: 'Culture', cost: 28.0, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80', description: 'Walk through water and body-immersive digital artwork installations.' }
    ]
  },
  {
    name: 'Rome',
    country: 'Italy',
    region: 'Europe',
    costIndex: 'medium',
    popularityScore: 9.7,
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80',
    description: 'The Eternal City packed with nearly 3,000 years of globally influential art, architecture, and mouthwatering pasta.',
    activities: [
      { name: 'Colosseum & Roman Forum Priority Entry', category: 'Sightseeing', cost: 40.0, durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80', description: 'Walk through gladiatorial arenas and ancient civic ruins with priority access.' }
    ]
  }
];

async function main() {
  console.log('Seeding Database with RBAC Roles, Sections and Community Reviews...');

  await prisma.communityReview.deleteMany({});
  await prisma.tripSection.deleteMany({});
  await prisma.currencyRate.deleteMany({});
  await prisma.tripChecklistItem.deleteMany({});
  await prisma.expenseItem.deleteMany({});
  await prisma.stopActivity.deleteMany({});
  await prisma.tripStop.deleteMany({});
  await prisma.activity.deleteMany({});
  await prisma.city.deleteMany({});
  await prisma.trip.deleteMany({});
  await prisma.user.deleteMany({});

  for (const rate of CURRENCY_RATES) {
    await prisma.currencyRate.create({ data: rate });
  }

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Dedicated Admin User (role: ADMIN)
  const adminUser = await prisma.user.create({
    data: {
      name: 'GlobalTrotter Admin',
      email: 'admin@globetrotter.com',
      passwordHash,
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
      phone: '+1 (555) 000-1111',
      city: 'New York',
      country: 'United States',
      bio: 'Platform System Administrator for GlobalTrotter Travel Intelligence Engine.',
      language: 'English'
    }
  });

  // 2. Create Standard Users (role: USER)
  const demoUser = await prisma.user.create({
    data: {
      name: 'Elena Rostova',
      email: 'elena@globetrotter.com',
      passwordHash,
      role: 'USER',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      phone: '+1 (555) 234-5678',
      city: 'Paris',
      country: 'France',
      bio: 'Passionate travel photographer and culinary explorer traveling across Europe and Asia.',
      language: 'English'
    }
  });

  const marcoUser = await prisma.user.create({
    data: {
      name: 'Marco Rossi',
      email: 'marco@globetrotter.com',
      passwordHash,
      role: 'USER',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      phone: '+39 06 6981234',
      city: 'Rome',
      country: 'Italy',
      bio: 'Architectural enthusiast and historic site explorer.',
      language: 'Italian'
    }
  });

  const createdCities: Record<string, any> = {};
  for (const cityData of CITIES_DATA) {
    const { activities, ...cData } = cityData;
    const city = await prisma.city.create({ data: cData });
    createdCities[city.name] = city;

    for (const act of activities) {
      await prisma.activity.create({
        data: {
          ...act,
          cityId: city.id
        }
      });
    }
  }

  const paris = createdCities['Paris'];

  const demoTrip = await prisma.trip.create({
    data: {
      userId: demoUser.id,
      title: 'European Grand Summer Tour 2026',
      description: 'A 10-day journey across Paris and Rome enjoying architecture, fine wine, and historic landmarks.',
      coverImageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-09-10'),
      totalBudget: 2500.0,
      isPublic: true,
      shareSlug: 'euro-summer-escape-2026'
    }
  });

  // Seed Sections for Screen 5 Wireframe
  await prisma.tripSection.createMany({
    data: [
      {
        tripId: demoTrip.id,
        sectionNumber: 1,
        title: 'Flight & Transit to Paris',
        description: 'Flight section: Direct flight from NYC JFK to Paris CDG on Air France.',
        startDate: new Date('2026-09-01'),
        endDate: new Date('2026-09-02'),
        budget: 650.0
      },
      {
        tripId: demoTrip.id,
        sectionNumber: 2,
        title: 'Hotel Accommodation in Le Marais',
        description: 'Hotel stay: 4 nights boutique hotel stay with breakfast included.',
        startDate: new Date('2026-09-02'),
        endDate: new Date('2026-09-06'),
        budget: 900.0
      },
      {
        tripId: demoTrip.id,
        sectionNumber: 3,
        title: 'Guided Museum & Culinary Excursions',
        description: 'Tour section: Louvre guided tour, Seine sunset cruise, and food walk.',
        startDate: new Date('2026-09-03'),
        endDate: new Date('2026-09-08'),
        budget: 450.0
      }
    ]
  });

  const stop1 = await prisma.tripStop.create({
    data: {
      tripId: demoTrip.id,
      cityId: paris.id,
      orderIndex: 0,
      arrivalDate: new Date('2026-09-01'),
      departureDate: new Date('2026-09-05'),
      stayCost: 450.0,
      transportCost: 200.0
    }
  });

  const parisActs = await prisma.activity.findMany({ where: { cityId: paris.id } });
  if (parisActs.length > 0) {
    await prisma.stopActivity.create({
      data: {
        tripStopId: stop1.id,
        activityId: parisActs[0].id,
        scheduledDate: new Date('2026-09-02'),
        scheduledTime: '09:30',
        customCost: parisActs[0].cost,
        orderIndex: 0
      }
    });
    await prisma.stopActivity.create({
      data: {
        tripStopId: stop1.id,
        activityId: parisActs[1].id,
        scheduledDate: new Date('2026-09-02'),
        scheduledTime: '14:00',
        customCost: parisActs[1].cost,
        orderIndex: 1
      }
    });
  }

  // Seed Community Reviews for Screen 10 Wireframe
  await prisma.communityReview.createMany({
    data: [
      {
        userId: demoUser.id,
        cityName: 'Paris',
        rating: 5,
        title: 'Unforgettable Sunset on the Seine River',
        content: 'Watching the Eiffel Tower light up while taking an evening boat cruise was the highlight of our 5-day Paris vacation!'
      },
      {
        userId: demoUser.id,
        cityName: 'Tokyo',
        rating: 5,
        title: 'Sushi Masterclass in Tsukiji Market',
        content: 'Learned authentic nigiri crafting techniques from a third-generation master chef. Must-do culinary experience!'
      }
    ]
  });

  console.log('Seeding completed successfully with Admin & User accounts!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
