package com.example.finalproject.finalproject.controller;

import java.util.List;

import javax.persistence.EntityNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.finalproject.finalproject.dto.RoadDamageDto;
import com.example.finalproject.finalproject.repository.RoadDamageRepository;
import com.example.finalproject.finalproject.service.RoadDamageService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:8090")
public class RoadDamageController {

    // dto에 저장된 데이터를 엔드포인터로 연결시켜주는 controller이다.
    @Autowired
    private RoadDamageService roadDamageService;

    private RoadDamageRepository roadDamageRepository;

    @GetMapping(value = "/getMarkers", produces = "application/json")
    public List<RoadDamageDto> getMarkers() {
        return roadDamageService.getAllRoadDamages();
    }

    @PutMapping("/updateMarker/{id1}")
    public ResponseEntity<String> updateRoadDamage(@PathVariable Integer id1,
            @RequestBody RoadDamageDto updateDto) {
        try {
            roadDamageService.updateRoadDamage(id1, updateDto);
            return ResponseEntity.ok("도로 위험물이 성공적으로 업데이트되었습니다.");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("도로 위험물을 찾을 수 없습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("도로 위험물 업데이트 중 오류 발생: " + e.getMessage());
        }
    }
}
