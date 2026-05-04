// Income data per country
//
// Fields:
//   name        — display name (RU)
//   nameEn      — English name (matches TopoJSON properties.name)
//   iso         — ISO 3166-1 numeric code (matches world-atlas TopoJSON)
//   population  — total population (UN, 2023 est.)
//   adultShare  — adult population share (default 0.72 if omitted)
//   meanIncome  — mean adult annual income, USD nominal
//   gini        — Gini coefficient × 100
//   percentiles — optional: known percentile thresholds (annual USD)
//   year        — reference year for the data
//   source      — short citation
//   sourceUrl   — link
//   modeled     — true if percentiles are derived via log-normal model from mean+Gini
//   predicted   — true if values are AI-estimated (no recent direct data)
//
// Primary sources: World Bank Open Data (GDP per capita, Gini), WID.world
// (World Inequality Database percentile thresholds), OECD Income Distribution
// Database. Figures rounded; latest available year noted.

const COUNTRIES = {
  // ============ HIGH-INCOME / OECD ============
  USA: { name: 'США', nameEn: 'United States of America', iso: 840, population: 334000000, meanIncome: 76000, gini: 39.7, year: 2022, source: 'World Bank / WID.world', sourceUrl: 'https://wid.world/country/usa/',
    percentiles: { 10: 9000, 25: 23000, 50: 48000, 75: 92000, 90: 168000, 95: 240000, 99: 650000 } },
  CAN: { name: 'Канада', nameEn: 'Canada', iso: 124, population: 40100000, meanIncome: 53000, gini: 33.3, year: 2022, source: 'World Bank / WID.world', sourceUrl: 'https://wid.world/country/canada/', modeled: true },
  GBR: { name: 'Великобритания', nameEn: 'United Kingdom', iso: 826, population: 67700000, meanIncome: 46000, gini: 35.1, year: 2022, source: 'World Bank / WID.world', sourceUrl: 'https://wid.world/country/united-kingdom/',
    percentiles: { 10: 7600, 25: 16000, 50: 31000, 75: 55000, 90: 92000, 95: 130000, 99: 280000 } },
  DEU: { name: 'Германия', nameEn: 'Germany', iso: 276, population: 84500000, meanIncome: 48000, gini: 31.7, year: 2022, source: 'World Bank / WID.world', sourceUrl: 'https://wid.world/country/germany/',
    percentiles: { 10: 9000, 25: 17000, 50: 33000, 75: 57000, 90: 90000, 95: 125000, 99: 280000 } },
  FRA: { name: 'Франция', nameEn: 'France', iso: 250, population: 64800000, meanIncome: 41000, gini: 32.4, year: 2022, source: 'World Bank / WID.world', sourceUrl: 'https://wid.world/country/france/',
    percentiles: { 10: 8000, 25: 16000, 50: 28000, 75: 49000, 90: 78000, 95: 110000, 99: 240000 } },
  ITA: { name: 'Италия', nameEn: 'Italy', iso: 380, population: 58900000, meanIncome: 34000, gini: 35.9, year: 2022, source: 'World Bank / WID.world', sourceUrl: 'https://wid.world/country/italy/', modeled: true },
  ESP: { name: 'Испания', nameEn: 'Spain', iso: 724, population: 47500000, meanIncome: 30000, gini: 34.7, year: 2022, source: 'World Bank / WID.world', sourceUrl: 'https://wid.world/country/spain/', modeled: true },
  PRT: { name: 'Португалия', nameEn: 'Portugal', iso: 620, population: 10400000, meanIncome: 25000, gini: 33.5, year: 2022, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/portugal', modeled: true },
  GRC: { name: 'Греция', nameEn: 'Greece', iso: 300, population: 10400000, meanIncome: 21000, gini: 32.9, year: 2022, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/greece', modeled: true },
  NLD: { name: 'Нидерланды', nameEn: 'Netherlands', iso: 528, population: 17600000, meanIncome: 57000, gini: 28.0, year: 2022, source: 'World Bank / WID.world', sourceUrl: 'https://wid.world/country/netherlands/', modeled: true },
  BEL: { name: 'Бельгия', nameEn: 'Belgium', iso: 56, population: 11700000, meanIncome: 51000, gini: 27.2, year: 2022, source: 'World Bank / OECD', sourceUrl: 'https://data.worldbank.org/country/belgium', modeled: true },
  LUX: { name: 'Люксембург', nameEn: 'Luxembourg', iso: 442, population: 660000, meanIncome: 125000, gini: 33.0, year: 2022, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/luxembourg', modeled: true },
  CHE: { name: 'Швейцария', nameEn: 'Switzerland', iso: 756, population: 8800000, meanIncome: 99000, gini: 33.0, year: 2022, source: 'World Bank / WID.world', sourceUrl: 'https://wid.world/country/switzerland/', modeled: true },
  AUT: { name: 'Австрия', nameEn: 'Austria', iso: 40, population: 9100000, meanIncome: 52000, gini: 30.7, year: 2022, source: 'World Bank / OECD', sourceUrl: 'https://data.worldbank.org/country/austria', modeled: true },
  IRL: { name: 'Ирландия', nameEn: 'Ireland', iso: 372, population: 5100000, meanIncome: 103000, gini: 32.0, year: 2022, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/ireland', modeled: true },
  DNK: { name: 'Дания', nameEn: 'Denmark', iso: 208, population: 5900000, meanIncome: 67000, gini: 28.2, year: 2022, source: 'World Bank / OECD', sourceUrl: 'https://data.worldbank.org/country/denmark', modeled: true },
  SWE: { name: 'Швеция', nameEn: 'Sweden', iso: 752, population: 10500000, meanIncome: 56000, gini: 30.0, year: 2022, source: 'World Bank / OECD', sourceUrl: 'https://data.worldbank.org/country/sweden', modeled: true },
  NOR: { name: 'Норвегия', nameEn: 'Norway', iso: 578, population: 5500000, meanIncome: 102000, gini: 27.7, year: 2022, source: 'World Bank / OECD', sourceUrl: 'https://data.worldbank.org/country/norway', modeled: true },
  FIN: { name: 'Финляндия', nameEn: 'Finland', iso: 246, population: 5550000, meanIncome: 51000, gini: 27.7, year: 2022, source: 'World Bank / OECD', sourceUrl: 'https://data.worldbank.org/country/finland', modeled: true },
  ISL: { name: 'Исландия', nameEn: 'Iceland', iso: 352, population: 380000, meanIncome: 78000, gini: 26.1, year: 2022, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/iceland', modeled: true },
  POL: { name: 'Польша', nameEn: 'Poland', iso: 616, population: 38000000, meanIncome: 18700, gini: 30.2, year: 2022, source: 'World Bank / OECD', sourceUrl: 'https://data.worldbank.org/country/poland', modeled: true },
  CZE: { name: 'Чехия', nameEn: 'Czech Republic', iso: 203, population: 10500000, meanIncome: 27000, gini: 25.0, year: 2022, source: 'World Bank / OECD', sourceUrl: 'https://data.worldbank.org/country/czech-republic', modeled: true },
  SVK: { name: 'Словакия', nameEn: 'Slovakia', iso: 703, population: 5500000, meanIncome: 21500, gini: 24.1, year: 2022, source: 'World Bank / OECD', sourceUrl: 'https://data.worldbank.org/country/slovakia', modeled: true },
  HUN: { name: 'Венгрия', nameEn: 'Hungary', iso: 348, population: 9700000, meanIncome: 18000, gini: 30.0, year: 2022, source: 'World Bank / OECD', sourceUrl: 'https://data.worldbank.org/country/hungary', modeled: true },
  ROU: { name: 'Румыния', nameEn: 'Romania', iso: 642, population: 19000000, meanIncome: 14800, gini: 32.0, year: 2022, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/romania', modeled: true },
  BGR: { name: 'Болгария', nameEn: 'Bulgaria', iso: 100, population: 6800000, meanIncome: 12500, gini: 39.7, year: 2022, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/bulgaria', modeled: true },
  HRV: { name: 'Хорватия', nameEn: 'Croatia', iso: 191, population: 3850000, meanIncome: 17400, gini: 28.5, year: 2022, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/croatia', modeled: true },
  SVN: { name: 'Словения', nameEn: 'Slovenia', iso: 705, population: 2100000, meanIncome: 28000, gini: 24.4, year: 2022, source: 'World Bank / OECD', sourceUrl: 'https://data.worldbank.org/country/slovenia', modeled: true },
  EST: { name: 'Эстония', nameEn: 'Estonia', iso: 233, population: 1330000, meanIncome: 27200, gini: 30.6, year: 2022, source: 'World Bank / OECD', sourceUrl: 'https://data.worldbank.org/country/estonia', modeled: true },
  LVA: { name: 'Латвия', nameEn: 'Latvia', iso: 428, population: 1830000, meanIncome: 21500, gini: 34.3, year: 2022, source: 'World Bank / OECD', sourceUrl: 'https://data.worldbank.org/country/latvia', modeled: true },
  LTU: { name: 'Литва', nameEn: 'Lithuania', iso: 440, population: 2860000, meanIncome: 25000, gini: 35.7, year: 2022, source: 'World Bank / OECD', sourceUrl: 'https://data.worldbank.org/country/lithuania', modeled: true },
  CYP: { name: 'Кипр', nameEn: 'Cyprus', iso: 196, population: 1260000, meanIncome: 32000, gini: 32.7, year: 2022, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/cyprus', modeled: true },
  MLT: { name: 'Мальта', nameEn: 'Malta', iso: 470, population: 535000, meanIncome: 35000, gini: 31.0, year: 2022, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/malta', modeled: true },

  // ============ ASIA / PACIFIC ============
  CHN: { name: 'Китай', nameEn: 'China', iso: 156, population: 1410000000, meanIncome: 12700, gini: 38.2, year: 2021, source: 'World Bank / WID.world', sourceUrl: 'https://wid.world/country/china/',
    percentiles: { 10: 1500, 25: 3500, 50: 7500, 75: 16000, 90: 32000, 95: 52000, 99: 130000 } },
  JPN: { name: 'Япония', nameEn: 'Japan', iso: 392, population: 124800000, meanIncome: 34000, gini: 32.9, year: 2022, source: 'World Bank / WID.world', sourceUrl: 'https://wid.world/country/japan/', modeled: true },
  KOR: { name: 'Южная Корея', nameEn: 'South Korea', iso: 410, population: 51800000, meanIncome: 33000, gini: 31.4, year: 2022, source: 'World Bank / WID.world', sourceUrl: 'https://wid.world/country/korea/', modeled: true },
  PRK: { name: 'Северная Корея', nameEn: 'North Korea', iso: 408, population: 26000000, meanIncome: 1700, gini: 50.0, year: 2022, source: 'AI predicted (нет открытых данных)', sourceUrl: '', predicted: true },
  TWN: { name: 'Тайвань', nameEn: 'Taiwan', iso: 158, population: 23400000, meanIncome: 33000, gini: 33.8, year: 2022, source: 'Taiwan DGBAS', sourceUrl: 'https://eng.dgbas.gov.tw/', modeled: true },
  IND: { name: 'Индия', nameEn: 'India', iso: 356, population: 1430000000, meanIncome: 2500, gini: 35.7, year: 2022, source: 'World Bank / WID.world', sourceUrl: 'https://wid.world/country/india/',
    percentiles: { 10: 600, 25: 1100, 50: 2000, 75: 4200, 90: 8500, 95: 14000, 99: 50000 } },
  IDN: { name: 'Индонезия', nameEn: 'Indonesia', iso: 360, population: 277500000, meanIncome: 4800, gini: 38.7, year: 2022, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/indonesia', modeled: true },
  PAK: { name: 'Пакистан', nameEn: 'Pakistan', iso: 586, population: 240500000, meanIncome: 1500, gini: 31.6, year: 2022, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/pakistan', modeled: true },
  BGD: { name: 'Бангладеш', nameEn: 'Bangladesh', iso: 50, population: 173000000, meanIncome: 2700, gini: 32.4, year: 2022, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/bangladesh', modeled: true },
  VNM: { name: 'Вьетнам', nameEn: 'Vietnam', iso: 704, population: 99500000, meanIncome: 4100, gini: 36.8, year: 2022, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/vietnam', modeled: true },
  THA: { name: 'Таиланд', nameEn: 'Thailand', iso: 764, population: 71700000, meanIncome: 7000, gini: 35.1, year: 2021, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/thailand', modeled: true },
  PHL: { name: 'Филиппины', nameEn: 'Philippines', iso: 608, population: 117300000, meanIncome: 3500, gini: 40.7, year: 2021, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/philippines', modeled: true },
  MYS: { name: 'Малайзия', nameEn: 'Malaysia', iso: 458, population: 33900000, meanIncome: 12500, gini: 41.1, year: 2021, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/malaysia', modeled: true },
  SGP: { name: 'Сингапур', nameEn: 'Singapore', iso: 702, population: 5920000, meanIncome: 84000, gini: 38.5, year: 2022, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/singapore', modeled: true },
  HKG: { name: 'Гонконг', nameEn: 'Hong Kong', iso: 344, population: 7400000, meanIncome: 50000, gini: 53.9, year: 2021, source: 'HK CSD', sourceUrl: 'https://www.censtatd.gov.hk/', modeled: true },
  KHM: { name: 'Камбоджа', nameEn: 'Cambodia', iso: 116, population: 16800000, meanIncome: 1800, gini: 35.5, year: 2021, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/cambodia', modeled: true },
  LAO: { name: 'Лаос', nameEn: 'Laos', iso: 418, population: 7600000, meanIncome: 2600, gini: 38.8, year: 2018, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/laos', modeled: true },
  MMR: { name: 'Мьянма', nameEn: 'Myanmar', iso: 104, population: 54600000, meanIncome: 1200, gini: 30.7, year: 2017, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/myanmar', modeled: true },
  NPL: { name: 'Непал', nameEn: 'Nepal', iso: 524, population: 30900000, meanIncome: 1340, gini: 32.8, year: 2022, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/nepal', modeled: true },
  LKA: { name: 'Шри-Ланка', nameEn: 'Sri Lanka', iso: 144, population: 21800000, meanIncome: 3500, gini: 39.3, year: 2019, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/sri-lanka', modeled: true },
  AFG: { name: 'Афганистан', nameEn: 'Afghanistan', iso: 4, population: 41100000, meanIncome: 350, gini: 27.8, year: 2020, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/afghanistan', modeled: true },
  AUS: { name: 'Австралия', nameEn: 'Australia', iso: 36, population: 26500000, meanIncome: 65000, gini: 34.3, year: 2022, source: 'World Bank / OECD', sourceUrl: 'https://data.worldbank.org/country/australia', modeled: true },
  NZL: { name: 'Новая Зеландия', nameEn: 'New Zealand', iso: 554, population: 5200000, meanIncome: 49000, gini: 31.9, year: 2022, source: 'World Bank / OECD', sourceUrl: 'https://data.worldbank.org/country/new-zealand', modeled: true },

  // ============ MIDDLE EAST ============
  SAU: { name: 'Саудовская Аравия', nameEn: 'Saudi Arabia', iso: 682, population: 36400000, meanIncome: 30400, gini: 34.0, year: 2018, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/saudi-arabia', modeled: true },
  ARE: { name: 'ОАЭ', nameEn: 'United Arab Emirates', iso: 784, population: 9500000, meanIncome: 51400, gini: 32.5, year: 2018, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/united-arab-emirates', modeled: true },
  ISR: { name: 'Израиль', nameEn: 'Israel', iso: 376, population: 9700000, meanIncome: 54900, gini: 38.6, year: 2021, source: 'World Bank / OECD', sourceUrl: 'https://data.worldbank.org/country/israel', modeled: true },
  TUR: { name: 'Турция', nameEn: 'Turkey', iso: 792, population: 85800000, meanIncome: 10500, gini: 41.9, year: 2021, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/turkey', modeled: true },
  IRN: { name: 'Иран', nameEn: 'Iran', iso: 364, population: 89200000, meanIncome: 4400, gini: 40.9, year: 2019, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/iran', modeled: true },
  IRQ: { name: 'Ирак', nameEn: 'Iraq', iso: 368, population: 45500000, meanIncome: 5500, gini: 29.5, year: 2012, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/iraq', modeled: true },
  JOR: { name: 'Иордания', nameEn: 'Jordan', iso: 400, population: 11300000, meanIncome: 4400, gini: 33.7, year: 2010, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/jordan', modeled: true },
  LBN: { name: 'Ливан', nameEn: 'Lebanon', iso: 422, population: 5400000, meanIncome: 4000, gini: 31.8, year: 2011, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/lebanon', modeled: true },
  SYR: { name: 'Сирия', nameEn: 'Syria', iso: 760, population: 23200000, meanIncome: 800, gini: 35.0, year: 2022, source: 'AI predicted', sourceUrl: '', predicted: true },
  YEM: { name: 'Йемен', nameEn: 'Yemen', iso: 887, population: 34500000, meanIncome: 700, gini: 36.7, year: 2014, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/yemen', modeled: true },
  QAT: { name: 'Катар', nameEn: 'Qatar', iso: 634, population: 2700000, meanIncome: 84000, gini: 35.0, year: 2018, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/qatar', modeled: true },
  KWT: { name: 'Кувейт', nameEn: 'Kuwait', iso: 414, population: 4300000, meanIncome: 32000, gini: 33.0, year: 2018, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/kuwait', modeled: true },
  OMN: { name: 'Оман', nameEn: 'Oman', iso: 512, population: 4600000, meanIncome: 21000, gini: 30.7, year: 2018, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/oman', modeled: true },
  BHR: { name: 'Бахрейн', nameEn: 'Bahrain', iso: 48, population: 1500000, meanIncome: 28000, gini: 34.0, year: 2018, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/bahrain', modeled: true },

  // ============ POST-SOVIET ============
  RUS: { name: 'Россия', nameEn: 'Russia', iso: 643, population: 143400000, meanIncome: 12200, gini: 36.0, year: 2021, source: 'World Bank / WID.world', sourceUrl: 'https://wid.world/country/russian-federation/',
    percentiles: { 10: 1900, 25: 4200, 50: 8000, 75: 16000, 90: 32000, 95: 52000, 99: 160000 } },
  UKR: { name: 'Украина', nameEn: 'Ukraine', iso: 804, population: 36700000, meanIncome: 4500, gini: 25.6, year: 2021, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/ukraine', modeled: true },
  BLR: { name: 'Беларусь', nameEn: 'Belarus', iso: 112, population: 9200000, meanIncome: 7000, gini: 24.4, year: 2020, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/belarus', modeled: true },
  KAZ: { name: 'Казахстан', nameEn: 'Kazakhstan', iso: 398, population: 19800000, meanIncome: 11500, gini: 27.8, year: 2021, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/kazakhstan', modeled: true },
  UZB: { name: 'Узбекистан', nameEn: 'Uzbekistan', iso: 860, population: 35600000, meanIncome: 2200, gini: 31.2, year: 2021, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/uzbekistan', modeled: true },
  KGZ: { name: 'Киргизия', nameEn: 'Kyrgyzstan', iso: 417, population: 6800000, meanIncome: 1700, gini: 29.0, year: 2021, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/kyrgyzstan', modeled: true },
  TJK: { name: 'Таджикистан', nameEn: 'Tajikistan', iso: 762, population: 10100000, meanIncome: 1200, gini: 34.0, year: 2015, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/tajikistan', modeled: true },
  TKM: { name: 'Туркменистан', nameEn: 'Turkmenistan', iso: 795, population: 6500000, meanIncome: 8500, gini: 40.8, year: 2018, source: 'AI predicted', sourceUrl: '', predicted: true },
  ARM: { name: 'Армения', nameEn: 'Armenia', iso: 51, population: 2780000, meanIncome: 5400, gini: 27.9, year: 2021, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/armenia', modeled: true },
  AZE: { name: 'Азербайджан', nameEn: 'Azerbaijan', iso: 31, population: 10400000, meanIncome: 5400, gini: 26.6, year: 2008, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/azerbaijan', modeled: true },
  GEO: { name: 'Грузия', nameEn: 'Georgia', iso: 268, population: 3700000, meanIncome: 5800, gini: 34.5, year: 2022, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/georgia', modeled: true },
  MDA: { name: 'Молдова', nameEn: 'Moldova', iso: 498, population: 2600000, meanIncome: 5700, gini: 26.0, year: 2021, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/moldova', modeled: true },

  // ============ LATIN AMERICA ============
  BRA: { name: 'Бразилия', nameEn: 'Brazil', iso: 76, population: 216000000, meanIncome: 8900, gini: 52.0, year: 2021, source: 'World Bank / WID.world', sourceUrl: 'https://wid.world/country/brazil/',
    percentiles: { 10: 700, 25: 1900, 50: 4200, 75: 9500, 90: 22000, 95: 38000, 99: 130000 } },
  MEX: { name: 'Мексика', nameEn: 'Mexico', iso: 484, population: 128500000, meanIncome: 11500, gini: 45.4, year: 2020, source: 'World Bank / OECD', sourceUrl: 'https://data.worldbank.org/country/mexico', modeled: true },
  ARG: { name: 'Аргентина', nameEn: 'Argentina', iso: 32, population: 46200000, meanIncome: 13700, gini: 42.0, year: 2021, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/argentina', modeled: true },
  COL: { name: 'Колумбия', nameEn: 'Colombia', iso: 170, population: 52100000, meanIncome: 6700, gini: 51.5, year: 2021, source: 'World Bank / OECD', sourceUrl: 'https://data.worldbank.org/country/colombia', modeled: true },
  CHL: { name: 'Чили', nameEn: 'Chile', iso: 152, population: 19600000, meanIncome: 16500, gini: 44.9, year: 2020, source: 'World Bank / OECD', sourceUrl: 'https://data.worldbank.org/country/chile', modeled: true },
  PER: { name: 'Перу', nameEn: 'Peru', iso: 604, population: 34000000, meanIncome: 7100, gini: 40.2, year: 2021, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/peru', modeled: true },
  VEN: { name: 'Венесуэла', nameEn: 'Venezuela', iso: 862, population: 28800000, meanIncome: 3500, gini: 45.0, year: 2022, source: 'AI predicted', sourceUrl: '', predicted: true },
  ECU: { name: 'Эквадор', nameEn: 'Ecuador', iso: 218, population: 18200000, meanIncome: 6300, gini: 45.4, year: 2021, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/ecuador', modeled: true },
  BOL: { name: 'Боливия', nameEn: 'Bolivia', iso: 68, population: 12200000, meanIncome: 3600, gini: 40.9, year: 2021, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/bolivia', modeled: true },
  PRY: { name: 'Парагвай', nameEn: 'Paraguay', iso: 600, population: 6900000, meanIncome: 6000, gini: 45.1, year: 2021, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/paraguay', modeled: true },
  URY: { name: 'Уругвай', nameEn: 'Uruguay', iso: 858, population: 3420000, meanIncome: 17000, gini: 40.6, year: 2021, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/uruguay', modeled: true },
  CUB: { name: 'Куба', nameEn: 'Cuba', iso: 192, population: 11200000, meanIncome: 9500, gini: 38.0, year: 2018, source: 'AI predicted', sourceUrl: '', predicted: true },
  DOM: { name: 'Доминиканская Респ.', nameEn: 'Dominican Republic', iso: 214, population: 11200000, meanIncome: 9500, gini: 39.6, year: 2021, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/dominican-republic', modeled: true },
  GTM: { name: 'Гватемала', nameEn: 'Guatemala', iso: 320, population: 17600000, meanIncome: 5000, gini: 48.3, year: 2014, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/guatemala', modeled: true },
  HND: { name: 'Гондурас', nameEn: 'Honduras', iso: 340, population: 10600000, meanIncome: 2750, gini: 48.2, year: 2019, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/honduras', modeled: true },
  NIC: { name: 'Никарагуа', nameEn: 'Nicaragua', iso: 558, population: 6700000, meanIncome: 2200, gini: 46.2, year: 2014, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/nicaragua', modeled: true },
  CRI: { name: 'Коста-Рика', nameEn: 'Costa Rica', iso: 188, population: 5200000, meanIncome: 12500, gini: 47.2, year: 2021, source: 'World Bank / OECD', sourceUrl: 'https://data.worldbank.org/country/costa-rica', modeled: true },
  PAN: { name: 'Панама', nameEn: 'Panama', iso: 591, population: 4400000, meanIncome: 16000, gini: 48.9, year: 2021, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/panama', modeled: true },
  SLV: { name: 'Сальвадор', nameEn: 'El Salvador', iso: 222, population: 6300000, meanIncome: 4400, gini: 38.8, year: 2021, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/el-salvador', modeled: true },

  // ============ AFRICA ============
  ZAF: { name: 'ЮАР', nameEn: 'South Africa', iso: 710, population: 60400000, meanIncome: 6700, gini: 63.0, year: 2014, source: 'World Bank / WID.world', sourceUrl: 'https://wid.world/country/south-africa/', modeled: true },
  NGA: { name: 'Нигерия', nameEn: 'Nigeria', iso: 566, population: 223800000, meanIncome: 2200, gini: 35.1, year: 2018, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/nigeria', modeled: true },
  EGY: { name: 'Египет', nameEn: 'Egypt', iso: 818, population: 112700000, meanIncome: 3700, gini: 31.9, year: 2019, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/egypt', modeled: true },
  ETH: { name: 'Эфиопия', nameEn: 'Ethiopia', iso: 231, population: 126500000, meanIncome: 1100, gini: 35.0, year: 2015, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/ethiopia', modeled: true },
  COD: { name: 'ДР Конго', nameEn: 'Democratic Republic of the Congo', iso: 180, population: 102200000, meanIncome: 600, gini: 42.1, year: 2012, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/congo-democratic-republic', modeled: true },
  TZA: { name: 'Танзания', nameEn: 'Tanzania', iso: 834, population: 67400000, meanIncome: 1200, gini: 40.5, year: 2018, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/tanzania', modeled: true },
  KEN: { name: 'Кения', nameEn: 'Kenya', iso: 404, population: 55100000, meanIncome: 2200, gini: 38.7, year: 2015, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/kenya', modeled: true },
  UGA: { name: 'Уганда', nameEn: 'Uganda', iso: 800, population: 48600000, meanIncome: 950, gini: 42.7, year: 2019, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/uganda', modeled: true },
  GHA: { name: 'Гана', nameEn: 'Ghana', iso: 288, population: 33500000, meanIncome: 2400, gini: 43.5, year: 2016, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/ghana', modeled: true },
  AGO: { name: 'Ангола', nameEn: 'Angola', iso: 24, population: 36700000, meanIncome: 3200, gini: 51.3, year: 2018, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/angola', modeled: true },
  MOZ: { name: 'Мозамбик', nameEn: 'Mozambique', iso: 508, population: 33900000, meanIncome: 600, gini: 54.0, year: 2014, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/mozambique', modeled: true },
  ZMB: { name: 'Замбия', nameEn: 'Zambia', iso: 894, population: 20600000, meanIncome: 1300, gini: 57.1, year: 2015, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/zambia', modeled: true },
  ZWE: { name: 'Зимбабве', nameEn: 'Zimbabwe', iso: 716, population: 16700000, meanIncome: 1700, gini: 50.3, year: 2019, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/zimbabwe', modeled: true },
  MAR: { name: 'Марокко', nameEn: 'Morocco', iso: 504, population: 37800000, meanIncome: 3500, gini: 39.5, year: 2014, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/morocco', modeled: true },
  DZA: { name: 'Алжир', nameEn: 'Algeria', iso: 12, population: 45600000, meanIncome: 4150, gini: 27.6, year: 2011, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/algeria', modeled: true },
  TUN: { name: 'Тунис', nameEn: 'Tunisia', iso: 788, population: 12500000, meanIncome: 3800, gini: 32.8, year: 2015, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/tunisia', modeled: true },
  LBY: { name: 'Ливия', nameEn: 'Libya', iso: 434, population: 6900000, meanIncome: 6700, gini: 35.0, year: 2022, source: 'AI predicted', sourceUrl: '', predicted: true },
  SDN: { name: 'Судан', nameEn: 'Sudan', iso: 729, population: 48100000, meanIncome: 800, gini: 34.2, year: 2014, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/sudan', modeled: true },
  SOM: { name: 'Сомали', nameEn: 'Somalia', iso: 706, population: 18100000, meanIncome: 600, gini: 36.8, year: 2017, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/somalia', modeled: true },
  CIV: { name: "Кот-д'Ивуар", nameEn: 'Ivory Coast', iso: 384, population: 28800000, meanIncome: 2500, gini: 35.3, year: 2018, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/cote-divoire', modeled: true },
  CMR: { name: 'Камерун', nameEn: 'Cameroon', iso: 120, population: 28100000, meanIncome: 1700, gini: 42.2, year: 2014, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/cameroon', modeled: true },
  SEN: { name: 'Сенегал', nameEn: 'Senegal', iso: 686, population: 17800000, meanIncome: 1700, gini: 38.1, year: 2018, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/senegal', modeled: true },
  MLI: { name: 'Мали', nameEn: 'Mali', iso: 466, population: 23300000, meanIncome: 850, gini: 36.1, year: 2018, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/mali', modeled: true },
  RWA: { name: 'Руанда', nameEn: 'Rwanda', iso: 646, population: 14000000, meanIncome: 980, gini: 43.7, year: 2016, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/rwanda', modeled: true },
  BFA: { name: 'Буркина-Фасо', nameEn: 'Burkina Faso', iso: 854, population: 23300000, meanIncome: 870, gini: 47.3, year: 2018, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/burkina-faso', modeled: true },
  MDG: { name: 'Мадагаскар', nameEn: 'Madagascar', iso: 450, population: 30300000, meanIncome: 530, gini: 42.6, year: 2012, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/madagascar', modeled: true },
  TCD: { name: 'Чад', nameEn: 'Chad', iso: 148, population: 18300000, meanIncome: 720, gini: 37.5, year: 2018, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/chad', modeled: true },
  NER: { name: 'Нигер', nameEn: 'Niger', iso: 562, population: 27200000, meanIncome: 600, gini: 32.9, year: 2018, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/niger', modeled: true },
  BDI: { name: 'Бурунди', nameEn: 'Burundi', iso: 108, population: 13200000, meanIncome: 230, gini: 38.6, year: 2020, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/burundi', modeled: true },
  MWI: { name: 'Малави', nameEn: 'Malawi', iso: 454, population: 20900000, meanIncome: 640, gini: 38.5, year: 2019, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/malawi', modeled: true },
  BWA: { name: 'Ботсвана', nameEn: 'Botswana', iso: 72, population: 2500000, meanIncome: 7300, gini: 53.3, year: 2015, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/botswana', modeled: true },
  NAM: { name: 'Намибия', nameEn: 'Namibia', iso: 516, population: 2600000, meanIncome: 4900, gini: 59.1, year: 2015, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/namibia', modeled: true },
  GAB: { name: 'Габон', nameEn: 'Gabon', iso: 266, population: 2400000, meanIncome: 8800, gini: 38.0, year: 2017, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/gabon', modeled: true },
  COG: { name: 'Республика Конго', nameEn: 'Republic of the Congo', iso: 178, population: 6100000, meanIncome: 2500, gini: 48.9, year: 2011, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/congo-republic', modeled: true },
  MUS: { name: 'Маврикий', nameEn: 'Mauritius', iso: 480, population: 1260000, meanIncome: 10500, gini: 36.8, year: 2017, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/mauritius', modeled: true },
  GNQ: { name: 'Эк. Гвинея', nameEn: 'Equatorial Guinea', iso: 226, population: 1700000, meanIncome: 8200, gini: 50.0, year: 2022, source: 'AI predicted', sourceUrl: '', predicted: true },
  GIN: { name: 'Гвинея', nameEn: 'Guinea', iso: 324, population: 14200000, meanIncome: 1300, gini: 33.7, year: 2018, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/guinea', modeled: true },
  BEN: { name: 'Бенин', nameEn: 'Benin', iso: 204, population: 13700000, meanIncome: 1400, gini: 37.8, year: 2018, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/benin', modeled: true },
  TGO: { name: 'Того', nameEn: 'Togo', iso: 768, population: 9000000, meanIncome: 990, gini: 43.1, year: 2015, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/togo', modeled: true },
  SSD: { name: 'Южный Судан', nameEn: 'South Sudan', iso: 728, population: 11100000, meanIncome: 400, gini: 44.1, year: 2016, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/south-sudan', modeled: true },
  ERI: { name: 'Эритрея', nameEn: 'Eritrea', iso: 232, population: 3700000, meanIncome: 600, gini: 35.0, year: 2022, source: 'AI predicted', sourceUrl: '', predicted: true },
  CAF: { name: 'ЦАР', nameEn: 'Central African Republic', iso: 140, population: 5700000, meanIncome: 480, gini: 56.2, year: 2008, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/central-african-republic', modeled: true },
  LBR: { name: 'Либерия', nameEn: 'Liberia', iso: 430, population: 5400000, meanIncome: 720, gini: 35.3, year: 2016, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/liberia', modeled: true },
  SLE: { name: 'Сьерра-Леоне', nameEn: 'Sierra Leone', iso: 694, population: 8800000, meanIncome: 530, gini: 35.7, year: 2018, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/sierra-leone', modeled: true },
  LSO: { name: 'Лесото', nameEn: 'Lesotho', iso: 426, population: 2300000, meanIncome: 1100, gini: 44.9, year: 2017, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/lesotho', modeled: true },
  SWZ: { name: 'Эсватини', nameEn: 'eSwatini', iso: 748, population: 1200000, meanIncome: 3700, gini: 54.6, year: 2017, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/eswatini', modeled: true },

  // ============ MISC ============
  GRL: { name: 'Гренландия', nameEn: 'Greenland', iso: 304, population: 56000, meanIncome: 47000, gini: 33.0, year: 2022, source: 'AI predicted', sourceUrl: '', predicted: true },
  ISL_DUMMY: undefined, // placeholder removed
  PNG: { name: 'Папуа Новая Гвинея', nameEn: 'Papua New Guinea', iso: 598, population: 10300000, meanIncome: 2800, gini: 41.9, year: 2009, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/papua-new-guinea', modeled: true },
  FJI: { name: 'Фиджи', nameEn: 'Fiji', iso: 242, population: 940000, meanIncome: 5500, gini: 30.7, year: 2019, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/fiji', modeled: true },
  SRB: { name: 'Сербия', nameEn: 'Republic of Serbia', iso: 688, population: 6800000, meanIncome: 9600, gini: 33.1, year: 2021, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/serbia', modeled: true },
  BIH: { name: 'Босния', nameEn: 'Bosnia and Herzegovina', iso: 70, population: 3200000, meanIncome: 7800, gini: 33.0, year: 2011, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/bosnia-and-herzegovina', modeled: true },
  ALB: { name: 'Албания', nameEn: 'Albania', iso: 8, population: 2800000, meanIncome: 6800, gini: 30.1, year: 2020, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/albania', modeled: true },
  MKD: { name: 'Сев. Македония', nameEn: 'North Macedonia', iso: 807, population: 2080000, meanIncome: 6700, gini: 33.0, year: 2020, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/north-macedonia', modeled: true },
  MNE: { name: 'Черногория', nameEn: 'Montenegro', iso: 499, population: 620000, meanIncome: 9500, gini: 36.8, year: 2021, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/montenegro', modeled: true },
  KOS: { name: 'Косово', nameEn: 'Kosovo', iso: -1, population: 1760000, meanIncome: 5300, gini: 29.0, year: 2017, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/kosovo', modeled: true },
  MNG: { name: 'Монголия', nameEn: 'Mongolia', iso: 496, population: 3400000, meanIncome: 4500, gini: 32.7, year: 2018, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/mongolia', modeled: true },
  BTN: { name: 'Бутан', nameEn: 'Bhutan', iso: 64, population: 780000, meanIncome: 3500, gini: 28.5, year: 2022, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/bhutan', modeled: true },
  HTI: { name: 'Гаити', nameEn: 'Haiti', iso: 332, population: 11700000, meanIncome: 1800, gini: 41.1, year: 2012, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/haiti', modeled: true },
  JAM: { name: 'Ямайка', nameEn: 'Jamaica', iso: 388, population: 2830000, meanIncome: 6200, gini: 40.2, year: 2021, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/jamaica', modeled: true },
  TTO: { name: 'Тринидад', nameEn: 'Trinidad and Tobago', iso: 780, population: 1530000, meanIncome: 19200, gini: 39.0, year: 2018, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/trinidad-and-tobago', modeled: true },
  BHS: { name: 'Багамы', nameEn: 'The Bahamas', iso: 44, population: 412000, meanIncome: 31000, gini: 41.0, year: 2018, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/bahamas', modeled: true },
  VUT: { name: 'Вануату', nameEn: 'Vanuatu', iso: 548, population: 330000, meanIncome: 3200, gini: 32.3, year: 2019, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/vanuatu', modeled: true },
  SLB: { name: 'Соломоновы о-ва', nameEn: 'Solomon Islands', iso: 90, population: 740000, meanIncome: 2200, gini: 37.1, year: 2013, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/solomon-islands', modeled: true },
  TLS: { name: 'Восточный Тимор', nameEn: 'East Timor', iso: 626, population: 1360000, meanIncome: 2200, gini: 28.7, year: 2014, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/timor-leste', modeled: true },
  BRN: { name: 'Бруней', nameEn: 'Brunei', iso: 96, population: 450000, meanIncome: 33000, gini: 33.0, year: 2022, source: 'AI predicted', sourceUrl: '', predicted: true },
  MDV: { name: 'Мальдивы', nameEn: 'Maldives', iso: 462, population: 520000, meanIncome: 11400, gini: 29.3, year: 2019, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/maldives', modeled: true },
  COM: { name: 'Коморы', nameEn: 'Comoros', iso: 174, population: 850000, meanIncome: 1500, gini: 45.3, year: 2014, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/comoros', modeled: true },
  DJI: { name: 'Джибути', nameEn: 'Djibouti', iso: 262, population: 1140000, meanIncome: 3500, gini: 41.6, year: 2017, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/djibouti', modeled: true },
  CPV: { name: 'Кабо-Верде', nameEn: 'Cape Verde', iso: 132, population: 600000, meanIncome: 4300, gini: 42.4, year: 2015, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/cabo-verde', modeled: true },
  GNB: { name: 'Гвинея-Бисау', nameEn: 'Guinea Bissau', iso: 624, population: 2100000, meanIncome: 800, gini: 35.5, year: 2018, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/guinea-bissau', modeled: true },
  MRT: { name: 'Мавритания', nameEn: 'Mauritania', iso: 478, population: 4900000, meanIncome: 2200, gini: 32.6, year: 2014, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/mauritania', modeled: true },
  GMB: { name: 'Гамбия', nameEn: 'Gambia', iso: 270, population: 2700000, meanIncome: 800, gini: 35.9, year: 2015, source: 'World Bank', sourceUrl: 'https://data.worldbank.org/country/gambia', modeled: true },
  AND: { name: 'Андорра', nameEn: 'Andorra', iso: 20, population: 80000, meanIncome: 42000, gini: 30.0, year: 2022, source: 'AI predicted', sourceUrl: '', predicted: true },
  MCO: { name: 'Монако', nameEn: 'Monaco', iso: 492, population: 39000, meanIncome: 195000, gini: 30.0, year: 2022, source: 'AI predicted', sourceUrl: '', predicted: true },
  SMR: { name: 'Сан-Марино', nameEn: 'San Marino', iso: 674, population: 33500, meanIncome: 53000, gini: 30.0, year: 2022, source: 'AI predicted', sourceUrl: '', predicted: true },
};

// remove the dummy
delete COUNTRIES.ISL_DUMMY;

// Build numeric ISO → alpha-3 map for matching with world-atlas TopoJSON
const ISO_NUMERIC_TO_ALPHA3 = {};
for (const [a3, c] of Object.entries(COUNTRIES)) {
  if (c && c.iso) ISO_NUMERIC_TO_ALPHA3[c.iso] = a3;
}

// Predefined groups
const GROUPS = {
  WORLD: {
    name: 'Весь мир',
    nameEn: 'World',
    description: 'Все страны с доступными данными',
    members: 'all',
  },
  EU: {
    name: 'Европейский союз',
    nameEn: 'European Union',
    description: '27 стран ЕС',
    members: ['DEU','FRA','ITA','ESP','POL','ROU','NLD','BEL','GRC','PRT','CZE','SWE','HUN','AUT','BGR','DNK','FIN','SVK','IRL','HRV','LTU','SVN','LVA','EST','CYP','LUX','MLT'],
  },
  G7: {
    name: 'G7',
    nameEn: 'G7',
    description: 'США, Канада, Великобритания, Германия, Франция, Италия, Япония',
    members: ['USA','CAN','GBR','DEU','FRA','ITA','JPN'],
  },
  G20: {
    name: 'G20',
    nameEn: 'G20',
    description: '19 стран + ЕС',
    members: ['USA','CAN','GBR','DEU','FRA','ITA','JPN','RUS','CHN','IND','BRA','MEX','ARG','AUS','KOR','IDN','TUR','SAU','ZAF'],
  },
  OECD: {
    name: 'ОЭСР',
    nameEn: 'OECD',
    description: '38 стран Организации экономического сотрудничества',
    members: ['USA','CAN','GBR','DEU','FRA','ITA','JPN','AUS','NZL','KOR','MEX','CHL','COL','CRI','BEL','NLD','LUX','CHE','AUT','IRL','DNK','SWE','NOR','FIN','ISL','POL','CZE','SVK','HUN','SVN','EST','LVA','LTU','PRT','ESP','GRC','TUR','ISR'],
  },
  BRICS: {
    name: 'БРИКС',
    nameEn: 'BRICS',
    description: 'Бразилия, Россия, Индия, Китай, ЮАР (+Иран, ОАЭ, Египет, Эфиопия)',
    members: ['BRA','RUS','IND','CHN','ZAF','IRN','ARE','EGY','ETH'],
  },
  ASEAN: {
    name: 'АСЕАН',
    nameEn: 'ASEAN',
    description: '10 стран Юго-Восточной Азии',
    members: ['IDN','THA','VNM','PHL','MYS','SGP','MMR','KHM','LAO','BRN'],
  },
  EAEU: {
    name: 'ЕАЭС',
    nameEn: 'Eurasian Economic Union',
    description: 'Россия, Беларусь, Казахстан, Армения, Киргизия',
    members: ['RUS','BLR','KAZ','ARM','KGZ'],
  },
  CIS: {
    name: 'СНГ',
    nameEn: 'Commonwealth of Independent States',
    description: 'Содружество Независимых Государств',
    members: ['RUS','BLR','KAZ','ARM','AZE','KGZ','MDA','TJK','UZB'],
  },
  LATAM: {
    name: 'Латинская Америка',
    nameEn: 'Latin America',
    description: 'Страны Центральной и Южной Америки',
    members: ['BRA','MEX','ARG','COL','CHL','PER','VEN','ECU','BOL','PRY','URY','CUB','DOM','GTM','HND','NIC','CRI','PAN','SLV','HTI','JAM'],
  },
  SSA: {
    name: 'Африка к югу от Сахары',
    nameEn: 'Sub-Saharan Africa',
    description: 'Страны южнее Сахары',
    members: ['ZAF','NGA','ETH','COD','TZA','KEN','UGA','GHA','AGO','MOZ','ZMB','ZWE','CIV','CMR','SEN','MLI','RWA','BFA','MDG','TCD','NER','BDI','MWI','BWA','NAM','GAB','COG','SSD','ERI','CAF','LBR','SLE','LSO','SWZ','SOM','GNQ','GIN','BEN','TGO','GMB','GNB','MRT','CPV','COM','DJI','MUS'],
  },
  MENA: {
    name: 'MENA',
    nameEn: 'Middle East & North Africa',
    description: 'Ближний Восток и Северная Африка',
    members: ['SAU','ARE','ISR','TUR','IRN','IRQ','JOR','LBN','SYR','YEM','QAT','KWT','OMN','BHR','EGY','MAR','DZA','TUN','LBY','SDN'],
  },
  GCC: {
    name: 'ССАГПЗ',
    nameEn: 'Gulf Cooperation Council',
    description: 'Совет сотрудничества арабских государств Залива',
    members: ['SAU','ARE','QAT','KWT','OMN','BHR'],
  },
  ANGLO: {
    name: 'Англоязычные',
    nameEn: 'Anglosphere',
    description: 'США, Канада, Великобритания, Австралия, Новая Зеландия, Ирландия',
    members: ['USA','CAN','GBR','AUS','NZL','IRL'],
  },
  NORDIC: {
    name: 'Северные страны',
    nameEn: 'Nordic countries',
    description: 'Дания, Швеция, Норвегия, Финляндия, Исландия',
    members: ['DNK','SWE','NOR','FIN','ISL'],
  },
};

// ════════════════════════════════════════════════════════════════════
//  PUBLIC ULTRA-HIGH-NET-WORTH INDIVIDUALS
// ════════════════════════════════════════════════════════════════════
// Selected names from the Forbes Real-Time Billionaires List
// (approximate figures, mid-2024, rounded to nearest $5B for the very top
// and $1B at the lower end). Used to put concrete names against the
// "Топ N человек в стране" display when the user's annual income places
// them near the very top.
//
// IMPORTANT: net worth ≠ annual income. Forbes tracks total wealth, not
// salary. This list is presented in the UI with that caveat — public
// data on individual annual income worldwide simply does not exist.
//
// Country code is the person's primary tax/business country (Forbes
// "Citizenship"). Some prominent figures (e.g. Lakshmi Mittal, Leonard
// Blavatnik) are tracked under their resident country, not country of
// birth.
const PEOPLE = [
  // ─── United States ───
  { nameEn: 'Elon Musk',                    nameRu: 'Илон Маск',                       country: 'USA', netWorth: 220, year: 2024 },
  { nameEn: 'Jeff Bezos',                   nameRu: 'Джефф Безос',                     country: 'USA', netWorth: 200, year: 2024 },
  { nameEn: 'Mark Zuckerberg',              nameRu: 'Марк Цукерберг',                  country: 'USA', netWorth: 175, year: 2024 },
  { nameEn: 'Larry Ellison',                nameRu: 'Ларри Эллисон',                   country: 'USA', netWorth: 165, year: 2024 },
  { nameEn: 'Warren Buffett',               nameRu: 'Уоррен Баффетт',                  country: 'USA', netWorth: 135, year: 2024 },
  { nameEn: 'Bill Gates',                   nameRu: 'Билл Гейтс',                      country: 'USA', netWorth: 130, year: 2024 },
  { nameEn: 'Steve Ballmer',                nameRu: 'Стив Балмер',                     country: 'USA', netWorth: 130, year: 2024 },
  { nameEn: 'Larry Page',                   nameRu: 'Ларри Пейдж',                     country: 'USA', netWorth: 125, year: 2024 },
  { nameEn: 'Sergey Brin',                  nameRu: 'Сергей Брин',                     country: 'USA', netWorth: 120, year: 2024 },
  { nameEn: 'Jensen Huang',                 nameRu: 'Дженсен Хуанг (NVIDIA)',          country: 'USA', netWorth: 110, year: 2024 },
  { nameEn: 'Michael Bloomberg',            nameRu: 'Майкл Блумберг',                  country: 'USA', netWorth: 105, year: 2024 },
  { nameEn: 'Michael Dell',                 nameRu: 'Майкл Делл',                      country: 'USA', netWorth: 100, year: 2024 },
  { nameEn: 'Jim Walton',                   nameRu: 'Джим Уолтон',                     country: 'USA', netWorth: 95,  year: 2024 },
  { nameEn: 'Rob Walton',                   nameRu: 'Роб Уолтон',                      country: 'USA', netWorth: 95,  year: 2024 },
  { nameEn: 'Alice Walton',                 nameRu: 'Элис Уолтон',                     country: 'USA', netWorth: 80,  year: 2024 },
  { nameEn: 'Julia Koch & family',          nameRu: 'Джулия Кох (семья)',              country: 'USA', netWorth: 65,  year: 2024 },
  { nameEn: 'Charles Koch',                 nameRu: 'Чарльз Кох',                      country: 'USA', netWorth: 60,  year: 2024 },
  { nameEn: 'Phil Knight & family',         nameRu: 'Фил Найт (Nike)',                 country: 'USA', netWorth: 40,  year: 2024 },
  { nameEn: 'John Mars',                    nameRu: 'Джон Марс (Mars Inc.)',           country: 'USA', netWorth: 40,  year: 2024 },
  { nameEn: 'Jacqueline Mars',              nameRu: 'Жаклин Марс (Mars Inc.)',         country: 'USA', netWorth: 40,  year: 2024 },
  { nameEn: 'Stephen Schwarzman',           nameRu: 'Стивен Шварцман (Blackstone)',    country: 'USA', netWorth: 38,  year: 2024 },
  { nameEn: 'Ken Griffin',                  nameRu: 'Кен Гриффин (Citadel)',           country: 'USA', netWorth: 37,  year: 2024 },
  { nameEn: 'Mackenzie Scott',              nameRu: 'Маккензи Скотт',                  country: 'USA', netWorth: 35,  year: 2024 },
  { nameEn: 'Thomas Frist Jr. & family',    nameRu: 'Томас Фрист (HCA Healthcare)',    country: 'USA', netWorth: 25,  year: 2024 },
  { nameEn: 'Leonard Lauder',               nameRu: 'Леонард Лаудер',                  country: 'USA', netWorth: 22,  year: 2024 },
  { nameEn: 'David Tepper',                 nameRu: 'Дэвид Теппер',                    country: 'USA', netWorth: 21,  year: 2024 },
  { nameEn: 'Stanley Kroenke',              nameRu: 'Стэнли Кронке',                   country: 'USA', netWorth: 16,  year: 2024 },
  { nameEn: 'Jim Simons',                   nameRu: 'Джим Саймонс (Renaissance)',      country: 'USA', netWorth: 31,  year: 2023 },

  // ─── France ───
  { nameEn: 'Bernard Arnault & family',     nameRu: 'Бернар Арно (LVMH)',              country: 'FRA', netWorth: 220, year: 2024 },
  { nameEn: 'Françoise Bettencourt Meyers', nameRu: 'Франсуаза Бетанкур Мейерс (LʼOréal)', country: 'FRA', netWorth: 100, year: 2024 },
  { nameEn: 'Gérard Wertheimer',            nameRu: 'Жерар Вертхаймер (Chanel)',       country: 'FRA', netWorth: 50,  year: 2024 },
  { nameEn: 'Alain Wertheimer',             nameRu: 'Ален Вертхаймер (Chanel)',        country: 'FRA', netWorth: 50,  year: 2024 },
  { nameEn: 'François Pinault & family',    nameRu: 'Франсуа Пино (Kering)',           country: 'FRA', netWorth: 38,  year: 2024 },
  { nameEn: 'Vincent Bolloré',              nameRu: 'Венсан Боллоре',                  country: 'FRA', netWorth: 10,  year: 2024 },

  // ─── Germany ───
  { nameEn: 'Dieter Schwarz',               nameRu: 'Дитер Шварц (Lidl/Kaufland)',     country: 'DEU', netWorth: 45,  year: 2024 },
  { nameEn: 'Klaus-Michael Kühne',          nameRu: 'Клаус-Михаэль Кюне',              country: 'DEU', netWorth: 40,  year: 2024 },
  { nameEn: 'Reinhold Würth',               nameRu: 'Райнхольд Вюрт',                  country: 'DEU', netWorth: 30,  year: 2024 },
  { nameEn: 'Susanne Klatten',              nameRu: 'Сюзанна Клаттен (BMW)',           country: 'DEU', netWorth: 28,  year: 2024 },
  { nameEn: 'Stefan Quandt',                nameRu: 'Штефан Квандт (BMW)',             country: 'DEU', netWorth: 25,  year: 2024 },
  { nameEn: 'Beate Heister & Karl Albrecht Jr.', nameRu: 'Беате Хайстер и Карл Альбрехт-мл. (Aldi Süd)', country: 'DEU', netWorth: 18, year: 2024 },
  { nameEn: 'Theo Albrecht Jr.',            nameRu: 'Тео Альбрехт-мл. (Aldi Nord)',    country: 'DEU', netWorth: 20,  year: 2024 },
  { nameEn: 'Andreas Strüngmann',           nameRu: 'Андреас Штрюнгманн (BioNTech)',   country: 'DEU', netWorth: 9,   year: 2024 },
  { nameEn: 'Thomas Strüngmann',            nameRu: 'Томас Штрюнгманн (BioNTech)',     country: 'DEU', netWorth: 9,   year: 2024 },

  // ─── Russia ───
  { nameEn: 'Vagit Alekperov',              nameRu: 'Вагит Алекперов (Лукойл)',        country: 'RUS', netWorth: 28,  year: 2024 },
  { nameEn: 'Vladimir Potanin',             nameRu: 'Владимир Потанин (Норникель)',    country: 'RUS', netWorth: 28,  year: 2024 },
  { nameEn: 'Leonid Mikhelson',             nameRu: 'Леонид Михельсон (Новатэк)',      country: 'RUS', netWorth: 25,  year: 2024 },
  { nameEn: 'Vladimir Lisin',               nameRu: 'Владимир Лисин (НЛМК)',           country: 'RUS', netWorth: 25,  year: 2024 },
  { nameEn: 'Alexey Mordashov & family',    nameRu: 'Алексей Мордашов (Северсталь)',   country: 'RUS', netWorth: 22,  year: 2024 },
  { nameEn: 'Andrey Melnichenko',           nameRu: 'Андрей Мельниченко (ЕвроХим)',    country: 'RUS', netWorth: 22,  year: 2024 },
  { nameEn: 'Gennady Timchenko',            nameRu: 'Геннадий Тимченко',               country: 'RUS', netWorth: 22,  year: 2024 },
  { nameEn: 'Pavel Durov',                  nameRu: 'Павел Дуров (Telegram)',          country: 'RUS', netWorth: 15,  year: 2024 },
  { nameEn: 'Mikhail Fridman',              nameRu: 'Михаил Фридман',                  country: 'RUS', netWorth: 13,  year: 2024 },
  { nameEn: 'Alisher Usmanov',              nameRu: 'Алишер Усманов',                  country: 'RUS', netWorth: 13,  year: 2024 },
  { nameEn: 'Roman Abramovich',             nameRu: 'Роман Абрамович',                 country: 'RUS', netWorth: 9,   year: 2024 },
  { nameEn: 'Tatyana Bakalchuk',            nameRu: 'Татьяна Бакальчук (Wildberries)', country: 'RUS', netWorth: 6,   year: 2024 },

  // ─── China ───
  { nameEn: 'Zhong Shanshan',               nameRu: 'Чжун Шаньшань (Nongfu Spring)',   country: 'CHN', netWorth: 60,  year: 2024 },
  { nameEn: 'Zhang Yiming',                 nameRu: 'Чжан Имин (ByteDance / TikTok)',  country: 'CHN', netWorth: 50,  year: 2024 },
  { nameEn: 'Ma Huateng (Pony Ma)',         nameRu: 'Ма Хуатэн (Tencent)',             country: 'CHN', netWorth: 45,  year: 2024 },
  { nameEn: 'Colin Huang',                  nameRu: 'Колин Хуан (Pinduoduo)',          country: 'CHN', netWorth: 45,  year: 2024 },
  { nameEn: 'Robin Zeng',                   nameRu: 'Робин Цзэн (CATL)',               country: 'CHN', netWorth: 35,  year: 2024 },
  { nameEn: 'Jack Ma',                      nameRu: 'Джек Ма (Alibaba)',               country: 'CHN', netWorth: 25,  year: 2024 },
  { nameEn: 'William Ding',                 nameRu: 'Уильям Дин (NetEase)',            country: 'CHN', netWorth: 25,  year: 2024 },
  { nameEn: 'Wang Wei',                     nameRu: 'Ван Вэй (SF Express)',            country: 'CHN', netWorth: 22,  year: 2024 },
  { nameEn: 'He Xiangjian',                 nameRu: 'Хэ Сянцзянь (Midea)',             country: 'CHN', netWorth: 22,  year: 2024 },
  { nameEn: 'Lei Jun',                      nameRu: 'Лэй Цзюнь (Xiaomi)',              country: 'CHN', netWorth: 17,  year: 2024 },
  { nameEn: 'Liu Yongxing',                 nameRu: 'Лю Юнсин (East Hope)',            country: 'CHN', netWorth: 18,  year: 2024 },
  { nameEn: 'Robin Li',                     nameRu: 'Робин Ли (Baidu)',                country: 'CHN', netWorth: 11,  year: 2024 },

  // ─── India ───
  { nameEn: 'Mukesh Ambani',                nameRu: 'Мукеш Амбани (Reliance)',         country: 'IND', netWorth: 110, year: 2024 },
  { nameEn: 'Gautam Adani & family',        nameRu: 'Гаутам Адани (Adani Group)',      country: 'IND', netWorth: 80,  year: 2024 },
  { nameEn: 'Shiv Nadar',                   nameRu: 'Шив Надар (HCL)',                 country: 'IND', netWorth: 36,  year: 2024 },
  { nameEn: 'Savitri Jindal & family',      nameRu: 'Савитри Джиндал (Jindal Group)',  country: 'IND', netWorth: 35,  year: 2024 },
  { nameEn: 'Radhakishan Damani',           nameRu: 'Радхакишан Дамани (DMart)',       country: 'IND', netWorth: 25,  year: 2024 },
  { nameEn: 'Cyrus Poonawalla',             nameRu: 'Сайрус Пунавалла (Serum Inst.)',  country: 'IND', netWorth: 22,  year: 2024 },
  { nameEn: 'Dilip Shanghvi',               nameRu: 'Дилип Шангви (Sun Pharma)',       country: 'IND', netWorth: 20,  year: 2024 },
  { nameEn: 'Kumar Birla',                  nameRu: 'Кумар Бирла (Aditya Birla Group)',country: 'IND', netWorth: 18,  year: 2024 },

  // ─── Mexico, Latin America ───
  { nameEn: 'Carlos Slim Helú & family',    nameRu: 'Карлос Слим (América Móvil)',     country: 'MEX', netWorth: 100, year: 2024 },
  { nameEn: 'Germán Larrea Mota Velasco',   nameRu: 'Херман Ларреа (Grupo México)',    country: 'MEX', netWorth: 30,  year: 2024 },
  { nameEn: 'Ricardo Salinas Pliego',       nameRu: 'Рикардо Салинас Плиего',          country: 'MEX', netWorth: 12,  year: 2024 },
  { nameEn: 'Eduardo Saverin',              nameRu: 'Эдуардо Саверин (Facebook)',      country: 'BRA', netWorth: 30,  year: 2024 },
  { nameEn: 'Jorge Paulo Lemann',           nameRu: 'Жоржи Паулу Леманн',              country: 'BRA', netWorth: 20,  year: 2024 },
  { nameEn: 'Joseph Safra family',          nameRu: 'Семья Сафра (Safra Group)',       country: 'BRA', netWorth: 20,  year: 2024 },
  { nameEn: 'Iris Fontbona & family',       nameRu: 'Ирис Фонтбона (Antofagasta)',     country: 'CHL', netWorth: 22,  year: 2024 },

  // ─── Italy ───
  { nameEn: 'Giovanni Ferrero',             nameRu: 'Джованни Ферреро (Ferrero)',      country: 'ITA', netWorth: 45,  year: 2024 },
  { nameEn: 'Del Vecchio family',           nameRu: 'Семья Дель Веккио (EssilorLuxottica)', country: 'ITA', netWorth: 30, year: 2024 },
  { nameEn: 'Giorgio Armani',               nameRu: 'Джорджо Армани',                  country: 'ITA', netWorth: 11,  year: 2024 },
  { nameEn: 'Berlusconi family',            nameRu: 'Семья Берлускони',                country: 'ITA', netWorth: 8,   year: 2024 },

  // ─── Spain ───
  { nameEn: 'Amancio Ortega',               nameRu: 'Амансио Ортега (Inditex / Zara)', country: 'ESP', netWorth: 110, year: 2024 },
  { nameEn: 'Sandra Ortega Mera',           nameRu: 'Сандра Ортега Мера',              country: 'ESP', netWorth: 9,   year: 2024 },
  { nameEn: 'Juan Roig',                    nameRu: 'Хуан Ройг (Mercadona)',           country: 'ESP', netWorth: 5,   year: 2024 },

  // ─── United Kingdom ───
  { nameEn: 'Leonard Blavatnik',            nameRu: 'Леонард Блаватник',               country: 'GBR', netWorth: 30,  year: 2024 },
  { nameEn: 'David & Simon Reuben',         nameRu: 'Дэвид и Саймон Рюбен',            country: 'GBR', netWorth: 26,  year: 2024 },
  { nameEn: 'Hinduja brothers',             nameRu: 'Братья Хиндуджа',                 country: 'GBR', netWorth: 20,  year: 2024 },
  { nameEn: 'Lakshmi Mittal & family',      nameRu: 'Лакшми Миттал (ArcelorMittal)',   country: 'GBR', netWorth: 16,  year: 2024 },
  { nameEn: 'James Dyson',                  nameRu: 'Джеймс Дайсон',                   country: 'GBR', netWorth: 13,  year: 2024 },

  // ─── Switzerland, Netherlands, Sweden ───
  { nameEn: 'Ernesto Bertarelli & family',  nameRu: 'Эрнесто Бертарелли',              country: 'CHE', netWorth: 11,  year: 2024 },
  { nameEn: 'Gianluigi Aponte & family',    nameRu: 'Джанлуиджи Апонте (MSC)',         country: 'CHE', netWorth: 31,  year: 2024 },
  { nameEn: 'Stefan Persson',               nameRu: 'Стефан Перссон (H&M)',            country: 'SWE', netWorth: 22,  year: 2024 },
  { nameEn: 'Charlene de Carvalho-Heineken',nameRu: 'Шарлин де Карвальо-Хайнекен',     country: 'NLD', netWorth: 18,  year: 2024 },

  // ─── Asia (Japan, Korea, HK, Singapore, Taiwan) ───
  { nameEn: 'Tadashi Yanai & family',       nameRu: 'Тадаси Янаи (Uniqlo)',            country: 'JPN', netWorth: 45,  year: 2024 },
  { nameEn: 'Takemitsu Takizaki',           nameRu: 'Такэмицу Такидзаки (Keyence)',    country: 'JPN', netWorth: 24,  year: 2024 },
  { nameEn: 'Masayoshi Son',                nameRu: 'Масаёси Сон (SoftBank)',          country: 'JPN', netWorth: 25,  year: 2024 },
  { nameEn: 'Jay Y. Lee',                   nameRu: 'Ли Чжэён (Samsung)',              country: 'KOR', netWorth: 9,   year: 2024 },
  { nameEn: 'Li Ka-shing',                  nameRu: 'Ли Кашин',                        country: 'HKG', netWorth: 38,  year: 2024 },
  { nameEn: 'Lee Shau Kee',                 nameRu: 'Ли Шаукей',                       country: 'HKG', netWorth: 28,  year: 2024 },
  { nameEn: 'Robert & Philip Ng',           nameRu: 'Роберт и Филип Ынь (Far East)',   country: 'SGP', netWorth: 14,  year: 2024 },
  { nameEn: 'Goh Cheng Liang',              nameRu: 'Го Чэнлян (Nippon Paint)',        country: 'SGP', netWorth: 11,  year: 2024 },
  { nameEn: 'Terry Gou',                    nameRu: 'Терри Гоу (Foxconn)',             country: 'TWN', netWorth: 12,  year: 2024 },

  // ─── Middle East ───
  { nameEn: 'Prince Alwaleed bin Talal',    nameRu: 'Принц Аль-Валид ибн Талал',       country: 'SAU', netWorth: 16,  year: 2024 },
  { nameEn: 'Mohammed Al Amoudi',           nameRu: 'Мохаммед Аль-Амуди',              country: 'SAU', netWorth: 9,   year: 2024 },
  { nameEn: 'Hussain Sajwani',              nameRu: 'Хусейн Саджвани (DAMAC)',         country: 'ARE', netWorth: 6,   year: 2024 },
  { nameEn: 'Eyal Ofer',                    nameRu: 'Эйаль Офер',                      country: 'ISR', netWorth: 16,  year: 2024 },
  { nameEn: 'Idan Ofer',                    nameRu: 'Идан Офер',                       country: 'ISR', netWorth: 15,  year: 2024 },

  // ─── Australia, Canada ───
  { nameEn: 'Gina Rinehart',                nameRu: 'Джина Райнхарт',                  country: 'AUS', netWorth: 30,  year: 2024 },
  { nameEn: 'Andrew Forrest',               nameRu: 'Эндрю Форрест (Fortescue)',       country: 'AUS', netWorth: 20,  year: 2024 },
  { nameEn: 'Anthony Pratt & family',       nameRu: 'Энтони Пратт (Visy)',             country: 'AUS', netWorth: 15,  year: 2024 },
  { nameEn: 'David Thomson & family',       nameRu: 'Дэвид Томсон (Thomson Reuters)',  country: 'CAN', netWorth: 70,  year: 2024 },
  { nameEn: 'Joseph Tsai',                  nameRu: 'Джозеф Цай (Alibaba)',            country: 'CAN', netWorth: 13,  year: 2024 },

  // ─── Indonesia, Thailand, Vietnam ───
  { nameEn: 'R. Budi Hartono',              nameRu: 'Р. Буди Хартоно (Djarum / BCA)',  country: 'IDN', netWorth: 27,  year: 2024 },
  { nameEn: 'Michael Hartono',              nameRu: 'Майкл Хартоно',                   country: 'IDN', netWorth: 25,  year: 2024 },
  { nameEn: 'Charoen Sirivadhanabhakdi',    nameRu: 'Чароен Сириваттанапхакди (TCC)',  country: 'THA', netWorth: 13,  year: 2024 },
  { nameEn: 'Yoovidhya family',             nameRu: 'Семья Йювитья (Red Bull TH)',     country: 'THA', netWorth: 25,  year: 2024 },
  { nameEn: 'Pham Nhat Vuong',              nameRu: 'Фам Нят Выонг (Vingroup)',        country: 'VNM', netWorth: 8,   year: 2024 },
];

const PEOPLE_SOURCE_URL = 'https://www.forbes.com/real-time-billionaires/';
const PEOPLE_SOURCE_LABEL = 'Forbes Real-Time Billionaires (2024)';
