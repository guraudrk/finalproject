document.addEventListener('DOMContentLoaded', function () {

 // 전역 변수로 마커를 저장하는 배열
 var markers = [];

var loggedInUser;

//id 저장.
var id1;
//data-details-button

//데이터 상세보기를 저장할 배열을 전역 변수로 선언한다.
//const는 상수이기 때문에 재선언이 불가능하다. 그래서 let으로 선언한다.
let filteredData1=[];






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
  
  //ajax를 사용해, 서버에서 아이디 값을 비동기적으로 가져온다.
  getLoggedInUser();

// 아이디를 비동기적으로 가져오는 함수
async function getLoggedInUser() {
  try {
      // 서버에 아이디를 가져오기 위한 Ajax 요청
      const response = await fetch('/getLoggedInUser');
      const data = await response.text();

      // 가져온 아이디 값을 변수에 저장
       loggedInUser = data;

      // 이후에 로직 처리...
      console.log("로그인된 사용자 아이디:", loggedInUser);
  } catch (error) {
      console.error('Error:', error);
  }
}


    // 카카오맵 api를 띄우는 코드
    var container = document.getElementById('map');
    var options = {
      center: new kakao.maps.LatLng(37.570013917406, 126.9780542555),
      level: 3
    };
    var map = new kakao.maps.Map(container, options);

  document.getElementById("clear-markers-button").addEventListener("click", function () {
    clearMarkers(); // 마커를 모두 지우는 함수 호출
    
});

    /*
    기본적으로, 이 부분의 js와 main.js의 js 코드는 유사하다.
    하지만, 아래의 부분들이 main.js와 다르다.
    1.좌측 탭에서 설정을하면, 그 설정대로 마커가 보인다. 또한, 마커는 '유지보수 유무'탭이 'null'인 데이터만 마커를 띄운다.
    2.마커를 클릭 시, 수정 안내 팝업이 뜨며,수정을 하면 그 계정의 id가 디비에 저장된다. 팝업 시 보여주는 데이터들도 다르다.
    3.우측 하단의 '데이터 상세보기'를 누르면, 좌측 탭에서 설정한 대로 데이터들을 디비에서 꺼내서 보여준다. 또한, 마커가 사라진다.
    */ 

    /*
async function sendFilteredDataToDetail(filteredData1) {
  try {
      const response = await fetch(`/api/filteredData`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(filteredData1)
      });
      
      // 전송이 성공하면 /detail 페이지로 이동
      if(filteredData1.length<=0){
        alert("상세보기를 할 데이터가 없습니다.")
      }
      else if (response.ok) {
        window.location.href = '/detail';
    } else {
        console.error('Failed to send filtered data:', response.statusText);
    }
} catch (error) {
    console.error('Error sending filtered data:', error);
    alert("좌측 탭에서 조건을 고른 다음 '확인'을 누르세요.");
}

}
*/
    // 날짜 형식이 유효한지 확인하는 함수
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return dateString.match(regex) !== null;
}

// 주소 형식이 유효한지 확인하는 함수
function isValidAddress(address) {
  // 주소에 대한 유효성 검사 로직을 추가할 수 있습니다.
  // 예를 들어, 최소 길이, 특수 문자 제한 등을 검사할 수 있습니다.
  // 이 예시에서는 간단하게 길이만 확인하고 있습니다.
  return address.length > 0;
}


   

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
  
   
    // '데이터 상세보기' 버튼을 누르면 /detail으로 이동
    //document.querySelector('#data-details-button').addEventListener('click', function () {
    //    window.location.href = '/detail';
    //  });
  // '확인' 버튼에 이벤트 리스너 등록
  document.getElementById("apply-button").addEventListener("click",  function () {
   
     applyFilter();
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
    'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/free-icon-gps-navigation-5142952.png',
    new kakao.maps.Size(45, 45), // 마커 이미지 크기
    { offset: new kakao.maps.Point(15, 15) } // 마커 이미지 좌표 설정 (가운데 정렬을 위해)
  );
  //console.log("결과2:",myLocationImage);
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

      //버튼을 1번 이상 누를 때, 오류를 방지하기 위해 이 함수를 가장 위로 보낸다.
      //함수를 정의하기 전에 호출하려고 시도하면 오류가 나기 때문이다.
      // '확인' 버튼을 누르면 필터를 적용하고 마커를 표시하는 함수
  async function applyFilter() {

   

 

    // 1. DTO에서 데이터를 가져온다.
    const response = await fetch('/api/getMarkers');
    const data = await response.json();

    // 2. goofficer.html에서 입력된 값들을 가져온다.
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;
    const address1 = document.getElementById("address1").value;
    const address2 = document.getElementById("address2").value;

    // 유효성 검사
  if (!isValidDate(startDate)) {
    alert("올바른 시작 날짜 형식이 아닙니다.");
    return;
  }

  if (!isValidDate(endDate)) {
    alert("올바른 종료 날짜 형식이 아닙니다.");
    return;
  }

  if (!isValidAddress(address1)) {
    alert("올바른 주소1 형식이 아닙니다.");
    return;
  }

  if (!isValidAddress(address2)) {
    alert("올바른 주소2 형식이 아닙니다.");
    return;
  }



    // 3. 페이지 로드 시에는 마커를 초기화하지 않음.
    // 페이지 로드 시에는 마커를 초기화하지 않음
    if (!applyFilter.initialized) {
      applyFilter.initialized = true; // 초기화 상태로 변경
    } else {
      // 페이지 로드 이후 '확인' 버튼을 눌렀을 때는 기존 마커를 제거
      clearMarkers();
    }


    

   // 4. creation_date의 값이 시작날짜/종료날짜 사이에 있는 것과,
//    위도와 경도를 주소로 변환한 구문 중에 주소1/주소2가 있는지 확인한다.
// 필터링된 데이터를 담을 배열을 초기화한다.
const filteredData = [];
console.log("data의 수:",data);
// 주어진 데이터 배열을 순회하면서 필터링 수행
//for 문으로 해야 필터링이 모든 데이터에 적용이 된다.
for (const item of data) {
  
  // 비동기적으로 주소를 가져오기 위해 Promise를 사용
  const address = await convertLatLngToAddress(item.lat, item.lng);
  
  const creationDate = new Date(item.creationTime);
  const isDateValid = creationDate >= new Date(startDate) && creationDate <= new Date(endDate);
  const isAddressValid = address.includes(address1) && address.includes(address2);

  if (isDateValid && isAddressValid) {
    // 날짜 및 주소가 유효한 경우에만 배열에 추가
    filteredData.push(item);
  }

  // 로그 출력
  console.log('Creation Date:', creationDate);
  console.log('Address:', address);
  console.log('주소1:', address1);
  console.log('주소2:', address2);
  console.log('시작날짜:', new Date(startDate));
  console.log('종료날짜:', new Date(endDate));
}

// 최종 필터링된 데이터 출력
console.log('Filtered Data:', filteredData);
//filteredData를 전역 변수 배열에 선언
//javascript에서 배열을 복사하는 로직을 쓴다.
filteredData1=Array.from(filteredData);
console.log("filteredData1:",filteredData1);



    // 5. 카카오맵을 통해, 좌표가 나타난 공간으로 지도를 이동한다.
    if (filteredData.length > 0) {
      const centerLat = filteredData[0].lat;
      const centerLng = filteredData[0].lng;
      map.setCenter(new kakao.maps.LatLng(centerLat, centerLng));
    }

    // 6. 확인 버튼을 다시 누르면, 3,4가 다시 동작한다.
    filteredData.forEach(item => {
//지난 날짜, categoryId에 따라 마커가 바뀌는 함수.
console.log('데이터:',item);
function getMarkerImage(creationTime, categoryId1){
  const categoryId  = String(categoryId1);
  
  console.log(categoryId);
  const currentDate = new Date();
  const markerDate = new Date(creationTime);
  console.log(currentDate - markerDate);
  // 생성 날짜가 최근 7일 이내인지 확인(파란색)
  if ((currentDate - markerDate) < (7 * 24 * 60 * 60 * 1000)) {
    // 카테고리 ID에 따라 마커 이미지를 결정
    //이미지 주소는 aws s3에 저장된 이미지 주소를 가져온다.
    if (categoryId.includes('PE드럼')) {
      return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/drum_blue.png'; // 프로젝트 구조에 맞게 실제 파일 경로를 수정하세요.
    } else if(categoryId.includes('PE방호벽')){
      return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/firewall_blue.png'
    }
    else if(categoryId.includes('PE안내봉')){
      return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/guiderod_blue.png'
    }
    else if(categoryId.includes('라바콘')){
      return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/con_blue.png'
    }
    else if(categoryId.includes('시선유도봉')){
      return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/gazeguideroad_blue.png'
    }
    else if(categoryId.includes('PE휀스')){
      return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/fence_blue.png'
    }
    else if(categoryId.includes('PE입간판')){
      return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/signboard_blue.png'
    }
    else if(categoryId.includes('제설함')){
      return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/snowremovalbox_blue.png'
    }
    else if(categoryId.includes('박스')){
      return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/box_blue.png'
    }
    else if(categoryId.includes('낙석')){
      return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/fallingrock_blue.png'
    }
    else if(categoryId.includes('포트홀')){
      return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/pothole_blue.png'
    }
  } 

  //생성날짜가 7일 이상-1달 이내인지 확인(마커의 색은 노란색)
  else if ((currentDate - markerDate) < (30 * 24 * 60 * 60 * 1000)) {
// 카테고리 ID에 따라 마커 이미지를 결정
if (categoryId.includes('PE드럼')) {
return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/drum_yellow.png'; // 프로젝트 구조에 맞게 실제 파일 경로를 수정하세요.
} else if(categoryId.includes('PE방호벽')){
return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/firewall_yellow.png'
}
else if(categoryId.includes('PE안내봉')){
return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/guiderod_yellow.png'
}
else if(categoryId.includes('라바콘')){
return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/con_yellow.png'
}
else if(categoryId.includes('시선유도봉')){
return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/gazeguideroad_yellow.png'
}
else if(categoryId.includes('PE휀스')){
return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/fence_yellow.png'
}
else if(categoryId.includes('PE입간판')){
return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/signboard_yellow.png'
}
else if(categoryId.includes('제설함')){
return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/snowremovalbox_yellow.png'
}
else if(categoryId.includes('박스')){
return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/box_yellow.png'
}
else if(categoryId.includes('낙석')){
return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/fallingrock_yellow.png'
}
else if(categoryId.includes('포트홀')){
return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/pothole_yellow.png'
}
} 

   //생성날짜가 1달 이상인지(마커의 색은 빨간색)
  else{
// 카테고리 ID에 따라 마커 이미지를 결정
if (categoryId.includes('PE드럼')) {
return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/drum_red.png'; // 프로젝트 구조에 맞게 실제 파일 경로를 수정하세요.
} else if(categoryId.includes('PE방호벽')){
return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/firewall_red.png'
}
else if(categoryId.includes('PE안내봉')){
return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/guiderod_red.png'
}
else if(categoryId.includes('라바콘')){
return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/con_red.png'
}
else if(categoryId.includes('시선유도봉')){
return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/gazeguideroad_red.png'
}
else if(categoryId.includes('PE휀스')){
return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/fence_red.png'
}
else if(categoryId.includes('PE입간판')){
return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/signboard_red.png'
}
else if(categoryId.includes('제설함')){
return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/snowremovalbox_red.png'
}
else if(categoryId.includes('박스')){
return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/box_red.png'
}
else if(categoryId.includes('낙석')){
return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/fallingrock_red.png'
}
else if(categoryId.includes('포트홀')){
return 'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/pothole_red.png'
}
} 
}
      // 조건에 따라 마커 이미지를 결정하는 함수를 호출하여 마커 이미지를 가져옵니다.
  const SelectedMarkerImage = getMarkerImage(item.creationTime, item.categoryId);

  console.log("SelectedMarkerImage:", SelectedMarkerImage);
      // 마커 생성 및 지도에 추가

   // '미완료' 상태인 경우에만 마커 생성
if (item.maintenance !== '완료') {
  // 내 위치 마커 이미지 정의
  const myLocationImage1 = new kakao.maps.MarkerImage(
      SelectedMarkerImage, // 빨간색 마커 이미지 URL
      new kakao.maps.Size(30, 30), // 마커 이미지 크기
      { offset: new kakao.maps.Point(15, 15) } // 마커 이미지 좌표 설정 (가운데 정렬을 위해)
  );

  console.log("결과:",item.creationTime);
  console.log('가져온 위도값:',item.lat);
  console.log('가져온 경도값:',item.lng);

  const marker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(item.lat, item.lng),
      map: map,
      image:myLocationImage1,
  });

 

  // 마커 클릭 시 팝업창 열기
  kakao.maps.event.addListener(marker, 'click', function () {
      openPopup(item);
  });

  // 생성된 마커를 전역 배열에 저장
  markers.push(marker);
  console.log("마커 생성 완료");
  console.log(marker);
   // 클러스터러 생성

  
} 

//마커 클러스터링 적용하는 코드.
var clusterer = new kakao.maps.MarkerClusterer({
  markers:markers,
  map: map, // 마커들을 클러스터로 관리하고 표시할 지도 객체 
  averageCenter: true, // 클러스터러에 속한 마커의 평균 위치로 클러스터 마커를 표시합니다
  minLevel: 5 // 클러스터러가 생성되는 최소 지도 레벨
});


    });
    console.log("마커:",markers);
   


    
//alert로 마커의 수를 나타내어주는 함수+클러스터러도 생성한다.
function showMarkerNmumber(){
  var markerNumber = markers.length;
  alert("총" +markerNumber+"개의 마커가 생성되었습니다. (보수 완료된 데이터는 생성되지 않습니다.)");
    
}





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
  id1=markerData.id;



    // creationTime을 Date 객체로 파싱
  const creationDate = new Date(markerData.creationTime);

  // 년/월/일로 포맷팅
  const formattedDate = `${creationDate.getFullYear()}-${(creationDate.getMonth() + 1).toString().padStart(2, '0')}-${creationDate.getDate().toString().padStart(2, '0')}`;

  const address = await convertLatLngToAddress(markerData.lat, markerData.lng);
  var popupContent = `
      <div class="popup-content">
          <img src="${markerData.photoInfo}" width="100" height="250">
          <p><b>검출날짜:</b> ${formattedDate}</p>
          <p><b>위치(도로명주소):</b> ${address}</p>
          <p><b>카테고리명:</b> ${markerData.categoryId}</p>
          <p><b>보수상태:</b> ${markerData.maintenance || '미완료'}</p>
      </div>
      <div class="popup-close-btn" style="background-color: #3498db;font-family: 'Poppins', 'Source Sans Pro';
      border: 2px solid #000;
      font-weight: bold;
      cursor: pointer;"">수정</div>
  `;

  //새로운 div 엘리먼트를 생성한다.
  //이는 javascript 안에서 html을 사용하기 위해 쓴다.
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
      // "수정" 버튼을 눌렀을 때의 로직 추가
      handleEdit(popup);
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

// "수정" 버튼을 눌렀을 때 처리할 함수
function handleEdit(popup) {
  // 여기에 "수정" 버튼을 눌렀을 때의 로직 추가
  console.log('수정 버튼을 눌렀을 때의 처리');
  // 여기에서 새로운 팝업을 열도록 호출
  openAdditionalPopup(popup);
}

// 추가로 뜨는 팝업을 열기 위한 함수
function openAdditionalPopup(parentPopup) {
  // 기존 팝업을 닫지 않음. 그러므로 closePopup()을 주석 처리함.
  //closePopup();

  // 여기에 추가로 뜨는 팝업에 대한 로직을 작성하세요.
  console.log('추가로 뜨는 팝업을 열기');
  // 여기에 원하는 팝업 창 열기 로직 추가

  // 예시: 추가로 뜨는 팝업 생성
  var additionalPopupContent = `
  <div class="additional-popup-content">
  <p>'${loggedInUser}'로 도로 위험물 수정 처리를 하시겠습니까?</p>
  <button class="additional-popup-confirm-btn">예</button>
  <button class="additional-popup-cancel-btn">아니오</button>
  
  </div>
  `;

  var additionalPopup = document.createElement('div');
  additionalPopup.classList.add('additional-popup');
  additionalPopup.innerHTML = additionalPopupContent;

  // 추가로 뜨는 팝업을 기존 팝업의 하위 요소로 추가
  parentPopup.appendChild(additionalPopup);

  // 추가로 뜨는 팝업에 닫기 버튼에 대한 이벤트 리스너 추가
  //var additionalCloseButton = additionalPopup.querySelector('.additional-popup-close-btn');
  //additionalCloseButton.addEventListener('click', function () {
      // 추가로 뜨는 팝업을 닫기
  //    parentPopup.removeChild(additionalPopup);
  //});
    // openPopup 함수 호출 시 생성한 팝업 객체를 변수에 저장
//const myPopup = openPopup();

// 추가로 뜨는 팝업을 여는 함수 호출 시 myPopup을 전달
//openAdditionalPopup(myPopup);

    // "예" 버튼에 대한 이벤트 리스너 추가
    var confirmButton = parentPopup.querySelector('.additional-popup-confirm-btn');
    confirmButton.addEventListener('click', async function () {
        // 여기에 "예" 버튼을 눌렀을 때의 로직 추가
        console.log('예 버튼을 눌렀을 때의 처리');

        // 1. '예'를 누르면 alert로 '도로 위험물 수정 처리가 완료되었습니다.'가 뜨고 팝업을 닫는다.
        alert('도로 위험물 수정 처리가 완료되었습니다.');
        
       

        // 2. '아니오'를 누르면 그냥 팝업을 닫아.

        // 3. '예'를 누르면, memberId에 ${loggedInUser}가 저장되고, completion_time에 지금 시간이 저장되고(년-월-일), maintenance에 '완료'가 저장된다.
      

        console.log('id1:',id1);
        //id를 통해 맞는 컬럼을 조회하고, 그 다음에 업데이트를 한다.
        const updateData = {
            id:id1,
            memberId: loggedInUser,
            completionTime: new Date(),  // 현재 시간으로 업데이트
            maintenance: '완료'
        };

        try {
           //데이터를 업데이트 할 때는 put을 쓰는 것이 맞다.
           //우리는 맞는 데이터를 찾는 다음에, 그 데이터를 업데이트 할 것이기 때문에, put을 쓴다.
            const response = await fetch(`/api/updateMarker/${id1}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

           
            if (response.ok) {
                console.log('도로 위험물 데이터가 성공적으로 업데이트되었습니다.');
            } else {
                console.error('도로 위험물 데이터 업데이트 실패:', response.statusText);
            }
        } catch (error) {
            console.error('도로 위험물 데이터 업데이트 중 오류 발생:', error);
        }

        //팝업을 닫는다.
     parentPopup.removeChild(additionalPopup);
    });

     

    // "아니오" 버튼에 대한 이벤트 리스너 추가
    var cancelButton = parentPopup.querySelector('.additional-popup-cancel-btn');
    cancelButton.addEventListener('click', function () {
        // 여기에 "아니오" 버튼을 눌렀을 때의 로직 추가
        console.log('아니오 버튼을 눌렀을 때의 처리');
        // 팝업을 닫기만 함
        parentPopup.removeChild(additionalPopup);
    });
}

//'확인'버튼을 누르면, 마커가 몇 개 생성되었는지 알려주는 함수를 호출한다.
showMarkerNmumber();
}
console.log("데이터 상세보기 페이지로 가는 배열:",filteredData1);
  // 필터링된 데이터를 /detail 페이지로 전송하는 함수


   // 마커를 클리어하는 함수
   function clearMarkers() {
    // 전역 변수로 선언된 markers 배열에 있는 모든 마커를 지웁니다.
    markers.forEach(function (marker) {
        marker.setMap(null);
    });
  
    // markers 배열 비우기
    markers = [];
    console.log("마커 삭제 완료");
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
  

  
    
  
  
  
  });

  //주소1에 따라 주소 2의 option이 변하는 코드.
  var address2Options = {
    '서울': ["강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"],
    '인천': ["계양구", "남구", "남동구", "동구", "부평구", "서구", "연수구", "중구", "강화군", "옹진군"],
    '대전': ["대덕구", "동구", "서구", "유성구", "중구"],
    '광주': ["광산구", "남구", "동구", "북구", "서구"],
    '대구': ["남구", "달서구", "동구", "북구", "서구", "수성구", "중구", "달성군"],
    '울산': ["남구", "동구", "북구", "중구", "울주군"],
    '부산': ["강서구", "금정구", "남구", "동구", "동래구", "부산진구", "북구", "사상구", "사하구", "서구", "수영구", "연제구", "영도구", "중구", "해운대구", "기장군"],
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



