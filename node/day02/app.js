const http = require("http");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const multer = require("multer");
const fs = require("fs");

//DB설정
const { MongoClient } = require("mongodb");
const uri = "mongodb://127.0.0.1";
const client = new MongoClient(uri);

app.set("port", 3000);
app.set("views", "views");
app.set("view engine", "ejs");

app.use(express.static("public"));
// POST 방식으로 파라미터 전달 받기 위한 설정
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// 쿠키 사용 미들웨어 설정
app.use(cookieParser());
// 세션 미들웨어 등록
app.use(
  expressSession({
    secret: "my key",
    resave: true,
    saveUninitialized: true,
  })
);

// multer 업로드 설정
// multer 미들웨어 사용: 미들웨어 사용 순서
// body-parser -> multer -> router 순으로 실행
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "uploads");
  },
  filename: function (req, file, callback) {
    //callback(null, file.originalname + Date.now());
    // 파일명 중복을 방지하기 위한 처리
    // Date.now() <-- 타임스템프
    const fileName = Buffer.from(file.originalname, "latin1").toString("utf8");
    let index = fileName.lastIndexOf(".");
    let newFileName = fileName.substring(0, index);
    newFileName += Date.now();
    newFileName += fileName.substring(index);
    callback(null, newFileName);
  },
});
// 파일 제한: 10개, 1G 이하
var upload = multer({
  storage: storage,
  limits: {
    files: 10,
    fileSize: 1024 * 1024 * 1024,
  },
});

var noCnt = 101;
var carSeq = 101;

// 요청 라운팅 사용
const router = express.Router();

router.route("/home").get((req, res) => {
  req.app.render("home/Home", {}, (err, html) => {
    res.end(html);
  });
});
router.route("/profile").get((req, res) => {
  req.app.render("profile/Profile", {}, (err, html) => {
    res.end(html);
  });
});
router.route("/member").get((req, res) => {
  // 로그인이 되어 있다면 member 페이지를 보여준다.
  // 쿠키는 사용자쪽에 전달(res), 세션은 요청 들어올때 생성(req)

  if (req.session.user !== undefined) {
    const user = req.session.user;
    req.app.render("member/Member", { user }, (err, html) => {
      res.end(html);
    });
  } else {
    res.redirect("/login");
  }
});

router.route("/login").get((req, res) => {
  req.app.render("member/Login", {}, (err, html) => {
    // 사용자(접속자)의 로컬에 쿠키가 저장 된다.
    res.cookie("user", {
      id: "TestUser",
      name: "테스트 유저",
      authorized: true,
    });
    res.end(html);
  });
});

router.route("/login").post(async (req, res) => {
  console.log(req.body.id, req.body.password);
  const id = req.body.id;
  const password = req.body.password;
  try {
    await client.connect();
    const db = client.db("vehicle");
    const member = db.collection("member");

    //계정이 있는지 확인하는 용도
    const memberid = await member.find({ id }).toArray();
    //계정하고 비밀번호가 일치하는 데이터 있는지 확인용
    const memberpass = await member.find({ id, password }).toArray();

    if (memberid[0]) {
      if (memberpass[0]) {
        console.log("로그인 성공!");
        // 세션에 로그인 정보를 등록 후 멤버 페이지 이동
        req.session.user = {
          id: memberpass[0].id,
          name: memberpass[0].name,
          email: memberpass[0].email,
          _id: memberpass[0]._id,
        };

        res.redirect("/member");
      } else {
        console.log("로그인 실패! 패스워드가 맞지 않습니다.");
        // 다시 로그인 페이지로 다시 이동
        res.redirect("/login");
      }
    } else {
      console.log("존재하지 않는 계정입니다.");
      res.redirect("/login");
    }
  } catch (e) {
    console.error(e);
    res.send("ERROR");
  } finally {
    await client.close();
  }
});

router.route("/logout").get((req, res) => {
  console.log("GET - /logout 호출 ...");
  // 로그인 된 상태라면 로그아웃
  if (!req.session.user) {
    console.log("아직 로그인 전 상태입니다.");
    res.redirect("/login");
    return;
  }
  // 세션의 user 정보를 제거 해서 logout처리
  req.session.destroy((err) => {
    if (err) throw err;
    console.log("로그아웃 성공!");
    res.redirect("/login");
  });
});

router.route("/joinus").get((req, res) => {
  // 회원 가입 ejs 페이지 forward
  req.app.render("member/Joinus", {}, (err, html) => {
    res.end(html);
  });
});

router.route("/joinus").post(async (req, res) => {
  // 회원 가입 처리 후 목록으로 갱신
  const body = req.body;
  console.log(body);
  try {
    await client.connect();
    const db = client.db("vehicle");
    const member = db.collection("member");
    if (member) {
      await member.insertOne({
        _id: noCnt++,
        id: body.id,
        password: body.password,
        name: body.name,
        email: body.email,
        carts: [],
      });
    } else {
      console.log("오류발생");
      req.redirect("/joinus");
    }
  } catch (e) {
    console.error(e);
    res.send("ERROR");
  } finally {
    await client.close();
  }
  res.redirect("/member");
});

router.route("/gallery").get((req, res) => {
  req.app.render("gallery/Gallery", {}, (err, html) => {
    res.end(html);
  });
});
// ---- 쇼핑몰 기능
router.route("/shop").get(async (req, res) => {
  try {
    await client.connect();
    const database = client.db("vehicle");
    const cars = database.collection("car");

    const dbCarList = await cars.find({}).toArray();

    req.app.render("shop/Shop", { carList: dbCarList }, (err, html) => {
      if (err) throw err;
      res.end(html);
    });
  } catch (e) {
    console.error(e);
    res.send("Error");
  } finally {
    await client.close();
  }
  //console.log(dbCarList);
});

router.route("/shop/insert").get((req, res) => {
  req.app.render("shop/Insert", {}, (err, html) => {
    res.end(html);
  });
});

router.route("/shop/insert").post(upload.any("photo", 1), async (req, res) => {
  //제품 추가 요청 처리하는 곳
  //가격과 연식은 수자로 변화후 등록
  const { name, price, year, company } = req.body;
  const itemFiles = req.files;
  let intprice = parseInt(price);
  let intyear = parseInt(year);
  //console.dir(itemFiles)
  try {
    await client.connect();
    const database = client.db("vehicle");
    const cars = database.collection("car");

    //제품입력시 사진을 등옥안하면 사진없음 사진으로 저장
    await cars.insertOne({
      _id: carSeq++,
      name,
      price: intprice,
      year: intyear,
      company,
      writedate: Date.now(),
      photos: itemFiles[0] ? itemFiles : [{ filename: "noimg.jpg" }],
    });
    res.redirect("/shop");
    res.end();
  } catch (e) {
    console.error(e);
    res.send("Error");
  } finally {
    await client.close();
  }
});

router.route("/shop/modify").get(async (req, res) => {
  const _id = parseInt(req.query._id);
  try {
    await client.connect();
    const database = client.db("vehicle");
    const cars = database.collection("car");
    const dbCarList = await cars.find({ _id }).toArray();
    if (!dbCarList[0]) {
      console.log("상품이 존재 하지 않습니다.");
      res.redirect("/shop");
      return;
    }
    req.app.render("shop/Modify", { car: dbCarList[0] }, (err, html) => {
      if (err) throw err;
      res.end(html);
    });
  } catch (e) {
    console.error(e);
    res.send("Error");
  } finally {
    await client.close();
  }
});

router.route("/shop/modify").post(upload.any("photo", 1), async (req, res) => {
  const _id = parseInt(req.body._id);
  const { name, price, year, company } = req.body;
  const itemFiles = req.files;
  let intprice = parseInt(price);
  let intyear = parseInt(year);
  console.log(itemFiles);
  try {
    await client.connect();
    const database = client.db("vehicle");
    const cars = database.collection("car");
    const dbCarList = await cars.find({ _id }).toArray();

    if (!dbCarList[0]) {
      console.log("상품이 존재 하지 않습니다.");
      res.redirect("/shop");
      return;
    }

    //사진이 변경되면 변경경된 사진으로 변경 안되면 기존 사진으로 저장
    await cars.updateOne(
      { _id },
      {
        $set: { _id },
        $set: { name: name },
        $set: { price: parseInt(intprice) },
        $set: { year: parseInt(intyear) },
        $set: { compile: company },
        $set: { photos: itemFiles[0] ? itemFiles : dbCarList[0].photos },
      },
      false,
      false
    );
  } catch (e) {
    console.error(e);
    res.send("Error");
  } finally {
    await client.close();
  }
  res.redirect("/shop");
});

router.route("/shop/detail").get(async (req, res) => {
  const _id = parseInt(req.query._id);
  try {
    await client.connect();
    const database = client.db("vehicle");
    const cars = database.collection("car");
    const dbCarList = await cars.find({ _id }).toArray();
    if (!dbCarList[0]) {
      console.log("상품이 존재 하지 않습니다.");
      res.redirect("/shop");
      return;
    }
    req.app.render("shop/Detail", { car: dbCarList[0] }, (err, html) => {
      if (err) throw err;
      res.end(html);
    });
  } catch (e) {
    console.error(e);
    res.send("Error");
  } finally {
    await client.close();
  }
  //console.dir(dbCarList[0]);
});
router.route("/shop/delete").get(async (req, res) => {
  const _id = parseInt(req.query._id);
  try {
    await client.connect();
    const database = client.db("vehicle");
    const cars = database.collection("car");
    const dbCarList = await cars.find({ _id }).toArray();
    //받아 오는 쿼리에 reply가 있으면 제품삭제나 취소를 클릭 한것이고
    //없으면 그냥 삭제 페이지 출력
    if (req.query.reply) {
      // 삭제 클릭하면 퀘에 있는 id 값을로 제품 삭제후 쇼핑홈
      if (req.query.reply === "yes") {
        console.log("삭제 완료");
        //삭제는 id로
        await cars.deleteOne({ _id });
        res.redirect("/shop");
        return;
      }
      // 취소 클릭하면 그냥 쇼핑 홈으로 이동
      console.log("삭제 취소");
      res.redirect("/shop");
      return;
    }
    req.app.render("shop/Delete", { car: dbCarList[0] }, (err, html) => {
      if (err) throw err;
      res.end(html);
    });
  } catch (e) {
    console.error(e);
    res.send("Error");
  } finally {
    await client.close();
  }
});
router.route("/shop/cart").get(async (req, res) => {
  //장바구니 제품 출력
  //멤버 컬럼 사용으로 세션 확인후 요청 처리
  //멤버 컬럼에 carts들고와 출력
  if (req.session.user !== undefined) {
    const _id = req.session.user._id;
    console.log(_id);
    try {
      await client.connect();
      const db = client.db("vehicle");
      const member = db.collection("member");
      const memberCart = await member.find({ _id }).toArray();

      req.app.render(
        "shop/Cart",
        { cartList: memberCart[0].carts },
        (err, html) => {
          if (err) throw err;
          res.end(html);
        }
      );
    } catch (e) {
      console.error(e);
      res.send("ERROR");
    } finally {
      client.close();
    }
  } else {
    res.redirect("/login");
  }
});

router.route("/shop/delete/cart").get(async (req, res) => {
  //상세페이지에 들어 가서 장바구에 담는 방식으로 함
  const _id = parseInt(req.query._id);
  //사람마다 장바구니를 따로 보이게 할려고
  //유저 컬럼에 cart:[]여기에 장바구니 내용 저장
  if (req.session.user !== undefined) {
    const m_id = req.session.user._id;
    try {
      await client.connect();
      const db = client.db("vehicle");
      const member = db.collection("member");
      const car = db.collection("car");
      const carList = await car.find({ _id }).toArray();

      if (!carList[0]) {
        console.log("장바구니에 담기 오류");
        res.redirect("/shop");
        return;
      }

      //carts:[] 업데이트로 데이터 추가
      //업데이트로 데이터 넣으떄 중복없이 넣을 수있는  addToSet속성 이용
      await member.updateOne(
        { _id: m_id },
        { $addToSet: { carts: carList[0] } },
        false,
        false
      );

      res.redirect("/shop/cart");
    } catch (e) {
      console.error(e);
      res.send("ERROR");
    } finally {
      client.close();
    }
  } else {
    res.redirect("/login");
  }
});

// router 설정 맨 아래에 미들웨어 등록
app.use("/", router);

// 등록되지 않은 패스에 대해 페이지 오류 응답
// app.all('*', function(req, res) {
//     res.status(404).send('<h1>ERROR - 페이지를 찾을 수 없습니다.</h1>')
// });

const expressErrorHandler = require("express-error-handler");
const { QueryCompositeFilterConstraint } = require("firebase/firestore/lite");
const { time } = require("console");
const { cache, name, compile } = require("ejs");
//모든 라우터 처리 후 404 오류 페이지 처리
const errorHandler = expressErrorHandler({
  static: {
    404: "./public/404.html",
  },
});
app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

// 서버 생성 및 실행
const server = http.createServer(app);
server.listen(app.get("port"), () => {
  console.log(`Run on server >>> http://localhost:${app.get("port")}`);
});
