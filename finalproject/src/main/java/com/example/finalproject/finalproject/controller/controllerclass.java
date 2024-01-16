package com.example.finalproject.finalproject.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import com.example.finalproject.finalproject.service.memberservice;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class controllerclass {

    // memeberservice 객체를 정의한다.
    private final memberservice memberService;

    @GetMapping("/main") // 메인 페이지로 이동하는 컨트롤러.
    public String gomain() {
        return "main";
    }

    @GetMapping("/officer") // 지자체 페이지로 이동하는 컨트롤러.
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

    @GetMapping("/signup") // 회원가입 페이지로 이동하는 컨트롤러.
    public String gosignup() {
        return "signup";
    }

    @GetMapping("/findpassword") // 비밀번호 찾기 페이지로 이동하는 컨트롤러.
    public String gofindpassword() {
        return "findpassword";
    }

    @GetMapping("/changepassword") // 비밀번호 변경 페이지로 이동하는 컨트롤러.
    public String gochangepassword() {
        return "changepassword";
    }

}
