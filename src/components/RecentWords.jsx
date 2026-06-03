import React from 'react';

export const RecentWords = ({ usedWords }) => {
  return (
    <section className="panel history-panel">
      <div className="panel__header">
        <span className="panel__label">Последние слова</span>
      </div>

      {usedWords.length === 0 ? (
        <p className="empty-history">Здесь появятся последние сыгранные слова.</p>
      ) : (
        <ul className="history-list">
          {usedWords.map((item, index) => (
            <li key={`${item.word}-${index}`} className="history-item">
              <span>{item.word}</span>
              <span>{item.success ? `+1 команде ${item.team}` : 'пропуск'}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};