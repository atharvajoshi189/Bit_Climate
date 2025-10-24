// src/lib/storiesData.ts

export interface Story {
  type: 'person' | 'organization' | 'project';
  name: string;
  photo: string;
  description: string;
  wikipediaUrl: string;
}

export const airStories: Story[] = [
  // ... your existing airStories array ...
  {
    type: 'person',
    name: 'Jadav Payeng',
    photo: 'https://www.theblogchatter.com/BeStorified/wp-content/uploads/2022/11/image-sourcewallsdesk.com-3.jpg',
    description: 'Known as the "Forest Man of India", Jadav Payeng single-handedly planted and nurtured a forest reserve spanning 1,360 acres on a barren sandbar in Assam. This monumental decades-long effort was aimed at combating soil erosion, but has had a massive positive impact on the local ecosystem, air quality, and biodiversity, providing a habitat for numerous species.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Jadav_Payeng',
  },
  {
    type: 'project',
    name: "NASA's Aura Satellite",
    photo: '/images/stories/nasa.jpg',
    description: "The Aura satellite is dedicated to studying the Earth's ozone layer, air quality, and climate. Its instruments, such as the OMI, provide invaluable global data on pollutants like nitrogen dioxide (NO₂), helping scientists track pollution sources and understand atmospheric chemistry.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Aura_(satellite)',
  },
  {
    type: 'organization',
    name: 'The Climate Group',
    photo: '/images/stories/climate_group.png',
    description: 'An international non-profit with a mission to accelerate climate action. Their work focuses on driving demand for clean energy and transport, with major initiatives like RE100 (100% renewable electricity) and EV100 (electric transport) to improve air quality.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Climate_Group',
  },
  {
    type: 'person',
    name: 'Dr. Mario Molina',
    photo: '/images/stories/MIT-Mario-Molina-01.jpg',
    description: "A Nobel Prize-winning chemist, Dr. Molina was a pivotal figure who discovered the threat of CFCs to the Earth's ozone layer. His research was instrumental in the creation of the Montreal Protocol, proving that global cooperation can solve atmospheric crises.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Mario_Molina',
  },
];

// --- ADD THIS NEW ARRAY ---
export const waterStories: Story[] = [
  {
    type: 'person',
    name: 'Rajendra Singh',
    photo: '/images/stories/rajendra.jpg',
    description: 'Hailed as the "water man of India", Rajendra Singh is a renowned water conservationist. He won the Stockholm Water Prize in 2015 for his innovative community-based water management and rain harvesting methods, which have revived several rivers and brought water back to thousands of dry villages in Rajasthan.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Rajendra_Singh',
  },
  {
    type: 'person',
    name: 'Afroz Shah',
    photo: '/images/stories/afsoz.jpg',
    description: 'An Indian environmental activist and lawyer, Afroz Shah is best known for organizing the world\'s largest beach clean-up project at Versova Beach in Mumbai. His volunteer-driven movement has cleared millions of kilograms of waste, transforming the coastline and highlighting the global issue of ocean plastic.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Afroz_Shah',
  },
  {
    type: 'organization',
    name: 'The Ocean Cleanup',
    photo: '/images/stories/ocean.jpg',
    description: "A global non-profit developing and scaling technologies to rid the world's oceans of plastic. Their dual strategy involves using long floating barriers to clean up legacy plastic in the Great Pacific Garbage Patch and deploying 'Interceptors' to capture plastic in rivers before it reaches the ocean.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/The_Ocean_Cleanup',
  },
];

// --- AND ADD THIS NEW ARRAY ---
export const landStories: Story[] = [
  {
    type: 'person',
    name: 'Saalumarada Thimmakka',
    photo: '/images/stories/saalumarada.jpg',
    description: 'An Indian environmentalist from Karnataka, who has planted and nurtured more than 8,000 trees, including 385 banyan trees along a 45-km stretch of highway, turning the arid land green. Her lifelong dedication to afforestation serves as a powerful inspiration for grassroots conservation.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Saalumarada_Thimmakka',
  },
  {
    type: 'organization',
    name: 'Green Belt Movement',
    photo: '/images/stories/green.jpg',
    description: "Founded by Nobel laureate Wangari Maathai, the Green Belt Movement is a Kenyan organization that empowers communities, particularly women, to conserve the environment and improve livelihoods. They have planted over 51 million trees in Kenya, helping to restore degraded lands, combat deforestation, and promote sustainable land use.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Green_Belt_Movement',
  },
  {
    type: 'person',
    name: 'Vandana Shiva',
    photo: '/images/stories/vandana.jpg',
    description: "An Indian scholar, environmental activist, and food sovereignty advocate. Vandana Shiva is a prominent figure in the global ecofeminist movement. She founded Navdanya, a movement promoting biodiversity, organic farming, and seed saving, arguing that these practices are essential for restoring soil health and ensuring sustainable land use.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Vandana_Shiva',
  },
];