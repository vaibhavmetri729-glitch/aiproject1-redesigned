import express from "express";
import Match from "../models/Match.js";
import Team from "../models/Team.js";
import Form from "../models/Form.js";
import Player from "../models/Player.js";

const router = express.Router();

/*
========================================================
SMARTCRICKET AI — MATCH DATA PREDICTION ENGINE
========================================================

Uses:
1. Historical match results
2. Head-to-head record
3. Recent form
4. Average runs scored
5. Venue performance
6. Toss impact
7. Player strength
========================================================
*/

router.post("/", async (req, res) => {
  try {
    const {
      team1,
      team2,
      venue,
      toss_winner,
    } = req.body;

    if (!team1 || !team2) {
      return res.status(400).json({
        message: "Both teams are required",
      });
    }

    if (team1 === team2) {
      return res.status(400).json({
        message: "Teams must be different",
      });
    }

    /*
    ======================================================
    1. GET COMPLETED MATCHES
    ======================================================
    */

    const allMatches = await Match.find({
      "outcome.winner": { $exists: true, $ne: null },
    }).lean();

    /*
    ======================================================
    2. FILTER TEAM HISTORY
    ======================================================
    */

    const team1Matches = allMatches.filter(
      (match) =>
        match.teams?.includes(team1)
    );

    const team2Matches = allMatches.filter(
      (match) =>
        match.teams?.includes(team2)
    );

    /*
    ======================================================
    3. OVERALL WIN RATE
    ======================================================
    */

    const calculateWinRate = (matches, team) => {
      if (!matches.length) return 50;

      const wins = matches.filter(
        (match) =>
          match.outcome?.winner === team
      ).length;

      return (wins / matches.length) * 100;
    };

    const team1WinRate =
      calculateWinRate(team1Matches, team1);

    const team2WinRate =
      calculateWinRate(team2Matches, team2);

    /*
    ======================================================
    4. HEAD TO HEAD
    ======================================================
    */

    const headToHead = allMatches.filter((match) => {
      const teams = match.teams || [];

      return (
        teams.includes(team1) &&
        teams.includes(team2)
      );
    });

    let team1H2H = 0;
    let team2H2H = 0;

    headToHead.forEach((match) => {
      if (match.outcome?.winner === team1) {
        team1H2H++;
      }

      if (match.outcome?.winner === team2) {
        team2H2H++;
      }
    });

    let h2hTeam1Score = 50;
    let h2hTeam2Score = 50;

    if (headToHead.length > 0) {
      h2hTeam1Score =
        (team1H2H / headToHead.length) * 100;

      h2hTeam2Score =
        (team2H2H / headToHead.length) * 100;
    }

    /*
    ======================================================
    5. RECENT FORM
    ======================================================
    */

    const getRecentForm = (matches, team) => {
      const sorted = [...matches].sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      );

      return sorted.slice(0, 5);
    };

    const team1Recent =
      getRecentForm(team1Matches, team1);

    const team2Recent =
      getRecentForm(team2Matches, team2);

    const recentWinRate = (matches, team) => {
      if (!matches.length) return 50;

      const wins = matches.filter(
        (match) =>
          match.outcome?.winner === team
      ).length;

      return (wins / matches.length) * 100;
    };

    const team1RecentRate =
      recentWinRate(team1Recent, team1);

    const team2RecentRate =
      recentWinRate(team2Recent, team2);

    /*
    ======================================================
    6. RUN SCORING PERFORMANCE
    ======================================================
    */

    const getAverageRuns = (matches, team) => {
      let totalRuns = 0;
      let inningsCount = 0;

      matches.forEach((match) => {
        const innings = match.innings || [];

        innings.forEach((inning) => {
          if (inning.team === team) {
            if (typeof inning.runs === "number") {
              totalRuns += inning.runs;
              inningsCount++;
            }
          }
        });
      });

      if (!inningsCount) return 0;

      return totalRuns / inningsCount;
    };

    const team1AvgRuns =
      getAverageRuns(team1Matches, team1);

    const team2AvgRuns =
      getAverageRuns(team2Matches, team2);

    let runScore1 = 50;
    let runScore2 = 50;

    if (team1AvgRuns > 0 && team2AvgRuns > 0) {
      const totalRuns =
        team1AvgRuns + team2AvgRuns;

      runScore1 =
        (team1AvgRuns / totalRuns) * 100;

      runScore2 =
        (team2AvgRuns / totalRuns) * 100;
    }

    /*
    ======================================================
    7. VENUE PERFORMANCE
    ======================================================
    */

    let venueScore1 = 50;
    let venueScore2 = 50;

    if (venue) {
      const venueMatches = allMatches.filter(
        (match) =>
          match.venue === venue
      );

      const team1VenueMatches =
        venueMatches.filter((match) =>
          match.teams?.includes(team1)
        );

      const team2VenueMatches =
        venueMatches.filter((match) =>
          match.teams?.includes(team2)
        );

      const team1VenueWins =
        team1VenueMatches.filter(
          (match) =>
            match.outcome?.winner === team1
        ).length;

      const team2VenueWins =
        team2VenueMatches.filter(
          (match) =>
            match.outcome?.winner === team2
        ).length;

      if (team1VenueMatches.length > 0) {
        venueScore1 =
          (team1VenueWins /
            team1VenueMatches.length) *
          100;
      }

      if (team2VenueMatches.length > 0) {
        venueScore2 =
          (team2VenueWins /
            team2VenueMatches.length) *
          100;
      }
    }

    /*
    ======================================================
    8. TOSS ADVANTAGE
    ======================================================
    */

    let tossScore1 = 50;
    let tossScore2 = 50;

    if (toss_winner) {
      if (toss_winner === team1) {
        tossScore1 = 55;
        tossScore2 = 45;
      }

      if (toss_winner === team2) {
        tossScore1 = 45;
        tossScore2 = 55;
      }
    }

    /*
    ======================================================
    9. TEAM DATABASE STRENGTH
    ======================================================
    */

    const firstTeam =
      await Team.findOne({
        name: team1,
      }).lean();

    const secondTeam =
      await Team.findOne({
        name: team2,
      }).lean();

    let databaseScore1 = 50;
    let databaseScore2 = 50;

    if (
      firstTeam?.matchesPlayed &&
      secondTeam?.matchesPlayed
    ) {
      const firstRate =
        firstTeam.wins /
        firstTeam.matchesPlayed;

      const secondRate =
        secondTeam.wins /
        secondTeam.matchesPlayed;

      const total =
        firstRate + secondRate;

      if (total > 0) {
        databaseScore1 =
          (firstRate / total) * 100;

        databaseScore2 =
          (secondRate / total) * 100;
      }
    }

    /*
    ======================================================
    10. FORM DATABASE
    ======================================================
    */

    const firstForm =
      await Form.findOne({
        team: team1,
      }).lean();

    const secondForm =
      await Form.findOne({
        team: team2,
      }).lean();

    const formScore1 =
      firstForm?.formScore ?? 50;

    const formScore2 =
      secondForm?.formScore ?? 50;

    /*
    ======================================================
    11. PLAYER STRENGTH
    ======================================================
    */

    const team1Players =
      await Player.find({
        team: team1,
      }).lean();

    const team2Players =
      await Player.find({
        team: team2,
      }).lean();

    const calculatePlayerStrength = (
      players
    ) => {
      if (!players.length) return 50;

      let total = 0;

      players.forEach((player) => {
        total +=
          Number(
            player.average ||
            player.battingAverage ||
            0
          );
      });

      return total / players.length;
    };

    const playerStrength1 =
      calculatePlayerStrength(team1Players);

    const playerStrength2 =
      calculatePlayerStrength(team2Players);

    let playerScore1 = 50;
    let playerScore2 = 50;

    if (
      playerStrength1 > 0 &&
      playerStrength2 > 0
    ) {
      const total =
        playerStrength1 +
        playerStrength2;

      playerScore1 =
        (playerStrength1 / total) * 100;

      playerScore2 =
        (playerStrength2 / total) * 100;
    }

    /*
    ======================================================
    12. FINAL AI SCORE
    ======================================================

    Historical data receives the largest weight.
    */

    const finalTeam1Score =
      team1WinRate * 0.20 +
      team1RecentRate * 0.20 +
      h2hTeam1Score * 0.20 +
      runScore1 * 0.10 +
      venueScore1 * 0.10 +
      tossScore1 * 0.05 +
      databaseScore1 * 0.10 +
      playerScore1 * 0.05;

    const finalTeam2Score =
      team2WinRate * 0.20 +
      team2RecentRate * 0.20 +
      h2hTeam2Score * 0.20 +
      runScore2 * 0.10 +
      venueScore2 * 0.10 +
      tossScore2 * 0.05 +
      databaseScore2 * 0.10 +
      playerScore2 * 0.05;

    const totalScore =
      finalTeam1Score +
      finalTeam2Score;

    const probability1 =
      Number(
        (
          (finalTeam1Score /
            totalScore) *
          100
        ).toFixed(2)
      );

    const probability2 =
      Number(
        (
          (finalTeam2Score /
            totalScore) *
          100
        ).toFixed(2)
      );

    const winner =
      probability1 >= probability2
        ? team1
        : team2;

    /*
    ======================================================
    13. MODEL CONFIDENCE
    ======================================================
    */

    const difference =
      Math.abs(
        probability1 -
        probability2
      );

    const confidence = Math.min(
      98,
      Math.max(
        55,
        Math.round(
          55 + difference * 0.8
        )
      )
    );

    /*
    ======================================================
    14. SEND AI RESULT
    ======================================================
    */

    res.json({
      winner,

      probability: {
        [team1]: probability1,
        [team2]: probability2,
      },

      confidence,

      dataUsed: {
        historicalMatches: allMatches.length,
        team1Matches: team1Matches.length,
        team2Matches: team2Matches.length,
        headToHeadMatches: headToHead.length,
        recentMatches: 5,
        venue,
      },

      analysis: {
        headToHead: {
          [team1]: team1H2H,
          [team2]: team2H2H,
        },

        recentForm: {
          [team1]: Number(
            team1RecentRate.toFixed(2)
          ),
          [team2]: Number(
            team2RecentRate.toFixed(2)
          ),
        },

        averageRuns: {
          [team1]: Number(
            team1AvgRuns.toFixed(2)
          ),
          [team2]: Number(
            team2AvgRuns.toFixed(2)
          ),
        },

        venuePerformance: {
          [team1]: Number(
            venueScore1.toFixed(2)
          ),
          [team2]: Number(
            venueScore2.toFixed(2)
          ),
        },

        playerStrength: {
          [team1]: Number(
            playerScore1.toFixed(2)
          ),
          [team2]: Number(
            playerScore2.toFixed(2)
          ),
        },
      },

      message:
        `Prediction generated using historical match data for ${team1} and ${team2}.`,
    });

  } catch (error) {
    console.error(
      "AI PREDICTION ERROR:",
      error
    );

    res.status(500).json({
      message:
        "AI prediction failed",
      error: error.message,
    });
  }
});

export default router;