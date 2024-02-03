package com.example.finalproject.finalproject.controller;

import java.util.Optional;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.example.finalproject.finalproject.dto.memberDTO;
import com.example.finalproject.finalproject.entity.MemberEntity;
import com.example.finalproject.finalproject.service.RoadDamageService;
import com.example.finalproject.finalproject.service.memberservice;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class controllerclass {

    // memeberservice 객체를 정의한다.
    private memberservice memberService;

    // roadDamageService정의
    private RoadDamageService roadDamageService;

    @Autowired
    public void MemberController(memberservice memberService) {
        this.memberService = memberService;
    }

    @GetMapping("/main") // 메인 페이지로 이동하는 컨트롤러.
    public String gomain(Model model, HttpSession session) {

        // 세션에 저장된 memberId를 모델에 추가
        model.addAttribute("loggedInUser", session.getAttribute("loggedInUser"));
        return "main";
    }

    // officer.js에 아이디를 전달하는 controller 코드.
    @GetMapping("/getLoggedInUser")
    @ResponseBody
    public String getLoggedInUser(HttpSession session) {
        return (String) session.getAttribute("loggedInUser");
    }

    @GetMapping("/goofficer") // 지자체 페이지로 이동하는 컨트롤러.
    public String goOfficer(Model model, HttpSession session) {
        // 세션에 저장된 memberId를 모델에 추가
        model.addAttribute("loggedInUser", session.getAttribute("loggedInUser"));
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
            // 실제로는 데이터베이스나 다른 인증 로직을 통해 사용자를 검증하는 작업이 필요
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

    // 로그아웃에 관한 get매핑이다.
    @GetMapping("/logout")
    public String logout(HttpServletRequest request) {
        // 세션에서 사용자 정보 삭제
        request.getSession().invalidate();// 로그아웃은 이거 한줄이면 뚝딱이다.
        return "redirect:/main";
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

    // id중복 체크를 하기 위한 controller 코드.
    // service의 idCheck을 통해 중복된 id check을 한다.
    // 데이터를 requestparam을 통해 받아온다.
    @PostMapping("/member/idcheck")
    @ResponseBody
    public String idCheck(@RequestParam("memberId") String memberId) {

        // 아이디를 디비에서 체크하기 위해 memberservice에서 함수를 만든다.
        String checkResult = memberService.idCheck(memberId);

        return checkResult;

    }

    // 이메일 중복 체크를 하기 위한 controller 코드이다.
    @PostMapping("member/emailcheck")
    @ResponseBody
    public String emailCheck(@RequestParam("email") String email) {

        // 이메일을 디비에서 체크하기 위해 memberservice에서 함수를 만든다.
        String emailResult = memberService.emailCheck(email);
        return emailResult;
    }

    // 이메일로 아이디 찾기 요청 처리
    @PostMapping("/findIdByEmail")
    public ResponseEntity<MemberEntity> findIdByEmail(@RequestParam String email) {
        Optional<MemberEntity> memberEntityOptional = memberService.findIdByEmail(email);
        return memberEntityOptional.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 아이디로 비밀번호 찾기 요청 처리
    @PostMapping("/findPasswordById")
    public ResponseEntity<MemberEntity> findPasswordById(@RequestParam String memberId) {
        Optional<MemberEntity> memberEntityOptional = memberService.findPasswordById(memberId);
        return memberEntityOptional.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

}
