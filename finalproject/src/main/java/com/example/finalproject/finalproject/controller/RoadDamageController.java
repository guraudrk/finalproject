package com.example.finalproject.finalproject.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.finalproject.finalproject.dto.RoadDamageDto;
import com.example.finalproject.finalproject.service.RoadDamageService;

@RestController
@RequestMapping("/api")
public class RoadDamageController {

    // dto에 저장된 데이터를 엔드포인터로 연결시켜주는 controller이다.
    @Autowired
    private RoadDamageService roadDamageService;

    @GetMapping(value = "/getMarkers", produces = "application/json")
    public List<RoadDamageDto> getMarkers() {
        return roadDamageService.getAllRoadDamages();
    }

}
