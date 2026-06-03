import React from 'react';

export const GameResultModal = ({ isOpen, winnerText, score, onNewGame }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="result-modal-overlay">
      <div className="result-modal">
        <p className="result-modal__eyebrow">Игра окончена</p>
        <h2 className="result-modal__title">{winnerText}</h2>

        <div className="result-scoreboard">
          <div className="result-score-card result-score-card--blue">
            <span className="result-score-card__label">Синие</span>
            <strong className="result-score-card__value">{score[1]}</strong>
          </div>

          <div className="result-score-divider">:</div>

          <div className="result-score-card result-score-card--red">
            <span className="result-score-card__label">Красные</span>
            <strong className="result-score-card__value">{score[2]}</strong>
          </div>
        </div>

        <button
          type="button"
          className="result-modal__button"
          onClick={onNewGame}
        >
          Новая игра
        </button>
      </div>
    </div>
  );
};