document.addEventListener('DOMContentLoaded', function () {
  

    /*
    기본적으로, 이 부분의 js와 main.js의 js 코드는 유사하다.
    하지만, 아래의 부분들이 main.js와 다르다.
    1.좌측 탭에서 설정을하면, 그 설정대로 마커가 보인다. 또한, 마커는 '유지보수 유무'탭이 'null'인 데이터만 마커를 띄운다.
    2.마커를 클릭 시, 수정 안내 팝업이 뜨며,수정을 하면 그 계정의 id가 디비에 저장된다. 팝업 시 보여주는 데이터들도 다르다.
    3.우측 하단의 '데이터 상세보기'를 누르면, 좌측 탭에서 설정한 대로 데이터들을 디비에서 꺼내서 보여준다. 또한, 마커가 사라진다.
    */ 


    // 전역 변수로 내 위치 마커를 저장하기 위한 변수 선언
    var myLocationMarker;
    


    //좌측 탭- '주소1' 선택 드롭다운 엘리먼트에 대한 이벤트 리스너 추가
    var address1Select = document.getElementById("address1");
    address1Select.addEventListener('change', function () {
        // 주소1 변경 시 주소2 옵션 업데이트
        updateAddress2Options();
    });

    // ROADs를 누르면 메인 페이지로 리다이렉트
    document.querySelector('.icon-container').addEventListener('click', function () {
      window.location.href = '/main';
    });
  
    // 로그아웃 버튼을 누르면 /main으로 이동
    document.querySelector('.logout-button').addEventListener('click', function () {
      window.location.href = '/main';
    });
    // '데이터 상세보기' 버튼을 누르면 /detail으로 이동
    document.querySelector('#data-details-button').addEventListener('click', function () {
        window.location.href = '/detail';
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

  //주소1에 따라 주소 2의 option이 변하는 코드.
  var address2Options = {
    '서울특별시': ["강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"],
    '인천광역시': ["계양구", "남구", "남동구", "동구", "부평구", "서구", "연수구", "중구", "강화군", "옹진군"],
    '대전광역시': ["대덕구", "동구", "서구", "유성구", "중구"],
    '광주광역시': ["광산구", "남구", "동구", "북구", "서구"],
    '대구광역시': ["남구", "달서구", "동구", "북구", "서구", "수성구", "중구", "달성군"],
    '울산광역시': ["남구", "동구", "북구", "중구", "울주군"],
    '부산광역시': ["강서구", "금정구", "남구", "동구", "동래구", "부산진구", "북구", "사상구", "사하구", "서구", "수영구", "연제구", "영도구", "중구", "해운대구", "기장군"],
    '경기도': ["고양시", "과천시", "광명시", "광주시", "구리시", "군포시", "김포시", "남양주시", "동두천시", "부천시", "성남시", "수원시", "시흥시", "안산시", "안성시", "안양시", "양주시", "오산시", "용인시", "의왕시", "의정부시", "이천시", "파주시", "평택시", "포천시", "하남시", "화성시", "가평군", "양평군", "여주군", "연천군"],
    '강원도': ["강릉시", "동해시", "삼척시", "속초시", "원주시", "춘천시", "태백시", "고성군", "양구군", "양양군", "영월군", "인제군", "정선군", "철원군", "평창군", "홍천군", "화천군", "횡성군"],
    '충청북도': ["제천시", "청주시", "충주시", "괴산군", "단양군", "보은군", "영동군", "옥천군", "음성군", "증평군", "진천군", "청원군"],
    '충청남도': ["계룡시", "공주시", "논산시", "보령시", "서산시", "아산시", "천안시", "금산군", "당진군", "부여군", "서천군", "연기군", "예산군", "청양군", "태안군", "홍성군"],
    '전라북도': ["군산시", "김제시", "남원시", "익산시", "전주시", "정읍시", "고창군", "무주군", "부안군", "순창군", "완주군", "임실군", "장수군", "진안군"],
    '전라남도': ["광양시", "나주시", "목포시", "순천시", "여수시", "강진군", "고흥군", "곡성군", "구례군", "담양군", "무안군", "보성군", "신안군", "영광군", "영암군", "완도군", "장성군", "장흥군", "진도군", "함평군", "해남군", "화순군"],
    '경상북도': ["경산시", "경주시", "구미시", "김천시", "문경시", "상주시", "안동시", "영주시", "영천시", "포항시", "고령군", "군위군", "봉화군", "성주군", "영덕군", "영양군", "예천군", "울릉군", "울진군", "의성군", "청도군", "청송군", "칠곡군"],
    '경상남도': ["거제시", "김해시", "마산시", "밀양시", "사천시", "양산시", "진주시", "진해시", "창원시", "통영시", "거창군", "고성군", "남해군", "산청군", "의령군", "창녕군", "하동군", "함안군", "함양군", "합천군"],
    '제주도': ["서귀포시", "제주시", "남제주군", "북제주군"]
};


// 드롭다운에 옵션을 추가하는 함수
//주소1을 선택시, 그에 맞는 옵션들을 주소2에 하나하나 추가한다.
function addOptions(selectElement, options) {
    for (var i = 0; i < options.length; i++) {
        var option = document.createElement("option");
        option.text = options[i];
        option.value = options[i];
        selectElement.add(option);
    }
}

// 주소1에 따라 주소2 옵션 동적으로 변경
function updateAddress2Options() {
    var address1 = document.getElementById("address1").value;
    var address2Select = document.getElementById("address2");

    // 주소2 옵션 초기화
    address2Select.innerHTML = "<option value=''>시/군/구 선택</option>";

    // 주소1에 따라 주소2 옵션 설정
    if (address2Options.hasOwnProperty(address1)) {
        addOptions(address2Select, address2Options[address1]);
    }

   
}