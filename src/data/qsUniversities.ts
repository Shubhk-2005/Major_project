export interface QsUniversity {
  id: string;
  rank: number;
  name: string;
  country: string;
  region: string;
  tuitionRaw: string;
  tuitionUSD: number | null;
  notes?: string;
}

export const qsTop150Universities: QsUniversity[] = [
  {
    "id": "qs-1-massachusetts-institute-of-tec",
    "rank": 1,
    "name": "Massachusetts Institute of Technology (MIT)",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "64,310",
    "tuitionUSD": 64310,
    "notes": "Standard grad tuition 2025-26; verified on MIT Registrar site"
  },
  {
    "id": "qs-2-stanford-university",
    "rank": 2,
    "name": "Stanford University",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "63,540",
    "tuitionUSD": 63540,
    "notes": "~$21,180/quarter x 3 quarters; verified 2025-26"
  },
  {
    "id": "qs-3-carnegie-mellon-university",
    "rank": 3,
    "name": "Carnegie Mellon University",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "57,500",
    "tuitionUSD": 57500,
    "notes": "MSCS approx first-year tuition; verify exact program/track on CMU SCS site"
  },
  {
    "id": "qs-4-national-university-of-singapo",
    "rank": 4,
    "name": "National University of Singapore (NUS)",
    "country": "Singapore",
    "region": "Asia",
    "tuitionRaw": "45,490",
    "tuitionUSD": 45490,
    "notes": "Fee varies significantly by citizenship (SG/PR/international)"
  },
  {
    "id": "qs-4-university-of-oxford",
    "rank": 4,
    "name": "University of Oxford",
    "country": "United Kingdom",
    "region": "Europe",
    "tuitionRaw": "40,000",
    "tuitionUSD": 40000,
    "notes": "MSc Computer Science approx (GBP ~31, 590 converted); verify current GBP rate"
  },
  {
    "id": "qs-6-university-of-california-berke",
    "rank": 6,
    "name": "University of California Berkeley",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "37,000",
    "tuitionUSD": 37000,
    "notes": "MEng fee varies by cohort/program"
  },
  {
    "id": "qs-7-harvard-university",
    "rank": 7,
    "name": "Harvard University",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "67,504",
    "tuitionUSD": 67504,
    "notes": ""
  },
  {
    "id": "qs-8-university-of-cambridge",
    "rank": 8,
    "name": "University of Cambridge",
    "country": "United Kingdom",
    "region": "Europe",
    "tuitionRaw": "65,738",
    "tuitionUSD": 65738,
    "notes": ""
  },
  {
    "id": "qs-9-nanyang-technological-universi",
    "rank": 9,
    "name": "Nanyang Technological University (NTU)",
    "country": "Singapore",
    "region": "Asia",
    "tuitionRaw": "Check university website",
    "tuitionUSD": null,
    "notes": ""
  },
  {
    "id": "qs-10-eth-zurich",
    "rank": 10,
    "name": "ETH Zurich",
    "country": "Switzerland",
    "region": "Europe",
    "tuitionRaw": "1822",
    "tuitionUSD": 1822,
    "notes": "Very low tuition (~CHF 730/semester); verify current rate"
  },
  {
    "id": "qs-11-tsinghua-university",
    "rank": 11,
    "name": "Tsinghua University",
    "country": "China",
    "region": "Asia",
    "tuitionRaw": "Check university website",
    "tuitionUSD": null,
    "notes": ""
  },
  {
    "id": "qs-12-imperial-college-london",
    "rank": 12,
    "name": "Imperial College London",
    "country": "United Kingdom",
    "region": "Europe",
    "tuitionRaw": "62,748",
    "tuitionUSD": 62748,
    "notes": "MSc Computing approx; verify current GBP rate"
  },
  {
    "id": "qs-13-university-of-toronto",
    "rank": 13,
    "name": "University of Toronto",
    "country": "Canada",
    "region": "North America",
    "tuitionRaw": "25,337",
    "tuitionUSD": 25337,
    "notes": ""
  },
  {
    "id": "qs-14-princeton-university",
    "rank": 14,
    "name": "Princeton University",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "65,210",
    "tuitionUSD": 65210,
    "notes": "Mostly funded PhD track; limited standalone MS"
  },
  {
    "id": "qs-15-ecole-polytechnique-federale-d",
    "rank": 15,
    "name": "Ecole Polytechnique Federale de Lausanne (EPFL)",
    "country": "Switzerland",
    "region": "Europe",
    "tuitionRaw": "1821.79",
    "tuitionUSD": 1822,
    "notes": "Very low tuition (~CHF 1, 266/year); verify current rate"
  },
  {
    "id": "qs-16-peking-university",
    "rank": 16,
    "name": "Peking University",
    "country": "China",
    "region": "Asia",
    "tuitionRaw": "7,439.09",
    "tuitionUSD": 7439,
    "notes": ""
  },
  {
    "id": "qs-17-cornell-university",
    "rank": 17,
    "name": "Cornell University",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "73,946",
    "tuitionUSD": 73946,
    "notes": "MEng CS fee varies by semester load"
  },
  {
    "id": "qs-18-institute-of-science-tokyo",
    "rank": 18,
    "name": "Institute of Science Tokyo",
    "country": "Japan",
    "region": "Asia",
    "tuitionRaw": "3,997",
    "tuitionUSD": 3997,
    "notes": ""
  },
  {
    "id": "qs-19-university-of-california-los-a",
    "rank": 19,
    "name": "University of California Los Angeles (UCLA)",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "45,000",
    "tuitionUSD": 45000,
    "notes": ""
  },
  {
    "id": "qs-20-university-college-london-ucl-",
    "rank": 20,
    "name": "University College London (UCL)",
    "country": "United Kingdom",
    "region": "Europe",
    "tuitionRaw": "58,247",
    "tuitionUSD": 58247,
    "notes": ""
  },
  {
    "id": "qs-21-yale-university",
    "rank": 21,
    "name": "Yale University",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "50,900",
    "tuitionUSD": 50900,
    "notes": ""
  },
  {
    "id": "qs-22-columbia-university",
    "rank": 22,
    "name": "Columbia University",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "69,168",
    "tuitionUSD": 69168,
    "notes": ""
  },
  {
    "id": "qs-22-new-york-university-nyu-",
    "rank": 22,
    "name": "New York University (NYU)",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "42,534",
    "tuitionUSD": 42534,
    "notes": ""
  },
  {
    "id": "qs-22-university-of-edinburgh",
    "rank": 22,
    "name": "University of Edinburgh",
    "country": "United Kingdom",
    "region": "Europe",
    "tuitionRaw": "61,943.78",
    "tuitionUSD": 61944,
    "notes": ""
  },
  {
    "id": "qs-22-university-of-washington",
    "rank": 22,
    "name": "University of Washington",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "34,800",
    "tuitionUSD": 34800,
    "notes": ""
  },
  {
    "id": "qs-26-technical-university-of-munich",
    "rank": 26,
    "name": "Technical University of Munich (TUM)",
    "country": "Germany",
    "region": "Europe",
    "tuitionRaw": "14,020",
    "tuitionUSD": 14020,
    "notes": "German public unis often have low/no tuition for resident students; verify semester fee"
  },
  {
    "id": "qs-27-university-of-hong-kong-hku-",
    "rank": 27,
    "name": "University of Hong Kong (HKU)",
    "country": "Hong Kong",
    "region": "Asia",
    "tuitionRaw": "47,823.38",
    "tuitionUSD": 47823,
    "notes": ""
  },
  {
    "id": "qs-27-university-of-british-columbia",
    "rank": 27,
    "name": "University of British Columbia (UBC)",
    "country": "Canada",
    "region": "North America",
    "tuitionRaw": "8,192.42",
    "tuitionUSD": 8192,
    "notes": "(plus annual increase, usually 2%-5%)"
  },
  {
    "id": "qs-27-university-of-waterloo",
    "rank": 27,
    "name": "University of Waterloo",
    "country": "Canada",
    "region": "North America",
    "tuitionRaw": "11,457.40",
    "tuitionUSD": 11457,
    "notes": ""
  },
  {
    "id": "qs-30-shanghai-jiao-tong-university",
    "rank": 30,
    "name": "Shanghai Jiao Tong University",
    "country": "China",
    "region": "Asia",
    "tuitionRaw": "4,299.79",
    "tuitionUSD": 4300,
    "notes": ""
  },
  {
    "id": "qs-31-university-of-melbourne",
    "rank": 31,
    "name": "University of Melbourne",
    "country": "Australia",
    "region": "Oceania",
    "tuitionRaw": "45,127.91",
    "tuitionUSD": 45128,
    "notes": ""
  },
  {
    "id": "qs-32-university-of-illinois-urbana-",
    "rank": 32,
    "name": "University of Illinois Urbana-Champaign (UIUC)",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "35,458.00",
    "tuitionUSD": 35458,
    "notes": ""
  },
  {
    "id": "qs-33-hong-kong-university-of-scienc",
    "rank": 33,
    "name": "Hong Kong University of Science and Technology (HKUST)",
    "country": "Hong Kong",
    "region": "Asia",
    "tuitionRaw": "40,814.53",
    "tuitionUSD": 40815,
    "notes": ""
  },
  {
    "id": "qs-34-georgia-institute-of-technolog",
    "rank": 34,
    "name": "Georgia Institute of Technology",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "~35,000",
    "tuitionUSD": 35000,
    "notes": "Flat fee of $180 per credit hour for all students"
  },
  {
    "id": "qs-34-zhejiang-university",
    "rank": 34,
    "name": "Zhejiang University",
    "country": "China",
    "region": "Asia",
    "tuitionRaw": "5,475.17",
    "tuitionUSD": 5475,
    "notes": "3 years of course"
  },
  {
    "id": "qs-36-university-of-pennsylvania",
    "rank": 36,
    "name": "University of Pennsylvania",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "8,825",
    "tuitionUSD": 8825,
    "notes": "The fees is for per course unit (it can be 1cu,2cu,3cu,4cu)"
  },
  {
    "id": "qs-37-chinese-university-of-hong-kon",
    "rank": 37,
    "name": "Chinese University of Hong Kong (CUHK)",
    "country": "Hong Kong",
    "region": "Asia",
    "tuitionRaw": "16,588.39",
    "tuitionUSD": 16588,
    "notes": ""
  },
  {
    "id": "qs-38-university-of-sydney",
    "rank": 38,
    "name": "University of Sydney",
    "country": "Australia",
    "region": "Oceania",
    "tuitionRaw": "41,497",
    "tuitionUSD": 41497,
    "notes": ""
  },
  {
    "id": "qs-39-university-of-texas-at-austin",
    "rank": 39,
    "name": "University of Texas at Austin",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "34,000",
    "tuitionUSD": 34000,
    "notes": ""
  },
  {
    "id": "qs-40-california-institute-of-techno",
    "rank": 40,
    "name": "California Institute of Technology (Caltech)",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "68,001",
    "tuitionUSD": 68001,
    "notes": ""
  },
  {
    "id": "qs-41-university-of-tokyo",
    "rank": 41,
    "name": "University of Tokyo",
    "country": "Japan",
    "region": "Asia",
    "tuitionRaw": "3,366.84",
    "tuitionUSD": 3367,
    "notes": ""
  },
  {
    "id": "qs-42-university-of-california-san-d",
    "rank": 42,
    "name": "University of California San Diego (UCSD)",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "58,080",
    "tuitionUSD": 58080,
    "notes": ""
  },
  {
    "id": "qs-43-mcgill-university",
    "rank": 43,
    "name": "McGill University",
    "country": "Canada",
    "region": "North America",
    "tuitionRaw": "7,717.52",
    "tuitionUSD": 7718,
    "notes": ""
  },
  {
    "id": "qs-44-indian-institute-of-technology",
    "rank": 44,
    "name": "Indian Institute of Technology Bombay (IIT Bombay)",
    "country": "India",
    "region": "Asia",
    "tuitionRaw": "~2,400",
    "tuitionUSD": 2400,
    "notes": "M.Tech CS approx INR ~2 lakh/yr for domestic students; verify"
  },
  {
    "id": "qs-45-indian-institute-of-technology",
    "rank": 45,
    "name": "Indian Institute of Technology Delhi (IIT Delhi)",
    "country": "India",
    "region": "Asia",
    "tuitionRaw": "~2,400",
    "tuitionUSD": 2400,
    "notes": "M.Tech CS approx INR ~2 lakh/yr for domestic students; verify"
  },
  {
    "id": "qs-46-king-s-college-london",
    "rank": 46,
    "name": "King's College London",
    "country": "United Kingdom",
    "region": "Europe",
    "tuitionRaw": "24,753.66",
    "tuitionUSD": 24754,
    "notes": ""
  },
  {
    "id": "qs-47-seoul-national-university",
    "rank": 47,
    "name": "Seoul National University",
    "country": "South Korea",
    "region": "Asia",
    "tuitionRaw": "4,359.47",
    "tuitionUSD": 4359,
    "notes": ""
  },
  {
    "id": "qs-48-australian-national-university",
    "rank": 48,
    "name": "Australian National University (ANU)",
    "country": "Australia",
    "region": "Oceania",
    "tuitionRaw": "41,281.48",
    "tuitionUSD": 41281,
    "notes": ""
  },
  {
    "id": "qs-49-fudan-university",
    "rank": 49,
    "name": "Fudan University",
    "country": "China",
    "region": "Asia",
    "tuitionRaw": "3,273.20",
    "tuitionUSD": 3273,
    "notes": ""
  },
  {
    "id": "qs-50-delft-university-of-technology",
    "rank": 50,
    "name": "Delft University of Technology",
    "country": "Netherlands",
    "region": "Europe",
    "tuitionRaw": "29,912.81",
    "tuitionUSD": 29913,
    "notes": ""
  },
  {
    "id": "qs-51-monash-university",
    "rank": 51,
    "name": "Monash University",
    "country": "Australia",
    "region": "Oceania",
    "tuitionRaw": "44,672.78",
    "tuitionUSD": 44673,
    "notes": ""
  },
  {
    "id": "qs-52-sorbonne-universite",
    "rank": 52,
    "name": "Sorbonne Universite",
    "country": "France",
    "region": "Europe",
    "tuitionRaw": "16,338.14",
    "tuitionUSD": 16338,
    "notes": ""
  },
  {
    "id": "qs-52-university-of-michigan",
    "rank": 52,
    "name": "University of Michigan",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "70,000",
    "tuitionUSD": 70000,
    "notes": ""
  },
  {
    "id": "qs-54-unsw-sydney",
    "rank": 54,
    "name": "UNSW Sydney",
    "country": "Australia",
    "region": "Oceania",
    "tuitionRaw": "46,703.99",
    "tuitionUSD": 46704,
    "notes": ""
  },
  {
    "id": "qs-55-university-of-technology-sydne",
    "rank": 55,
    "name": "University of Technology Sydney (UTS)",
    "country": "Australia",
    "region": "Oceania",
    "tuitionRaw": "24,725",
    "tuitionUSD": 24725,
    "notes": ""
  },
  {
    "id": "qs-56-institut-polytechnique-de-pari",
    "rank": 56,
    "name": "Institut Polytechnique de Paris",
    "country": "France",
    "region": "Europe",
    "tuitionRaw": "17,966.52",
    "tuitionUSD": 17967,
    "notes": ""
  },
  {
    "id": "qs-56-universite-de-montreal",
    "rank": 56,
    "name": "Universite de Montreal",
    "country": "Canada",
    "region": "North America",
    "tuitionRaw": "16,619.91",
    "tuitionUSD": 16620,
    "notes": ""
  },
  {
    "id": "qs-58-politecnico-di-milano",
    "rank": 58,
    "name": "Politecnico di Milano",
    "country": "Italy",
    "region": "Europe",
    "tuitionRaw": "4,599.84",
    "tuitionUSD": 4600,
    "notes": ""
  },
  {
    "id": "qs-58-university-of-manchester",
    "rank": 58,
    "name": "University of Manchester",
    "country": "United Kingdom",
    "region": "Europe",
    "tuitionRaw": "53,720.13",
    "tuitionUSD": 53720,
    "notes": ""
  },
  {
    "id": "qs-60-tecnologico-de-monterrey",
    "rank": 60,
    "name": "Tecnologico de Monterrey",
    "country": "Mexico",
    "region": "Latin America",
    "tuitionRaw": "20,000",
    "tuitionUSD": 20000,
    "notes": ""
  },
  {
    "id": "qs-61-kth-royal-institute-of-technol",
    "rank": 61,
    "name": "KTH Royal Institute of Technology",
    "country": "Sweden",
    "region": "Europe",
    "tuitionRaw": "18,961.36",
    "tuitionUSD": 18961,
    "notes": "EU/EEA students often exempt from tuition"
  },
  {
    "id": "qs-62-university-of-amsterdam",
    "rank": 62,
    "name": "University of Amsterdam",
    "country": "Netherlands",
    "region": "Europe",
    "tuitionRaw": "28,176.89",
    "tuitionUSD": 28177,
    "notes": ""
  },
  {
    "id": "qs-63-ku-leuven",
    "rank": 63,
    "name": "KU Leuven",
    "country": "Belgium",
    "region": "Europe",
    "tuitionRaw": "11,076.89",
    "tuitionUSD": 11077,
    "notes": ""
  },
  {
    "id": "qs-64-university-of-chicago",
    "rank": 64,
    "name": "University of Chicago",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "66,735",
    "tuitionUSD": 66735,
    "notes": "For 9 course program"
  },
  {
    "id": "qs-65-indian-institute-of-technology",
    "rank": 65,
    "name": "Indian Institute of Technology Kanpur (IIT Kanpur)",
    "country": "India",
    "region": "Asia",
    "tuitionRaw": "~2,400",
    "tuitionUSD": 2400,
    "notes": "M.Tech CS approx INR ~2 lakh/yr for domestic students; verify"
  },
  {
    "id": "qs-66-purdue-university-west-lafayet",
    "rank": 66,
    "name": "Purdue University West Lafayette",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "31,000",
    "tuitionUSD": 31000,
    "notes": ""
  },
  {
    "id": "qs-67-city-university-of-hong-kong",
    "rank": 67,
    "name": "City University of Hong Kong",
    "country": "Hong Kong",
    "region": "Asia",
    "tuitionRaw": "Check university website",
    "tuitionUSD": null,
    "notes": ""
  },
  {
    "id": "qs-67-indian-institute-of-technology",
    "rank": 67,
    "name": "Indian Institute of Technology Kharagpur (IIT Kharagpur)",
    "country": "India",
    "region": "Asia",
    "tuitionRaw": "~2,400",
    "tuitionUSD": 2400,
    "notes": "M.Tech CS approx INR ~2 lakh/yr for domestic students; verify"
  },
  {
    "id": "qs-67-johns-hopkins-university",
    "rank": 67,
    "name": "Johns Hopkins University",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "66,670",
    "tuitionUSD": 66670,
    "notes": ""
  },
  {
    "id": "qs-70-hong-kong-polytechnic-universi",
    "rank": 70,
    "name": "Hong Kong Polytechnic University",
    "country": "Hong Kong",
    "region": "Asia",
    "tuitionRaw": "Check university website",
    "tuitionUSD": null,
    "notes": ""
  },
  {
    "id": "qs-71-universidade-de-sao-paulo-usp-",
    "rank": 71,
    "name": "Universidade de Sao Paulo (USP)",
    "country": "Brazil",
    "region": "Latin America",
    "tuitionRaw": "0",
    "tuitionUSD": 0,
    "notes": "Public Brazilian universities are often tuition-free/very low cost"
  },
  {
    "id": "qs-72-sapienza-university-of-rome",
    "rank": 72,
    "name": "Sapienza University of Rome",
    "country": "Italy",
    "region": "Europe",
    "tuitionRaw": "3,410.10",
    "tuitionUSD": 3410,
    "notes": ""
  },
  {
    "id": "qs-73-adelaide-university",
    "rank": 73,
    "name": "Adelaide University",
    "country": "Australia",
    "region": "Oceania",
    "tuitionRaw": "40,815.95",
    "tuitionUSD": 40816,
    "notes": ""
  },
  {
    "id": "qs-73-university-of-southern-califor",
    "rank": 73,
    "name": "University of Southern California (USC)",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "87,744",
    "tuitionUSD": 87744,
    "notes": ""
  },
  {
    "id": "qs-73-universite-paris-saclay",
    "rank": 73,
    "name": "Universite Paris-Saclay",
    "country": "France",
    "region": "Europe",
    "tuitionRaw": "296.11",
    "tuitionUSD": 296,
    "notes": ""
  },
  {
    "id": "qs-76-technische-universitat-berlin-",
    "rank": 76,
    "name": "Technische Universitat Berlin (TU Berlin)",
    "country": "Germany",
    "region": "Europe",
    "tuitionRaw": "~0-1,500",
    "tuitionUSD": 1500,
    "notes": "German public unis often have low/no tuition; verify semester fee"
  },
  {
    "id": "qs-76-universite-paris-sciences-et-l",
    "rank": 76,
    "name": "Universite Paris Sciences et Lettres (PSL)",
    "country": "France",
    "region": "Europe",
    "tuitionRaw": "291.50",
    "tuitionUSD": 292,
    "notes": ""
  },
  {
    "id": "qs-78-queen-mary-university-of-londo",
    "rank": 78,
    "name": "Queen Mary University of London",
    "country": "United Kingdom",
    "region": "Europe",
    "tuitionRaw": "48,042",
    "tuitionUSD": 48042,
    "notes": ""
  },
  {
    "id": "qs-79-indian-institute-of-technology",
    "rank": 79,
    "name": "Indian Institute of Technology Madras (IIT Madras)",
    "country": "India",
    "region": "Asia",
    "tuitionRaw": "~2,400",
    "tuitionUSD": 2400,
    "notes": "M.Tech CS approx INR ~2 lakh/yr for domestic students; verify"
  },
  {
    "id": "qs-80-nanjing-university",
    "rank": 80,
    "name": "Nanjing University",
    "country": "China",
    "region": "Asia",
    "tuitionRaw": "5,652.95",
    "tuitionUSD": 5653,
    "notes": ""
  },
  {
    "id": "qs-80-yonsei-university",
    "rank": 80,
    "name": "Yonsei University",
    "country": "South Korea",
    "region": "Asia",
    "tuitionRaw": "11,000",
    "tuitionUSD": 11000,
    "notes": ""
  },
  {
    "id": "qs-82-korea-university",
    "rank": 82,
    "name": "Korea University",
    "country": "South Korea",
    "region": "Asia",
    "tuitionRaw": "5,344.48",
    "tuitionUSD": 5344,
    "notes": ""
  },
  {
    "id": "qs-82-university-of-science-and-tech",
    "rank": 82,
    "name": "University of Science and Technology of China (USTC)",
    "country": "China",
    "region": "Asia",
    "tuitionRaw": "4,462.86",
    "tuitionUSD": 4463,
    "notes": ""
  },
  {
    "id": "qs-84-university-of-warwick",
    "rank": 84,
    "name": "University of Warwick",
    "country": "United Kingdom",
    "region": "Europe",
    "tuitionRaw": "51,044.87",
    "tuitionUSD": 51045,
    "notes": ""
  },
  {
    "id": "qs-85-harbin-institute-of-technology",
    "rank": 85,
    "name": "Harbin Institute of Technology (HIT)",
    "country": "China",
    "region": "Asia",
    "tuitionRaw": "5,057.90",
    "tuitionUSD": 5058,
    "notes": ""
  },
  {
    "id": "qs-86-university-of-malaya",
    "rank": 86,
    "name": "University of Malaya",
    "country": "Malaysia",
    "region": "Asia",
    "tuitionRaw": "10,715.97",
    "tuitionUSD": 10716,
    "notes": ""
  },
  {
    "id": "qs-86-vellore-institute-of-technolog",
    "rank": 86,
    "name": "Vellore Institute of Technology (VIT) Vellore",
    "country": "India",
    "region": "Asia",
    "tuitionRaw": "8,000",
    "tuitionUSD": 8000,
    "notes": "Private institute; fee is separate from IIT-style government fee structure"
  },
  {
    "id": "qs-88-national-taiwan-university-ntu",
    "rank": 88,
    "name": "National Taiwan University (NTU)",
    "country": "Taiwan",
    "region": "Asia",
    "tuitionRaw": "3930",
    "tuitionUSD": 3930,
    "notes": ""
  },
  {
    "id": "qs-88-university-of-maryland-college",
    "rank": 88,
    "name": "University of Maryland College Park",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "39,014",
    "tuitionUSD": 39014,
    "notes": ""
  },
  {
    "id": "qs-90-beijing-institute-of-technolog",
    "rank": 90,
    "name": "Beijing Institute of Technology (BIT)",
    "country": "China",
    "region": "Asia",
    "tuitionRaw": "5,350",
    "tuitionUSD": 5350,
    "notes": ""
  },
  {
    "id": "qs-91-duke-university",
    "rank": 91,
    "name": "Duke University",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "69,880",
    "tuitionUSD": 69880,
    "notes": ""
  },
  {
    "id": "qs-91-ludwig-maximilians-universitat",
    "rank": 91,
    "name": "Ludwig-Maximilians-Universitat Munchen (LMU Munich)",
    "country": "Germany",
    "region": "Europe",
    "tuitionRaw": "~0-1,500",
    "tuitionUSD": 1500,
    "notes": "German public unis often have low/no tuition; verify semester fee"
  },
  {
    "id": "qs-93-lomonosov-moscow-state-univers",
    "rank": 93,
    "name": "Lomonosov Moscow State University (MSU)",
    "country": "Russia",
    "region": "Europe",
    "tuitionRaw": "7,018.86",
    "tuitionUSD": 7019,
    "notes": ""
  },
  {
    "id": "qs-93-university-of-auckland",
    "rank": 93,
    "name": "University of Auckland",
    "country": "New Zealand",
    "region": "Oceania",
    "tuitionRaw": "7,018.86",
    "tuitionUSD": 7019,
    "notes": ""
  },
  {
    "id": "qs-95-university-of-bologna",
    "rank": 95,
    "name": "University of Bologna",
    "country": "Italy",
    "region": "Europe",
    "tuitionRaw": "4,081.16",
    "tuitionUSD": 4081,
    "notes": ""
  },
  {
    "id": "qs-95-boston-university",
    "rank": 95,
    "name": "Boston University",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "69,870",
    "tuitionUSD": 69870,
    "notes": ""
  },
  {
    "id": "qs-95-kyoto-university",
    "rank": 95,
    "name": "Kyoto University",
    "country": "Japan",
    "region": "Asia",
    "tuitionRaw": "3,366.43",
    "tuitionUSD": 3366,
    "notes": ""
  },
  {
    "id": "qs-95-pennsylvania-state-university",
    "rank": 95,
    "name": "Pennsylvania State University",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "48,000",
    "tuitionUSD": 48000,
    "notes": ""
  },
  {
    "id": "qs-99-tu-wien",
    "rank": 99,
    "name": "TU Wien",
    "country": "Austria",
    "region": "Europe",
    "tuitionRaw": "1,695.14",
    "tuitionUSD": 1695,
    "notes": "EU/EEA students often exempt from tuition"
  },
  {
    "id": "qs-99-university-of-queensland",
    "rank": 99,
    "name": "University of Queensland",
    "country": "Australia",
    "region": "Oceania",
    "tuitionRaw": "38,432.22",
    "tuitionUSD": 38432,
    "notes": ""
  },
  {
    "id": "qs-101-macquarie-university",
    "rank": 101,
    "name": "Macquarie University",
    "country": "Australia",
    "region": "Oceania",
    "tuitionRaw": "Check university website",
    "tuitionUSD": null,
    "notes": ""
  },
  {
    "id": "qs-102-universidad-nacional-autonoma-",
    "rank": 102,
    "name": "Universidad Nacional Autonoma de Mexico (UNAM)",
    "country": "Mexico",
    "region": "Latin America",
    "tuitionRaw": "4,000",
    "tuitionUSD": 4000,
    "notes": ""
  },
  {
    "id": "qs-103-university-of-alberta",
    "rank": 103,
    "name": "University of Alberta",
    "country": "Canada",
    "region": "North America",
    "tuitionRaw": "36,003.19",
    "tuitionUSD": 36003,
    "notes": ""
  },
  {
    "id": "qs-104-king-abdulaziz-university-kau-",
    "rank": 104,
    "name": "King Abdulaziz University (KAU)",
    "country": "Saudi Arabia",
    "region": "Middle East",
    "tuitionRaw": "0",
    "tuitionUSD": 0,
    "notes": "full scholarship"
  },
  {
    "id": "qs-105-universidade-estadual-de-campi",
    "rank": 105,
    "name": "Universidade Estadual de Campinas (UNICAMP)",
    "country": "Brazil",
    "region": "Latin America",
    "tuitionRaw": "0",
    "tuitionUSD": 0,
    "notes": "full scholarship"
  },
  {
    "id": "qs-106-king-fahd-university-of-petrol",
    "rank": 106,
    "name": "King Fahd University of Petroleum and Minerals (KFUPM)",
    "country": "Saudi Arabia",
    "region": "Middle East",
    "tuitionRaw": "0",
    "tuitionUSD": 0,
    "notes": "full scholarship"
  },
  {
    "id": "qs-106-university-of-jordan-uj-",
    "rank": 106,
    "name": "University of Jordan (UJ)",
    "country": "Jordan",
    "region": "Middle East",
    "tuitionRaw": "6,300",
    "tuitionUSD": 6300,
    "notes": ""
  },
  {
    "id": "qs-108-arizona-state-university",
    "rank": 108,
    "name": "Arizona State University",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "30,348",
    "tuitionUSD": 30348,
    "notes": ""
  },
  {
    "id": "qs-109-king-saud-university-ksu-",
    "rank": 109,
    "name": "King Saud University (KSU)",
    "country": "Saudi Arabia",
    "region": "Middle East",
    "tuitionRaw": "13,760",
    "tuitionUSD": 13760,
    "notes": ""
  },
  {
    "id": "qs-110-karlsruhe-institute-of-technol",
    "rank": 110,
    "name": "Karlsruhe Institute of Technology (KIT)",
    "country": "Germany",
    "region": "Europe",
    "tuitionRaw": "3,480",
    "tuitionUSD": 3480,
    "notes": ""
  },
  {
    "id": "qs-111-brown-university",
    "rank": 111,
    "name": "Brown University",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "43,908",
    "tuitionUSD": 43908,
    "notes": ""
  },
  {
    "id": "qs-111-eindhoven-university-of-techno",
    "rank": 111,
    "name": "Eindhoven University of Technology (TU/e)",
    "country": "Netherlands",
    "region": "Europe",
    "tuitionRaw": "25,175",
    "tuitionUSD": 25175,
    "notes": ""
  },
  {
    "id": "qs-111-university-of-bristol",
    "rank": 111,
    "name": "University of Bristol",
    "country": "United Kingdom",
    "region": "Europe",
    "tuitionRaw": "49,969",
    "tuitionUSD": 49969,
    "notes": ""
  },
  {
    "id": "qs-114-national-university-of-science",
    "rank": 114,
    "name": "National University of Sciences & Technology (NUST) Islamabad",
    "country": "Pakistan",
    "region": "Asia",
    "tuitionRaw": "3,050",
    "tuitionUSD": 3050,
    "notes": ""
  },
  {
    "id": "qs-114-rwth-aachen-university",
    "rank": 114,
    "name": "RWTH Aachen University",
    "country": "Germany",
    "region": "Europe",
    "tuitionRaw": "0",
    "tuitionUSD": 0,
    "notes": ""
  },
  {
    "id": "qs-116-indian-institute-of-science-ba",
    "rank": 116,
    "name": "Indian Institute of Science Bangalore (IISc)",
    "country": "India",
    "region": "Asia",
    "tuitionRaw": "307.79",
    "tuitionUSD": 308,
    "notes": ""
  },
  {
    "id": "qs-117-rmit-university",
    "rank": 117,
    "name": "RMIT University",
    "country": "Australia",
    "region": "Oceania",
    "tuitionRaw": "46,080",
    "tuitionUSD": 46080,
    "notes": ""
  },
  {
    "id": "qs-118-northwestern-university",
    "rank": 118,
    "name": "Northwestern University",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "71,000",
    "tuitionUSD": 71000,
    "notes": ""
  },
  {
    "id": "qs-118-university-of-chile",
    "rank": 118,
    "name": "University of Chile",
    "country": "Chile",
    "region": "Latin America",
    "tuitionRaw": "6,305",
    "tuitionUSD": 6305,
    "notes": ""
  },
  {
    "id": "qs-118-university-of-zurich-uzh-",
    "rank": 118,
    "name": "University of Zurich (UZH)",
    "country": "Switzerland",
    "region": "Europe",
    "tuitionRaw": "1,010",
    "tuitionUSD": 1010,
    "notes": ""
  },
  {
    "id": "qs-121-pohang-university-of-science-a",
    "rank": 121,
    "name": "Pohang University of Science and Technology (POSTECH)",
    "country": "South Korea",
    "region": "Asia",
    "tuitionRaw": "7,539",
    "tuitionUSD": 7539,
    "notes": ""
  },
  {
    "id": "qs-121-trinity-college-dublin-tcd-",
    "rank": 121,
    "name": "Trinity College Dublin (TCD)",
    "country": "Ireland",
    "region": "Europe",
    "tuitionRaw": "35,954",
    "tuitionUSD": 35954,
    "notes": ""
  },
  {
    "id": "qs-121-university-of-california-irvin",
    "rank": 121,
    "name": "University of California Irvine (UCI)",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "48,384",
    "tuitionUSD": 48384,
    "notes": ""
  },
  {
    "id": "qs-124-king-abdullah-university-of-sc",
    "rank": 124,
    "name": "King Abdullah University of Science and Technology (KAUST)",
    "country": "Saudi Arabia",
    "region": "Middle East",
    "tuitionRaw": "0",
    "tuitionUSD": 0,
    "notes": ""
  },
  {
    "id": "qs-124-politecnico-di-torino",
    "rank": 124,
    "name": "Politecnico di Torino",
    "country": "Italy",
    "region": "Europe",
    "tuitionRaw": "4,058",
    "tuitionUSD": 4058,
    "notes": ""
  },
  {
    "id": "qs-124-singapore-management-universit",
    "rank": 124,
    "name": "Singapore Management University (SMU)",
    "country": "Singapore",
    "region": "Asia",
    "tuitionRaw": "17,129",
    "tuitionUSD": 17129,
    "notes": ""
  },
  {
    "id": "qs-127-universitat-de-barcelona-ub-",
    "rank": 127,
    "name": "Universitat de Barcelona (UB)",
    "country": "Spain",
    "region": "Europe",
    "tuitionRaw": "7,650",
    "tuitionUSD": 7650,
    "notes": ""
  },
  {
    "id": "qs-127-university-of-birmingham",
    "rank": 127,
    "name": "University of Birmingham",
    "country": "United Kingdom",
    "region": "Europe",
    "tuitionRaw": "48,701",
    "tuitionUSD": 48701,
    "notes": ""
  },
  {
    "id": "qs-127-university-of-illinois-chicago",
    "rank": 127,
    "name": "University of Illinois Chicago (UIC)",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "35,500",
    "tuitionUSD": 35500,
    "notes": ""
  },
  {
    "id": "qs-130-universitat-politecnica-de-cat",
    "rank": 130,
    "name": "Universitat Politecnica de Catalunya (UPC)",
    "country": "Spain",
    "region": "Europe",
    "tuitionRaw": "6,259",
    "tuitionUSD": 6259,
    "notes": ""
  },
  {
    "id": "qs-130-university-of-technology-malay",
    "rank": 130,
    "name": "University of Technology Malaysia (UTM)",
    "country": "Malaysia",
    "region": "Asia",
    "tuitionRaw": "6,561.85",
    "tuitionUSD": 6562,
    "notes": ""
  },
  {
    "id": "qs-130-university-of-glasgow",
    "rank": 130,
    "name": "University of Glasgow",
    "country": "United Kingdom",
    "region": "Europe",
    "tuitionRaw": "46,628",
    "tuitionUSD": 46628,
    "notes": ""
  },
  {
    "id": "qs-130-virginia-tech",
    "rank": 130,
    "name": "Virginia Tech",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "36,212",
    "tuitionUSD": 36212,
    "notes": ""
  },
  {
    "id": "qs-134-national-tsing-hua-university-",
    "rank": 134,
    "name": "National Tsing Hua University (NTHU)",
    "country": "Taiwan",
    "region": "Asia",
    "tuitionRaw": "2,292",
    "tuitionUSD": 2292,
    "notes": ""
  },
  {
    "id": "qs-134-universidad-politecnica-de-mad",
    "rank": 134,
    "name": "Universidad Politecnica de Madrid (UPM)",
    "country": "Spain",
    "region": "Europe",
    "tuitionRaw": "5,842",
    "tuitionUSD": 5842,
    "notes": ""
  },
  {
    "id": "qs-136-cairo-university",
    "rank": 136,
    "name": "Cairo University",
    "country": "Egypt",
    "region": "Middle East",
    "tuitionRaw": "6,500",
    "tuitionUSD": 6500,
    "notes": ""
  },
  {
    "id": "qs-137-khalifa-university-of-science-",
    "rank": 137,
    "name": "Khalifa University of Science and Technology (KUSTAR)",
    "country": "United Arab Emirates",
    "region": "Middle East",
    "tuitionRaw": "24,506",
    "tuitionUSD": 24506,
    "notes": ""
  },
  {
    "id": "qs-137-university-of-massachusetts-am",
    "rank": 137,
    "name": "University of Massachusetts Amherst",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "60,750",
    "tuitionUSD": 60750,
    "notes": ""
  },
  {
    "id": "qs-139-pontificia-universidad-catolic",
    "rank": 139,
    "name": "Pontificia Universidad Catolica de Chile (PUC)",
    "country": "Chile",
    "region": "Latin America",
    "tuitionRaw": "10,000",
    "tuitionUSD": 10000,
    "notes": ""
  },
  {
    "id": "qs-140-texas-a-m-university-tamu-",
    "rank": 140,
    "name": "Texas A&M University (TAMU)",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "20,000",
    "tuitionUSD": 20000,
    "notes": ""
  },
  {
    "id": "qs-141-university-of-wisconsin-madiso",
    "rank": 141,
    "name": "University of Wisconsin-Madison (UW)",
    "country": "United States",
    "region": "North America",
    "tuitionRaw": "25,732",
    "tuitionUSD": 25732,
    "notes": ""
  },
  {
    "id": "qs-142-aalto-university",
    "rank": 142,
    "name": "Aalto University",
    "country": "Finland",
    "region": "Europe",
    "tuitionRaw": "19,704",
    "tuitionUSD": 19704,
    "notes": ""
  },
  {
    "id": "qs-143-chalmers-university-of-technol",
    "rank": 143,
    "name": "Chalmers University of Technology",
    "country": "Sweden",
    "region": "Europe",
    "tuitionRaw": "16,667",
    "tuitionUSD": 16667,
    "notes": ""
  },
  {
    "id": "qs-144-duy-tan-university-dtu-",
    "rank": 144,
    "name": "Duy Tan University (DTU)",
    "country": "Vietnam",
    "region": "Asia",
    "tuitionRaw": "1,227",
    "tuitionUSD": 1227,
    "notes": ""
  },
  {
    "id": "qs-144-university-of-pisa-unipi-",
    "rank": 144,
    "name": "University of Pisa (UniPi)",
    "country": "Italy",
    "region": "Europe",
    "tuitionRaw": "3,361",
    "tuitionUSD": 3361,
    "notes": ""
  },
  {
    "id": "qs-146-wuhan-university-whu-",
    "rank": 146,
    "name": "Wuhan University (WHU)",
    "country": "China",
    "region": "Asia",
    "tuitionRaw": "5,654",
    "tuitionUSD": 5654,
    "notes": ""
  },
  {
    "id": "qs-147-middle-east-technical-universi",
    "rank": 147,
    "name": "Middle East Technical University (METU)",
    "country": "Turkey",
    "region": "Europe",
    "tuitionRaw": "2,100",
    "tuitionUSD": 2100,
    "notes": ""
  },
  {
    "id": "qs-147-university-of-copenhagen-ucph-",
    "rank": 147,
    "name": "University of Copenhagen (UCPH)",
    "country": "Denmark",
    "region": "Europe",
    "tuitionRaw": "19,385",
    "tuitionUSD": 19385,
    "notes": ""
  },
  {
    "id": "qs-149-humboldt-universitat-zu-berlin",
    "rank": 149,
    "name": "Humboldt-Universitat zu Berlin (HU)",
    "country": "Germany",
    "region": "Europe",
    "tuitionRaw": "0",
    "tuitionUSD": 0,
    "notes": "semester contribution of approximately €355 per semester"
  },
  {
    "id": "qs-149-sun-yat-sen-university",
    "rank": 149,
    "name": "Sun Yat-sen University",
    "country": "China",
    "region": "Asia",
    "tuitionRaw": "5,803",
    "tuitionUSD": 5803,
    "notes": ""
  }
];
