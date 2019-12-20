let Words = function() {

    let words = [
        'Собака',
        'Слон',
        'Дом',
        'Дождь',
        'Снег',
        'Сейф',
        'Гитара',
        'Стакан',
    ];

    getRandomWord = () => {
        let randomWordId = Math.ceil(Math.random() * words.length-1);
        return words[randomWordId];
    }

    getRandomList = (count=3, arr=[]) => {
        if(arr.length < count) {
            let word = getRandomWord();
            if(!arr.includes(word)) arr.push(word);
            return getRandomList(count, arr);
        }
        else return arr;
    }

    return {
        getRandomList,
    }

};

module.exports = Words;