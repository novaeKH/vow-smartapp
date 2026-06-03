import React from 'react';

export const RulesCard = ({ lastActionText }) => {
  return (
    <section className="panel info-panel">
      <div className="panel__header">
        <span className="panel__label">Правила</span>
      </div>

      <ul className="rules-list">
        <li>Матч состоит из 4 раундов, и в каждом раунде по очереди играют обе команды.</li>
        <li>Сначала играют Синие, затем Красные в этом же раунде.</li>
        <li>За каждое угаданное слово команда получает 1 очко.</li>
        <li>Объясняйте слово без однокоренных слов и прямого перевода.</li>
        <li>Если слово сложное, нажмите «Пропустить» или скажите это голосом.</li>
        <li>Если после 4 раундов счёт равный, запускается дополнительный 5-й раунд.</li>
      </ul>

      <div className="status-box">
        <span className="status-box__label">Последнее событие</span>
        <strong className="status-box__text">{lastActionText}</strong>
      </div>
    </section>
  );
};