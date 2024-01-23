package com.example.finalproject.finalproject.controller;

import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.example.finalproject.finalproject.dto.memberDTO;
import com.example.finalproject.finalproject.service.memberservice;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class controllerclass {

    // memeberservice 객체를 정의한다.
    private memberservice memberService;

    @Autowired
    public void MemberController(memberservice memberService) {
        this.memberService = memberService;
    }

    @GetMapping("/main") // 메인 페이지로 이동하는 컨트롤러.
    public String gomain() {
        return "main";
    }

    @GetMapping("/goofficer") // 지자체 페이지로 이동하는 컨트롤러.
    public String goOfficer() {
        return "goofficer";
    }

    @GetMapping("/detail") // 디테일 페이지로 이동하는 컨트롤러.
    public String godetail() {
        return "detail";
    }

    @GetMapping("/login") // 로그인 페이지로 이동하는 컨트롤러.
    public String gologin() {
        return "login";
    }

    @PostMapping("/login")
    public String login(@RequestParam("memberId") String memberId,
            @RequestParam("password") String password,
            HttpSession session, RedirectAttributes attributes) {
        try {

            memberDTO result = memberService.login(new memberDTO(memberId, password));

            if (result != null) {
                // 로그인 성공 시 세션에 정보 저장
                session.setAttribute("loggedInUser", result.getMemberId());

                // 리다이렉트 URL과 함께 성공 메시지 전달
                attributes.addFlashAttribute("successMessage", "로그인에 성공했습니다.");
                return "redirect:/main";
            } else {
                // 로그인 실패 시 리다이렉트 URL과 함께 실패 메시지 전달
                attributes.addFlashAttribute("errorMessage", "아이디 또는 비밀번호가 올바르지 않습니다.");
                return "redirect:/login";
            }
        } catch (Exception e) {
            // 로그인 중 오류 발생 시 리다이렉트 URL과 함께 오류 메시지 전달
            attributes.addFlashAttribute("errorMessage", "로그인 중 오류가 발생했습니다.");
            return "redirect:/login";
        }
    }

    @GetMapping("/signup") // 회원가입 페이지로 이동하는 컨트롤러.
    public String gosignup() {
        return "signup";
    }

    // 회원가입 페이지에서 요청을 받아옴.
    // ResponseEntity:Spring Framework에서 제공하는 클래스. http 응답을 나타낸다.
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody memberDTO memberDTO) {
        try {
            memberService.save(memberDTO);

            // 회원가입이 완료되었다는 신호를 보낸다.
            return ResponseEntity.ok("회원가입이 완료되었습니다.");
        } catch (Exception e) {
            // 오류 신호를 보낸다.
            return ResponseEntity.status(500).body("회원가입 중 오류가 발생했습니다.");
        }
    }

    // 회원가입 페이지에서, 중복 check에 관한 요청을 받아옴.
    @PostMapping("/checkDuplicateId")
    public ResponseEntity<Boolean> checkDuplicateId(@RequestBody String memberId) {
        try {
            // 중복되지 않은 경우에 true.
            boolean isDuplicate = memberService.idCheck(memberId) != null;
            return ResponseEntity.ok(isDuplicate);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(false);
        }
    }

    @GetMapping("/findpassword") // 비밀번호 찾기 페이지로 이동하는 컨트롤러.
    public String gofindpassword() {
        return "findpassword";
    }

    @GetMapping("/changepassword") // 비밀번호 변경 페이지로 이동하는 컨트롤러.
    public String gochangepassword() {
        return "changepassword";
    }

    // id중복 체크를 하기 위한 controller 코드.
    // service의 idCheck을 통해 중복된 id check을 한다.
    // 데이터를 requestparam을 통해 받아온다.
    @PostMapping("/member/idcheck")
    @ResponseBody
    public String idCheck(@RequestParam("memberId") String memberId) {

        // 이메일을 디비에서 체크하기 위해 memberservice에서 함수를 만든다.
        String checkResult = memberService.idCheck(memberId);

        return checkResult;

    }

}
