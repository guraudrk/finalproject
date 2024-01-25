package com.example.finalproject.finalproject.dto;

import java.sql.Timestamp;

public class RoadDamageDto {

    private Integer id;
    private String memberId;
    private String categoryId;
    private Timestamp creationTime;
    private Timestamp completionTime;
    private String photoInfo;
    private String maintenance;
    private double lat;
    private double lng;

    public RoadDamageDto() {
        // 기본 생성자
    }

    public RoadDamageDto(String memberId, String categoryId, Timestamp creationTime, Timestamp completionTime,
            String photoInfo, String maintenance, double lat, double lng) {
        this.memberId = memberId;
        this.categoryId = categoryId;
        this.creationTime = creationTime;
        this.completionTime = completionTime;
        this.photoInfo = photoInfo;
        this.maintenance = maintenance;
        this.lat = lat;
        this.lng = lng;
    }

    // Constructors, getters, setters

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getMemberId() {
        return memberId;
    }

    public void setMemberId(String memberId) {
        this.memberId = memberId;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public Timestamp getCreationTime() {
        return creationTime;
    }

    public void setCreationTime(Timestamp creationTime) {
        this.creationTime = creationTime;
    }

    public Timestamp getCompletionTime() {
        return completionTime;
    }

    public void setCompletionTime(Timestamp completionTime) {
        this.completionTime = completionTime;
    }

    public String getPhotoInfo() {
        return photoInfo;
    }

    public void setPhotoInfo(String photoInfo) {
        this.photoInfo = photoInfo;
    }

    public String getMaintenance() {
        return maintenance;
    }

    public void setMaintenance(String maintenance) {
        this.maintenance = maintenance;
    }

    public double getLat() {
        return lat;
    }

    public void setLat(double lat) {
        this.lat = lat;
    }

    public double getLng() {
        return lng;
    }

    public void setLng(double lng) {
        this.lng = lng;
    }
}
