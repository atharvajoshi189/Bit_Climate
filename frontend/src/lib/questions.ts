// Define the structure of a single question
type Question = {
    question: string;
    options: string[];
    correctAnswer: string;
  };
  
  // Define the structure for all quizzes
  type QuizData = {
    [topic: string]: Question[];
  };
  
  // Yahan apne saare questions add karo
  export const quizzes: QuizData = {
    air: [
      {
        question: "Which gas is the most abundant greenhouse gas in Earth's atmosphere?",
        options: ["Carbon Dioxide (CO2)", "Methane (CH4)", "Water Vapor (H2O)", "Nitrous Oxide (N2O)"],
        correctAnswer: "Water Vapor (H2O)",
      },
      {
        question: "What does AQI stand for?",
        options: ["Air Quality Index", "Atmospheric Quality Indicator", "Air Quotient Index", "Area Quality Inspection"],
        correctAnswer: "Air Quality Index",
      },
      {
        question: "What is the primary source of man-made air pollution in cities?",
        options: ["Volcanoes", "Farming", "Vehicle Emissions", "Forest Fires"],
        correctAnswer: "Vehicle Emissions",
      },
      {
        question: "Which pollutant forms when sunlight reacts with nitrogen oxides and volatile organic compounds (VOCs)?",
        options: ["Carbon Monoxide (CO)", "Sulfur Dioxide (SO2)", "Ground-level Ozone (O3)", "Particulate Matter (PM2.5)"],
        correctAnswer: "Ground-level Ozone (O3)",
      },
      {
        question: "What international agreement aims to limit global warming by reducing greenhouse gas emissions?",
        options: ["Kyoto Protocol", "Montreal Protocol", "Paris Agreement", "Copenhagen Accord"],
        correctAnswer: "Paris Agreement",
      },
      {
        question: "Which of these is a major source of methane (CH4) emissions?",
        options: ["Burning coal", "Livestock digestion (cows)", "Nuclear power plants", "Solar panels"],
        correctAnswer: "Livestock digestion (cows)",
      },
      {
        question: "What does PM2.5 refer to in air quality measurements?",
        options: ["Parts per million of ozone", "Fine particulate matter smaller than 2.5 micrometers", "A type of pollen", "Pressure measurement"],
        correctAnswer: "Fine particulate matter smaller than 2.5 micrometers",
      },
      {
        question: "Acid rain is primarily caused by which two pollutants?",
        options: ["Ozone and CO2", "Sulfur dioxide (SO2) and Nitrogen oxides (NOx)", "Methane and VOCs", "Carbon monoxide and Lead"],
        correctAnswer: "Sulfur dioxide (SO2) and Nitrogen oxides (NOx)",
      },
      {
        question: "What is the term for the long-term shift in global weather patterns?",
        options: ["Weather cycle", "Climate change", "Seasonal variation", "Atmospheric pressure"],
        correctAnswer: "Climate change",
      },
      {
        question: "Which renewable energy source relies on the Earth's internal heat?",
        options: ["Solar power", "Wind power", "Geothermal energy", "Hydropower"],
        correctAnswer: "Geothermal energy",
      },
    ],
    water: [
      {
        question: "What percentage of Earth's water is fresh water?",
        options: ["10%", "50%", "3%", "15%"],
        correctAnswer: "3%",
      },
      {
        question: "What is the main cause of ocean acidification?",
        options: ["Oil spills", "Fish breathing", "Sunlight", "CO2 absorption"],
        correctAnswer: "CO2 absorption",
      },
      {
        question: "Which human activity is a major source of nutrient pollution (eutrophication) in water bodies?",
        options: ["Swimming", "Agricultural runoff (fertilizers)", "Building bridges", "Fishing"],
        correctAnswer: "Agricultural runoff (fertilizers)",
      },
      {
        question: "What is the term for the area of land where all water drains to a common point, like a river or lake?",
        options: ["Water table", "Aquifer", "Watershed (or Catchment)", "Delta"],
        correctAnswer: "Watershed (or Catchment)",
      },
      {
        question: "Which type of water pollution involves harmful microorganisms like bacteria and viruses?",
        options: ["Thermal pollution", "Chemical pollution", "Sediment pollution", "Pathogen pollution"],
        correctAnswer: "Pathogen pollution",
      },
      {
        question: "'Gray water' typically refers to wastewater from which sources?",
        options: ["Toilets only", "Industrial processes", "Showers, sinks, and laundry", "Rainwater runoff"],
        correctAnswer: "Showers, sinks, and laundry",
      },
      {
        question: "What is the process where water turns into vapor and rises into the atmosphere?",
        options: ["Condensation", "Precipitation", "Evaporation", "Transpiration"],
        correctAnswer: "Evaporation",
      },
      {
        question: "What does 'potable water' mean?",
        options: ["Water used for irrigation", "Saltwater", "Water safe for drinking", "Water used in industry"],
        correctAnswer: "Water safe for drinking",
      },
      {
        question: "Which large ocean garbage patch is known for accumulating plastic waste?",
        options: ["Atlantic Garbage Patch", "Indian Ocean Garbage Patch", "Great Pacific Garbage Patch", "Arctic Garbage Patch"],
        correctAnswer: "Great Pacific Garbage Patch",
      },
      {
        question: "What is the primary goal of wastewater treatment plants?",
        options: ["To generate electricity", "To remove pollutants before discharge", "To add salt to water", "To cool down hot water"],
        correctAnswer: "To remove pollutants before discharge",
      },
    ],
    land: [
      {
        question: "What is deforestation?",
        options: ["Planting new trees", "The clearing of forests", "Building on farmland", "A type of soil"],
        correctAnswer: "The clearing of forests",
      },
      {
        question: "Which farming technique helps prevent soil erosion?",
        options: ["Tilling", "Monocropping", "Contour Plowing", "Over-grazing"],
        correctAnswer: "Contour Plowing",
      },
      {
        question: "What is a 'carbon sink'?",
        options: ["A type of engine", "A kitchen appliance", "A place that absorbs more carbon than it releases", "A type of rock"],
        correctAnswer: "A place that absorbs more carbon than it releases",
      },
      {
        question: "Desertification is the process where fertile land becomes...",
        options: ["Forest", "Wetland", "Desert", "Grassland"],
        correctAnswer: "Desert",
      },
      {
        question: "Which of these is a primary driver of habitat loss for wildlife?",
        options: ["National parks", "Sustainable forestry", "Urban sprawl and agriculture", "Ecotourism"],
        correctAnswer: "Urban sprawl and agriculture",
      },
      {
        question: "What is soil salinization, often caused by improper irrigation?",
        options: ["Increase in soil nutrients", "Increase in soil acidity", "Increase in salt concentration in soil", "Increase in soil water content"],
        correctAnswer: "Increase in salt concentration in soil",
      },
      {
        question: "Which type of agriculture focuses on growing crops without synthetic pesticides or fertilizers?",
        options: ["Hydroponics", "Organic farming", "Monoculture", "Industrial agriculture"],
        correctAnswer: "Organic farming",
      },
      {
        question: "What is biodiversity?",
        options: ["The number of buildings in an area", "The variety of life in a particular habitat or ecosystem", "The amount of rainfall", "The type of soil"],
        correctAnswer: "The variety of life in a particular habitat or ecosystem",
      },
      {
        question: "Reforestation refers to the process of...",
        options: ["Cutting down old forests", "Replanting trees in areas where forests were removed", "Building roads through forests", "Studying forest animals"],
        correctAnswer: "Replanting trees in areas where forests were removed",
      },
      {
        question: "Which land use typically has the lowest carbon footprint per square meter?",
        options: ["Urban areas", "Industrial zones", "Intact natural forests", "Intensive farmland"],
        correctAnswer: "Intact natural forests",
      },
    ],
  };