import React from 'react';
import { createAssistant, createSmartappDebugger } from '@salutejs/client';

import './App.css';
import { GameScreen } from './pages/GameScreen';
import { WORDS } from './data/words';
import { SLANG_WORDS } from './data/slang_words';

const ROUND_SECONDS = 60;
const TOTAL_ROUNDS = 4;
const EXTRA_ROUND = 5;

const WORD_SETS = {
  classic: WORDS,
  slang: SLANG_WORDS,
};

const HELP_TEXT =
  'Скажите: начать игру, угадали, пропустить, сменить команду, показать счёт или начать заново. Также можно выбрать обычные слова или молодёжный сленг кнопками на экране.';

const initializeAssistant = (getState) => {
  if (process.env.NODE_ENV === 'development') {
    return createSmartappDebugger({
      token: process.env.REACT_APP_TOKEN ?? '',
      initPhrase: `Запусти ${process.env.REACT_APP_SMARTAPP}`,
      getState,
      nativePanel: {
        defaultText: 'Говорите!',
        screenshotMode: false,
        tabIndex: -1,
      },
    });
  }

  return createAssistant({ getState });
};

const shuffle = (array) => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const buildDeck = (mode = 'classic') =>
  shuffle((WORD_SETS[mode] || WORDS).map((text, index) => ({ id: `${mode}-${index}-${text}`, text })));

const getTeamName = (team) => (team === 1 ? 'Синие' : 'Красные');

const createInitialState = (mode = 'classic') => ({
  mode,
  phase: 'idle',
  words: buildDeck(mode),
  currentIndex: 0,
  currentTeam: 1,
  score: { 1: 0, 2: 0 },
  round: 1,
  maxRounds: TOTAL_ROUNDS,
  isGameOver: false,
  winnerText: '',
  secondsLeft: ROUND_SECONDS,
  lastActionText:
    mode === 'slang'
      ? 'Выбран режим: молодёжный сленг. Раунд 1. Синие начинают.'
      : 'Выбран режим: обычные слова. Раунд 1. Синие начинают.',
});

export class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = createInitialState();
    this.timerId = null;
    this.audioContext = null;

    this.assistant = initializeAssistant(() => this.getStateForAssistant());

    this.assistant.on('data', (event) => {
      if (event.type === 'character' || event.type === 'insets') {
        return;
      }

      const { action } = event;
      this.dispatchAssistantAction(action);
    });
  }

  componentWillUnmount() {
    this.stopTimer();
  }

  getCurrentWord() {
    return this.state.words[this.state.currentIndex] || null;
  }

  getStateForAssistant() {
    const currentWord = this.getCurrentWord();

    return {
      screen: 'game',
      game_phase: this.state.phase,
      game_mode: this.state.mode,
      current_team: this.state.currentTeam,
      current_round: this.state.round,
      max_rounds: this.state.maxRounds,
      current_word: currentWord ? currentWord.text : '',
      score_team_1: this.state.score[1],
      score_team_2: this.state.score[2],
      timer: this.state.secondsLeft,
      is_game_over: this.state.isGameOver,
      suggestions: [
        'Начать игру',
        'Угадали',
        'Пропустить',
        'Сменить команду',
        'Покажи счёт',
        'Начать заново',
        'Помощь',
      ],
    };
  }

  dispatchAssistantAction(action) {
    if (!action || !action.type) {
      return;
    }

    switch (action.type) {
      case 'start_game':
        this.startGame();
        break;
      case 'guessed_word':
        this.guessedWord();
        break;
      case 'skip_word':
        this.skipWord();
        break;
      case 'next_team':
        this.nextTeam();
        break;
      case 'reset_game':
        this.resetGame();
        break;
      case 'show_score':
        this.sayScore();
        break;
      case 'help_info':
        this.showHelp();
        break;
      default:
        break;
    }
  }

  sendActionValue(actionId, value) {
    if (!this.assistant || typeof this.assistant.sendData !== 'function') {
      return;
    }

    const data = {
      action: {
        action_id: actionId,
        parameters: { value },
      },
    };

    const unsubscribe = this.assistant.sendData(data, () => {
      unsubscribe();
    });
  }

  stopTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  ensureAudioContext() {
    if (typeof window === 'undefined') {
      return null;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return null;
    }

    if (!this.audioContext) {
      this.audioContext = new AudioContextClass();
    }

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    return this.audioContext;
  }

  playBeep(frequency = 880, duration = 0.12, volume = 0.03) {
    const ctx = this.ensureAudioContext();
    if (!ctx) {
      return;
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gainNode.gain.value = volume;

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  startTimer() {
    this.stopTimer();

    this.timerId = setInterval(() => {
      this.setState((prevState) => {
        if (prevState.phase !== 'playing') {
          return null;
        }

        if ([3, 2, 1].includes(prevState.secondsLeft)) {
          this.playBeep(980, 0.08, 0.035);
        }

        if (prevState.secondsLeft <= 1) {
          this.stopTimer();
          this.playBeep(520, 0.2, 0.05);
          this.sendActionValue('round_end', `Время вышло. Ход команды ${getTeamName(prevState.currentTeam)} завершён.`);

          return {
            phase: 'paused',
            secondsLeft: 0,
            lastActionText: `Время вышло. Передайте ход команде ${getTeamName(prevState.currentTeam === 1 ? 2 : 1)}.`,
          };
        }

        return {
          secondsLeft: prevState.secondsLeft - 1,
        };
      });
    }, 1000);
  }

  ensureWordIndex(state) {
    if (state.currentIndex < state.words.length) {
      return state;
    }

    return {
      ...state,
      words: buildDeck(state.mode),
      currentIndex: 0,
    };
  }

  setGameMode = (mode) => {
    this.stopTimer();
    this.setState(createInitialState(mode), () => {
      this.sendActionValue(
        'game_state',
        mode === 'slang'
          ? 'Включён режим молодёжного сленга.'
          : 'Включён режим обычных слов.'
      );
    });
  };

  startGame() {
    if (this.state.isGameOver) {
      this.sendActionValue('game_state', 'Матч завершён. Скажите «начать заново».');
      this.setState({
        lastActionText: 'Матч завершён. Скажите «начать заново».',
      });
      return;
    }

    this.setState((prevState) => {
      const prepared = this.ensureWordIndex({
        ...prevState,
        phase: 'playing',
        secondsLeft: ROUND_SECONDS,
        lastActionText: `Раунд ${prevState.round}. Ход команды ${getTeamName(prevState.currentTeam)}.`,
      });

      return prepared;
    }, () => {
      this.startTimer();
      this.sendActionValue('game_state', `Раунд ${this.state.round}. Ход команды ${getTeamName(this.state.currentTeam)}.`);
    });
  }

  advanceWord(withPoint) {
    this.setState((prevState) => {
      const nextScore = { ...prevState.score };

      if (withPoint) {
        nextScore[prevState.currentTeam] += 1;
      }

      const nextState = this.ensureWordIndex({
        ...prevState,
        score: nextScore,
        currentIndex: prevState.currentIndex + 1,
        lastActionText: withPoint
          ? `Команда ${getTeamName(prevState.currentTeam)} получает 1 очко.`
          : 'Слово пропущено. Игра продолжается.',
      });

      return nextState;
    }, () => {
      if (withPoint) {
        this.sendActionValue(
          'game_state',
          `Верно. Счёт ${this.state.score[1]} к ${this.state.score[2]}.`
        );
      } else {
        this.sendActionValue('game_state', 'Слово пропущено.');
      }
    });
  }

  guessedWord() {
    if (this.state.phase !== 'playing') {
      this.sendActionValue('game_state', 'Сначала начните игру.');
      this.setState({ lastActionText: 'Сначала начните игру.' });
      return;
    }

    this.advanceWord(true);
  }

  skipWord() {
    if (this.state.phase !== 'playing') {
      this.sendActionValue('game_state', 'Сначала начните игру.');
      this.setState({ lastActionText: 'Сначала начните игру.' });
      return;
    }

    this.advanceWord(false);
  }

  showHelp() {
    this.sendActionValue('game_state', HELP_TEXT);
    this.setState({
      lastActionText: HELP_TEXT,
    });
  }

  buildFinishState(score, currentRound, nextTeam) {
    const isMainRoundFinished = currentRound >= TOTAL_ROUNDS;

    if (!isMainRoundFinished) {
      return {
        phase: 'idle',
        currentTeam: nextTeam,
        round: currentRound + 1,
        maxRounds: TOTAL_ROUNDS,
        isGameOver: false,
        winnerText: '',
        lastActionText: `Раунд ${currentRound + 1}. Теперь ход команды ${getTeamName(nextTeam)}. Нажмите «Старт раунда».`,
      };
    }

    if (isMainRoundFinished && currentRound < EXTRA_ROUND && score[1] === score[2]) {
      return {
        phase: 'idle',
        currentTeam: 1,
        round: EXTRA_ROUND,
        maxRounds: EXTRA_ROUND,
        isGameOver: false,
        winnerText: '',
        lastActionText: 'После 4 раундов счёт равный. Начинается дополнительный 5-й раунд.',
      };
    }

    if (score[1] > score[2]) {
      const winnerText = 'Победили Синие';
      return {
        phase: 'finished',
        currentTeam: nextTeam,
        round: currentRound,
        maxRounds: currentRound >= EXTRA_ROUND ? EXTRA_ROUND : TOTAL_ROUNDS,
        isGameOver: true,
        winnerText,
        lastActionText: winnerText,
      };
    }

    if (score[2] > score[1]) {
      const winnerText = 'Победили Красные';
      return {
        phase: 'finished',
        currentTeam: nextTeam,
        round: currentRound,
        maxRounds: currentRound >= EXTRA_ROUND ? EXTRA_ROUND : TOTAL_ROUNDS,
        isGameOver: true,
        winnerText,
        lastActionText: winnerText,
      };
    }

    const winnerText = 'Ничья';
    return {
      phase: 'finished',
      currentTeam: nextTeam,
      round: currentRound,
      maxRounds: EXTRA_ROUND,
      isGameOver: true,
      winnerText,
      lastActionText: winnerText,
    };
  }

  nextTeam() {
    this.stopTimer();

    if (this.state.isGameOver) {
      this.sendActionValue('game_state', this.state.winnerText || 'Матч завершён.');
      return;
    }

    this.setState((prevState) => {
      const nextTeam = prevState.currentTeam === 1 ? 2 : 1;

      if (prevState.currentTeam === 1) {
        return {
          ...prevState,
          phase: 'idle',
          currentTeam: 2,
          secondsLeft: ROUND_SECONDS,
          lastActionText: `Раунд ${prevState.round}. Теперь ход команды Красные. Нажмите «Старт раунда».`,
        };
      }

      const finishState = this.buildFinishState(prevState.score, prevState.round, nextTeam);

      return {
        ...prevState,
        phase: finishState.phase,
        currentTeam: finishState.currentTeam,
        round: finishState.round,
        maxRounds: finishState.maxRounds,
        secondsLeft: ROUND_SECONDS,
        isGameOver: finishState.isGameOver,
        winnerText: finishState.winnerText,
        lastActionText: finishState.lastActionText,
      };
    }, () => {
      this.sendActionValue('game_state', this.state.lastActionText);
    });
  }

  resetGame() {
    this.stopTimer();
    this.setState(createInitialState(this.state.mode), () => {
      this.sendActionValue('game_state', 'Игра сброшена. Можно начинать заново.');
    });
  }

  sayScore() {
    this.sendActionValue(
      'game_state',
      `Счёт такой: Синие — ${this.state.score[1]}, Красные — ${this.state.score[2]}.`
    );

    this.setState({
      lastActionText: 'Счёт озвучен голосовым помощником.',
    });
  }

  handleStart = () => {
    this.startGame();
  };

  handleGuessed = () => {
    this.guessedWord();
  };

  handleSkip = () => {
    this.skipWord();
  };

  handleNextTeam = () => {
    this.nextTeam();
  };

  handleReset = () => {
    this.resetGame();
  };

  handleShowScore = () => {
    this.sayScore();
  };

  render() {
    return (
      <GameScreen
        mode={this.state.mode}
        currentWord={this.getCurrentWord()}
        currentTeam={this.state.currentTeam}
        score={this.state.score}
        round={this.state.round}
        maxRounds={this.state.maxRounds}
        secondsLeft={this.state.secondsLeft}
        phase={this.state.phase}
        lastActionText={this.state.lastActionText}
        winnerText={this.state.winnerText}
        isGameOver={this.state.isGameOver}
        onStart={this.handleStart}
        onGuessed={this.handleGuessed}
        onSkip={this.handleSkip}
        onNextTeam={this.handleNextTeam}
        onReset={this.handleReset}
        onShowScore={this.handleShowScore}
        onSetClassicMode={() => this.setGameMode('classic')}
        onSetSlangMode={() => this.setGameMode('slang')}
      />
    );
  }
}