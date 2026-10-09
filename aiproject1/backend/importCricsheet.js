import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Match from "./models/Match.js";

dotenv.config();

/*
=====================================================
FORMAT TO IMPORT
=====================================================

Change this when importing:

"test"  -> Test
"t20"   -> T20
"odi"   -> ODI
=====================================================
*/

const FORMAT = "t20";

const DATA_FOLDER = `./data/cricsheet/${FORMAT}`;


/*
=====================================================
BATTING
=====================================================
*/

function calculateBatting(innings) {
  const batting = {};

  for (const over of innings.overs || []) {
    for (const delivery of over.deliveries || []) {
      const batter = delivery.batter;

      if (!batting[batter]) {
        batting[batter] = {
          name: batter,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          dismissal: "not out",
        };
      }

      const batterRuns =
        delivery.runs?.batter || 0;

      batting[batter].runs += batterRuns;

      // Legal delivery
      if (!delivery.extras?.wides) {
        batting[batter].balls++;
      }

      if (batterRuns === 4) {
        batting[batter].fours++;
      }

      if (batterRuns === 6) {
        batting[batter].sixes++;
      }

      // Wickets
      if (delivery.wickets) {
        for (const wicket of delivery.wickets) {
          const playerOut =
            wicket.player_out;

          if (batting[playerOut]) {
            let dismissal =
              wicket.kind || "out";

            if (wicket.fielders?.length) {
              const fielders =
                wicket.fielders
                  .map((f) => f.name)
                  .join(", ");

              dismissal +=
                ` (${fielders})`;
            }

            batting[playerOut].dismissal =
              dismissal;
          }
        }
      }
    }
  }

  return Object.values(batting).map(
    (player) => ({
      ...player,

      strikeRate:
        player.balls > 0
          ? Number(
              (
                (player.runs /
                  player.balls) *
                100
              ).toFixed(2)
            )
          : 0,
    })
  );
}


/*
=====================================================
BOWLING
=====================================================
*/

function calculateBowling(innings) {
  const bowling = {};

  for (const over of innings.overs || []) {
    for (const delivery of over.deliveries || []) {
      const bowler = delivery.bowler;

      if (!bowling[bowler]) {
        bowling[bowler] = {
          name: bowler,
          balls: 0,
          runs: 0,
          wickets: 0,
          maidens: 0,
        };
      }

      // Legal delivery
      if (
        !delivery.extras?.wides &&
        !delivery.extras?.noballs
      ) {
        bowling[bowler].balls++;
      }

      /*
      Runs conceded by bowler
      */

      let bowlerRuns =
        delivery.runs?.total || 0;

      if (delivery.extras?.byes) {
        bowlerRuns -=
          delivery.extras.byes;
      }

      if (delivery.extras?.legbyes) {
        bowlerRuns -=
          delivery.extras.legbyes;
      }

      if (delivery.extras?.penalty) {
        bowlerRuns -=
          delivery.extras.penalty;
      }

      bowling[bowler].runs +=
        bowlerRuns;

      /*
      Bowler wickets
      */

      if (delivery.wickets) {
        for (const wicket of delivery.wickets) {

          const nonBowlerWickets = [
            "run out",
            "retired hurt",
            "retired out",
            "obstructing the field",
          ];

          if (
            !nonBowlerWickets.includes(
              wicket.kind
            )
          ) {
            bowling[bowler].wickets++;
          }
        }
      }
    }
  }

  return Object.values(bowling).map(
    (player) => {

      const completedOvers =
        Math.floor(
          player.balls / 6
        );

      const remainingBalls =
        player.balls % 6;

      const overs =
        completedOvers +
        remainingBalls / 10;

      return {
        name: player.name,

        overs: overs.toFixed(1),

        maidens:
          player.maidens,

        runs:
          player.runs,

        wickets:
          player.wickets,

        economy:
          player.balls > 0
            ? Number(
                (
                  player.runs /
                  (player.balls / 6)
                ).toFixed(2)
              )
            : 0,
      };
    }
  );
}


/*
=====================================================
INNINGS
=====================================================
*/

function calculateInnings(innings) {

  let totalRuns = 0;
  let totalWickets = 0;
  let totalBalls = 0;

  for (
    const over of innings.overs || []
  ) {

    for (
      const delivery of
      over.deliveries || []
    ) {

      totalRuns +=
        delivery.runs?.total || 0;

      if (delivery.wickets) {
        totalWickets +=
          delivery.wickets.length;
      }

      if (
        !delivery.extras?.wides &&
        !delivery.extras?.noballs
      ) {
        totalBalls++;
      }
    }
  }

  const completedOvers =
    Math.floor(totalBalls / 6);

  const remainingBalls =
    totalBalls % 6;

  const overs =
    `${completedOvers}.${remainingBalls}`;

  return {

    team:
      innings.team,

    runs:
      totalRuns,

    wickets:
      totalWickets,

    overs,

    batting:
      calculateBatting(innings),

    bowling:
      calculateBowling(innings),
  };
}


/*
=====================================================
IMPORT
=====================================================
*/

async function importMatches() {

  try {

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "MongoDB connected ✅"
    );


    if (
      !fs.existsSync(DATA_FOLDER)
    ) {

      console.log(
        `❌ Folder not found: ${DATA_FOLDER}`
      );

      console.log(
        `Create the folder and put your ${FORMAT.toUpperCase()} JSON files inside it.`
      );

      await mongoose.disconnect();

      return;
    }


    const files =
      fs.readdirSync(DATA_FOLDER)
        .filter(
          (file) =>
            file.endsWith(".json")
        );


    console.log(
      `Found ${files.length} ${FORMAT.toUpperCase()} JSON files`
    );


    let imported = 0;
    let skipped = 0;
    let failed = 0;


    for (
      const file of files
    ) {

      try {

        const filePath =
          path.join(
            DATA_FOLDER,
            file
          );


        const data =
          JSON.parse(
            fs.readFileSync(
              filePath,
              "utf8"
            )
          );


        const info =
          data.info;


        /*
        Only international matches
        */

        if (
          info.team_type &&
          info.team_type !==
            "international"
        ) {

          console.log(
            `⏭ Skipping non-international: ${file}`
          );

          skipped++;

          continue;
        }


        /*
        Make cleaned scorecard
        */

        const scorecard =
          (data.innings || []).map(
            (innings) =>
              calculateInnings(
                innings
              )
          );


        /*
        Match object
        */

        const match = {

          cricsheetId:
            path.basename(
              file,
              ".json"
            ),

          teams:
            info.teams || [],

          venue:
            info.venue || "",

          date:
            info.dates?.[0] || "",

          format:
            info.match_type ||
            FORMAT.toUpperCase(),

          gender:
            info.gender ||
            "male",

          toss: {

            winner:
              info.toss?.winner ||
              "",

            decision:
              info.toss?.decision ||
              "",
          },

          outcome: {

            winner:
              info.outcome?.winner ||
              "",

            result:
              info.outcome?.result ||
              "",
          },

          players:
            info.players || {},

          innings:
            scorecard,
        };


        /*
        Upsert prevents duplicates
        */

        await Match.updateOne(

          {
            cricsheetId:
              match.cricsheetId,
          },

          {
            $set:
              match,
          },

          {
            upsert:
              true,
          }
        );


        imported++;


        console.log(
          `✅ ${FORMAT.toUpperCase()} ${imported}/${files.length}: ${file}`
        );

      }

      catch (error) {

        failed++;

        console.log(
          `❌ Failed: ${file}`
        );

        console.log(
          error.message
        );
      }
    }


    console.log(
      "\n================================"
    );

    console.log(
      `${FORMAT.toUpperCase()} IMPORT COMPLETE ✅`
    );

    console.log(
      "================================"
    );

    console.log(
      `Imported: ${imported}`
    );

    console.log(
      `Skipped: ${skipped}`
    );

    console.log(
      `Failed: ${failed}`
    );

    console.log(
      "================================"
    );


    await mongoose.disconnect();

  }

  catch (error) {

    console.error(
      "❌ Import failed"
    );

    console.error(
      error
    );

    process.exit(1);
  }
}


importMatches();