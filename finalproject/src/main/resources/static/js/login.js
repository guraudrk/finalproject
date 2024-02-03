document.addEventListener('DOMContentLoaded', function() {
    

  //roads 클릭 시 메인 페이지로 이동
  document.querySelector('.roads-dgY').addEventListener('click', function() {
    window.location.href = '/main';
  });
  

  // ID/PW 찾기 버튼 클릭 시 이벤트
document.querySelector('.text-field-7oz').addEventListener('click', function() {
    window.location.href = '/findpassword';
  });
  
  // 로그인 버튼 클릭 시 이벤트
  document.querySelector('.button-w2L').addEventListener('click', function() {
    window.location.href = '/main';
  });
  
  // 회원가입 버튼 클릭 시 이벤트
  document.querySelector('.button-jTz').addEventListener('click', function() {
    // 이벤트의 기본 동작을 막음 (기본 동작이 페이지 이동인 경우)
    event.preventDefault();
    window.location.href = '/signup';
  });
  

  

});
  
  




  //DOMContentLoaded를 쓰는 이유: DOM들이 완전히 로드되기 전에 JavaScript가 실행되기때문.
  //addEventListener,querySelector 등을 통해 요소를 검색한다.