// Promise를 이용한 흐름 제어
// 콜백 함수의 실행 순서를 결정한다.

new Promise(function (fullfill) {
    console.log('1. Task1 시작');
    let num = 0;
    setTimeout(() => {
        let num = 1004;
        fullfill({data: '3. Task1 결과', num});
    }, 300);
    console.log('2. Task1 끝', num);
}).then( (result) => {
    console.log('fullfiled 함수 : ', result.data, result.num);
});