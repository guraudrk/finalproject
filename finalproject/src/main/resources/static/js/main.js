

document.addEventListener('DOMContentLoaded', function () {
  
  
  
  
  //클러스터링을 위해 마커를 저장할 전역변수
  var markers=[];

  //음성 인식을 위해 마커들을 저장할 전역변수
  //중복을 막기 위해 set을 정의한다.
  var markersforaudio=new Set();
  // 전역 변수로 내 위치 마커를 저장하기 위한 변수 선언
  var myLocationMarker;
  

  //각 마커에 대한 알림 상태를 저장할 객체
  var markerNotiStatus = [];

  //거리의 기준을 설정하는 변수.(미터 단위)
  const maxDistance = 1000;


  //내 위치의 위도/경도를 전역변수로 설정
  var lat1;
  var lng1;

  //여러개의 알림이 있을 경우, queue에 쌓아서 차례대로 알림을 보낸다.
var speechQueue = [];

 // 전역 범위에서 polyline 변수를 선언하여 초기값을 null로 설정합니다.
var polyline = null;

// 음성 재생을 위한 Audio 객체 배열
var audioQueue = [];

function toRadians(degrees) {
  return degrees * Math.PI / 180;
}




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
      <div class="popup-close-btn" style="background-color: #3498db;font-family: 'Poppins', 'Source Sans Pro';
      border: 2px solid #000;
      font-weight: bold;
      cursor: pointer;">확인</div>
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

      // 사용자의 현재 위치를 확인하고, 각 마커와의 거리를 계산하여 알림을 보내는 함수
  var destinationlocation;


  //목표 위치의 위도, 경도를 저장할 변수

 





   


  // 디비에서 정보를 가져와서 지도에 마커로 표시해주는 코드
  kakao.maps.load(async () => {
    try {
      const response = await fetch('/api/getMarkers');
      const data = await response.json();
      console.log("data:",data);
      markersforaudio=data;
      data.forEach(item => {
        var marker = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(item.lat, item.lng),
          map: map,
        });

        kakao.maps.event.addListener(marker, 'click', function () {
          // 클릭 시 팝업창 열기
          openPopup(item);
        });

        markers.push(marker);
        marker.setMap(map);
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    
  });
  
//마커 클러스터링 적용하는 코드.
var clusterer = new kakao.maps.MarkerClusterer({
  markers:markers,
  map: map, // 마커들을 클러스터로 관리하고 표시할 지도 객체 
  averageCenter: true, // 클러스터러에 속한 마커의 평균 위치로 클러스터 마커를 표시합니다
  minLevel: 5 // 클러스터러가 생성되는 최소 지도 레벨
});
console.log("markers:",markers);
//근처에 도로 장애물이 있으면, 알림을 알려주는 코드.
async function checkProximityToMarkers() {
  navigator.geolocation.getCurrentPosition(async function (position) {
    //실제 유저의 위도, 경로도를 알려준다.
    const userLat = position.coords.latitude;
    const userLon = position.coords.longitude;

    // 이전에 추가된 알림 제거
    speechQueue = [];

    for (const markerData of markersforaudio) {
      console.log('lat',markerData.lat);
      const distance = calculateDistance(userLat, userLon, markerData.lat, markerData.lng);
      if (distance <= maxDistance) {
        const textToSpeech ='근처에 ' + markerData.categoryId + '이 있습니다.';
        console.log("알림:",textToSpeech);
        // speech를 queue에 추가한다.
        speechQueue.push(textToSpeech);
        console.log("push완료");
      }
    }
    // 대기열에 추가된 알림이 있다면 재생 await으로 감싼다.
  await playSpeechQueue();
  }, function (error) {
    console.error('Error getting current location:', error);
  });
 
}


//실시간으로 내 위치를 업데이터 해 주는 함수.(단, 내 위치 버튼을 눌러서 내 위치를 1번은 불러와야 한다.)
async function updatemylocation(){
  navigator.geolocation.getCurrentPosition(async function (position) {
    //실제 유저의 위도, 경로도를 알려준다.
     lat1 = position.coords.latitude;
     lng1 = position.coords.longitude;

    // 내 위치 마커를 업데이트
    if (myLocationMarker) {
      myLocationMarker.setPosition(new kakao.maps.LatLng(lat1, lng1));
      map.setCenter(new kakao.maps.LatLng(lat1,lng1));
    } else {
       // 내 위치 마커 이미지 정의
 var myLocationImage = new kakao.maps.MarkerImage(
  'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/free-icon-gps-navigation-5142952.png', 
  new kakao.maps.Size(45, 45), // 마커 이미지 크기
  { offset: new kakao.maps.Point(15, 15) } // 마커 이미지 좌표 설정 (가운데 정렬을 위해)
);
      // 내 위치 마커가 없을 경우 새로 생성
      myLocationMarker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(lat1, lng1),
        map: map,
        image: myLocationImage,
        // 내 위치 마커 이미지 설정 등
      });
    }
    console.log("marker location update complete.");

    //지도를 내 위치로 이동
    //map.setCenter(new kakao.maps.LatLng(userLat,userLon));


    
  });
}
// watchPosition() 함수를 사용하여 위치가 변경될 때마다 내 위치를 감시하고 이벤트를 처리
function startWatchingPostion(){
  //watchPosition 함수는 사용자의 위치를 지속적으로 감시한다. 
  //
  navigator.geolocation.watchPosition(function (position) {
    updatemylocation();
  }, function (error) {
    console.error('Error getting current location:', error);
  });
}

//비동기 함수로 처리하기.
async function startPolly(){
  checkProximityToMarkers();
}

  // S3에서 오디오 파일을 가져와서 재생하는 함수
async function playSpeechFromS3(textToSpeech) {
 // S3에서 오디오 파일을 가져오기 위한 매개변수 설정
 return new Promise(async (resolve, reject) => {
  try {
    const audioUrl = await generateSpeechWithPolly(textToSpeech);

    const audio = new Audio(audioUrl);
    audio.play();
    audio.onended = () => {
      resolve(); // 음성 재생이 끝나면 resolve 호출
      playSpeechQueue(); // 재생이 끝나면 다음 알림 재생을 위해 호출. 그래야 순서대로 음성이 재생된다.
    };
    audio.onerror = (error) => {
      reject(error); // 오류 발생 시 reject 호출
    };
    // 음성 재생을 위해 audioQueue에 추가
    audioQueue.push(audio);
  } catch (error) {
    console.error('Error playing audio from Polly:', error);
    reject(error);
  }
});
}

// Amazon Polly API를 사용하여 텍스트를 음성으로 변환하는 함수
async function generateSpeechWithPolly(text) {
  // Amazon Polly API를 호출하여 텍스트를 음성으로 변환하는 코드
  // 이 부분은 사용자의 AWS 계정 정보를 사용하여 Polly를 호출하고, 텍스트를 음성으로 변환하는 방법에 따라 구현해야 합니다.
  // 예를 들어, AWS SDK를 사용하여 Polly를 호출하고, 텍스트를 음성으로 변환한 뒤, 오디오 URL을 반환하는 방법을 사용할 수 있습니다.
  // 아래는 간단한 예시 코드입니다.
  const params = {
    Text: text,
    OutputFormat: 'mp3',
    VoiceId: 'Seoyeon' // 사용할 음성 설정-한국인 여성 음성으로 Seoyeon을 제공하고 있다.
  };

  // AWS SDK를 사용하여 Polly로 텍스트를 음성으로 변환하는 코드

  const polly = new AWS.Polly();
  const response = await polly.synthesizeSpeech(params).promise(); //실제로 음성으로 변환하는 코드.

  // 응답으로 받은 오디오 데이터를 Blob 형태로 생성
  const audioBlob = new Blob([response.AudioStream], { type: 'audio/mpeg' });
  // Blob URL 생성
  const audioUrl = URL.createObjectURL(audioBlob);

  return audioUrl;
}


//차례대로 알림을 보내는 함수.
async function playSpeechQueue(){
 // 대기열에 음성이 있고, 현재 재생 중인 오디오가 없으면 다음 오디오 재생
 if (speechQueue.length > 0) {
  // 대기열의 첫 번째 알림을 가져온다.
  const textToSpeech = speechQueue[0];
  try {
    // s3에서 mp3파일을 가져와서 재생.
    await playSpeechFromS3(textToSpeech);
  } catch (error) {
    console.error('Error playing speech:', error);
  }
  // 재생 완료된 알림을 대기열에서 제거
  speechQueue.shift();
  console.log("audio textmaking completed.");
  // 재생이 끝나면 다음 알림 재생을 위해 다시 호출
  //playSpeechQueue();
}
}






//위도와 경도를 라디안 값으로 변환한 다음, 허버시 공식을 사용해서 두 지점간의 거리를 계산한다.
function calculateDistance(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371e3; // 지구의 반지름 (미터 단위)

  // 위도, 경도를 라디안 값으로 변환
  const lat1Rad = toRadians(lat1);
  const lon1Rad = toRadians(lon1);
  const lat2Rad = toRadians(lat2);
  const lon2Rad = toRadians(lon2);

  // 위도, 경도 차이 계산
  const dLat = lat2Rad - lat1Rad;
  const dLon = lon2Rad - lon1Rad;

  // 허버시 공식에 대입
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

  // 중심 각을 계산하여 거리 구하기
  const centralAngle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadius * centralAngle;
  console.log("거리(distance):",distance);
  return distance;
}

  // 내 위치 버튼을 눌렀을 때 지도를 내 위치로 이동
  document.querySelector('.my-location-button').addEventListener('click', function () {
    navigator.geolocation.getCurrentPosition(function (position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;



      lat1 = lat;
      lng1 = lng;
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




  






 // 클릭한 위치의 경로를 찾아 polyline로 그리는 함수
 kakao.maps.event.addListener(map, 'click', function (mouseEvent) {
  var clickedPosition = mouseEvent.latLng;

  // 내 위치와 클릭한 위치를 출발점과 도착점으로 설정하여 경로 탐색
  var startPoint = {
      lat: lat1,
      lng: lng1
  };
  var endPoint = {
      lat: clickedPosition.getLat(),
      lng: clickedPosition.getLng()
  };

   // 이전 polyline 제거
   if (polyline) {
    polyline.setMap(null);
  }
  // 카카오모빌리티 API를 사용하여 경로 탐색
  getCarDirection(startPoint, endPoint);
});




async function getCarDirection(startPoint, endPoint) {
  //kakao developers에서 발급 받았던 rest_api 키를 받는다.
const REST_API_KEY = '2f89a5abaeca0fa4f49b6e38e7cc6345';
// 호출방식의 URL을 입력합니다.
const url = 'https://apis-navi.kakaomobility.com/v1/directions';

// 출발지(origin), 목적지(destination)의 좌표를 문자열로 변환합니다.
const origin = `${startPoint.lng},${startPoint.lat}`;
const destination = `${endPoint.lng},${endPoint.lat}`;

// 요청 헤더를 추가합니다.
const headers = {
  Authorization: `KakaoAK ${REST_API_KEY}`,
  'Content-Type': 'application/json'
};

// 표3의 요청 파라미터에 필수값을 적어줍니다.
const queryParams = new URLSearchParams({
  origin: origin,
  destination: destination
});

//이 부분이 get으로 간다.
const requestUrl = `${url}?${queryParams}`; // 파라미터까지 포함된 전체 URL

try {
  const response = await fetch(requestUrl, {
      method: 'GET',
      headers: headers
  });

  if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();

  // 경로 데이터가 여기서 사용될 수 있습니다.
  console.log(data);
  
  // 경로를 가져와서 지도에 표시하는 부분을 추가하면 됩니다.
  displayRouteOnMap(data);
} catch (error) {
  console.error('Error:', error);
}
}
function displayRouteOnMap(routeData) {
  //ployline을 그릴 때의 경로를 저장하는 배열이라고 보면 된다.
  const linepath=[];
  console.log("routeData:",routeData);
  // 경로 데이터 중 필요한 정보를 추출합니다.
  //밑의 구문이 이해가 안된다면, f12를 눌러서 routeData의 배열 내부를 보면 된다.
  routeData.routes[0].sections[0].roads.forEach(road => {
    road.vertexes.forEach((coord, index) => {
      // 인덱스가 짝수인 경우에만 좌표를 추출하여 LatLng 객체로 변환합니다.
      if (index % 2 === 0) {
        const lng = coord; // x 좌표
        const lat = road.vertexes[index + 1]; // y 좌표
        linepath.push(new kakao.maps.LatLng(lat, lng));
      }
    });
  });
  /// Polyline 생성 및 지도에 표시
 polyline = new kakao.maps.Polyline({
  path: linepath,
  strokeWeight: 5,
  strokeColor: '#ff0000',
  strokeOpacity: 0.7,
  strokeStyle: 'solid'
}); 
polyline.setMap(map);
 
}





/*setInterval을 통해서 시간 간격을 두고 함수를 지속적으로 호출한다.*/ 
//setInterval(startPolly, 10000);
//차는 빠르게 달리기 때문에, 경고가 나오는 간격을 길게 조절한다.


//1초 간격으로 내 위치 좌표를 갱신한다.
//setInterval(startWatchingPostion,100);

/*이 부분은 마커가 이동하는 것을 구현하는 코드 부분이다.*/
var movingcar;

//위도와 경도의 배열을 생성(여기에 위도,경도를 넣는다.)
var latarray=[37.48353777832766,37.48363010124466,37.48376075824257,37.48386887354988,37.483992753719754,37.48412789371688,37.48426979676771,37.48442749496761,37.48449736978076];
var lngarray=[126.88494810217033,126.88491686775933,126.88492797386257,126.88492215478591,126.88491348487544,126.88490197102232,126.88489610004352,126.88491847132988,126.88496641728375];

//배열의 인덱스를 추적
var currentindex=0;

function movemarker(){
  // 배열에서 현재 인덱스에 해당하는 위도와 경도를 가져옴
  const newLat = latarray[currentindex];
  const newLng = lngarray[currentindex];
if(currentindex<latarray.length){

    // 내 위치 마커 이미지 정의
 var myLocationImage = new kakao.maps.MarkerImage(
  'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/free-icon-gps-navigation-5142952.png', 
  new kakao.maps.Size(45, 45), // 마커 이미지 크기
  { offset: new kakao.maps.Point(15, 15) } // 마커 이미지 좌표 설정 (가운데 정렬을 위해)
);
   // 새로운 좌표로 마커 이동
   if (movingcar) {
    movingcar.setPosition(new kakao.maps.Coords(newLat, newLng));
    map.setCenter(new kakao.maps.LatLng(newLat,newLng));
// 마커 객체가 없으면 새로 생성
movingcar = new kakao.maps.Marker({
  position: new kakao.maps.LatLng(newLat, newLng),
  map: map,  // map 객체가 이미 선언되어 있어야 함
  image:myLocationImage,
});
  } else {
  
      // 마커 객체가 없으면 새로 생성
      movingcar = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(newLat, newLng),
          map: map,  // map 객체가 이미 선언되어 있어야 함
          image:myLocationImage,
      });
  }

  // 다음 인덱스로 이동
  currentindex++;
}
else{
  console.log("마커 이동이 끝났습니다.");
  return;
}
 
  

}
/*마커 이동 끝!*/ 

//1초 간격으로 movemarker를 생성한다.
setInterval(movemarker,1000);
});


