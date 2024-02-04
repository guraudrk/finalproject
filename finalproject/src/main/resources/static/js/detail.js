document.addEventListener('DOMContentLoaded', function (){


  // 필터링된 데이터를 담을 배열을 초기화한다.

let filteredData = [];

/*
돔트리가 다 만들어진 후에 돔에 접근이 가능하기때문에, 
돔이 생성되기전 돔을 조작하는 자바스크립트 코드가 실행되어 원하지 않는 결과를 내는것을 막을 수 있다.
*/
// ROADs를 누르면 메인 페이지로 리다이렉트
document.querySelector('.icon-container').addEventListener('click', function () {
  window.location.href = '/main';
});
//메인 페이지로 이동하는 것도.
document.querySelector('.icon-container').addEventListener('click', function () {
    window.location.href = '/main';
  });
    // '확인' 버튼에 이벤트 리스너 등록
    document.getElementById("apply-button").addEventListener("click",  function () {
   
      applyFilterAndShowData();
   });

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
//좌측 탭- '주소1' 선택 드롭다운 엘리먼트에 대한 이벤트 리스너 추가
var address1Select = document.getElementById("address1");
address1Select.addEventListener('change', function () {
    // 주소1 변경 시 주소2 옵션 업데이트
    updateAddress2Options();
});
 


//dto에서 데이터 다 가져오고, 그것을 표현해주는 함수 구현
async function applyFilterAndShowData(){

//가장 먼저, 결과를 보여줄 배열을 초기화한다. 그래야 확인 버튼을 누를 때 마다 데이터가 초기화된다.
  filteredData = [];

    //  DTO에서 데이터를 가져온다.
    const response = await fetch('/api/getMarkers');
    const data = await response.json();

    //html에서 입력된 값들을 가져온다.
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;
    const address1 = document.getElementById("address1").value;
    const address2 = document.getElementById("address2").value;

    //유효성 검사
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

    //2.4.creation_date의 값이 시작날짜/종료날짜 사이에 있는 것과,
//    위도와 경도를 주소로 변환한 구문 중에 주소1/주소2가 있는지 확인한다.

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
    //{ ...item, address }을 통해, 기존에 있던 아이템에서 address 항목을 추가한다.
    const itemWithAddress = { ...item, address }; // 기존 항목에 주소 추가
    filteredData.push(itemWithAddress);
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


// 필터링된 데이터를 테이블에 추가한다. 만약, 데이터가 없다면, 함수를 따로 실행시키지는 않고, 경고 메시지가 뜬다.
if(filteredData.length>0){
  renderFilteredData();
  alert("데이터가 "+filteredData.length+"건 생성되었습니다.");
}
else if(filteredData.length==0){
  alert("조건에 맞는 데이터가 없습니다.");
  renderFilteredData();
}

  }

// 필터링된 데이터를 테이블에 추가하는 함수
function renderFilteredData() {
  const tableBody = document.getElementById("filtered-data-body");
  // 테이블 바디 초기화
  tableBody.innerHTML = "";

  // 필터링된 데이터를 테이블에 추가
  filteredData.forEach(item => {
    const row = document.createElement("tr");

    // creationTime을 Date 객체로 파싱
  const creationDate = new Date(item.creationTime);
  //completetime을 date 객체로 파싱
  const completionTime = new Date(item.completionTime);
  // 년/월/일로 포맷팅
  const formattedDate = `${creationDate.getFullYear()}-${(creationDate.getMonth() + 1).toString().padStart(2, '0')}-${creationDate.getDate().toString().padStart(2, '0')}`;
  
  //1970-01-01이면 null로 출력한다.
  const changedDate = completionTime && completionTime.getTime() !== 0 ? 
  `${completionTime.getFullYear()}-${(completionTime.getMonth() + 1).toString().padStart(2, '0')}-${completionTime.getDate().toString().padStart(2, '0')}` 
  : null;  
  const maintenanceStatus = item.maintenance ? item.maintenance : '미완료'; // maintenance가 null이면 '미완료'로 설정

  //유지 보수 여부가 'null'이면 '미완료'로 바꾸기
  

    row.innerHTML = `
      <td>${item.address}</td>
      <td>${item.categoryId}</td>
      <td>${formattedDate}</td>
      <td>${maintenanceStatus}</td>
      <td>${item.memberId}</td>
      <td>${changedDate}</td>
      <td><img src="${item.photoInfo}" width="200" height="150"></td>
    `;
    //행을 추가하는 용도이다.
    tableBody.appendChild(row);
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