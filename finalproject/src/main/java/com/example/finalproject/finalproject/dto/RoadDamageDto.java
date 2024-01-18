package com.example.finalproject.finalproject.dto;

import java.util.Date;

public class RoadDamageDto {

    private Long id;
    private String contactPersonId;
    private String categoryId;
    private Date creationTime;
    private Date completionTime;
    private String location;
    private String photoInfo;
    private String maintenance;
    private double lat;
    private double lng;

    // Constructors, getters, setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContactPersonId() {
        return contactPersonId;
    }

    public void setContactPersonId(String contactPersonId) {
        this.contactPersonId = contactPersonId;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public Date getCreationTime() {
        return creationTime;
    }

    public void setCreationTime(Date creationTime) {
        this.creationTime = creationTime;
    }

    public Date getCompletionTime() {
        return completionTime;
    }

    public void setCompletionTime(Date completionTime) {
        this.completionTime = completionTime;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
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
