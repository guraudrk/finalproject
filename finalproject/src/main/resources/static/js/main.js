

document.addEventListener('DOMContentLoaded', function () {
  //클러스터링을 위해 마커를 저장할 전역변수
  var markers=[];

  //음성 인식을 위해 마커들을 저장할 전역변수
  var markersforaudio=[];
  // 전역 변수로 내 위치 마커를 저장하기 위한 변수 선언
  var myLocationMarker;
  

  //각 마커에 대한 알림 상태를 저장할 객체
  var markerNotiStatus = [];

  //거리의 기준을 설정하는 변수.(미터 단위)
  const maxDistance = 1000;



  //여러개의 알림이 있을 경우, queue에 쌓아서 차례대로 알림을 보낸다.
var speechQueue = [];

   // 사용자의 현재 위치를 확인하고, 각 마커와의 거리를 계산하여 알림을 보내는 함수


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

    for (const markerData of markersforaudio) {
      console.log('lat',markerData.lat);
      const distance = calculateDistance(userLat, userLon, markerData.lat, markerData.lng);
      if (distance <= maxDistance) {
        const textToSpeech = '근처에 ' + markerData.categoryId + '이(가) 있습니다.';
        console.log("알림:",textToSpeech);
        // speech를 queue에 추가한다.
        speechQueue.push(textToSpeech);
      }
    }
    // 대기열에 추가된 알림이 있다면 재생
  playSpeechQueue();
  }, function (error) {
    console.error('Error getting current location:', error);
  });
 
}
  // S3에서 오디오 파일을 가져와서 재생하는 함수
async function playSpeechFromS3(textToSpeech) {
// S3에서 오디오 파일을 가져오기 위한 매개변수 설정
try {
  // 텍스트를 Amazon Polly를 사용하여 음성으로 변환
  const audioUrl = await generateSpeechWithPolly(textToSpeech);

  // 오디오 재생을 위한 Audio 객체 생성
  const audio = new Audio(audioUrl);
  // 오디오 재생
  audio.play();
   //음성 기능 생성 성공 시 console.log 생성
   console.log("audio text make complete.");
} catch (error) {
  console.error('Error playing audio from Polly:', error);
}
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
  //대기열이 비어 있으면 함수 종료
  if(speechQueue.length===0){
    return;
  }

  //대기열의 첫번째 알림을 가져온다.(사실 그냥 텍스트로 되어 있는 것을 가져온 것일 뿐이다. 텍스트를 변환해주는 것은 밑의 함수들이 해주지!)
  const textToSpeech = speechQueue[0];
  try{
    //s3에서 mp3파일을 가져와서 재생.
    await playSpeechFromS3(textToSpeech);
  }catch (error) {
    console.error('Error playing speech:', error);
  }

  // 대기열에서 재생된 알림 제거
  speechQueue.shift();

  // 재생이 완료된 후 다음 알림을 대기열에서 재생
  //이렇게 무한 루프 식으로 하나하나 재생하다가, length가 0이 되면 return을 한다.
  playSpeechQueue();

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

      map.setCenter(new kakao.maps.LatLng(lat, lng));
       // 기존에 있던 내 위치 마커를 제거
       if (myLocationMarker) {
        myLocationMarker.setMap(null);
      }
 // 내 위치 마커 이미지 정의
 var myLocationImage = new kakao.maps.MarkerImage(
  'https://playdataroads.s3.ap-northeast-2.amazonaws.com/iconimage/asset-5-1Xi.png', 
  new kakao.maps.Size(20, 20), // 마커 이미지 크기
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

  //watchPosition() 함수를 사용하면 위치가 변경될 때마다 실시간으로 위치를 업데이트하고 이에 대한 알림을 받을 수 있다. 
  // 위치가 변경될 때마다 해당 위치와 마커 간의 거리를 확인하여 알림을 표시하거나 숨김
function startWatchingPostion(){
  navigator.geolocation.watchPosition(function (position) {
  
    checkProximityToMarkers();
  }, function (error) {
    console.error('Error getting current location:', error);
  });
}
  


  // 일정 시간마다 사용자의 위치를 확인하여 알림을 보내는 코드
setInterval(startWatchingPostion, 30000); // 예시로 10초마다 위치를 확인하도록 설정
//차는 빠르게 달리기 때문에, 경고가 나오는 간격을 길게 조절한다.




});
