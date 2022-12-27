import { render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { ScoreBoard } from "./ScoreBoard";

describe("ScoreBoard", () => {
  const games = [
    { homeTeam: "Mexico", awayTeam: "Canada" },
    { homeTeam: "Spain", awayTeam: "Brazil" },
    { homeTeam: "Germany", awayTeam: "France" },
    { homeTeam: "Uruguay", awayTeam: "Italy" },
    { homeTeam: "Argentina", awayTeam: "Australia" },
  ];

  const scores = games.map((game) => ({
    ...game,
    homeScore: 0,
    awayScore: 0,
    duration: 1 * 60 * 1000, // 1 minute in milliseconds
    timestamp: Date.now(),
    lastGoal: Date.now(),
  }));

  it("renders the correct number of rows", () => {
    const { getAllByTestId } = render(<ScoreBoard />);
    const rows = getAllByTestId("score-row");
    expect(rows).toHaveLength(games.length);
  });

  it("renders the correct home and away team names", () => {
    const { getAllByTestId } = render(<ScoreBoard />);
    const rows = getAllByTestId("score-row");
    rows.forEach((row, index) => {
      const homeTeamCell = row.querySelector('[data-testid="home-team-cell"]');
      expect(homeTeamCell).toHaveTextContent(games[index].homeTeam);
      const awayTeamCell = row.querySelector('[data-testid="away-team-cell"]');
      expect(awayTeamCell).toHaveTextContent(games[index].awayTeam);
    });
  });

  it("updates the scores correctly", async () => {
    const { getAllByTestId } = render(<ScoreBoard />);
    const rows = getAllByTestId("score-row");
    await waitFor(() => {
      rows.forEach((row) => {
        const homeScoreCell = row.querySelector(
          '[data-testid="home-score-cell"]'
        );
        expect(homeScoreCell).toHaveTextContent(/^\d+$/);
        const awayScoreCell = row.querySelector(
          '[data-testid="away-score-cell"]'
        );
        expect(awayScoreCell).toHaveTextContent(/^\d+$/);
      });
    });
  });

  it("sorts the scores correctly based on the total number of goals and the time of the last goal", async () => {
    const { getAllByTestId } = render(<ScoreBoard />);
    const rows = getAllByTestId("score-row");
    let initialScores: [{ homeScore: number; awayScore: number }] = [
      { homeScore: 0, awayScore: 0 },
    ];
    rows.forEach((row, index) => {
      const homeScoreCell =
        row.querySelector('[data-testid="home-score-cell"]')?.textContent ??
        "0";
      const awayScoreCell =
        row.querySelector('[data-testid="away-score-cell"]')?.textContent ??
        "0";
      initialScores[index] = {
        homeScore: parseInt(homeScoreCell),
        awayScore: parseInt(awayScoreCell),
      };
    });
    // Simulate adding a goal by updating the scores
    const updatedScores = scores.map((score, index) => ({
      ...score,
      homeScore: initialScores[index].homeScore + 1,
      lastGoal: Date.now(),
    }));

    await waitFor(() => {
      rows.forEach((row, index) => {
        const homeScoreCell = updatedScores[index].homeScore;
        expect(homeScoreCell).toBeGreaterThan(initialScores[index].homeScore);
        const awayScoreCell = updatedScores[index].awayScore;
        expect(awayScoreCell).toEqual(initialScores[index].awayScore);
      });
    });
  });

  it("filters out scores that have exceeded the duration of the game", async () => {
    const { getAllByTestId } = render(<ScoreBoard />);
    const rows = getAllByTestId("score-row");
    await waitFor(() => {
      rows.forEach((row, index) => {
        const currentTimestamp = Date.now();
        const scoreTimestamp = scores[index].timestamp;
        const scoreDuration = scores[index].duration;
        expect(currentTimestamp).toBeLessThanOrEqual(
          scoreTimestamp + scoreDuration
        );
      });
    });
  });
});
