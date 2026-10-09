import express from "express";
import Match from "../models/Match.js";

const router = express.Router();

// =====================================================
// PLAYER NAME ALIASES
// Frontend name -> Cricsheet name
// =====================================================

const PLAYER_ALIASES = {
  "Virat Kohli": "V Kohli",
  "Rohit Sharma": "RG Sharma",
  "KL Rahul": "KL Rahul",
  "Shubman Gill": "Shubman Gill",
  "Jasprit Bumrah": "JJ Bumrah",
  "Mohammed Siraj": "Mohammed Siraj",
  "Rishabh Pant": "RR Pant",
  "Yashasvi Jaiswal": "YBK Jaiswal",
};


// =====================================================
// GET PLAYER PERFORMANCE
// Example:
// /api/player-analytics/Virat%20Kohli
// =====================================================

router.get("/:playerName", async (req, res) => {

  try {

    const requestedName =
      decodeURIComponent(req.params.playerName);

    // Convert frontend name to Cricsheet name
    const playerName =
      PLAYER_ALIASES[requestedName] || requestedName;


    // =================================================
    // FIND MATCHES
    // =================================================

    const matches = await Match.find({
      $or: [
        { "innings.batting.name": playerName },
        { "innings.bowling.name": playerName },
      ],
    }).lean();


    // =================================================
    // INITIAL STATS
    // =================================================

    const batting = {

      matches: 0,
      innings: 0,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      fifties: 0,
      hundreds: 0,
      notOuts: 0,

    };


    const bowling = {

      matches: 0,
      innings: 0,
      wickets: 0,
      runs: 0,
      balls: 0,
      maidens: 0,

    };


    // =================================================
    // FORMAT STATS
    // =================================================

    const formats = {

      ODI: {
        batting: {
          matches: 0,
          innings: 0,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          notOuts: 0,
        },
        bowling: {
          matches: 0,
          innings: 0,
          wickets: 0,
          runs: 0,
          balls: 0,
        },
      },

      Test: {
        batting: {
          matches: 0,
          innings: 0,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          notOuts: 0,
        },
        bowling: {
          matches: 0,
          innings: 0,
          wickets: 0,
          runs: 0,
          balls: 0,
        },
      },

      T20: {
        batting: {
          matches: 0,
          innings: 0,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          notOuts: 0,
        },
        bowling: {
          matches: 0,
          innings: 0,
          wickets: 0,
          runs: 0,
          balls: 0,
        },
      },

    };


    // =================================================
    // PROCESS MATCHES
    // =================================================

    matches.forEach((match) => {

      const format = match.format || "ODI";

      let playedBatting = false;
      let playedBowling = false;


      // Safety in case format has unexpected casing
      let formatKey = format;

      if (format.toLowerCase().includes("odi")) {
        formatKey = "ODI";
      } else if (format.toLowerCase().includes("test")) {
        formatKey = "Test";
      } else if (
        format.toLowerCase().includes("t20") ||
        format.toLowerCase().includes("twenty")
      ) {
        formatKey = "T20";
      }


      if (!formats[formatKey]) {
        return;
      }


      // =================================================
      // PROCESS INNINGS
      // =================================================

      (match.innings || []).forEach((innings) => {

        // -----------------------------------------------
        // BATTING
        // -----------------------------------------------

        const batter =
          (innings.batting || []).find(
            (player) => player.name === playerName
          );


        if (batter) {

          playedBatting = true;

          batting.innings++;

          batting.runs += batter.runs || 0;

          batting.balls += batter.balls || 0;

          batting.fours += batter.fours || 0;

          batting.sixes += batter.sixes || 0;


          if (batter.dismissal === "not out") {
            batting.notOuts++;
          }


          if (batter.runs >= 100) {

            batting.hundreds++;

          } else if (batter.runs >= 50) {

            batting.fifties++;

          }


          // FORMAT

          const fb = formats[formatKey].batting;

          fb.innings++;

          fb.runs += batter.runs || 0;

          fb.balls += batter.balls || 0;

          fb.fours += batter.fours || 0;

          fb.sixes += batter.sixes || 0;


          if (batter.dismissal === "not out") {
            fb.notOuts++;
          }

        }


        // -----------------------------------------------
        // BOWLING
        // -----------------------------------------------

        const bowler =
          (innings.bowling || []).find(
            (player) => player.name === playerName
          );


        if (bowler) {

          playedBowling = true;

          bowling.innings++;

          bowling.wickets += bowler.wickets || 0;

          bowling.runs += bowler.runs || 0;

          bowling.maidens += bowler.maidens || 0;


          const oversString =
            bowler.overs || "0.0";

          const parts =
            oversString.split(".");

          const completedOvers =
            Number(parts[0]) || 0;

          const remainingBalls =
            Number(parts[1]) || 0;

          const balls =
            completedOvers * 6 +
            remainingBalls;


          bowling.balls += balls;


          // FORMAT

          const fb = formats[formatKey].bowling;

          fb.innings++;

          fb.wickets += bowler.wickets || 0;

          fb.runs += bowler.runs || 0;

          fb.balls += balls;

        }

      });


      // =================================================
      // MATCH COUNTS
      // =================================================

      if (playedBatting) {

        batting.matches++;

        formats[formatKey].batting.matches++;

      }


      if (playedBowling) {

        bowling.matches++;

        formats[formatKey].bowling.matches++;

      }

    });


    // =================================================
    // CALCULATIONS
    // =================================================

    const dismissals =
      batting.innings -
      batting.notOuts;


    const battingAverage =
      dismissals > 0
        ? Number(
            (
              batting.runs /
              dismissals
            ).toFixed(2)
          )
        : batting.runs;


    const strikeRate =
      batting.balls > 0
        ? Number(
            (
              batting.runs /
              batting.balls *
              100
            ).toFixed(2)
          )
        : 0;


    const bowlingAverage =
      bowling.wickets > 0
        ? Number(
            (
              bowling.runs /
              bowling.wickets
            ).toFixed(2)
          )
        : 0;


    const economy =
      bowling.balls > 0
        ? Number(
            (
              bowling.runs /
              (bowling.balls / 6)
            ).toFixed(2)
          )
        : 0;


    // =================================================
    // FORMAT CALCULATIONS
    // =================================================

    const calculateFormatStats = (data) => {

      const b = data.batting;

      const bw = data.bowling;


      const dismissals =
        b.innings -
        b.notOuts;


      const average =
        dismissals > 0
          ? Number(
              (
                b.runs /
                dismissals
              ).toFixed(2)
            )
          : b.runs;


      const strikeRate =
        b.balls > 0
          ? Number(
              (
                b.runs /
                b.balls *
                100
              ).toFixed(2)
            )
          : 0;


      const bowlingAverage =
        bw.wickets > 0
          ? Number(
              (
                bw.runs /
                bw.wickets
              ).toFixed(2)
            )
          : 0;


      const economy =
        bw.balls > 0
          ? Number(
              (
                bw.runs /
                (bw.balls / 6)
              ).toFixed(2)
            )
          : 0;


      return {

        batting: {

          matches: b.matches,

          innings: b.innings,

          runs: b.runs,

          average,

          strikeRate,

          fours: b.fours,

          sixes: b.sixes,

          notOuts: b.notOuts,

        },

        bowling: {

          matches: bw.matches,

          innings: bw.innings,

          wickets: bw.wickets,

          runs: bw.runs,

          bowlingAverage,

          economy,

        },

      };

    };


    // =================================================
    // RESPONSE
    // =================================================

    res.json({

      player: requestedName,

      databaseName: playerName,

      totalMatches: matches.length,

      batting: {

        matches: batting.matches,

        innings: batting.innings,

        runs: batting.runs,

        average: battingAverage,

        strikeRate,

        fours: batting.fours,

        sixes: batting.sixes,

        fifties: batting.fifties,

        hundreds: batting.hundreds,

        notOuts: batting.notOuts,

      },

      bowling: {

        matches: bowling.matches,

        innings: bowling.innings,

        wickets: bowling.wickets,

        runs: bowling.runs,

        bowlingAverage,

        economy,

        maidens: bowling.maidens,

      },

      formats: {

        ODI:
          calculateFormatStats(formats.ODI),

        Test:
          calculateFormatStats(formats.Test),

        T20:
          calculateFormatStats(formats.T20),

      },

    });

  } catch (error) {

    console.error(
      "PLAYER ANALYTICS ERROR:",
      error
    );

    res.status(500).json({

      message:
        "Failed to calculate player analytics",

      error:
        error.message,

    });

  }

});


export default router;