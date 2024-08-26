var http = require('http');

var server = http.createServer();
server.listen(3000, () => {
    console.log("http://localhost:3000");
});

const html = `
<!DOCTYPE html>
<html lang="ko">
    <head>
        <title>Node.js응답</title>
        <meta charset="UTF-8" />
    </head>
    <body>
        <h1>Nodejs 응답 페이지</h1>
    </body>
</html>
`;

// req > request
// res > response
server.on('request', (req, res) => {
    console.log('>>> 클라이언트 요청이 들어왔습니다.');
    //res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
    res.write(html);
    res.end();
    // res.write()는 여러번 호출 가능, res.end() 한번만 호출 해야 함.
    // res.end()는 문자열 데이터만 사용.
    // express에서 res.send() 수식, 객체 등을 body 화면에 바로 출력.
});