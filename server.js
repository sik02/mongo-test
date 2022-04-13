//서버를 띄우기 위한 문법들
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true})); //bodyparser는 요청한 데이터 해석을 쉽게 도와줌
var db;
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs'); //ejs 라이브러리 설치하고 사용하기 위한 코드



MongoClient.connect('mongodb+srv://admin:admin@cluster0.4sxry.mongodb.net/todoapp?retryWrites=true&w=majority', function(에러, client){
    if(에러) return console.log(에러); // 에러띄우는법

    db = client.db('todoapp');
    // db.collection('post').insertOne({이름 : 'John', _id : 100} , function(에러, 결과){ // db에 자료 저장하는 방법
    //     console.log('저장완료');
    // });

    app.listen(8080, function(){ //8080 포트 
        console.log('listening on 8080');
    }); 
});


app.get('/', function(요청, 응답){
    응답.sendFile(__dirname + "/index.html");
});

app.get('/write', function(요청, 응답){
    응답.sendFile(__dirname + "/write.html");
})

app.post('/add', function(요청, 응답){ //submit한 정보는 요청 파라미터에 담겨있음 꺼내쓰려면 라이브러리 설치 필요 body-parser
    응답.send("전송완료");
    // console.log(요청.body.title); //input 정보 전달하는 법
    // console.log(요청.body.date); //input 정보 전달하는 법
    db.collection('counter').findOne({name : '게시물갯수'}, function(에러, 결과){  //db counter내의 총 게시물 갯수 찾음
        var 총게시물갯수 = 결과.totalPost; // 총 게시물 갯수 변수에 저장
        db.collection('post').insertOne({ _id:총게시물갯수 + 1, 제목:요청.body.title, 날짜:요청.body.date}, function(에러, 결과){  //db.post에 새 게시물 기록
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
        console.log(결과);
        응답.render('list.ejs', {posts : 결과});   // ejs파일은 views로 옮기기
    }); 
    

});

app.delete('/delete', function(요청, 응답){
    console.log(요청.body); //요청시 함께 보낸 데이터를 찾을 때
    요청.body._id = parseInt(요청.body._id); // 자료를 넘길때 문자로 넘어올 경우 숫자로 다시 변경
    db.collection('post').deleteOne(요청.body, function(에러, 결과){        // 요청.body에 담겨온 게시물번호를 가진 글을 db에서 찾아서 삭제
        console.log('삭제완료');
        응답.status(200).send({ message : '성공했습니다' });  // 응답코드사용 200은 OK의 뜻 400은 요청 실패  500은 서버에 의한 요청 실패
    });
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

