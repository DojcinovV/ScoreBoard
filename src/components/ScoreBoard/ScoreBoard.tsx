import { useState, useEffect, FC, memo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

import { IGames, IScores } from "./models";
import { millisToMinutesAndSeconds } from "utils";
import "./ScoreBoard.css";

const games: IGames[] = [
  { homeTeam: "Mexico", awayTeam: "Canada" },
  { homeTeam: "Spain", awayTeam: "Brazil" },
  { homeTeam: "Germany", awayTeam: "France" },
  { homeTeam: "Uruguay", awayTeam: "Italy" },
  { homeTeam: "Argentina", awayTeam: "Australia" },
];

export const ScoreBoard: FC = memo(() => {
  const [scores, setScores] = useState<IScores[]>(
    games.map((game) => ({
      ...game,
      homeScore: 0,
      awayScore: 0,
      duration: 1 * 60 * 1000, // 1 minute in milliseconds
      gameStartTime: Date.now(),
      lastGoal: Date.now(),
    }))
  );

  useEffect(() => {
    // This simulates updating the score every 5 seconds
    const interval = setInterval(() => {
      setScores(
        scores.map((score) => {
          // This simulates adding a goal with a probability of 0.1 for home team
          if (Math.random() < 0.1) {
            return {
              ...score,
              homeScore: score.homeScore + 1,
              lastGoal: Date.now(),
            };
          } else if (Math.random() < 0.05) {
            return {
              ...score,
              awayScore: score.awayScore + 1,
              lastGoal: Date.now(),
            };
          } else {
            return {
              ...score,
            };
          }
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [scores]);

  const getSummary = () => {
    return scores
      .filter((score) => score.gameStartTime + score.duration > Date.now())
      .sort((a, b) => {
        if (a.homeScore + a.awayScore !== b.homeScore + b.awayScore) {
          return b.homeScore + b.awayScore - a.homeScore - a.awayScore;
        } else {
          return b.lastGoal - a.lastGoal;
        }
      });
  };

  return (
    <div className="container">
      <TableContainer component={Paper}>
        <Table aria-label="scoreboard">
          <TableHead>
            <TableRow>
              <TableCell>Home Team</TableCell>
              <TableCell align="right">Away Team</TableCell>
              <TableCell align="right">Home Score</TableCell>
              <TableCell align="right">Away Score</TableCell>
              <TableCell align="right">Current Minute</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getSummary().map((score, index) => (
              <TableRow key={index} data-testid="score-row">
                <TableCell
                  component="th"
                  scope="row"
                  data-testid="home-team-cell"
                >
                  {score.homeTeam}
                </TableCell>
                <TableCell align="right" data-testid="away-team-cell">
                  {score.awayTeam}
                </TableCell>
                <TableCell align="right" data-testid="home-score-cell">
                  {score.homeScore}
                </TableCell>
                <TableCell align="right" data-testid="away-score-cell">
                  {score.awayScore}
                </TableCell>
                <TableCell align="right" data-testid="away-score-cell">
                  {millisToMinutesAndSeconds(Date.now() - score.gameStartTime)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
});
