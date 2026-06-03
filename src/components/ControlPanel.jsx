import React from 'react';

const ActionButton = ({ children, onClick, variant = 'default', disabled = false }) => (
  <button
    type="button"
    className={`action-button action-button--${variant}`}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

export const ControlPanel = ({
  phase,
  onStart,
  onGuessed,
  onSkip,
  onNextTeam,
}) => {
  const isPlaying = phase === 'playing';
  const isFinished = phase === 'finished';

  return (
    <section className="panel controls-panel">
      <div className="panel__header">
        <span className="panel__label">Управление</span>
      </div>

      <div className="button-grid">
        <ActionButton
          variant="primary"
          onClick={onStart}
          disabled={isPlaying || isFinished}
        >
          Старт раунда
        </ActionButton>

        <ActionButton
          onClick={onNextTeam}
          disabled={isFinished}
        >
          Сменить команду
        </ActionButton>

        <ActionButton
          variant="success"
          onClick={onGuessed}
          disabled={!isPlaying}
        >
          Угадали
        </ActionButton>

        <ActionButton
          variant="warning"
          onClick={onSkip}
          disabled={!isPlaying}
        >
          Пропустить
        </ActionButton>
      </div>
    </section>
  );
};