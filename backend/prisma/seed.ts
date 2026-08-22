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
      { name: 'Le Marais Bakery & Food Tasting Walk', category: 'Food', cost: 45.0, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80', description: 'Sample fresh croissants, artisanal cheeses, French macarons, and wine.' },
      { name: 'Sunset Seine River Cruise', category: 'Leisure', cost: 22.0, durationMinutes: 75, imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80', description: 'Glide past Notre-Dame and Musée d’Orsay while illuminated at night.' },
      { name: 'Montmartre Artists Quarter Stroll', category: 'Sightseeing', cost: 0.0, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1500315331616-db4f707c24d1?auto=format&fit=crop&w=800&q=80', description: 'Explore cobblestone alleys, Sacré-Cœur basilica, and street painter studios.' }
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
      { name: 'teamLab Planets Digital Art Immersion', category: 'Culture', cost: 28.0, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80', description: 'Walk through water and body-immersive digital artwork installations.' },
      { name: 'Shibuya Crossing & Harajuku Culture Tour', category: 'Sightseeing', cost: 0.0, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80', description: 'Experience the world’s busiest pedestrian scramble and Takeshita Street pop culture.' },
      { name: 'Mount Fuji Day Excursion & Lake Kawaguchiko', category: 'Adventure', cost: 110.0, durationMinutes: 480, imageUrl: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=80', description: 'Travel to Mt. Fuji 5th Station and enjoy scenic alpine lake views.' },
      { name: 'Asakusa Senso-ji Temple & Traditional Tea', category: 'Culture', cost: 18.0, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=800&q=80', description: 'Visit Tokyo’s oldest temple and enjoy a traditional matcha tea ceremony.' }
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
      { name: 'Colosseum & Roman Forum Priority Entry', category: 'Sightseeing', cost: 40.0, durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80', description: 'Walk through gladiatorial arenas and ancient civic ruins with priority access.' },
      { name: 'Vatican Museums & Sistine Chapel Tour', category: 'Culture', cost: 55.0, durationMinutes: 210, imageUrl: 'https://images.unsplash.com/photo-1548625361-1850b4a4563a?auto=format&fit=crop&w=800&q=80', description: 'Marvel at Michelangelo’s ceiling frescoes and St. Peter’s Basilica.' },
      { name: 'Trastevere Pasta & Gelato Evening Walk', category: 'Food', cost: 50.0, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80', description: 'Savor authentic Cacio e Pepe, Suppli, and artisanal gelato in charming alleys.' }
    ]
  },
  {
    name: 'Barcelona',
    country: 'Spain',
    region: 'Europe',
    costIndex: 'medium',
    popularityScore: 9.6,
    imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1000&q=80',
    description: 'Catalan capital celebrated for Antoni Gaudí architecture, Mediterranean beaches, tapas bars, and vibrant street life.',
    activities: [
      { name: 'Sagrada Família Fast-Track Tower Access', category: 'Sightseeing', cost: 38.0, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80', description: 'Step inside Gaudí’s breathtaking basilica and admire forest-like stained glass columns.' },
      { name: 'Park Güell Mosaic Monuments Walk', category: 'Culture', cost: 18.0, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?auto=format&fit=crop&w=800&q=80', description: 'Explore colorful salamander statues and curved park benches overlooking the sea.' }
    ]
  }
];

async function main() {
  console.log('Seeding Database with Exchange Rates and Advanced Features...');

  await prisma.currencyRate.deleteMany({});
  await prisma.tripChecklistItem.deleteMany({});
  await prisma.expenseItem.deleteMany({});
  await prisma.stopActivity.deleteMany({});
  await prisma.tripStop.deleteMany({});
  await prisma.activity.deleteMany({});
  await prisma.city.deleteMany({});
  await prisma.trip.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Seed Currency Rates
  for (const rate of CURRENCY_RATES) {
    await prisma.currencyRate.create({ data: rate });
  }
  console.log('Seeded Currency Exchange Rates!');

  // 2. Seed Demo User
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const demoUser = await prisma.user.create({
    data: {
      name: 'Elena Rostova',
      email: 'elena@globetrotter.com',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      language: 'English'
    }
  });

  // 3. Seed Cities & Activities
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

  // 4. Seed Demo Trip & Checklist Items
  const paris = createdCities['Paris'];
  const barcelona = createdCities['Barcelona'];

  const demoTrip = await prisma.trip.create({
    data: {
      userId: demoUser.id,
      title: 'European Grand Summer Tour 2026',
      description: 'A 10-day journey across Paris and Barcelona enjoying architecture, fine wine, and historic landmarks.',
      coverImageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-09-10'),
      totalBudget: 2500.0,
      isPublic: true,
      shareSlug: 'euro-summer-escape-2026'
    }
  });

  const stop1 = await prisma.tripStop.create({
    data: {
      tripId: demoTrip.id,
      cityId: paris.id,
      orderIndex: 0,
      arrivalDate: new Date('2026-09-01'),
      departureDate: new Date('2026-09-04'),
      stayCost: 450.0,
      transportCost: 200.0
    }
  });

  const stop2 = await prisma.tripStop.create({
    data: {
      tripId: demoTrip.id,
      cityId: barcelona.id,
      orderIndex: 1,
      arrivalDate: new Date('2026-09-04'),
      departureDate: new Date('2026-09-07'),
      stayCost: 380.0,
      transportCost: 150.0
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

  // Seed Checklist Items
  await prisma.tripChecklistItem.createMany({
    data: [
      { tripId: demoTrip.id, title: 'Passport & Visa Documents', category: 'Essentials', isCompleted: true },
      { tripId: demoTrip.id, title: 'Universal EU Power Adapter', category: 'Essentials', isCompleted: true },
      { tripId: demoTrip.id, title: 'Comfortable City Walking Shoes', category: 'Packing', isCompleted: false },
      { tripId: demoTrip.id, title: 'Museum Pass Confirmation Tickets', category: 'Culture', isCompleted: true },
      { tripId: demoTrip.id, title: 'Travel Insurance Documents', category: 'Documents', isCompleted: false }
    ]
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
