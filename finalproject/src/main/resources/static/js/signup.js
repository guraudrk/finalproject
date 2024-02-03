//회원가입 관련 javascript코드
//async, await 함수를 사용함으로서, 비동기 작업을 동기적으로 처리한다.


// 입력 필드에 input 이벤트 추가
//addeventlistener에 'input'은 값이 추가가 될 때, 해당 함수를 적용한다는 의미이다.
document.getElementById("id").addEventListener("input", checkId);
document.getElementById("password").addEventListener("input", checkPassword);
document.getElementById("passwordconfirm").addEventListener("input", checkPasswordConfirmation);

 //roads 클릭 시 메인 페이지로 이동
 document.querySelector('.roads-v8C').addEventListener('click', function() {
    window.location.href = '/main';
  });


// id를 체크하고 중복 여부를 서버에 요청하는 함수
async function checkId() {
    var id = String(document.getElementById("id").value);
    console.log("입력값:",id);
    var idMessage = document.getElementById("idMessage");


    //입력값이 비어 있는 경우에도 빨간색 알림을 띄운다.
    if(id.trim()===""){
        idMessage.style.color="red";
        idMessage.innerHTML="아이디를 입력해주세요.";
        return;
    }
    //id의 길이가 8미만이여도 알림을 띄운다.
    if(id.length<8){

        idMessage.style.color = "red";
        idMessage.innerHTML="아이디는 영문 및 숫자 8자 이상입니다.";
        return;
    }


    //ajax를 통해 디비와 통신한다. 아이디 값이 있는지 없는지 통신하는 것이다.
    $.ajax({
        type:"post",
        url:"http://localhost:8090/member/idcheck",
        data:{
          "memberId":id
        },
        
        success:function(res){
          console.log("요청성공",res);
          if(res==="ok"){
            idMessage.style.color = "green";
            idMessage.innerHTML="생성 가능한 id입니다.";
          } else {
            idMessage.style.color = "red";
            idMessage.innerHTML="이미 사용중인 아이디입니다.";
          }
        },
        error:function(err){
          console.log("에러발생",err);
         
        }
      });
}


// 비밀번호를 체크하는 함수
function checkPassword() {
    var password = document.getElementById("password").value;
    var passwordMessage = document.getElementById("passwordMessage");

    if (password.length < 8 || password.length > 15) {
        passwordMessage.innerText = "PW는 8~15자 이내로 입력하세요.";
        passwordMessage.style.color = "red";
    } else {
        passwordMessage.innerText = "비밀번호 체크가 완료되었습니다.";
        passwordMessage.style.color = "green";
    }
}

// 비밀번호 확인을 체크하는 함수
function checkPasswordConfirmation() {
    var password = document.getElementById("password").value;
    var passwordConfirm = document.getElementById("passwordconfirm").value;
    var passwordConfirmMessage = document.getElementById("passwordConfirmMessage");

    if (password !== passwordConfirm) {
        passwordConfirmMessage.innerText = "비밀번호가 일치하지 않습니다.";
        passwordConfirmMessage.style.color = "red";
    } else {
        passwordConfirmMessage.innerText = "일치합니다.";
        passwordConfirmMessage.style.color = "green";
    }
}

//이메일 중복을 확인하는 함수

function checkEmailFunction(){
    var email= document.getElementById("email").value;
    
}



// 회원가입 처리 함수
async function register() {
    var id = document.getElementById("id").value;
    var password = document.getElementById("password").value;
    var email = document.getElementById("email").value;

    // 위에서 정의한 함수들을 여기서 실행한다.
    checkId();
    checkPassword();
    checkPasswordConfirmation();

    var idMessage = document.getElementById("idMessage").innerText;
    var passwordMessage = document.getElementById("passwordMessage").innerText;
    var passwordConfirmMessage = document.getElementById("passwordConfirmMessage").innerText;

    // 조건을 만족하지 않으면, 회원가입 요청이 보내지지 않음.
    if (idMessage === "생성 가능한 id입니다." && passwordMessage === "비밀번호 체크가 완료되었습니다." && passwordConfirmMessage === "일치합니다.") {
        try {
            // 데이터를 JSON 형태로 변환
            var data = {
                memberId: id,
                password: password,
                email: email
            };

            // 서버로 데이터 전송
            //data들을 json으로 변환해서 서버에 전송해야 한다.
            $.ajax({
                type: "POST",
                url: "/signup",
                contentType: "application/json",  // 데이터 타입 설정
                data: JSON.stringify(data),  // 데이터 전송 전 JSON 형태로 변환
                success: function(res) {
                    if (res === "회원가입이 완료되었습니다.") {
                        alert(res);
                        window.location.href = "/main";
                    } else {
                        alert("회원가입에 실패했습니다.");
                        window.location.href = "/signup";
                    }
                },
                error: function(err) {
                    console.error("에러 발생", err);
                }
            });
        } catch (error) {
            alert("회원가입에 실패하였습니다. 다시 시도해주세요.");
        }
    } else {
        alert("아이디 또는 비밀번호 체크를 완료해주세요.");
    }
}
