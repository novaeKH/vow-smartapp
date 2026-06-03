import React from 'react';

const getTeamName = (team) => (team === 1 ? 'Синие' : 'Красные');

export const WordCard = ({ currentWord, currentTeam, phase, winnerText }) => {
  let helperText = 'Запустите раунд, чтобы открыть новое слово.';
  let cardText = 'Готовы начать?';

  if (phase === 'playing' && currentWord) {
    helperText = 'Объясняйте слово, не называя его однокоренные формы.';
    cardText = currentWord.text;
  }

  if (phase === 'paused') {
    helperText = 'Время закончилось. Передайте ход другой команде.';
    cardText = 'Раунд завершён';
  }

  if (phase === 'finished') {
    helperText = 'Матч завершён. Можно начать заново голосовой командой или кнопкой.';
    cardText = winnerText || 'Игра окончена';
  }

  return (
    <section className="panel word-panel">
      <div className="panel__header">
        <span className="panel__label">Слово для объяснения</span>
        <span className="panel__meta">
          {phase === 'finished' ? 'Итог матча' : `Ход команды ${getTeamName(currentTeam)}`}
        </span>
      </div>

      <div className="word-box">
        {cardText}
      </div>

      <p className="panel__hint">{helperText}</p>
    </section>
  );
};