import React from 'react';
import { ControlPanel } from '../components/ControlPanel';
import { ScoreBoard } from '../components/ScoreBoard';
import { WordCard } from '../components/WordCard';
import { RulesCard } from '../components/RulesCard';
import { GameResultModal } from '../components/GameResultModal';

export const GameScreen = ({
  mode,
  currentWord,
  currentTeam,
  score,
  round,
  maxRounds,
  secondsLeft,
  phase,
  lastActionText,
  winnerText,
  isGameOver,
  onStart,
  onGuessed,
  onSkip,
  onNextTeam,
  onReset,
  onShowScore,
  onSetClassicMode,
  onSetSlangMode,
}) => {
  const subtitle =
    mode === 'slang'
      ? 'Объясняйте современные сленговые слова.'
      : 'Объясняйте слова своей команде.';

  return (
    <main className="app-shell">
      {/* Desktop / tablet */}
      <div className="screen-desktop">
        <section className="hero-card">
          <div className="hero-copy">
            <p className="eyebrow">Игра для компании</p>
            <h1 className="title">VOW</h1>
            <p className="subtitle">
              {mode === 'slang'
                ? 'Объясняйте современные сленговые слова. Играйте голосом, касанием или с помощью пульта.'
                : 'Один игрок объясняет слово, не называя его. Играйте голосом, касанием или с помощью пульта.'}
            </p>

            <div className="mode-switch">
              <button
                type="button"
                className={`mode-switch__button ${mode === 'classic' ? 'mode-switch__button--active' : ''}`}
                onClick={onSetClassicMode}
              >
                Обычные слова
              </button>

              <button
                type="button"
                className={`mode-switch__button ${mode === 'slang' ? 'mode-switch__button--active' : ''}`}
                onClick={onSetSlangMode}
              >
                Молодёжный сленг
              </button>
            </div>
          </div>

          <ScoreBoard
            score={score}
            currentTeam={currentTeam}
            round={round}
            maxRounds={maxRounds}
            secondsLeft={secondsLeft}
          />
        </section>

        <section className="content-grid">
          <div className="left-column">
            <WordCard
              currentWord={currentWord}
              currentTeam={currentTeam}
              phase={phase}
              winnerText={winnerText}
            />

            <ControlPanel
              phase={phase}
              onStart={onStart}
              onGuessed={onGuessed}
              onSkip={onSkip}
              onNextTeam={onNextTeam}
              onReset={onReset}
              onShowScore={onShowScore}
            />
          </div>

          <div className="right-column">
            <RulesCard lastActionText={lastActionText} />
          </div>
        </section>
      </div>

      {/* Mobile */}
      <div className="screen-mobile">
        <section className="mobile-top-card">
          <p className="eyebrow">Игра для устройств Сбера</p>
          <h1 className="mobile-title">VOW</h1>
          <p className="mobile-subtitle">Vibe of Words</p>
          <p className="mobile-description">{subtitle}</p>

          <div className="mode-switch mode-switch--mobile">
            <button
              type="button"
              className={`mode-switch__button ${mode === 'classic' ? 'mode-switch__button--active' : ''}`}
              onClick={onSetClassicMode}
            >
              Обычные слова
            </button>

            <button
              type="button"
              className={`mode-switch__button ${mode === 'slang' ? 'mode-switch__button--active' : ''}`}
              onClick={onSetSlangMode}
            >
              Молодёжный сленг
            </button>
          </div>
        </section>

        <section className="mobile-score-wrap">
          <ScoreBoard
            score={score}
            currentTeam={currentTeam}
            round={round}
            maxRounds={maxRounds}
            secondsLeft={secondsLeft}
          />
        </section>

        <section className="mobile-word-wrap">
          <WordCard
            currentWord={currentWord}
            currentTeam={currentTeam}
            phase={phase}
            winnerText={winnerText}
          />
        </section>

        <section className="mobile-status-card panel">
          <div className="panel__header">
            <span className="panel__label">Статус</span>
          </div>
          <div className="status-box status-box--mobile">
            <span className="status-box__label">Последнее событие</span>
            <strong className="status-box__text">{lastActionText}</strong>
          </div>
        </section>

        <section className="mobile-controls-wrap">
          <ControlPanel
            phase={phase}
            onStart={onStart}
            onGuessed={onGuessed}
            onSkip={onSkip}
            onNextTeam={onNextTeam}
            onReset={onReset}
            onShowScore={onShowScore}
          />
        </section>
      </div>

      <GameResultModal
        isOpen={isGameOver}
        winnerText={winnerText}
        score={score}
        onNewGame={onReset}
      />
    </main>
  );
};