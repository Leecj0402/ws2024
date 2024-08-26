function task1(callback) {
    console.log('Task1 시작');
    // 파일을 읽거나, Ajax를 사용 한다고 가정한다.
    setTimeout(function() {
        console.log('Task1 끝');
        callback('Task1 결과');
    }, 1000);
    console.log("2. 이 부분은 언제 실행 될까?")
}

task1(function (result) {
    console.log('fullfiled : ', result);
});

console.log("1. 이 부분은 언제 실행 될까?");