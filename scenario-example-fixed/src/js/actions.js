function startGame(context) {
    addAction({ type: 'start_game' }, context);
}

function guessedWord(context) {
    addAction({ type: 'guessed_word' }, context);
}

function skipWord(context) {
    addAction({ type: 'skip_word' }, context);
}

function nextTeam(context) {
    addAction({ type: 'next_team' }, context);
}

function resetGame(context) {
    addAction({ type: 'reset_game' }, context);
}

function showScore(context) {
    addAction({ type: 'show_score' }, context);
}

function helpInfo(context) {
    addAction({ type: 'help_info' }, context);
}