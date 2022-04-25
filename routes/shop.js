var router = require('express').Router();   // npm으로 설치했던 express 라이브러리의 router함수 사용  // require는 라이브러리를 사용할 때 씀

function 로그인했니(요청, 응답, next){  // 미들 웨어
    if(요청.user){  // 요청.user가 있는지 검사
        next()  // 통과시킴 오류없이 넘어감
    } else{
        응답.send('로그인 안함')
    }
}

router.use('/shirts', 로그인했니);

router.get('/shirts', function(요청, 응답){
   응답.send('셔츠 파는 페이지입니다.');
});

router.get('/pants', 로그인했니, function(요청, 응답){
   응답.send('바지 파는 페이지입니다.');
}); 

module.exports = router;   // 파일을 다른 파일로 내보낼 때 사용