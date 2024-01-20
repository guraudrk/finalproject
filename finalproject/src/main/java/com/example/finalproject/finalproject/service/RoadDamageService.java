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

    // 데이터들을 디비에서 가져오는 쿼리문(모든 table 포함.)
    private RoadDamageDto convertToDTO(RoadDamageEntity roadDamage) {
        if (roadDamage == null) {
            throw new IllegalArgumentException("RoadDamage 객체가 null입니다.");
        }

        // 데이터들을 디비에서 가져온다.
        RoadDamageDto dto = new RoadDamageDto();
        dto.setPhotoInfo(roadDamage.getPhotoInfo());
        dto.setLat(roadDamage.getLat());
        dto.setLng(roadDamage.getLng());
        dto.setCategoryId(roadDamage.getCategoryId());
        dto.setCreationTime(roadDamage.getCreationTime());
        dto.setCompletionTime(roadDamage.getCompletionTime());
        dto.setMemberId(roadDamage.getMemberId());
        dto.setMaintenance(roadDamage.getMaintenance());
        return dto;
    }
}
