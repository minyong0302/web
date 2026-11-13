const quotes = [
// {
// quote: '산다는것 그것은 치열한 전투이다.',
// author: '로망 로랑'
// },
// {
// quote: '하루에 3시간을 걸으면 7년 후에 지구를 한바퀴 돌 수 있다.',
// author: '사무엘존슨'
// },
{
quote: '오늘 걷지 않으면 내일은 뛰어야한다',
author: ' - 서울대 도서관 1장 1절'
},
{
quote: '멍청한 덴 약도 없지',
author: ' - 야스오 '
},
{
quote: '내 인생 가장 큰 꺠달음은 생리현상을 참지 않는 것이다',
author: ' - 김민준'
},
{
quote: '이병 김대원 🫡​🫡​🫡​🫡​🫡​🫡​🫡​🫡​🫡​',
author: ' - 김대원'
},
{
quote: '나는 생각한다 고로 존재한다',
author: ' - 르네 데카르트'
},
{
quote: '엄....',
author: ' - 엄은준'
},
// {
// quote: 'The only thing worse than starting something and falling.. is not starting something',
// author: 'SEth Godin'
// },
// {
// quote: 'If you really want to do something, you will find a way. If you do not, you will find an excuse.',
// author: 'Jim Rohn'
// },
];


const quote = document.querySelector("#quote span:first-child");
const author = document.querySelector("#quote span:last-child");
const todaysQuote = quotes[Math.floor(Math.random() * quotes.length)];

quote.innerText = todaysQuote.quote;
author.innerText = todaysQuote.author;