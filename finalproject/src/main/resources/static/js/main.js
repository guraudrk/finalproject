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
    center: new kakao.maps.LatLng(37.570013917406,	126.9780542555),
    level:3
  };
  //map을 전역변수로 설정해야 오류가 나지 않는다.
   map = new kakao.maps.Map(container,options);
});

//3.웹캠을 띄우는 코드.
const webcam = document.getElementById('webcam');
console.log(webcam); // 콘솔에 출력하여 값이 null인지 확인
navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
        webcam.srcObject = stream;
    })
    .catch((error) => {
        console.error('Error accessing webcam:', error);
    });

    //4.디비에서 정보를 가져와서 지도에 마커로 표시해주는 코드.
    //팝업창까지 구현되어 있다.
    // Kakao Maps API 초기화
    kakao.maps.load(async () => {
      try {
        //데이터를 가져오는 동안 비동기 작업을 기다려야 할 수 있다.
        const response = await fetch('/api/getMarkers');
        const data = await response.json();
    
        // Loop through the data and add markers to the map
        data.forEach(item => {
          var marker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(item.lat, item.lng),
            map: map,
          });
    
          var infowindow = new kakao.maps.InfoWindow({
            content: `<b>Category ID:</b> ${item.categoryId}<br><img src="${item.photoInfo}" width="100" height="100">`,
          });
    
          kakao.maps.event.addListener(marker, 'click', function () {
            infowindow.open(map, marker);
          });
    
          // 마커 지도에 추가
          marker.setMap(map);
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    });



  //참고사항
//1.DOMContentLoaded를 쓰는 이유: DOM들이 완전히 로드되기 전에 JavaScript가 실행되기때문.
//2.html 부분에서 heigth을 100vh로 해서, 웹 페이지의 크기와 상관 없이 지도를 항상 꽉차게 보여주도록 한다.