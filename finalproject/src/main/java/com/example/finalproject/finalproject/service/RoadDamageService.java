package com.example.finalproject.finalproject.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.finalproject.finalproject.dto.RoadDamageDto;
import com.example.finalproject.finalproject.entity.RoadDamageEntity;
import com.example.finalproject.finalproject.repository.RoadDamageRepository;

@Service
public class RoadDamageService {

    // 디비의 정보를 하나 하나 받는 service 파일이다.
    // 이 파일을 통해 정보를 하나하나 받아오면, 이를js을 통해 웹 페이지에 팝업창을 띄운다.
    @Autowired
    private RoadDamageRepository roadDamageRepository;

    public List<RoadDamageDto> getAllRoadDamages() {
        List<RoadDamageEntity> roadDamages = roadDamageRepository.findAll();
        return roadDamages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private RoadDamageDto convertToDTO(RoadDamageEntity roadDamage) {
        if (roadDamage == null) {
            throw new IllegalArgumentException("RoadDamage 객체가 null입니다.");
        }

        RoadDamageDto dto = new RoadDamageDto();
        dto.setPhotoInfo(roadDamage.getPhotoInfo());
        dto.setLat(roadDamage.getLat());
        dto.setLng(roadDamage.getLng());
        dto.setCategoryId(roadDamage.getCategoryId());
        return dto;
    }
}
