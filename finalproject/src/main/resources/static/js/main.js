document.addEventListener('DOMContentLoaded', function() {
  // 1. ROADs를 누르면 메인 페이지로 리다이렉트
  document.querySelector('.icon-container').addEventListener('click', function() {
    window.location.href = '/main'; // 메인 페이지의 URL로 변경
  });

  // 2. 로그인 버튼을 누르면 /login으로 이동
  document.querySelector('.login-button').addEventListener('click', function() {
    window.location.href = '/login'; // 로그인 페이지의 URL로 변경
  });

  //3.카카오맵 api를 띄우는 코드이다.
  var container = document.getElementById('map');
  var options = {
    center: new kakao.maps.LatLng(33.450701,126.570667),
    level:3
  };
  var map = new kakao.maps.Map(container,options);
});


//1.DOMContentLoaded를 쓰는 이유: DOM들이 완전히 로드되기 전에 JavaScript가 실행되기때문.
//2.html 부분에서 heigth을 100vh로 해서, 웹 페이지의 크기와 상관 없이 지도를 항상 꽉차게 보여주도록 한다.