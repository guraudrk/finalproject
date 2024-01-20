package com.example.finalproject.finalproject.Mapper;

import com.example.finalproject.finalproject.dto.RoadDamageDto;
import com.example.finalproject.finalproject.entity.RoadDamageEntity;

public class RoadDamageMapper {
    public static RoadDamageDto toDto(RoadDamageEntity entity) {
        RoadDamageDto dto = new RoadDamageDto();
        dto.setId(entity.getId());
        dto.setMemberId(entity.getMemberId());
        dto.setCategoryId(entity.getCategoryId());
        dto.setCreationTime(entity.getCreationTime());
        dto.setCompletionTime(entity.getCompletionTime());
        dto.setPhotoInfo(entity.getPhotoInfo());
        dto.setMaintenance(entity.getMaintenance());
        dto.setLat(entity.getLat());
        dto.setLng(entity.getLng());
        return dto;
    }

    public static RoadDamageEntity toEntity(RoadDamageDto dto) {
        RoadDamageEntity entity = new RoadDamageEntity();
        entity.setId(dto.getId());
        entity.setMemberId(dto.getMemberId());
        entity.setCategoryId(dto.getCategoryId());
        entity.setCreationTime(dto.getCreationTime());
        entity.setCompletionTime(dto.getCompletionTime());
        entity.setPhotoInfo(dto.getPhotoInfo());
        entity.setMaintenance(dto.getMaintenance());
        entity.setLat(dto.getLat());
        entity.setLng(dto.getLng());
        return entity;
    }
}