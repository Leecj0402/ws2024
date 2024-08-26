const http = require("http");
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

app.set('port', 3000);
console.log("__dirname:", __dirname);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
// public 디렉토리를 static으로 사용하기 위한 설정
app.use("/", express.static(path.join(__dirname, "public") ));
app.use(cors());
// POST 요청 시 파라미터를 body에서 사용하기 위한 설정
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const saramList = [
    {no:1001, name:"홍길동", dept:"기획부", grade:"부장"},
    {no:1002, name:"홍길동", dept:"기획부", grade:"부장"},
    {no:1003, name:"홍길동", dept:"기획부", grade:"부장"}
];
let noCnt=1004;

// index.html에서 Ajax 요청 처리 
// 구현 하고 Postman으로 테스트 하세요.
// 파일 업로드 참고 : https://docs.google.com/presentation/d/1hTAwoG6A_0BazmwQi2I21KZFnCiLRfhX/edit#slide=id.p112
// https://www.w3schools.com/nodejs/nodejs_uploadfiles.asp
// https://cafe.naver.com/sw202407
// https://cafe.naver.com/sw202407
app.get("/saram", (req, res) => {
    console.log("GET - /saram 요청");
    res.send(saramList);
});
app.post("/saram", (req, res) => {
    console.log("POST - /saram 요청");
    res.send(saramList);
});
app.put("/saram", (req, res) => {
    console.log("PUT - /saram 요청");
    res.send(saramList);
});
app.delete("/saram", (req, res) => {
    console.log("DELETE - /saram 요청");
    res.send(saramList);
});

const server = http.createServer(app);
server.listen(app.get('port'), ()=>{
    console.log(`서버 실행 중>>> http://localhost:${app.get('port')}`);
});