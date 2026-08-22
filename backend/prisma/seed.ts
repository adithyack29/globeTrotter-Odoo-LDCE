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
  // ── 1. TOKYO ──────────────────────────────────────────────────────────────
  {
    name: 'Tokyo',
    country: 'Japan',
    region: 'Asia',
    costIndex: 'medium',
    popularityScore: 9.9,
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80',
    description: 'A captivating metropolis blending neon-lit ultramodern skyscrapers with historic Shinto shrines, world-class sushi bars, and electric street food culture.',
    activities: [
      { name: 'Shibuya Crossing & Street Food Tour', category: 'Food', cost: 45.0, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80', description: "Navigate the world's busiest pedestrian crossing then sample takoyaki, ramen, and yakitori from legendary street stalls." },
      { name: 'TeamLab Borderless Digital Art Immersion', category: 'Culture', cost: 35.0, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80', description: 'Walk through breathtaking body-immersive digital art installations where boundaries between art and viewer dissolve entirely.' },
      { name: 'Tsukiji Outer Market Sushi Tasting', category: 'Food', cost: 60.0, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80', description: 'Taste the freshest morning-catch nigiri and sashimi from iconic Tsukiji stalls with a knowledgeable local guide.' },
      { name: 'Senso-ji Temple & Asakusa Walking Tour', category: 'Sightseeing', cost: 20.0, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1583400220089-4e0f5a8a4c6c?auto=format&fit=crop&w=800&q=80', description: "Explore Tokyo's oldest Buddhist temple, the iconic Nakamise shopping street, and serene Asakusa neighbourhood." }
    ]
  },
  // ── 2. PARIS ──────────────────────────────────────────────────────────────
  {
    name: 'Paris',
    country: 'France',
    region: 'Europe',
    costIndex: 'high',
    popularityScore: 9.8,
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80',
    description: 'The City of Light — romantic architecture, haute cuisine, fashion capitals, and world-class art museums make Paris an eternal travel dream.',
    activities: [
      { name: 'Louvre Museum Guided Tour', category: 'Culture', cost: 65.0, durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1565099824688-e93eb20fe622?auto=format&fit=crop&w=800&q=80', description: 'Discover the Mona Lisa, Venus de Milo, and Winged Victory with an expert art historian on a skip-the-line guided tour.' },
      { name: 'Seine River Sunset Cruise', category: 'Leisure', cost: 40.0, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80', description: 'Glide along the Seine as Paris glows golden at dusk, passing Notre-Dame, the Eiffel Tower, and riverside brasseries.' },
      { name: 'Eiffel Tower Summit Access', category: 'Sightseeing', cost: 55.0, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&w=800&q=80', description: "Take the elevator to the very top of Paris's most iconic landmark for a 360° panoramic view of the entire city." },
      { name: 'Le Marais Bakery & Food Walk', category: 'Food', cost: 45.0, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80', description: 'Sample fresh croissants, artisanal cheeses, French macarons, and curated wines in the charming Le Marais district.' }
    ]
  },
  // ── 3. ROME ───────────────────────────────────────────────────────────────
  {
    name: 'Rome',
    country: 'Italy',
    region: 'Europe',
    costIndex: 'medium',
    popularityScore: 9.7,
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80',
    description: 'The Eternal City — nearly 3,000 years of globally influential art, architecture, piazzas, and mouthwatering pasta and gelato.',
    activities: [
      { name: 'Colosseum & Roman Forum Tour', category: 'Sightseeing', cost: 50.0, durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80', description: 'Walk through gladiatorial arenas and ancient civic ruins with a certified archaeologist guide and priority access.' },
      { name: 'Vatican Museums & Sistine Chapel', category: 'Culture', cost: 60.0, durationMinutes: 240, imageUrl: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=800&q=80', description: "Marvel at Michelangelo's legendary ceiling fresco and explore over 70 galleries of papal art and antiquities." },
      { name: 'Trastevere Culinary Walk', category: 'Food', cost: 45.0, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80', description: 'Stroll cobblestone lanes of Trastevere tasting suppli, cacio e pepe, tiramisu, and local Frascati wines.' }
    ]
  },
  // ── 4. BARCELONA ──────────────────────────────────────────────────────────
  {
    name: 'Barcelona',
    country: 'Spain',
    region: 'Europe',
    costIndex: 'medium',
    popularityScore: 9.6,
    imageUrl: 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?auto=format&fit=crop&w=1000&q=80',
    description: "A sun-soaked Mediterranean city famed for Gaudi's surreal architecture, vibrant tapas culture, world-class beaches, and non-stop nightlife.",
    activities: [
      { name: 'Sagrada Familia Fast-Track Entry', category: 'Sightseeing', cost: 38.0, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80', description: "Skip the queue and explore Gaudi's unfinished masterpiece — a soaring basilica of extraordinary organic stonework." },
      { name: 'Park Guell Discovery Tour', category: 'Sightseeing', cost: 25.0, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80', description: "Wander the UNESCO-listed mosaic terraces and viaducts of Gaudi's whimsical hilltop garden park above the city." },
      { name: 'Tapas & Gothic Quarter Night Tour', category: 'Food', cost: 50.0, durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?auto=format&fit=crop&w=800&q=80', description: 'Bar-hop through medieval alleyways sampling patatas bravas, jamon iberico, croquetas, and Catalan wines after dark.' }
    ]
  },
  // ── 5. KYOTO ──────────────────────────────────────────────────────────────
  {
    name: 'Kyoto',
    country: 'Japan',
    region: 'Asia',
    costIndex: 'medium',
    popularityScore: 9.8,
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80',
    description: "Japan's ancient imperial capital — home to over 1,600 Buddhist temples, ethereal bamboo groves, geisha districts, and centuries-old tea ceremony traditions.",
    activities: [
      { name: 'Fushimi Inari Early Morning Walk', category: 'Sightseeing', cost: 20.0, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800&q=80', description: 'Hike thousands of vermilion torii gates up sacred Mount Inari at dawn before the crowds arrive for a truly mystical experience.' },
      { name: 'Arashiyama Bamboo Grove & Monkey Park', category: 'Adventure', cost: 30.0, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80', description: 'Stroll the towering bamboo grove, cross Togetsukyo bridge, then climb to the mountain monkey park for city panoramas.' },
      { name: 'Traditional Matcha Tea Ceremony', category: 'Culture', cost: 45.0, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80', description: 'Participate in an authentic Chado ceremony with a kimono-dressed tea master in a historic Higashiyama machiya townhouse.' }
    ]
  },
  // ── 6. CAIRO ──────────────────────────────────────────────────────────────
  {
    name: 'Cairo',
    country: 'Egypt',
    region: 'Africa',
    costIndex: 'budget',
    popularityScore: 9.4,
    imageUrl: 'https://images.unsplash.com/photo-1539650116574-75c7e02bc33b?auto=format&fit=crop&w=1000&q=80',
    description: 'The gateway to ancient wonders — Cairo pulses with bazaar energy, Nile-side cafes, and the sheer awe of the last remaining Seven Wonders of the Ancient World.',
    activities: [
      { name: 'Giza Pyramids & Sphinx Camel Trek', category: 'Adventure', cost: 45.0, durationMinutes: 240, imageUrl: 'https://images.unsplash.com/photo-1539650116574-75c7e02bc33b?auto=format&fit=crop&w=800&q=80', description: "Ride a camel around the last surviving ancient wonder and enter the Great Pyramid's burial chamber with a licensed Egyptologist." },
      { name: 'Grand Egyptian Museum Tour', category: 'Culture', cost: 30.0, durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1571155401600-a6e9e03a8a6e?auto=format&fit=crop&w=800&q=80', description: "Explore the world's largest archaeological museum housing over 100,000 artefacts including Tutankhamun's golden mask." },
      { name: 'Nile Felucca Sunset Sailing', category: 'Leisure', cost: 25.0, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&w=800&q=80', description: "Drift down the Nile on a traditional felucca sailboat as the sun sets over Cairo's skyline, minaret calls echoing across the water." }
    ]
  },
  // ── 7. NEW YORK CITY ──────────────────────────────────────────────────────
  {
    name: 'New York City',
    country: 'USA',
    region: 'North America',
    costIndex: 'high',
    popularityScore: 9.7,
    imageUrl: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1000&q=80',
    description: 'The city that never sleeps — towering skylines, Broadway spectacles, iconic delis, world-class museums, and the relentless energy of 8 million dreamers.',
    activities: [
      { name: 'Broadway Show Premium Ticket', category: 'Culture', cost: 110.0, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?auto=format&fit=crop&w=800&q=80', description: 'Experience a world-class Broadway production in the Theatre District — from blockbuster musicals to award-winning dramas.' },
      { name: 'Top of the Rock Observation Deck', category: 'Sightseeing', cost: 42.0, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=800&q=80', description: 'Ascend to the 70th floor of 30 Rockefeller Plaza for unobstructed Manhattan views including the Empire State Building skyline.' },
      { name: 'Central Park Bike Rental & Tour', category: 'Adventure', cost: 30.0, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=800&q=80', description: 'Cycle through 843 acres of iconic park landscapes — Bethesda Fountain, Strawberry Fields, the Great Lawn, and Bow Bridge.' },
      { name: 'Brooklyn Food Market & Bridge Walk', category: 'Food', cost: 35.0, durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1546484475-7f7bd55792da?auto=format&fit=crop&w=800&q=80', description: "Walk across the iconic Brooklyn Bridge then graze through DUMBO's artisan food markets for NYC's finest artisan bites." }
    ]
  },
  // ── 8. BALI ───────────────────────────────────────────────────────────────
  {
    name: 'Bali',
    country: 'Indonesia',
    region: 'Asia',
    costIndex: 'budget',
    popularityScore: 9.5,
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80',
    description: 'The Island of the Gods — terraced rice fields, active volcanoes, sacred Hindu temples, world-class surf, and a thriving wellness and yoga culture.',
    activities: [
      { name: 'Mount Batur Sunrise Trekking', category: 'Adventure', cost: 40.0, durationMinutes: 300, imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80', description: 'Trek the active volcano in the dark to witness a breathtaking sunrise above the clouds, with breakfast cooked on volcanic steam.' },
      { name: 'Ubud Monkey Forest & Rice Terraces', category: 'Sightseeing', cost: 25.0, durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80', description: 'Wander through the sacred monkey sanctuary then stroll the stunning UNESCO-listed Tegalalang rice terrace steps at golden hour.' },
      { name: 'Nusa Penida Island Speedboat Day Tour', category: 'Adventure', cost: 65.0, durationMinutes: 480, imageUrl: 'https://images.unsplash.com/photo-1591017403286-fd8493524e1e?auto=format&fit=crop&w=800&q=80', description: "Speed to Nusa Penida for Kelingking cliff views, Angel's Billabong natural pool, and snorkeling with Manta Rays." }
    ]
  },
  // ── 9. RIO DE JANEIRO ─────────────────────────────────────────────────────
  {
    name: 'Rio de Janeiro',
    country: 'Brazil',
    region: 'South America',
    costIndex: 'medium',
    popularityScore: 9.3,
    imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1000&q=80',
    description: 'The Marvellous City — iconic mountains, samba rhythms, golden beaches, and the towering Christ the Redeemer statue make Rio utterly unforgettable.',
    activities: [
      { name: 'Christ the Redeemer & Corcovado Train', category: 'Sightseeing', cost: 35.0, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80', description: 'Ride the historic cog railway up Corcovado mountain to stand beside one of the New Seven Wonders of the World.' },
      { name: 'Sugarloaf Mountain Cable Car', category: 'Adventure', cost: 40.0, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1544989164-31c2b91e29e5?auto=format&fit=crop&w=800&q=80', description: 'Take a twin cable car ride to the summit of Pao de Acucar for sweeping views over Guanabara Bay, the city, and Atlantic ocean.' },
      { name: 'Copacabana Sunset Beach Tour', category: 'Leisure', cost: 20.0, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80', description: "Stroll Rio's world-famous 4km crescent beach at sunset, sampling caipirinhas and grilled acai from beachside kiosks." }
    ]
  },
  // ── 10. REYKJAVIK ─────────────────────────────────────────────────────────
  {
    name: 'Reykjavik',
    country: 'Iceland',
    region: 'Europe',
    costIndex: 'high',
    popularityScore: 9.8,
    imageUrl: 'https://images.unsplash.com/photo-1504233529578-6d46baba6d34?auto=format&fit=crop&w=1000&q=80',
    description: "The world's northernmost capital — dramatic lava fields, geysers, the Northern Lights, and midnight sun make Iceland a planet apart.",
    activities: [
      { name: 'Golden Circle & Gullfoss Waterfall', category: 'Adventure', cost: 85.0, durationMinutes: 480, imageUrl: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=800&q=80', description: "Drive Iceland's legendary Golden Circle route: Thingvellir tectonic rift, the erupting Geysir hot spring, and the thundering Gullfoss falls." },
      { name: 'Blue Lagoon Geothermal Spa', category: 'Leisure', cost: 95.0, durationMinutes: 240, imageUrl: 'https://images.unsplash.com/photo-1504233529578-6d46baba6d34?auto=format&fit=crop&w=800&q=80', description: "Soak in silica-rich 38 degree milky-blue geothermal waters surrounded by black lava fields — one of the world's most iconic spa experiences." },
      { name: 'Northern Lights Hunt Tour', category: 'Adventure', cost: 75.0, durationMinutes: 240, imageUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=80', description: 'Chase Aurora Borealis with expert guides who track real-time solar activity, driving to the darkest skies far from the city.' }
    ]
  },
  // ── 11. SYDNEY ────────────────────────────────────────────────────────────
  {
    name: 'Sydney',
    country: 'Australia',
    region: 'Oceania',
    costIndex: 'high',
    popularityScore: 9.6,
    imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1000&q=80',
    description: "Australia's glittering harbour city — the Opera House sails, Bondi's golden sands, Harbour Bridge thrills, and world-class food and wine culture.",
    activities: [
      { name: 'Sydney Opera House Guided Backstage Tour', category: 'Culture', cost: 45.0, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=800&q=80', description: "Go behind the scenes of one of architecture's greatest icons — explore rehearsal rooms, dressing rooms, and the grand concert halls." },
      { name: 'Bondi to Coogee Coastal Cliff Walk', category: 'Adventure', cost: 15.0, durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80', description: 'Trek 6km of dramatic sandstone cliffs, ocean pools, and secluded coves from iconic Bondi Beach to Coogee bay.' },
      { name: 'Sydney Harbour Kayak Tour', category: 'Adventure', cost: 60.0, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?auto=format&fit=crop&w=800&q=80', description: 'Paddle beneath the Harbour Bridge in a guided kayak tour, passing Kirribilli, Admiralty House, and the Opera House at water level.' }
    ]
  },
  // ── 12. CAPE TOWN ─────────────────────────────────────────────────────────
  {
    name: 'Cape Town',
    country: 'South Africa',
    region: 'Africa',
    costIndex: 'medium',
    popularityScore: 9.6,
    imageUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1000&q=80',
    description: 'Where mountains meet the ocean — Table Mountain, penguin beaches, Cape Winelands, and a vibrant multicultural food scene make Cape Town utterly magnetic.',
    activities: [
      { name: 'Table Mountain Aerial Cableway', category: 'Sightseeing', cost: 30.0, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=800&q=80', description: 'Ascend the rotating cable car to the flat-topped summit for 360 degree views over Cape Town, the Atlantic, and Robben Island.' },
      { name: 'Boulders Beach African Penguin Colony', category: 'Sightseeing', cost: 20.0, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1470114716159-e389f8712fda?auto=format&fit=crop&w=800&q=80', description: 'Walk boardwalks through a protected colony of over 2,000 African penguins nesting and swimming at this sheltered granite-boulder beach.' },
      { name: 'Cape Point & Peninsula Day Tour', category: 'Adventure', cost: 55.0, durationMinutes: 480, imageUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=800&q=80', description: "Drive the Cape Peninsula scenic route — Chapman's Peak, Cape Point lighthouse, wild ostriches, and wine tasting in Constantia." }
    ]
  }
];

async function main() {
  console.log('🌍 Seeding GlobeTrotter with 12 global destinations & curated activities...');

  await prisma.communityReview.deleteMany({});
  await prisma.tripSection.deleteMany({});
  await prisma.currencyRate.deleteMany({});
  await prisma.tripChecklistItem.deleteMany({});
  await prisma.expenseItem.deleteMany({});
  await prisma.stopActivity.deleteMany({});
  await prisma.tripStop.deleteMany({});
  await prisma.activity.deleteMany({});
  await prisma.userWishlist.deleteMany({});
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

  console.log(`✅  Created ${CITIES_DATA.length} cities with activities`);

  const paris = createdCities['Paris'];
  const tokyo = createdCities['Tokyo'];

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
  if (parisActs.length >= 2) {
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

  // ── MARCO'S TRIP (Tokyo) ─────────────────────────────────────────────────
  const marcoUser2 = await prisma.user.findUnique({ where: { email: 'marco@globetrotter.com' } });
  if (marcoUser2 && tokyo) {
    const marcoTrip = await prisma.trip.create({
      data: {
        userId: marcoUser2.id,
        title: 'Japan Cultural Deep Dive 2026',
        description: 'Exploring Tokyo and Kyoto — temples, shrines, ramen bars, and digital art.',
        coverImageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80',
        startDate: new Date('2026-10-05'),
        endDate: new Date('2026-10-14'),
        totalBudget: 3200.0,
        isPublic: true,
        shareSlug: 'japan-cultural-deep-dive-2026'
      }
    });

    const tokyoStop = await prisma.tripStop.create({
      data: {
        tripId: marcoTrip.id,
        cityId: tokyo.id,
        orderIndex: 0,
        arrivalDate: new Date('2026-10-05'),
        departureDate: new Date('2026-10-09'),
        stayCost: 380.0,
        transportCost: 150.0
      }
    });

    const tokyoActs = await prisma.activity.findMany({ where: { cityId: tokyo.id } });
    for (let i = 0; i < Math.min(tokyoActs.length, 3); i++) {
      await prisma.stopActivity.create({
        data: {
          tripStopId: tokyoStop.id,
          activityId: tokyoActs[i].id,
          scheduledDate: new Date(`2026-10-0${6 + i}`),
          scheduledTime: i === 0 ? '09:00' : i === 1 ? '13:00' : '18:00',
          customCost: tokyoActs[i].cost,
          orderIndex: i
        }
      });
    }
  }

  // ── COMMUNITY REVIEWS ─────────────────────────────────────────────────────
  const adminU = await prisma.user.findUnique({ where: { email: 'admin@globetrotter.com' } });
  const marcoU = await prisma.user.findUnique({ where: { email: 'marco@globetrotter.com' } });
  await prisma.communityReview.createMany({
    data: [
      {
        userId: demoUser.id,
        cityName: 'Paris',
        rating: 5,
        title: 'Unforgettable Sunset on the Seine River',
        content: 'Watching the Eiffel Tower light up while taking an evening boat cruise was the highlight of our 5-day Paris vacation! The food walk in Le Marais was equally magical.'
      },
      {
        userId: demoUser.id,
        cityName: 'Tokyo',
        rating: 5,
        title: 'Sushi Masterclass in Tsukiji Market',
        content: 'Learned authentic nigiri crafting techniques from a third-generation master chef. TeamLab Borderless was mind-blowing — pure digital art magic!'
      },
      {
        userId: marcoU!.id,
        cityName: 'Rome',
        rating: 5,
        title: 'The Eternal City Never Disappoints',
        content: 'The Colosseum at sunrise is something else entirely. Trastevere food walk was the best value — incredible cacio e pepe and local wine.'
      },
      {
        userId: marcoU!.id,
        cityName: 'Kyoto',
        rating: 5,
        title: 'Fushimi Inari at Dawn — Pure Magic',
        content: 'Arrived at 5:30am to beat the crowds. The torii gates in the early morning mist were absolutely surreal. The tea ceremony was equally moving.'
      },
      {
        userId: demoUser.id,
        cityName: 'Bali',
        rating: 5,
        title: 'Mount Batur Sunrise Changed My Life',
        content: "Watching the sun rise above the clouds from the volcano crater edge — with breakfast cooked on volcanic steam — is a memory I'll carry forever."
      },
      {
        userId: adminU!.id,
        cityName: 'Reykjavik',
        rating: 5,
        title: 'Northern Lights Beyond Words',
        content: 'The Aurora Borealis tour delivered. We drove 90 minutes to pitch-black skies and then the green ribbons just exploded across the entire sky. Indescribable.'
      }
    ]
  });

  console.log('✅  Community reviews seeded');
  console.log('');
  console.log('🎉  Seeding complete!');
  console.log('');
  console.log('   Demo credentials:');
  console.log('   Admin  → admin@globetrotter.com  / Password123!');
  console.log('   User   → elena@globetrotter.com  / Password123!');
  console.log('   User   → marco@globetrotter.com  / Password123!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
