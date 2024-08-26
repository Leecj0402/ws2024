const http = require("http");
const express = require("express");
const app = express();

app.set('port', 3000);

app.use((req, res, next) => {
    // 전체 요청에 적용 될 한글 처리 기능
    res.writeHead(200, {"Content-Type":"text/html; charset=UTF-8"});
    console.log("전체 미들웨어 호출");
    //res.end("<h1>Hello nodejs</h1>");
    // 다음 요청 실행
    next();
});

app.use("/", (req, res, next) => {
    console.log("/ 요청 미들웨어 호출");
    // 다음 요청 실행
    next();
});

app.get("/", (req, res) => {
    console.log("Get / 요청 실행");
    res.end("<h1>안녕 세계</h1>");
})

const server = http.createServer(app);
server.listen(app.get('port'), ()=>{
    console.log(`서버 실행 중>>> http://localhost:${app.get('port')}`);
});