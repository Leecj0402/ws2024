const http = require("http");
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");

app.set('port', 3000);
console.log("__dirname:", __dirname);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/", express.static(path.join(__dirname, "public") ));
app.use(cors());

// ejs 뷰 엔진에서 파라미터 확인
app.get("/home", (req, res) => {
    console.log("Get /home 요청 실행");
    const name = req.query.name;
    const age = req.query.age;
    req.app.render("home", {name, age}, (err, html)=>{
        // res.end()는 문자열만 처리
        res.end(html);
    });
});

// 브라우저 body에 JSON형식으로 바로 출력
app.get("/home2", (req, res) => {
    console.log("Get /home 요청 실행");
    // res.send()는 객체나 수식 처리
    res.send(req.query);
});

const server = http.createServer(app);
server.listen(app.get('port'), ()=>{
    console.log(`서버 실행 중>>> http://localhost:${app.get('port')}`);
});