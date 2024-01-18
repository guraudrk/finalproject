document.addEventListener('DOMContentLoaded', function () {
  
  // 전역 변수로 내 위치 마커를 저장하기 위한 변수 선언
  var myLocationMarker;
  
  // ROADs를 누르면 메인 페이지로 리다이렉트
  document.querySelector('.icon-container').addEventListener('click', function () {
    window.location.href = '/main';
  });

  // 로그인 버튼을 누르면 /login으로 이동
  document.querySelector('.login-button').addEventListener('click', function () {
    window.location.href = '/login';
  });

  // 팝업창 닫기 함수
  function closePopup() {
    var popup = document.querySelector('.popup');
    if (popup) {
      document.body.removeChild(popup);
    }
  }

  // 팝업창을 열기 위한 함수
  async function openPopup(markerData) {
    // 위도, 경도를 도로명 주소로 변환
    const address = await convertLatLngToAddress(markerData.lat, markerData.lng);

    var popupContent = `
      <div class="popup-content">
        <img src="${markerData.photoInfo}" width="100" height="250">
        <p><b>도로명주소:</b> ${address}</p>
        <p><b>카테고리명:</b> ${markerData.categoryId}</p>
      </div>
      <div class="popup-close-btn">확인</div>
    `;

    //새로운 div 엘리먼트를 생성한다.
    var popup = document.createElement('div');
    //새 엘리먼트에 popup이라는 css 클래스를 추가한다.
    popup.classList.add('popup');
    //html 내용을 popupcontent 변수에 저장된 값으로 설정한다.
    //팝업 창의 내용을 동적으로 생성한 html 코드로 채운다.
    popup.innerHTML = popupContent;

    //팝업창이 화면 중앙에 위치하게 하기 위한 코드.
    var popupTop = (window.innerHeight - popup.offsetHeight) / 2;
    var popupLeft = (window.innerWidth - popup.offsetWidth) / 2;
    popup.style.top = popupTop + 'px';
    popup.style.left = popupLeft + 'px';

    // 팝업에 닫기 버튼에 대한 이벤트 리스너 추가
    var closeButton = popup.querySelector('.popup-close-btn');
    closeButton.addEventListener('click', function () {
      closePopup();
    });

    document.body.appendChild(popup);

    // 다른 부분 클릭 시 팝업창 닫음.
    document.addEventListener('click', function (event) {
      // 현재 클릭한 엘리먼트
      var clickedElement = event.target;

      // 팝업 영역 또는 닫기 버튼을 눌렀을 때만 팝업 닫음.
      if (!popup.contains(clickedElement) && !clickedElement.classList.contains('popup-close-btn')) {
        closePopup();
      }
    });
  }

  // 도로명주소로 변환하는 함수
  // 비동기 함수의 결과에 따라 promise의 resolve,reject 둘중 하나가 실행됨.
  async function convertLatLngToAddress(lat, lng) {
    // 좌표의 유효성 검사 함수
    function isValidCoordinate(lat, lng) {
      const numericLat = Number(lat);
      const numericLng = Number(lng);

      return (
        !isNaN(numericLat) &&
        !isNaN(numericLng) &&
        isValidLatitude(numericLat) &&
        isValidLongitude(numericLng)
      );
    }

    // 위도의 유효성 검사 함수
    function isValidLatitude(lat) {
      return lat >= -90 && lat <= 90;
    }

    // 경도의 유효성 검사 함수
    function isValidLongitude(lng) {
      return lng >= -180 && lng <= 180;
    }

    // 좌표의 유효성 검사
    if (!isValidCoordinate(lat, lng)) {
      throw new Error('Invalid latitude or longitude values.');
    }

    // 주소 변환 Promise
    return new Promise((resolve, reject) => {
      var geocoder = new kakao.maps.services.Geocoder();

      geocoder.coord2Address(lng, lat, function (result, status) {
        if (status === kakao.maps.services.Status.OK) {
          resolve(result[0].address.address_name);
        } else {
          // 거부되면 reject를 호출하고 오류 정보를 전달합니다.
          reject(new Error('Failed to convert coordinates to address.'));
        }
      });
    });
  }

  // 카카오맵 api를 띄우는 코드
  var container = document.getElementById('map');
  var options = {
    center: new kakao.maps.LatLng(37.570013917406, 126.9780542555),
    level: 3
  };
  var map = new kakao.maps.Map(container, options);

  // 웹캠을 띄우는 코드
  const webcam = document.getElementById('webcam');
  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      webcam.srcObject = stream;
    })
    .catch((error) => {
      console.error('Error accessing webcam:', error);
    });

  // 디비에서 정보를 가져와서 지도에 마커로 표시해주는 코드
  kakao.maps.load(async () => {
    try {
      const response = await fetch('/api/getMarkers');
      const data = await response.json();

      data.forEach(item => {
        var marker = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(item.lat, item.lng),
          map: map,
        });

        kakao.maps.event.addListener(marker, 'click', function () {
          // 클릭 시 팝업창 열기
          openPopup(item);
        });

        marker.setMap(map);
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  });

  // 내 위치 버튼을 눌렀을 때 지도를 내 위치로 이동
  document.querySelector('.my-location-button').addEventListener('click', function () {
    navigator.geolocation.getCurrentPosition(function (position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;

      map.setCenter(new kakao.maps.LatLng(lat, lng));
       // 기존에 있던 내 위치 마커를 제거
       if (myLocationMarker) {
        myLocationMarker.setMap(null);
      }
 // 내 위치 마커 이미지 정의
 var myLocationImage = new kakao.maps.MarkerImage(
  'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png', // 빨간색 마커 이미지 URL
  new kakao.maps.Size(30, 30), // 마커 이미지 크기
  { offset: new kakao.maps.Point(15, 15) } // 마커 이미지 좌표 설정 (가운데 정렬을 위해)
);
      // 내 위치 마커 생성 및 지도에 추가
      myLocationMarker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(lat, lng),
        map: map,
        image: myLocationImage, // 내 위치 마커 이미지 설정
      });
    }, function (error) {
      console.error('Error getting current location:', error);
    });
  });
});