//서버를 띄우기 위한 문법들
const express = require('express');
const passport = require('passport'); // passport 라이브러리 설치
const LocalStrategy = require('passport-local').Strategy; // passport-local 라이브러리 설치
const session = require('express-session');  // express-session 라이브러리 설치
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true})); //bodyparser는 요청한 데이터 해석을 쉽게 도와줌
var db;
const MongoClient = require('mongodb').MongoClient;
const methodOverride = require('method-override'); //method override 사용 위한 코드
const { Passport } = require('passport/lib');
app.use(methodOverride('_method')); //method override 사용 위한 코드
app.set('view engine', 'ejs'); //ejs 라이브러리 설치하고 사용하기 위한 코드

let multer = require('multer'); // multer 라이브러리 사용 위한 코드
var storage = multer.diskStorage({  // disk는 같은 폴더에 저장 memory는 램에다 저장
    destination : function(req, file, cb){
        cb(null, './public/image') // 이미지 폴더 경로 정의
    },
    filename : function(req, file, cb){ // 파일명 설정
        cb(null, file.originalname)
    },
    filefilter : function(req, file, cb){ // 파일 형식 제한두기
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !=='.jpeg'){
            return callback(new Error('PNG, JPG만 업로드하세요'))
        }
        callback(null, true)
    },
    limits:{
        fileSize: 1024 * 1024  // 파일 사이즈 제한
    }
});

var upload = multer({storage : storage}); // 설정 변수 설정

require('dotenv').config() //환경변수 사용 가능

app.use(session({secret : '비밀코드', resave : true, saveUninitialized : false}));
app.use(passport.initialize());
app.use(passport.session());

 
app.use('/public', express.static('public')); //public폴더의 css파일을 사용하기 위한 코드

app.use('/shop', require('./routes/shop.js') );   // 미들웨어를 사용해서 shop.js 라우터 첨부하기 /shop 경로로 요청했을때 미들웨어 적용


MongoClient.connect(process.env.DB_URL, function(에러, client){ // env를 이용해서 코드 변경
    if(에러) return console.log(에러); // 에러띄우는법

    db = client.db('todoapp');
    // db.collection('post').insertOne({이름 : 'John', _id : 100} , function(에러, 결과){ // db에 자료 저장하는 방법
    //     console.log('저장완료');
    // });

    app.listen(process.env.PORT, function(){ // 8080 포트 env이용해서 코드 변경
        console.log('listening on 8080');
    }); 
});


app.get('/', function(요청, 응답){
    응답.render('index.ejs');
});

app.get('/write', function(요청, 응답){
    응답.render('write.ejs');
})

app.post('/add', function(요청, 응답){ //submit한 정보는 요청 파라미터에 담겨있음 꺼내쓰려면 라이브러리 설치 필요 body-parser
    응답.send("전송완료");
    db.collection('counter').findOne({name : '게시물갯수'}, function(에러, 결과){  //db counter내의 총 게시물 갯수 찾음
        var 총게시물갯수 = 결과.totalPost; // 총 게시물 갯수 변수에 저장
        var DB저장 = { _id:총게시물갯수 + 1, 작성자:요청.user._id, 제목:요청.body.title, 날짜:요청.body.date }; // user의 정보까지 db에 추가
        db.collection('post').insertOne(DB저장, function(에러, 결과){  //db.post에 새 게시물 기록
            console.log("저장완료");
            db.collection('counter').updateOne({name:'게시물갯수'}, { $inc: {totalPost:1}}, function(에러, 결과){ //set operator 값을 바꿀때 inc 기존값에 더해줄 값
                if(에러) {
                    return console.log(에러);
                }                                                // 위에있는 코드db.counter내의 총 게시물 갯수 + 1
            }); 
        });
    });
});


app.get('/list', function(요청, 응답){
    db.collection('post').find().toArray(function(에러, 결과){     // 모든 데이터를 다 가져오기
        응답.render('list.ejs', {posts : 결과});   // ejs파일은 views로 옮기기
    }); 
});

app.delete('/delete', function(요청, 응답){
    console.log(요청.body); //요청시 함께 보낸 데이터를 찾을 때
    요청.body._id = parseInt(요청.body._id); // 자료를 넘길때 문자로 넘어올 경우 숫자로 다시 변경
    var 삭제할데이터 = { _id: 요청.body._id , 작성자: 요청.user._id } // 본인이 작성한 게시물이 아닐시 삭제되지 않음
    db.collection('post').deleteOne(삭제할데이터, function(에러, 결과){        // 요청.body에 담겨온 게시물번호를 가진 글을 db에서 찾아서 삭제
        // console.log('삭제완료');
        if(에러){
            console.log(에러);
        }
        응답.status(200).send({ message : '성공했습니다' });  // 응답코드사용 200은 OK의 뜻 400은 요청 실패  500은 서버에 의한 요청 실패
    });
});

app.get('/detail/:id', function(요청, 응답){   // url 파라미터 /:??
    db.collection('post').findOne({_id : parseInt(요청.params.id)}, function(에러, 결과){  //url의 파라미터중 id라 이름 지은 파라미터를 넣음
        console.log(결과);
        응답.render('detail.ejs', { data : 결과 });
        
    });
    
});

app.get('/edit/:id', function(요청, 응답){
    db.collection('post').findOne({_id : parseInt(요청.params.id)}, function(에러, 결과){
        console.log(결과);
        응답.render('edit.ejs', { post : 결과 });
    }); 
});

app.put('/edit/',function(요청, 응답){          //edit 경로로 put 요청시 폼에 담긴 제목, 날짜 데이터를 가지고 db에 업데이트함 
    db.collection('post').updateOne({ _id : parseInt(요청.body.id) },
    { $set : { 제목 : 요청.body.title, 날짜 : 요청.body.date }}, function(에러, 결과){
        console.log('수정완료');
        응답.redirect('/list');     //수정 완료시 다른 페이지로 이동
    });
});

app.get('/login', function(요청, 응답){
    응답.render('login.ejs')
});

app.post('/login', passport.authenticate('local', {failureRedirect : '/fail'}), function(요청, 응답){
    응답.redirect('/')
});

app.get('/mypage', 로그인했니, function(요청, 응답){
    console.log(요청.user);
    응답.render('mypage.ejs', {사용자 : 요청.user})
})

app.get('/signup', function(요청, 응답){
    응답.render('signup.ejs')
});

app.post('/signup', function(요청, 응답){
    db.collection('login').insertOne({id:요청.body.id, pw:요청.body.pw}, function(에러, 결과){
        응답.redirect('/')
    })
});

app.get('/search', (요청, 응답) => {
    var 검색조건 = [
        {
          $search: {
            index: 'titleSearch',
            text: {
              query: 요청.query.value,
              path: '제목'  // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
            }
          }
        },
        // { $sort : {_id : 1 } }, // 정렬
        // { $limit : 5} // 갯수 제한
        // { $project : { 제목 : 1, _id: 1, score : { $meta : "searchScore" }}} // 검색 결과에서 필터 주기 원하는 것만 보여줄 수 있음
      ] 
    db.collection('post').aggregate(검색조건).toArray((에러, 결과)=>{ // search index로 검색하는 방식 aggregate는 검색 조건을 여러개 사용할 수 있음
        console.log(결과)
        응답.render('search.ejs', {posts : 결과})
    })
});

app.get('/upload', function(요청, 응답){
  응답.render('upload.ejs')  
});

app.post('/upload', upload.single('프로필'), function(요청, 응답){ //single은 파일 1개 전송 array는 여러개 가능
    응답.send('업로드완료')
});

app.get('/image/:imageName', function(요청, 응답){
    응답.sendFile( __dirname + '/public/image/' + 요청.params.imageName )
});

// 정규식을 사용해서 문자열 검색 사용 /abc/ 게시물이 많을 경우 find로 찾는 시간이 매우 오래걸림
// indexing을 해두면 게시물을 빨리 찾을 수 있음 binary search를 위해 몽고 사이트에서 indexing을 만들어 놓음
// text index는 문제점이 많기에 search index 사용

function 로그인했니(요청, 응답, next){  // 미들 웨어
    if(요청.user){  // 요청.user가 있는지 검사
        next()  // 통과시킴 오류없이 넘어감
    } else{
        응답.send('로그인 안함')
    }
}

passport.use(new LocalStrategy({  // 인증하는 방법 strategy
    usernameField: 'id', // html form에서 id에서 가져온 값
    passwordField: 'pw', // html form에서 pw에서 가져온 값
    session: true,
    passReqToCallback: false,
}, function (입력한아이디, 입력한비번, done) { // 실제로 입력한 아이디, 비번을 파라미터에 받음
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {  // 아이디가 맞는지 먼저 검사
        if (에러) {
            return done(에러)
        }
        if (!결과) { // 일치하는 아이디가 없으면
            return done(null, false, { message: '존재하지않는 아이디요' })
        }
        if (입력한비번 == 결과.pw) { // 아이디가 있어서 넘어와서 비밀번호와 입력PW가 같다면
            return done(null, 결과)
        } else {
            return done(null, false, { message: '비번틀렸어요' })
        }
    })
}));

passport.serializeUser(function(user, done){ // 세션을 저장시키는 코드
    done(null, user.id)
});

passport.deserializeUser(function(아이디, done){  // 이 세션 데이터를 가진 사람을 DB에서 찾아주세요   
    db.collection('login').findOne({id : 아이디}, function(에러, 결과){    // DB에서 user.id로 유저를 찾으면 유저 정보를 아래 파라미터에 넣어줌
        done(null, 결과)  // 마이페이지에서 해당 유저의 정보를 나타내기에 적합함
    })
});




// REST API
// REST 원칙
// 1. uniform interface 하나의 자료는 하나의 url로 url이 간결하고 알기 쉬워야함 * 가장 중요함
// 2. client-server 역할 구분 브라우저는 요청만 서버는 응답만 서로의 역할만 할수 있게 해야함
// 3. stateless 고객의 각각의 요청들은 서로 독립적인 존재로 다뤄야함 두가지의 의존성은 없어야함
// 4. cacheable 캐싱이 가능해야함 크롬이 알아서 해줌
// 5. Layered system
// 6. code on demand 
// 결론적으로는 url만 보고 어떤 사이트인지 알 수 있게 구성을 하고 만들어야하는게 중요함
// url 작성시 명사만 사용, 하위문서는 /로 나타냄, 파일확장저 사용 X, 띄어쓰기는 -(대시) 활용, 자료 하나당 하나의 url


// env파일
// 환경이나 DB등 장소가 바뀜에 따라 가변적인 변수데이터를 환경변수라고 함
// 

