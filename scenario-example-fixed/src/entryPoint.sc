require: js/reply.js
require: js/actions.js

patterns:
    $StartGame = (начать игру|старт|запустить игру|начать раунд|поехали)
    $Guessed = (угадали|верно|правильно|есть|засчитано)
    $Skip = (пропустить|пас|дальше|следующее слово)
    $NextTeam = (сменить команду|следующий ход|передать ход|другая команда)
    $Reset = (начать заново|сброс|сбросить игру|новая игра)
    $ShowScore = (покажи счёт|покажи счет|какой счёт|какой счет|счёт|счет|результат)
    $Help = (помощь|справка|что ты умеешь|что можно сказать|какие команды доступны|что можно делать)

theme: /
    state: Start
        q!: (запусти|открой|включи) скажи иначе
        q!: (запусти|открой|включи) vow
        q!: (запусти|открой|включи) vibe of words
        q!: (запусти|открой|включи) воу
        q!: $StartGame
        script:
            startGame($context);
            addSuggestions(['Угадали', 'Пропустить', 'Сменить команду', 'Помощь'], $context);
        a: Игра началась.

    state: Guessed
        q!: $Guessed
        script:
            guessedWord($context);
            addSuggestions(['Угадали', 'Пропустить', 'Сменить команду', 'Помощь'], $context);
        a: Отлично.

    state: SkipWord
        q!: $Skip
        script:
            skipWord($context);
            addSuggestions(['Угадали', 'Пропустить', 'Сменить команду', 'Помощь'], $context);
        a: Пропускаем.

    state: NextTeam
        q!: $NextTeam
        script:
            nextTeam($context);
            addSuggestions(['Начать игру', 'Покажи счёт', 'Начать заново', 'Помощь'], $context);
        a: Ход передан.

    state: ShowScore
        q!: $ShowScore
        script:
            showScore($context);
            addSuggestions(['Начать игру', 'Угадали', 'Пропустить', 'Помощь'], $context);
        a: Показываю счёт.

    state: ResetGame
        q!: $Reset
        script:
            resetGame($context);
            addSuggestions(['Начать игру', 'Покажи счёт', 'Помощь'], $context);
        a: Игра сброшена.

    state: HelpState
        q!: $Help
        script:
            helpInfo($context);
            addSuggestions(['Начать игру', 'Угадали', 'Пропустить', 'Сменить команду', 'Покажи счёт'], $context);
        a: Скажите: начать игру, угадали, пропустить, сменить команду, показать счёт или начать заново. Также можно выбрать обычные слова или молодёжный сленг кнопками на экране.

    state: Fallback
        event!: noMatch
        a: Я не поняла команду. Скажите начать игру, угадали, пропустить, сменить команду, показать счёт, начать заново или помощь.
        script:
            addSuggestions(['Начать игру', 'Угадали', 'Пропустить', 'Сменить команду', 'Покажи счёт', 'Помощь'], $context);