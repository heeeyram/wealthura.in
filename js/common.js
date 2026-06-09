const CONTACT = {
  phone: "9911156655",
  whatsapp: "8851066112",
  email: "expertfinancialconsultancy@gmail.com",
};

const PRODUCTS = [
  ["life-insurance", "Life Insurance"],
  ["health-insurance", "Health Insurance"],
  ["motor-insurance", "Motor Insurance"],
  ["bike-insurance", "Bike Insurance"],
  ["travel-insurance", "Travel Insurance"],
  ["group-health-insurance", "Group Health Insurance"],
  ["corporate-insurance", "Corporate Insurance"],
  ["marine-insurance", "Marine Insurance"],
  ["cyber-insurance", "Cyber Insurance"],
  ["liability-insurance", "Liability Insurance"],
  ["property-insurance", "Property Insurance"],
];

const productNotes = {
  "life-insurance": "Term plans, savings plans and protection-led wealth planning from leading life insurers including Tata AIA options.",
  "health-insurance": "Individual and family health plans with hospital network, room rent, restoration and claim support guidance.",
  "motor-insurance": "Private car insurance advisory for own damage, third-party cover, add-ons and renewal comparisons.",
  "bike-insurance": "Two-wheeler insurance guidance with practical add-ons, quick renewals and claims coordination.",
  "travel-insurance": "Domestic and international travel cover for medical emergencies, baggage and trip-related risks.",
  "group-health-insurance": "Employee health benefits for SMEs, startups and HR teams with plan design support.",
  "corporate-insurance": "Business insurance advisory across employee benefits, liability, property and specialist risk covers.",
  "marine-insurance": "Transit and cargo insurance guidance for importers, exporters, distributors and logistics teams.",
  "cyber-insurance": "Cyber risk cover advisory for startups, SMEs and digital-first businesses handling sensitive data.",
  "liability-insurance": "Professional indemnity, public liability and other risk covers for businesses and professionals.",
  "property-insurance": "Protection planning for offices, shops, factories, homes and commercial assets."
};

const productIcons = {
  "life-insurance": "life.png",
  "health-insurance": "health.png",
  "motor-insurance": "motor.png",
  "bike-insurance": "bike.png",
  "travel-insurance": "travel.png",
  "group-health-insurance": "group.png",
  "corporate-insurance": "corporate.png",
  "marine-insurance": "marine.png",
  "cyber-insurance": "cyber.png",
  "liability-insurance": "liability.png",
  "property-insurance": "property.png",
};

/* ── Premium Calculator Rate Tables (Market-Calibrated 2024-25) ── */

const CALC_CONFIGS = {
  "Health Insurance": {
    fields: [
      { id: "calcAge", label: "Age of Eldest Member", type: "range", min: 18, max: 65, value: 30, unit: "years" },
      { id: "calcFamily", label: "Coverage For", type: "select", options: [["self","Self Only"],["couple","Self + Spouse"],["family","Family (2A + 2C)"],["parents","Parents"]] },
      { id: "calcCover", label: "Sum Insured", type: "range", min: 3, max: 100, step: 1, value: 10, unit: "lakh", prefix: "₹" },
      { id: "calcCity", label: "City Tier", type: "select", options: [["metro","Metro (Delhi, Mumbai, Bangalore)"],["tier1","Tier 1"],["tier2","Tier 2 & Below"]] },
      { id: "calcFreq", label: "Payment Mode", type: "select", options: [["1","Yearly"],["2","Half-Yearly"],["12","Monthly"]] },
    ],
    calc(v) {
      const age = +v.calcAge;
      const cover = +v.calcCover;
      const family = v.calcFamily;
      const city = v.calcCity;
      const freq = +v.calcFreq;
      // Base premium for ₹5L cover, age 30, self only (market: ₹5,500-8,000)
      const baseFor5L = 6200;
      // Cover scaling (non-linear — higher covers are proportionally cheaper)
      const coverFactor = cover <= 5 ? (cover / 5) : (1 + Math.log(cover / 5) * 0.7);
      // Age factor
      let ageFactor = 1;
      if (age <= 25) ageFactor = 0.85;
      else if (age <= 35) ageFactor = 1.0;
      else if (age <= 45) ageFactor = 1.45;
      else if (age <= 55) ageFactor = 2.1;
      else ageFactor = 3.0;
      // Family multiplier
      const familyMult = { self: 1, couple: 1.75, family: 2.2, parents: 2.5 }[family];
      // City loading
      const cityMult = { metro: 1.12, tier1: 1.0, tier2: 0.92 }[city];
      const annualBase = Math.round(baseFor5L * coverFactor * ageFactor * familyMult * cityMult);
      const gst = Math.round(annualBase * 0.18);
      const annual = annualBase + gst;
      const perFreq = Math.round(annual / freq);
      const taxBenefit80D = Math.min(annualBase, age >= 60 ? 50000 : 25000);
      return {
        base: annualBase, gst, total: annual, perFreq, freq,
        taxSection: "80D", taxBenefit: taxBenefit80D,
        coverLabel: `₹${cover} Lakh`, termLabel: "1 Year (Renewable)"
      };
    }
  },

  "Motor Insurance": {
    fields: [
      { id: "calcIDV", label: "Car Value (IDV)", type: "range", min: 100000, max: 3000000, step: 50000, value: 600000, unit: "", prefix: "₹" },
      { id: "calcCarAge", label: "Car Age", type: "select", options: [["0","Brand New"],["1","1 Year"],["2","2 Years"],["3","3 Years"],["5","4-5 Years"],["8","6-8 Years"],["10","9-10 Years"]] },
      { id: "calcFuel", label: "Fuel Type", type: "toggle", options: ["Petrol", "Diesel", "EV"] },
      { id: "calcCoverType", label: "Cover Type", type: "select", options: [["comp","Comprehensive"],["tp","Third Party Only"],["od","Own Damage Only"]] },
      { id: "calcNCB", label: "NCB Discount", type: "select", options: [["0","No NCB (0%)"],["20","20% (1 yr claim-free)"],["25","25% (2 yrs)"],["35","35% (3 yrs)"],["45","45% (4 yrs)"],["50","50% (5+ yrs)"]] },
    ],
    calc(v) {
      const idv = +v.calcIDV;
      const carAge = +v.calcCarAge;
      const fuel = v.calcFuel;
      const coverType = v.calcCoverType;
      const ncb = +v.calcNCB;
      // Third Party premium (IRDAI fixed 2024-25)
      // Private cars ≤1000cc: ₹2,094, 1000-1500cc: ₹3,416, >1500cc: ₹7,897
      // We'll use a mid-range estimate based on IDV
      let tpPremium;
      if (idv <= 500000) tpPremium = 2094;
      else if (idv <= 1000000) tpPremium = 3416;
      else tpPremium = 7897;
      // Own Damage premium: percentage of IDV
      const odRateBase = 0.028; // ~2.8% base rate
      const ageFactor = carAge === 0 ? 1.0 : carAge <= 2 ? 0.95 : carAge <= 5 ? 0.88 : 0.80;
      const fuelMult = fuel === "Diesel" ? 1.08 : fuel === "EV" ? 0.85 : 1.0;
      let odPremium = Math.round(idv * odRateBase * ageFactor * fuelMult);
      // Apply NCB discount to OD
      odPremium = Math.round(odPremium * (1 - ncb / 100));
      let annualBase;
      if (coverType === "tp") annualBase = tpPremium;
      else if (coverType === "od") annualBase = odPremium;
      else annualBase = tpPremium + odPremium;
      const gst = Math.round(annualBase * 0.18);
      const annual = annualBase + gst;
      return {
        base: annualBase, gst, total: annual, perFreq: annual, freq: 1,
        taxSection: null, taxBenefit: 0,
        coverLabel: `IDV ₹${(idv/100000).toFixed(1)} L`, termLabel: "1 Year",
        extras: [
          { label: "Own Damage", value: coverType === "tp" ? "N/A" : `₹${odPremium.toLocaleString("en-IN")}` },
          { label: "Third Party", value: coverType === "od" ? "N/A" : `₹${tpPremium.toLocaleString("en-IN")}` },
          { label: "NCB Applied", value: `${ncb}%` },
        ]
      };
    }
  },

  "Bike Insurance": {
    fields: [
      { id: "calcCC", label: "Engine CC", type: "select", options: [["75","Up to 75cc (Scooter)"],["150","75-150cc"],["350","150-350cc"],["500","Above 350cc"]] },
      { id: "calcIDV", label: "Bike Value (IDV)", type: "range", min: 20000, max: 500000, step: 5000, value: 80000, unit: "", prefix: "₹" },
      { id: "calcBikeAge", label: "Bike Age", type: "select", options: [["0","Brand New"],["1","1 Year"],["2","2 Years"],["3","3-4 Years"],["5","5+ Years"]] },
      { id: "calcCoverType", label: "Cover Type", type: "select", options: [["comp","Comprehensive"],["tp","Third Party Only"]] },
      { id: "calcNCB", label: "NCB Discount", type: "select", options: [["0","No NCB (0%)"],["20","20%"],["25","25%"],["35","35%"],["45","45%"],["50","50%"]] },
    ],
    calc(v) {
      const cc = +v.calcCC;
      const idv = +v.calcIDV;
      const bikeAge = +v.calcBikeAge;
      const coverType = v.calcCoverType;
      const ncb = +v.calcNCB;
      // IRDAI Third Party rates 2024-25
      let tpPremium;
      if (cc <= 75) tpPremium = 538;
      else if (cc <= 150) tpPremium = 714;
      else if (cc <= 350) tpPremium = 1366;
      else tpPremium = 2804;
      // OD rate: ~2.5% of IDV
      const odRate = 0.025;
      const ageFactor = bikeAge === 0 ? 1.0 : bikeAge <= 2 ? 0.93 : 0.85;
      let odPremium = Math.round(idv * odRate * ageFactor);
      odPremium = Math.round(odPremium * (1 - ncb / 100));
      let annualBase;
      if (coverType === "tp") annualBase = tpPremium;
      else annualBase = tpPremium + odPremium;
      const gst = Math.round(annualBase * 0.18);
      const annual = annualBase + gst;
      return {
        base: annualBase, gst, total: annual, perFreq: annual, freq: 1,
        taxSection: null, taxBenefit: 0,
        coverLabel: `IDV ₹${(idv/1000).toFixed(0)}K`, termLabel: "1 Year",
        extras: [
          { label: "Own Damage", value: coverType === "tp" ? "N/A" : `₹${odPremium.toLocaleString("en-IN")}` },
          { label: "Third Party", value: `₹${tpPremium.toLocaleString("en-IN")}` },
        ]
      };
    }
  },

  "Travel Insurance": {
    fields: [
      { id: "calcDest", label: "Destination", type: "select", options: [["asia","Asia (excl. Japan)"],["europe","Europe / UK"],["usa","USA / Canada"],["world","Worldwide"],["domestic","Domestic India"]] },
      { id: "calcDays", label: "Trip Duration", type: "range", min: 3, max: 180, value: 14, unit: "days" },
      { id: "calcAge", label: "Traveller Age", type: "range", min: 1, max: 70, value: 30, unit: "years" },
      { id: "calcCover", label: "Cover Amount", type: "select", options: [["50000","$50,000"],["100000","$100,000"],["250000","$250,000"],["500000","$500,000"]] },
      { id: "calcTravellers", label: "No. of Travellers", type: "range", min: 1, max: 8, value: 1, unit: "" },
    ],
    calc(v) {
      const dest = v.calcDest;
      const days = +v.calcDays;
      const age = +v.calcAge;
      const cover = +v.calcCover;
      const travellers = +v.calcTravellers;
      // Base daily rate (INR) for $100K cover, age 30
      const destRates = { domestic: 45, asia: 120, europe: 180, usa: 250, world: 210 };
      const baseDaily = destRates[dest] || 150;
      // Age factor
      let ageFactor = 1;
      if (age <= 25) ageFactor = 0.9;
      else if (age <= 40) ageFactor = 1.0;
      else if (age <= 55) ageFactor = 1.4;
      else ageFactor = 2.0;
      // Cover factor
      const coverFactor = cover <= 50000 ? 0.7 : cover <= 100000 ? 1.0 : cover <= 250000 ? 1.6 : 2.2;
      // Duration: slight daily discount for longer trips
      const durationFactor = days <= 7 ? 1.0 : days <= 30 ? 0.9 : 0.8;
      const perPerson = Math.round(baseDaily * days * ageFactor * coverFactor * durationFactor);
      const annualBase = perPerson * travellers;
      const gst = Math.round(annualBase * 0.18);
      const annual = annualBase + gst;
      return {
        base: annualBase, gst, total: annual, perFreq: annual, freq: 1,
        taxSection: null, taxBenefit: 0,
        coverLabel: dest === "domestic" ? `₹${(cover*0.012).toFixed(0)}K` : `$${(cover/1000).toFixed(0)}K`,
        termLabel: `${days} Days`,
        extras: travellers > 1 ? [{ label: "Per Person", value: `₹${perPerson.toLocaleString("en-IN")}` }] : undefined
      };
    }
  },

  "Group Health Insurance": {
    fields: [
      { id: "calcEmployees", label: "No. of Employees", type: "range", min: 5, max: 500, step: 5, value: 25, unit: "" },
      { id: "calcCover", label: "Cover per Employee", type: "select", options: [["300000","₹3 Lakh"],["500000","₹5 Lakh"],["1000000","₹10 Lakh"],["2500000","₹25 Lakh"]] },
      { id: "calcAvgAge", label: "Average Employee Age", type: "select", options: [["25","25-30 years"],["32","30-35 years"],["38","35-40 years"],["45","40-50 years"]] },
      { id: "calcFamily", label: "Coverage Scope", type: "select", options: [["emp","Employee Only"],["empsp","Employee + Spouse"],["empfam","Employee + Family"]] },
    ],
    calc(v) {
      const employees = +v.calcEmployees;
      const cover = +v.calcCover;
      const avgAge = +v.calcAvgAge;
      const family = v.calcFamily;
      // Base rate per employee for ₹3L cover, age 30, employee only
      const basePerEmp = 3800;
      const coverFactor = cover <= 300000 ? 1 : cover <= 500000 ? 1.4 : cover <= 1000000 ? 2.0 : 3.2;
      const ageFactor = avgAge <= 30 ? 1.0 : avgAge <= 35 ? 1.2 : avgAge <= 40 ? 1.5 : 2.0;
      const familyMult = { emp: 1, empsp: 1.8, empfam: 2.6 }[family];
      // Volume discount for large groups
      const volDiscount = employees >= 200 ? 0.85 : employees >= 100 ? 0.9 : employees >= 50 ? 0.95 : 1.0;
      const perEmp = Math.round(basePerEmp * coverFactor * ageFactor * familyMult * volDiscount);
      const annualBase = perEmp * employees;
      const gst = Math.round(annualBase * 0.18);
      const annual = annualBase + gst;
      return {
        base: annualBase, gst, total: annual, perFreq: annual, freq: 1,
        taxSection: "Business Expense", taxBenefit: annualBase,
        coverLabel: `₹${(cover/100000).toFixed(0)} L / employee`, termLabel: "1 Year",
        extras: [
          { label: "Per Employee", value: `₹${perEmp.toLocaleString("en-IN")}/yr` },
          { label: "Employees", value: employees },
          { label: "Volume Discount", value: volDiscount < 1 ? `${Math.round((1-volDiscount)*100)}%` : "—" },
        ]
      };
    }
  },

  "Corporate Insurance": {
    fields: [
      { id: "calcAssetValue", label: "Insured Asset Value", type: "range", min: 10, max: 500, step: 10, value: 50, unit: "lakh", prefix: "₹" },
      { id: "calcIndustry", label: "Industry", type: "select", options: [["it","IT / Services"],["mfg","Manufacturing"],["retail","Retail / Trading"],["construction","Construction"],["food","Food & Hospitality"]] },
      { id: "calcCoverType", label: "Cover Required", type: "select", options: [["fire","Fire & Burglary"],["all","All Risk"],["package","SME Package"]] },
    ],
    calc(v) {
      const assetValue = +v.calcAssetValue * 100000;
      const industry = v.calcIndustry;
      const coverType = v.calcCoverType;
      const indRates = { it: 0.0018, mfg: 0.0035, retail: 0.0025, construction: 0.004, food: 0.003 };
      const coverMult = { fire: 1, all: 1.6, package: 2.2 }[coverType];
      const rate = (indRates[industry] || 0.0025) * coverMult;
      const annualBase = Math.max(2500, Math.round(assetValue * rate));
      const gst = Math.round(annualBase * 0.18);
      const annual = annualBase + gst;
      return {
        base: annualBase, gst, total: annual, perFreq: annual, freq: 1,
        taxSection: "Business Expense", taxBenefit: annualBase,
        coverLabel: `₹${(assetValue/100000).toFixed(0)} Lakh`, termLabel: "1 Year"
      };
    }
  },

  "Marine Insurance": {
    fields: [
      { id: "calcCargoValue", label: "Cargo / Shipment Value", type: "range", min: 5, max: 500, step: 5, value: 50, unit: "lakh", prefix: "₹" },
      { id: "calcRoute", label: "Transit Route", type: "select", options: [["inland","Inland (India)"],["coastal","Coastal"],["international","International"]] },
      { id: "calcCargo", label: "Cargo Type", type: "select", options: [["general","General Goods"],["fragile","Fragile / Perishable"],["hazardous","Hazardous"],["machinery","Machinery / Equipment"]] },
      { id: "calcPolicy", label: "Policy Type", type: "select", options: [["single","Single Transit"],["open","Open Policy (Annual)"]] },
    ],
    calc(v) {
      const value = +v.calcCargoValue * 100000;
      const route = v.calcRoute;
      const cargo = v.calcCargo;
      const policy = v.calcPolicy;
      const routeRates = { inland: 0.0008, coastal: 0.0012, international: 0.002 };
      const cargoMult = { general: 1, fragile: 1.5, hazardous: 2.0, machinery: 1.3 };
      const rate = (routeRates[route] || 0.0012) * (cargoMult[cargo] || 1);
      let annualBase = Math.max(1500, Math.round(value * rate));
      if (policy === "open") annualBase = Math.round(annualBase * 8);
      const gst = Math.round(annualBase * 0.18);
      const annual = annualBase + gst;
      return {
        base: annualBase, gst, total: annual, perFreq: annual, freq: 1,
        taxSection: "Business Expense", taxBenefit: annualBase,
        coverLabel: `₹${(value/100000).toFixed(0)} Lakh`, termLabel: policy === "open" ? "1 Year (Open)" : "Single Transit"
      };
    }
  },

  "Cyber Insurance": {
    fields: [
      { id: "calcRevenue", label: "Annual Revenue", type: "range", min: 10, max: 500, step: 10, value: 50, unit: "lakh", prefix: "₹" },
      { id: "calcCover", label: "Cover Amount", type: "select", options: [["1000000","₹10 Lakh"],["2500000","₹25 Lakh"],["5000000","₹50 Lakh"],["10000000","₹1 Crore"]] },
      { id: "calcIndustry", label: "Business Type", type: "select", options: [["ecom","E-commerce / Fintech"],["it","IT / SaaS"],["healthcare","Healthcare"],["retail","Retail / Trading"],["other","Other"]] },
      { id: "calcDataRecords", label: "Data Records Handled", type: "select", options: [["small","< 10,000"],["medium","10,000 - 1 Lakh"],["large","1 Lakh - 10 Lakh"],["xlarge","> 10 Lakh"]] },
    ],
    calc(v) {
      const revenue = +v.calcRevenue * 100000;
      const cover = +v.calcCover;
      const industry = v.calcIndustry;
      const records = v.calcDataRecords;
      const indRisk = { ecom: 1.5, it: 1.2, healthcare: 1.8, retail: 1.0, other: 1.0 };
      const dataRisk = { small: 1, medium: 1.3, large: 1.6, xlarge: 2.0 };
      const baseRate = 0.012;
      const rate = baseRate * (indRisk[industry] || 1) * (dataRisk[records] || 1);
      const annualBase = Math.max(8000, Math.round(cover * rate));
      const gst = Math.round(annualBase * 0.18);
      const annual = annualBase + gst;
      return {
        base: annualBase, gst, total: annual, perFreq: annual, freq: 1,
        taxSection: "Business Expense", taxBenefit: annualBase,
        coverLabel: `₹${(cover/100000).toFixed(0)} Lakh`, termLabel: "1 Year"
      };
    }
  },

  "Liability Insurance": {
    fields: [
      { id: "calcProfession", label: "Profession / Industry", type: "select", options: [["doctor","Doctor / Healthcare"],["lawyer","Lawyer / Legal"],["ca","CA / Financial Advisor"],["it","IT Consultant / Developer"],["architect","Architect / Engineer"],["director","Director / Officer"]] },
      { id: "calcCover", label: "Cover Amount", type: "select", options: [["500000","₹5 Lakh"],["1000000","₹10 Lakh"],["2500000","₹25 Lakh"],["5000000","₹50 Lakh"],["10000000","₹1 Crore"]] },
      { id: "calcExperience", label: "Years of Experience", type: "select", options: [["2","0-2 Years"],["5","3-5 Years"],["10","5-10 Years"],["15","10+ Years"]] },
    ],
    calc(v) {
      const profession = v.calcProfession;
      const cover = +v.calcCover;
      const exp = +v.calcExperience;
      const profRates = { doctor: 0.018, lawyer: 0.012, ca: 0.01, it: 0.008, architect: 0.014, director: 0.02 };
      const expDiscount = exp >= 10 ? 0.85 : exp >= 5 ? 0.92 : 1.0;
      const rate = (profRates[profession] || 0.012) * expDiscount;
      const annualBase = Math.max(3000, Math.round(cover * rate));
      const gst = Math.round(annualBase * 0.18);
      const annual = annualBase + gst;
      return {
        base: annualBase, gst, total: annual, perFreq: annual, freq: 1,
        taxSection: "Business Expense", taxBenefit: annualBase,
        coverLabel: `₹${(cover/100000).toFixed(0)} Lakh`, termLabel: "1 Year"
      };
    }
  },

  "Property Insurance": {
    fields: [
      { id: "calcPropertyValue", label: "Property Value", type: "range", min: 10, max: 1000, step: 10, value: 100, unit: "lakh", prefix: "₹" },
      { id: "calcPropertyType", label: "Property Type", type: "select", options: [["office","Office / IT Park"],["shop","Shop / Showroom"],["factory","Factory / Warehouse"],["home","Residential / Home"],["land","Land / Plot"]] },
      { id: "calcCoverType", label: "Cover Type", type: "select", options: [["fire","Fire & Allied Perils"],["burglary","Burglary & Theft"],["all","All Risk (Comprehensive)"]] },
      { id: "calcConstruction", label: "Construction Type", type: "select", options: [["rcc","RCC / Pucca"],["semi","Semi-Pucca"],["kutcha","Kutcha / Temporary"]] },
    ],
    calc(v) {
      const propValue = +v.calcPropertyValue * 100000;
      const propType = v.calcPropertyType;
      const coverType = v.calcCoverType;
      const construction = v.calcConstruction;
      const propRates = { office: 0.001, shop: 0.0014, factory: 0.002, home: 0.0008, land: 0.0005 };
      const coverMult = { fire: 1, burglary: 0.8, all: 1.8 }[coverType];
      const constMult = { rcc: 1, semi: 1.3, kutcha: 1.8 }[construction];
      const rate = (propRates[propType] || 0.001) * coverMult * constMult;
      const annualBase = Math.max(2000, Math.round(propValue * rate));
      const gst = Math.round(annualBase * 0.18);
      const annual = annualBase + gst;
      return {
        base: annualBase, gst, total: annual, perFreq: annual, freq: 1,
        taxSection: "Business Expense", taxBenefit: annualBase,
        coverLabel: `₹${(propValue/100000).toFixed(0)} Lakh`, termLabel: "1 Year"
      };
    }
  },
};

/* ── Utility Functions ── */

function basePath() {
  return window.location.pathname.includes("/pages/") ? "../" : "";
}

function imagePath(file) {
  return `${basePath()}images/${file}`;
}

function iconMarkup(file, label) {
  return `<span class="icon"><img src="${imagePath(file)}" alt="${label}" loading="lazy"></span>`;
}

function pageSlug() {
  const file = window.location.pathname.split("/").pop() || "index.html";
  return file.replace(".html", "");
}

function fmtINR(n) {
  return "₹" + n.toLocaleString("en-IN");
}

/* ── Navigation, Footer, Floating Actions ── */

function navMarkup() {
  const base = basePath();
  const links = [
    [base + "index.html", "Home", "index"],
    [base + "pages/about.html", "About", "about"],
    [base + "pages/life-insurance.html", "Insurance", "life-insurance"],
    [base + "pages/insurance-partners.html", "Partners", "insurance-partners"],
    [base + "pages/claims-assistance.html", "Claims", "claims-assistance"],
    [base + "pages/advisor-opportunity.html", "Advisor", "advisor-opportunity"],
    [base + "pages/blog.html", "Blog", "blog"],
    [base + "pages/contact.html", "Contact", "contact"],
  ];
  const slug = pageSlug();
  return `
    <div class="top-strip">
      <div class="container">
        <span>Insurance advisory across life, health, motor, corporate and specialist risk covers</span>
        <span><a href="tel:${CONTACT.phone}">Call ${CONTACT.phone}</a> | <a href="mailto:${CONTACT.email}">${CONTACT.email}</a></span>
      </div>
    </div>
    <header class="site-header" id="siteHeader">
      <div class="container nav-wrap">
        <a class="brand" href="${base}index.html" aria-label="Wealthura home">
          <span class="brand-mark"><img src="${imagePath("wealthura logo.jpg")}" alt="Wealthura logo"></span><span>Wealthura</span>
        </a>
        <button class="nav-toggle" type="button" aria-label="Open navigation" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
        <nav class="site-nav" aria-label="Primary navigation">
          ${links.map(([href, label, key]) => `<a class="${slug === key ? "is-active" : ""}" href="${href}">${label}</a>`).join("")}
        </nav>
        <div class="nav-cta">
          <a class="btn btn-ghost" href="tel:${CONTACT.phone}"><img src="${imagePath("phone-logo.svg")}" alt="">Call</a>
          <a class="btn btn-primary" href="https://wa.me/91${CONTACT.whatsapp}?text=Hi%20Wealthura%2C%20I%20need%20insurance%20guidance." target="_blank" rel="noopener"><img src="${imagePath("whatsapp-logo.svg")}" alt="">WhatsApp</a>
        </div>
      </div>
    </header>
  `;
}

function footerMarkup() {
  const base = basePath();
  return `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <a class="brand" href="${base}index.html"><span class="brand-mark"><img src="${imagePath("wealthura logo.jpg")}" alt="Wealthura logo"></span><span style="color:#fff">Wealthura</span></a>
            <p>Trusted insurance advisory for individuals, families, professionals and businesses. Compare options from multiple insurers and choose suitable protection with expert guidance.</p>
          </div>
          <div>
            <h3>Insurance</h3>
            <div class="footer-links">
              ${PRODUCTS.slice(0, 6).map(([slug, name]) => `<a href="${base}pages/${slug}.html">${name}</a>`).join("")}
            </div>
          </div>
          <div>
            <h3>Business</h3>
            <div class="footer-links">
              ${PRODUCTS.slice(6).map(([slug, name]) => `<a href="${base}pages/${slug}.html">${name}</a>`).join("")}
              <a href="${base}pages/advisor-opportunity.html">Insurance Advisor Opportunity</a>
            </div>
          </div>
          <div>
            <h3>Contact</h3>
            <div class="footer-links">
              <a href="tel:${CONTACT.phone}">${CONTACT.phone}</a>
              <a href="https://wa.me/91${CONTACT.whatsapp}" target="_blank" rel="noopener">WhatsApp ${CONTACT.whatsapp}</a>
              <a href="mailto:${CONTACT.email}">${CONTACT.email}</a>
              <span>Ground Floor, Pearl Omaxe Plaza, Netaji Subhash Place, Pitampura, New Delhi, Delhi 110034</span>
            </div>
          </div>
        </div>
        <div class="footer-bottom">(c) ${new Date().getFullYear()} Wealthura. Insurance advisory services. Product selection is subject to insurer underwriting, terms and conditions.</div>
      </div>
    </footer>
  `;
}

function floatingActions() {
  return `
    <div class="floating-actions" aria-label="Quick contact actions">
      <a class="float-btn float-whatsapp" href="https://wa.me/91${CONTACT.whatsapp}?text=Hi%20Wealthura%2C%20I%20need%20insurance%20guidance." target="_blank" rel="noopener" aria-label="WhatsApp Wealthura"><img src="${imagePath("whatsapp-logo.svg")}" alt=""></a>
      <a class="float-btn float-call" href="tel:${CONTACT.phone}" aria-label="Call Wealthura"><img src="${imagePath("phone-logo.svg")}" alt=""></a>
    </div>
  `;
}

/* ── Lead Form ── */

function leadFormMarkup(type = "") {
  const options = PRODUCTS.map(([, name]) => `<option ${name === type ? "selected" : ""}>${name}</option>`).join("");
  return `
    <form class="lead-form form-grid" novalidate>
      <div class="field"><label>Name*</label><input name="name" autocomplete="name" required><span class="error">Please enter your name.</span></div>
      <div class="field"><label>Mobile*</label><input name="mobile" inputmode="numeric" autocomplete="tel" required pattern="[0-9]{10}"><span class="error">Enter a valid 10 digit mobile number.</span></div>
      <div class="field"><label>Email</label><input name="email" type="email" autocomplete="email"><span class="error">Enter a valid email address.</span></div>
      <div class="field"><label>City*</label><input name="city" autocomplete="address-level2" required><span class="error">Please enter your city.</span></div>
      <div class="field"><label>Insurance Type*</label><select name="insuranceType" required><option value="">Select insurance type</option>${options}</select><span class="error">Select an insurance type.</span></div>
      <button class="btn btn-primary" type="submit">Request Quote</button>
      <div class="form-success">Thank you. Wealthura will contact you shortly.</div>
    </form>
  `;
}

function advisorFormMarkup() {
  return `
    <form class="lead-form form-grid" novalidate>
      <div class="field"><label>Name*</label><input name="name" autocomplete="name" required><span class="error">Please enter your name.</span></div>
      <div class="field"><label>Mobile*</label><input name="mobile" inputmode="numeric" autocomplete="tel" required pattern="[0-9]{10}"><span class="error">Enter a valid 10 digit mobile number.</span></div>
      <div class="field"><label>Email*</label><input name="email" type="email" autocomplete="email" required><span class="error">Enter a valid email address.</span></div>
      <div class="field"><label>City*</label><input name="city" required><span class="error">Please enter your city.</span></div>
      <div class="field"><label>Current Occupation*</label><input name="occupation" required><span class="error">Please enter your occupation.</span></div>
      <button class="btn btn-primary" type="submit">Apply Now</button>
      <div class="form-success">Application received. Our advisor team will connect with you.</div>
    </form>
  `;
}

/* ── Premium Calculator (Market-Accurate) ── */

function renderCalcField(f) {
  if (f.type === "toggle") {
    return `
      <div class="calc-field" data-id="${f.id}">
        <label class="calc-label">${f.label}</label>
        <div class="calc-toggle-group" data-for="${f.id}">
          ${f.options.map((opt, i) => `<button type="button" class="calc-toggle-btn${i === 0 ? " is-active" : ""}" data-value="${opt}">${opt}</button>`).join("")}
        </div>
      </div>`;
  }
  if (f.type === "range") {
    const displayVal = f.prefix ? `${f.prefix}${f.value.toLocaleString("en-IN")}` : f.value;
    return `
      <div class="calc-field" data-id="${f.id}">
        <label class="calc-label">${f.label}: <strong class="calc-range-val" data-display="${f.id}">${displayVal}</strong> <span class="calc-range-unit">${f.unit || ""}</span></label>
        <div class="calc-slider-wrap">
          <input type="range" id="${f.id}" min="${f.min}" max="${f.max}" step="${f.step || 1}" value="${f.value}" class="calc-slider">
          <div class="calc-slider-track"><div class="calc-slider-fill"></div></div>
        </div>
      </div>`;
  }
  if (f.type === "select") {
    const opts = f.options.map(o => {
      const [val, label] = Array.isArray(o) ? o : [o, o];
      return `<option value="${val}">${label}</option>`;
    }).join("");
    return `
      <div class="calc-field" data-id="${f.id}">
        <label class="calc-label" for="${f.id}">${f.label}</label>
        <select id="${f.id}" class="calc-select">${opts}</select>
      </div>`;
  }
  return "";
}

function calculatorMarkup() {
  const typeOptions = Object.keys(CALC_CONFIGS).map(name => `<option value="${name}">${name}</option>`).join("");
  const firstType = Object.keys(CALC_CONFIGS)[0];
  const firstConfig = CALC_CONFIGS[firstType];

  return `
    <div class="pcalc" id="premium-calculator">
      <div class="pcalc-header">
        <div class="pcalc-badge">Premium Calculator</div>
        <h3 class="pcalc-title">Calculate Your Insurance Premium</h3>
        <p class="pcalc-subtitle">Get market-accurate estimates instantly</p>
      </div>

      <div class="pcalc-type-selector">
        <label class="calc-label" for="calcInsuranceType">Insurance Type</label>
        <select id="calcInsuranceType" class="calc-select calc-type-select">${typeOptions}</select>
      </div>

      <div class="pcalc-body">
        <div class="pcalc-inputs" id="calcInputs">
          ${firstConfig.fields.map(f => renderCalcField(f)).join("")}
        </div>

        <div class="pcalc-results" id="calcResults">
          <div class="pcalc-result-card">
            <div class="pcalc-result-top">
              <span class="pcalc-result-label">Estimated Premium</span>
              <span class="pcalc-result-amount" id="calcResultAmount">₹0</span>
              <span class="pcalc-result-freq" id="calcResultFreq">per year</span>
            </div>
            <div class="pcalc-breakdown" id="calcBreakdown">
              <div class="pcalc-breakdown-row">
                <span>Base Premium</span>
                <span id="calcBase">₹0</span>
              </div>
              <div class="pcalc-breakdown-row">
                <span>GST (18%)</span>
                <span id="calcGST">₹0</span>
              </div>
              <div class="pcalc-breakdown-row pcalc-row-total">
                <span>Total Annual</span>
                <span id="calcTotal">₹0</span>
              </div>
            </div>
            <div class="pcalc-extras" id="calcExtras"></div>
            <div class="pcalc-tax" id="calcTax"></div>
            <div class="pcalc-cover-info" id="calcCoverInfo">
              <span id="calcCoverLabel"></span>
              <span id="calcTermLabel"></span>
            </div>
          </div>
          <div class="pcalc-disclaimer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            Indicative estimate only. Final premium depends on insurer underwriting, medicals, plan features and applicable GST.
          </div>
          <a class="btn btn-primary pcalc-cta" href="https://wa.me/91${CONTACT.whatsapp}?text=Hi%20Wealthura%2C%20I%20need%20a%20premium%20quote." target="_blank" rel="noopener">Get Exact Quote on WhatsApp</a>
        </div>
      </div>
    </div>
  `;
}

/* ── Product Page Sections ── */

function productSections(slug, title) {
  const note = productNotes[slug] || "Insurance advisory designed around your needs, risk profile and budget.";
  return `
    <section class="section">
      <div class="container split">
        <div class="reveal">
          ${iconMarkup(productIcons[slug] || "icon-partners.svg", `${title} logo`)}
          <span class="eyebrow">Overview</span>
          <h2>${title} Advisory</h2>
          <p class="lead">${note} Wealthura helps you compare products from multiple leading insurers and choose cover that fits your requirements.</p>
          <ul class="feature-list">
            <li>Needs analysis before product recommendation</li>
            <li>Comparison support across insurer features and exclusions</li>
            <li>Guidance for documentation, renewal and claims</li>
          </ul>
        </div>
        <div class="form-panel reveal">
          <h3>Get a ${title} Quote</h3>
          ${leadFormMarkup(title)}
        </div>
      </div>
    </section>
    <section class="section section-soft">
      <div class="container">
        <div class="section-head center reveal"><span class="eyebrow">Plan Details</span><h2>Benefits and Key Features</h2></div>
        <div class="grid grid-3">
          ${[
            ["icon-partners.svg", "Multiple insurer options"],
            ["icon-support.svg", "Transparent feature comparison"],
            ["icon-claims.svg", "Claim and renewal assistance"]
          ].map(([file, item]) => `<div class="card reveal">${iconMarkup(file, item)}<h3>${item}</h3><p>Get practical guidance from enquiry to policy servicing, with recommendations aligned to your budget and risk profile.</p></div>`).join("")}
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container grid grid-2">
        <div class="card reveal"><h3>Eligibility</h3><p>Eligibility depends on age, occupation, health declarations, income, business type, asset details and insurer underwriting rules.</p></div>
        <div class="card reveal"><h3>Claim Support</h3><p>Wealthura assists with claim intimation, document checklists, insurer coordination and status follow-up where applicable.</p></div>
      </div>
    </section>
    <section class="section section-soft">
      <div class="container split">
        ${calculatorMarkup()}
        <div class="reveal">
          <span class="eyebrow">FAQs</span>
          <h2>Common Questions</h2>
          <div class="accordion">
            <div class="accordion-item"><button class="accordion-button" type="button">Does Wealthura sell only one insurer's products?</button><div class="accordion-panel">No. Wealthura works with multiple insurance providers, including Tata AIA and Tata AIG solutions where suitable.</div></div>
            <div class="accordion-item"><button class="accordion-button" type="button">Can I compare options before choosing?</button><div class="accordion-panel">Yes. The advisory process focuses on comparing benefits, limitations, costs and suitability.</div></div>
            <div class="accordion-item"><button class="accordion-button" type="button">Do you support renewals and claims?</button><div class="accordion-panel">Yes. Wealthura provides renewal reminders and claim assistance guidance for customers.</div></div>
          </div>
        </div>
      </div>
    </section>
  `;
}

/* ── Setup Functions ── */

const WEB3FORMS_KEY = "9caca0df-0fde-4681-affd-819eb24a5ef4";

function setupForms() {
  document.querySelectorAll(".lead-form").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      let valid = true;
      form.querySelectorAll(".field").forEach((field) => {
        const input = field.querySelector("input, select, textarea");
        const ok = input.checkValidity();
        field.classList.toggle("is-invalid", !ok);
        valid = valid && ok;
      });
      if (!valid) return;

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";

      // Collect form data
      const formData = new FormData(form);

      // Determine form type
      const isAdvisor = form.querySelector('[name="occupation"]') !== null;
      const formType = isAdvisor ? "Advisor Application" : "Insurance Quote Request";
      const insuranceType = formData.get("insuranceType") || "General";

      // Append Web3Forms fields
      formData.append("access_key", WEB3FORMS_KEY);
      formData.append("subject", `${formType} — ${isAdvisor ? formData.get("name") : insuranceType} | Wealthura`);
      formData.append("from_name", "Wealthura Website");
      formData.append("replyto", formData.get("email") || "");
      formData.append("Submitted From", window.location.href);
      formData.append("Submission Time", new Date().toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" }));
      formData.append("Form Type", formType);

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();

        if (result.success) {
          form.reset();
          const successEl = form.querySelector(".form-success");
          if (successEl) {
            successEl.classList.add("is-visible");
            setTimeout(() => successEl.classList.remove("is-visible"), 6000);
          }
        } else {
          alert("Something went wrong. Please try again or contact us directly.");
        }
      } catch (err) {
        alert("Network error. Please check your connection and try again.");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  });
}

function setupCalculator() {
  document.querySelectorAll("#premium-calculator").forEach(calc => {
    const typeSelect = calc.querySelector("#calcInsuranceType");
    const inputsContainer = calc.querySelector("#calcInputs");
    if (!typeSelect || !inputsContainer) return;

    function getValues() {
      const vals = {};
      calc.querySelectorAll(".calc-slider, .calc-select:not(.calc-type-select)").forEach(el => {
        vals[el.id] = el.value;
      });
      calc.querySelectorAll(".calc-toggle-group").forEach(group => {
        const active = group.querySelector(".calc-toggle-btn.is-active");
        if (active) vals[group.dataset.for] = active.dataset.value;
      });
      return vals;
    }

    function updateSliderFills() {
      calc.querySelectorAll(".calc-slider").forEach(slider => {
        const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
        const fill = slider.closest(".calc-slider-wrap")?.querySelector(".calc-slider-fill");
        if (fill) fill.style.width = pct + "%";
        // Update display value
        const display = calc.querySelector(`[data-display="${slider.id}"]`);
        if (display) {
          const field = CALC_CONFIGS[typeSelect.value]?.fields.find(f => f.id === slider.id);
          if (field && field.prefix) {
            display.textContent = field.prefix + Number(slider.value).toLocaleString("en-IN");
          } else {
            display.textContent = Number(slider.value).toLocaleString("en-IN");
          }
        }
      });
    }

    function updateResults() {
      const config = CALC_CONFIGS[typeSelect.value];
      if (!config) return;
      const vals = getValues();
      const result = config.calc(vals);

      const freqLabels = { 12: "per month", 4: "per quarter", 2: "per half-year", 1: "per year" };

      calc.querySelector("#calcResultAmount").textContent = fmtINR(result.perFreq);
      calc.querySelector("#calcResultFreq").textContent = freqLabels[result.freq] || "per year";
      calc.querySelector("#calcBase").textContent = fmtINR(result.base);
      calc.querySelector("#calcGST").textContent = fmtINR(result.gst);
      calc.querySelector("#calcTotal").textContent = fmtINR(result.total);
      calc.querySelector("#calcCoverLabel").textContent = result.coverLabel || "";
      calc.querySelector("#calcTermLabel").textContent = result.termLabel || "";

      // Extras
      const extrasEl = calc.querySelector("#calcExtras");
      if (result.extras && result.extras.length) {
        extrasEl.innerHTML = result.extras.map(e =>
          `<div class="pcalc-breakdown-row"><span>${e.label}</span><span>${e.value}</span></div>`
        ).join("");
        extrasEl.style.display = "";
      } else {
        extrasEl.innerHTML = "";
        extrasEl.style.display = "none";
      }

      // Tax benefits
      const taxEl = calc.querySelector("#calcTax");
      if (result.taxSection && result.taxBenefit > 0) {
        taxEl.innerHTML = `
          <div class="pcalc-tax-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Tax Benefit u/s ${result.taxSection}: <strong>${fmtINR(result.taxBenefit)}</strong>
          </div>`;
        taxEl.style.display = "";
      } else {
        taxEl.innerHTML = "";
        taxEl.style.display = "none";
      }

      // Animate the result
      const amountEl = calc.querySelector("#calcResultAmount");
      amountEl.classList.remove("pcalc-pop");
      void amountEl.offsetWidth;
      amountEl.classList.add("pcalc-pop");
    }

    function renderInputs() {
      const config = CALC_CONFIGS[typeSelect.value];
      if (!config) return;

      inputsContainer.style.opacity = "0";
      inputsContainer.style.transform = "translateY(8px)";

      setTimeout(() => {
        inputsContainer.innerHTML = config.fields.map(f => renderCalcField(f)).join("");
        bindInputEvents();
        updateSliderFills();
        updateResults();

        requestAnimationFrame(() => {
          inputsContainer.style.opacity = "1";
          inputsContainer.style.transform = "translateY(0)";
        });
      }, 200);
    }

    function bindInputEvents() {
      calc.querySelectorAll(".calc-slider").forEach(slider => {
        slider.addEventListener("input", () => {
          updateSliderFills();
          updateResults();
        });
      });
      calc.querySelectorAll(".calc-select:not(.calc-type-select)").forEach(sel => {
        sel.addEventListener("change", updateResults);
      });
      calc.querySelectorAll(".calc-toggle-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          btn.closest(".calc-toggle-group").querySelectorAll(".calc-toggle-btn").forEach(b => b.classList.remove("is-active"));
          btn.classList.add("is-active");
          updateResults();
        });
      });
    }

    typeSelect.addEventListener("change", renderInputs);

    // Auto-select the matching insurance type on product pages
    const productPage = document.querySelector("[data-product-page]");
    if (productPage) {
      const pageTitle = productPage.dataset.title;
      if (pageTitle && CALC_CONFIGS[pageTitle]) {
        typeSelect.value = pageTitle;
      }
    }

    renderInputs();
  });
}

function setupReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach((item) => observer.observe(item));
}

function setupAccordions() {
  document.querySelectorAll(".accordion-button").forEach((button) => {
    button.addEventListener("click", () => button.closest(".accordion-item").classList.toggle("is-open"));
  });
}

function setupSlider() {
  const track = document.querySelector(".testimonial-track");
  if (!track) return;
  const cards = [...track.children];
  const controls = document.querySelector(".slider-controls");
  let active = 0;
  cards.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.className = "slider-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Show testimonial ${index + 1}`);
    dot.addEventListener("click", () => setActive(index));
    controls.appendChild(dot);
  });
  function setActive(index) {
    active = index;
    track.style.transform = `translateX(-${active * 100}%)`;
    controls.querySelectorAll(".slider-dot").forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === active));
  }
  setActive(0);
  setInterval(() => setActive((active + 1) % cards.length), 5200);
}

function initShell() {
  document.querySelector("#site-shell").insertAdjacentHTML("afterbegin", navMarkup());
  document.querySelector("#site-shell").insertAdjacentHTML("beforeend", footerMarkup() + floatingActions());
  document.querySelector(".nav-toggle")?.addEventListener("click", (event) => {
    const header = document.querySelector("#siteHeader");
    const open = !header.classList.contains("is-open");
    header.classList.toggle("is-open", open);
    event.currentTarget.setAttribute("aria-expanded", String(open));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initShell();
  document.querySelectorAll("[data-lead-form]").forEach((target) => {
    target.innerHTML = leadFormMarkup(target.dataset.type || "");
  });
  document.querySelectorAll("[data-advisor-form]").forEach((target) => {
    target.innerHTML = advisorFormMarkup();
  });
  document.querySelectorAll("[data-calculator]").forEach((target) => {
    target.innerHTML = calculatorMarkup();
  });
  document.querySelectorAll("[data-product-page]").forEach((target) => {
    target.innerHTML = productSections(target.dataset.slug, target.dataset.title);
  });
  setupForms();
  setupCalculator();
  setupReveal();
  setupAccordions();
  setupSlider();
});
