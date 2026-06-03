import React from 'react';

export const ScoreBoard = ({ score, currentTeam, round, maxRounds, secondsLeft }) => {
  return (
    <div className="scoreboard-card">
      <div className={`team-score team-score--blue ${currentTeam === 1 ? 'team-score--active' : ''}`}>
        <span className="team-score__label">Синие</span>
        <strong className="team-score__value">{score[1]}</strong>
      </div>

      <div className="score-center">
        <div className="round-badge">Раунд {round} из {maxRounds}</div>
        <div className="timer">{secondsLeft} c</div>
      </div>

      <div className={`team-score team-score--red ${currentTeam === 2 ? 'team-score--active' : ''}`}>
        <span className="team-score__label">Красные</span>
        <strong className="team-score__value">{score[2]}</strong>
      </div>
    </div>
  );
};