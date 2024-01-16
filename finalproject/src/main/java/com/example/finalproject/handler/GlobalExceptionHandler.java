package com.example.finalproject.handler;

import org.springframework.http.HttpStatus;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

//에러페이지를 나타낸다.
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleException(Exception e, Model model) {
        model.addAttribute("error", e.getMessage());
        return "error"; // error.html 또는 원하는 에러 페이지로 이동하도록 설정
    }
}
