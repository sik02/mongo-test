//서버를 띄우기 위한 문법들
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true})); //bodyparser는 요청한 데이터 해석을 쉽게 도와줌

app.listen(8080, function(){ //8080 포트 
    console.log('listening on 8080')
}); 

app.get('/pet', function(요청, 응답){
    응답.send("펫용품 사이트");
});

app.get('/beauty', function(요청, 응답){
    응답.send("뷰티용품 사이트");
});

app.get('/', function(요청, 응답){
    응답.sendFile(__dirname + "/index.html");
});

app.get('/write', function(요청, 응답){
    응답.sendFile(__dirname + "/write.html");
})

app.post('/add', function(요청, 응답){ //submit한 정보는 요청 파라미터에 담겨있음 꺼내쓰려면 라이브러리 설치 필요 body-parser
    응답.send("전송완료");
    console.log(요청.body.title); //input 정보 전달하는 법
    console.log(요청.body.date); //input 정보 전달하는 법

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

