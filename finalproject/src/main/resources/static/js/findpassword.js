function findIdByEmail() {
    var email = document.getElementById("inputEmail").value;
    $.post("/findIdByEmail", { email: email }, function(response) {
      if (response) {
        document.getElementById("resultMessage").innerText = "회원님의 아이디는 " + response.memberId + "입니다";
        document.getElementById("resultMessage").style.color = "green";
      } else {
        document.getElementById("resultMessage").innerText = "이메일이 올바르지 않습니다";
        document.getElementById("resultMessage").style.color = "red";
      }
    });
  }

  function findPasswordById() {
    var memberId = document.getElementById("inputId").value;
    $.post("/findPasswordById", { memberId: memberId }, function(response) {
      if (response) {
        document.getElementById("resultMessage").innerText = "회원님의 비밀번호는 " + response.password + "입니다";
        document.getElementById("resultMessage").style.color = "green";
      } else {
        document.getElementById("resultMessage").innerText = "아이디가 올바르지 않습니다";
        document.getElementById("resultMessage").style.color = "red";
      }
    });
  }
   //roads 클릭 시 메인 페이지로 이동
 document.querySelector('.roads-v5S').addEventListener('click', function() {
  window.location.href = '/main';
});