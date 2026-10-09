// Fallback content shown instantly while live API calls resolve (or if the
// backend / ML service isn't running yet). Keeps the UI populated like a
// real broadcast site instead of empty-state skeletons everywhere.

export const LIVE_MATCH = {
  id: 1,

  team1: "India",
  team2: "Australia",

  team1Score: "186/5",
  team1Overs: "19.2",

  team2Score: "Yet to bat",

  venue: "Wankhede Stadium, Mumbai",
  status: "1st Innings",

  winProb: {
    India: 68,
    Australia: 32,
  },

  batting: [
    {
      name: "Virat Kohli",
      runs: 92,
      balls: 88,
      fours: 8,
      sixes: 1,
      sr: 104.54,
      dismissal: "not out",
    },
    {
      name: "KL Rahul",
      runs: 44,
      balls: 37,
      fours: 3,
      sixes: 1,
      sr: 118.91,
      dismissal: "not out",
    },
    {
      name: "Rohit Sharma",
      runs: 78,
      balls: 65,
      fours: 9,
      sixes: 2,
      sr: 120.00,
      dismissal: "c Smith b Cummins",
    },
    {
      name: "Shubman Gill",
      runs: 31,
      balls: 28,
      fours: 4,
      sixes: 0,
      sr: 110.71,
      dismissal: "lbw b Starc",
    },
    {
      name: "Hardik Pandya",
      runs: 28,
      balls: 18,
      fours: 2,
      sixes: 1,
      sr: 155.55,
      dismissal: "c Maxwell b Zampa",
    },
  ],

  bowling: [
    {
      name: "Pat Cummins",
      overs: "9.0",
      maidens: 0,
      runs: 48,
      wickets: 2,
      economy: 5.33,
    },
    {
      name: "Mitchell Starc",
      overs: "9.0",
      maidens: 1,
      runs: 56,
      wickets: 1,
      economy: 6.22,
    },
    {
      name: "Adam Zampa",
      overs: "10.0",
      maidens: 0,
      runs: 41,
      wickets: 2,
      economy: 4.10,
    },
    {
      name: "Josh Hazlewood",
      overs: "8.2",
      maidens: 0,
      runs: 52,
      wickets: 1,
      economy: 6.24,
    },
  ],

  currentBatters: [
    {
      name: "Virat Kohli",
      runs: 92,
      balls: 88,
      fours: 8,
      sixes: 1,
      sr: 104.54,
    },
    {
      name: "KL Rahul",
      runs: 44,
      balls: 37,
      fours: 3,
      sixes: 1,
      sr: 118.91,
    },
  ],

  currentBowler: {
    name: "Pat Cummins",
    overs: "9.0",
    runs: 48,
    wickets: 2,
    economy: 5.33,
  },
};

export const TICKER_MATCHES = [
  { id: 1, teams: "IND vs AUS", note: "IND 186/5 (19.2) — LIVE", live: true },
  { id: 2, teams: "ENG vs NZ", note: "ENG won by 42 runs", live: false },
  { id: 3, teams: "PAK vs SA", note: "Starts in 2h 10m", live: false },
  { id: 4, teams: "SL vs WI", note: "SL 240 all out", live: false },
];

export const SERIES = [
  { name: "India Tour of Australia", tag: "TEST SERIES", matches: 5 },
  { name: "The Ashes 2027", tag: "ICONIC RIVALRY", matches: 5 },
  { name: "Asia Cup 2026", tag: "T20 TOURNAMENT", matches: 13 },
];

export const NEWS = [
  {
    title: "Kohli predicted to score 70+ runs today",
    body: "SmartCricket AI's form model gives Virat Kohli a high probability of crossing fifty in current Mumbai conditions.",
    tag: "AI INSIGHT",
  },
  {
    title: "Australia expected to dominate powerplay",
    body: "The AI strategist model suggests aggressive field placements against left-handed batters in the first six overs.",
    tag: "AI STRATEGY",
  },
  {
    title: "Rain forecast could shape Melbourne clash",
    body: "Weather-adjusted DLS modelling shows a 22% chance of a rain-shortened contest at the MCG on Tuesday.",
    tag: "CONDITIONS",
  },
];

export const FIXTURES = [
  { teams: "India vs England", when: "Tomorrow", venue: "Lord's, London" },
  { teams: "Australia vs Pakistan", when: "12 Aug", venue: "Melbourne Cricket Ground" },
  { teams: "New Zealand vs South Africa", when: "14 Aug", venue: "Wellington" },
];

export const RESULTS = [
  {
    team1: "England",
    team2: "New Zealand",
    winner: "England",
    team1Score: "312/6",
    team2Score: "270 all out",
    venue: "The Oval, London",
    date: "2026-08-02",
  },
  {
    team1: "Sri Lanka",
    team2: "West Indies",
    winner: "Sri Lanka",
    team1Score: "240 all out",
    team2Score: "198 all out",
    venue: "R. Premadasa Stadium",
    date: "2026-07-30",
  },
];

export const TEAMS = [
  { name: "India", short: "IND", rank: 1, points: 128, rating: 91, form: ["W", "W", "L", "W", "W"], color: "#1B3A80" },
  { name: "Australia", short: "AUS", rank: 2, points: 122, rating: 88, form: ["W", "L", "W", "W", "W"], color: "#FFC72C" },
  { name: "England", short: "ENG", rank: 3, points: 115, rating: 84, form: ["L", "W", "W", "L", "W"], color: "#0C6B3D" },
  { name: "South Africa", short: "SA", rank: 4, points: 110, rating: 82, form: ["W", "W", "W", "L", "L"], color: "#0c6b3d" },
  { name: "Pakistan", short: "PAK", rank: 5, points: 102, rating: 80, form: ["L", "W", "L", "W", "W"], color: "#0c6b3d" },
  { name: "New Zealand", short: "NZ", rank: 6, points: 98, rating: 78, form: ["W", "L", "W", "L", "W"], color: "#0a1226" },
];

export const PLAYERS = [
  { name: "Virat Kohli", team: "India", role: "Batter", runs: 12869, avg: 57.3, sr: 93.6, form: 92 },
  { name: "Pat Cummins", team: "Australia", role: "Bowler", wickets: 284, avg: 22.1, econ: 4.8, form: 88 },
  { name: "Joe Root", team: "England", role: "Batter", runs: 11704, avg: 50.9, sr: 87.1, form: 85 },
  { name: "Jasprit Bumrah", team: "India", role: "Bowler", wickets: 198, avg: 20.5, econ: 4.5, form: 94 },
  { name: "Kane Williamson", team: "New Zealand", role: "Batter", runs: 9235, avg: 47.8, sr: 81.2, form: 79 },
  { name: "David Warner", team: "Australia", role: "Batter", runs: 10203, avg: 45.3, sr: 96.4, form: 74 },
];

export const TEAM_STRENGTHS = {
  India: 90,
  Australia: 82,
  England: 78,
  "South Africa": 79,
  Pakistan: 80,
  "New Zealand": 76,
};
export const ICC_RANKINGS = [
  { rank: 1, name: "Virat Kohli", team: "India" },
  { rank: 2, name: "Babar Azam", team: "Pakistan" },
  { rank: 3, name: "Steve Smith", team: "Australia" },
  { rank: 4, name: "Rohit Sharma", team: "India" },
  { rank: 5, name: "Travis Head", team: "Australia" },
  { rank: 6, name: "Joe Root", team: "England" },
  { rank: 7, name: "Kane Williamson", team: "New Zealand" },
  { rank: 8, name: "Shubman Gill", team: "India" },
  { rank: 9, name: "David Warner", team: "Australia" },
  { rank: 10, name: "Jos Buttler", team: "England" },
];
export const FIXTURE_AI_DATA = {
  "Australia vs Pakistan": {
    team1: "Australia",
    team2: "Pakistan",
    venue: "Sydney Cricket Ground",
    format: "ODI",
    date: "Tomorrow • 2:00 PM",

    prediction: {
      winner: "Australia",
      team1Win: 58,
      team2Win: 42,
      confidence: 84,
    },

    projectedScore: {
      team1: "272–289",
      team2: "248–267",
    },

    recentAverage: {
      team1: 281,
      team2: 258,
    },

    venueStats: {
      averageFirstInnings: 274,
      averageSecondInnings: 251,
      highestScore: 408,
      lowestScore: 117,
      battingFirstWin: 54,
      pitch: "Balanced with assistance for pace early",
    },

    predictedXI: {
      team1: [
        "Travis Head",
        "David Warner",
        "Steve Smith",
        "Marnus Labuschagne",
        "Glenn Maxwell",
        "Josh Inglis",
        "Pat Cummins",
        "Mitchell Starc",
        "Adam Zampa",
        "Josh Hazlewood",
        "Mitchell Marsh",
      ],
      team2: [
        "Babar Azam",
        "Mohammad Rizwan",
        "Fakhar Zaman",
        "Saud Shakeel",
        "Salman Ali Agha",
        "Shadab Khan",
        "Shaheen Afridi",
        "Haris Rauf",
        "Naseem Shah",
        "Abrar Ahmed",
        "Mohammad Wasim Jr",
      ],
    },

    keyPlayers: [
      {
        name: "Travis Head",
        team: "Australia",
        impact: 91,
        prediction: "64–78 runs",
      },
      {
        name: "Babar Azam",
        team: "Pakistan",
        impact: 88,
        prediction: "55–70 runs",
      },
      {
        name: "Adam Zampa",
        team: "Australia",
        impact: 84,
        prediction: "2–3 wickets",
      },
      {
        name: "Shaheen Afridi",
        team: "Pakistan",
        impact: 86,
        prediction: "2–3 wickets",
      },
    ],

    matchup: {
      advantage: "Australia",
      batter: "Travis Head",
      bowler: "Shaheen Afridi",
      description:
        "Head's aggressive powerplay batting could challenge Pakistan's left-arm pace attack.",
    },

    strategy: {
      team1: [
        "Attack the powerplay with Head and Warner",
        "Use Zampa through the middle overs",
        "Keep Starc for the final 10 overs",
      ],
      team2: [
        "Use Shaheen aggressively with the new ball",
        "Target Australia's middle-order spin weakness",
        "Keep Haris Rauf for the death overs",
      ],
    },

    tossRecommendation:
      "AI recommends batting first if the pitch remains dry. Expected advantage: +7 runs.",

    aiReason:
      "Australia receives the edge because of stronger recent batting form, home conditions and a deeper bowling attack.",
  },

  "India vs England": {
    team1: "India",
    team2: "England",
    venue: "Mumbai",
    format: "ODI",
    date: "Saturday • 1:30 PM",

    prediction: {
      winner: "India",
      team1Win: 64,
      team2Win: 36,
      confidence: 89,
    },

    projectedScore: {
      team1: "295–315",
      team2: "270–292",
    },

    recentAverage: {
      team1: 302,
      team2: 278,
    },

    venueStats: {
      averageFirstInnings: 286,
      averageSecondInnings: 264,
      highestScore: 438,
      lowestScore: 79,
      battingFirstWin: 61,
      pitch: "Batting-friendly with increasing grip for spinners",
    },

    predictedXI: {
      team1: [
        "Rohit Sharma",
        "Shubman Gill",
        "Virat Kohli",
        "Shreyas Iyer",
        "KL Rahul",
        "Hardik Pandya",
        "Ravindra Jadeja",
        "Kuldeep Yadav",
        "Jasprit Bumrah",
        "Mohammed Shami",
        "Mohammed Siraj",
      ],
      team2: [
        "Jos Buttler",
        "Ben Duckett",
        "Joe Root",
        "Harry Brook",
        "Liam Livingstone",
        "Ben Stokes",
        "Jamie Smith",
        "Jofra Archer",
        "Adil Rashid",
        "Mark Wood",
        "Reece Topley",
      ],
    },

    keyPlayers: [
      {
        name: "Virat Kohli",
        team: "India",
        impact: 94,
        prediction: "72–88 runs",
      },
      {
        name: "Joe Root",
        team: "England",
        impact: 90,
        prediction: "58–75 runs",
      },
      {
        name: "Jasprit Bumrah",
        team: "India",
        impact: 95,
        prediction: "2–4 wickets",
      },
      {
        name: "Adil Rashid",
        team: "England",
        impact: 82,
        prediction: "1–3 wickets",
      },
    ],

    matchup: {
      advantage: "India",
      batter: "Virat Kohli",
      bowler: "Adil Rashid",
      description:
        "Kohli's ability to rotate strike against spin gives India an advantage during the middle overs.",
    },

    strategy: {
      team1: [
        "Build a strong powerplay platform",
        "Use Jadeja and Kuldeep through the middle overs",
        "Bumrah should attack with the new ball and return at the death",
      ],
      team2: [
        "Attack India's spinners with aggressive running",
        "Use Archer early against India's top order",
        "Hold Rashid for the middle overs",
      ],
    },

    tossRecommendation:
      "AI recommends batting first. Mumbai is expected to become slightly slower later in the innings.",

    aiReason:
      "India has the advantage because of stronger recent form, home conditions and a more balanced bowling attack.",
  },

  "England vs New Zealand": {
    team1: "England",
    team2: "New Zealand",
    venue: "London",
    format: "ODI",
    date: "Sunday • 3:00 PM",

    prediction: {
      winner: "England",
      team1Win: 55,
      team2Win: 45,
      confidence: 78,
    },

    projectedScore: {
      team1: "276–294",
      team2: "265–282",
    },

    recentAverage: {
      team1: 284,
      team2: 273,
    },

    venueStats: {
      averageFirstInnings: 268,
      averageSecondInnings: 251,
      highestScore: 397,
      lowestScore: 86,
      battingFirstWin: 52,
      pitch: "Seam-friendly early with good batting conditions later",
    },

    predictedXI: {
      team1: [
        "Jos Buttler",
        "Ben Duckett",
        "Joe Root",
        "Harry Brook",
        "Ben Stokes",
        "Liam Livingstone",
        "Jamie Smith",
        "Jofra Archer",
        "Adil Rashid",
        "Mark Wood",
        "Reece Topley",
      ],
      team2: [
        "Devon Conway",
        "Rachin Ravindra",
        "Kane Williamson",
        "Daryl Mitchell",
        "Tom Latham",
        "Glenn Phillips",
        "Mitchell Santner",
        "Matt Henry",
        "Lockie Ferguson",
        "Trent Boult",
        "William O'Rourke",
      ],
    },

    keyPlayers: [
      {
        name: "Joe Root",
        team: "England",
        impact: 91,
        prediction: "60–76 runs",
      },
      {
        name: "Kane Williamson",
        team: "New Zealand",
        impact: 92,
        prediction: "58–72 runs",
      },
      {
        name: "Jofra Archer",
        team: "England",
        impact: 87,
        prediction: "2–3 wickets",
      },
      {
        name: "Trent Boult",
        team: "New Zealand",
        impact: 89,
        prediction: "2–3 wickets",
      },
    ],

    matchup: {
      advantage: "England",
      batter: "Joe Root",
      bowler: "Trent Boult",
      description:
        "Root's ability to handle swing and rotate strike could be important against New Zealand's new-ball attack.",
    },

    strategy: {
      team1: [
        "Protect wickets during the first 10 overs",
        "Target the middle overs against spin",
        "Use Archer aggressively with the new ball",
      ],
      team2: [
        "Attack with Boult and Henry early",
        "Use Santner to control the middle overs",
        "Keep Ferguson for attacking bursts",
      ],
    },

    tossRecommendation:
      "AI slightly prefers batting first because early seam movement is expected.",

    aiReason:
      "England has a small advantage due to home conditions and stronger recent batting depth.",
  },
};