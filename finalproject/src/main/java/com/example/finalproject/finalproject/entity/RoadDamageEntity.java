package com.example.finalproject.finalproject.entity;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Entity
@Getter
@Setter
@Table(name = "road_damage")
public class RoadDamageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contact_person_id")
    private String contactPersonId;

    @Column(name = "category_id")
    private String categoryId;

    @Column(name = "creation_time")
    private Date creationTime;

    @Column(name = "completion_time")
    private Date completionTime;

    @Column
    private String location;

    @Column(name = "photo_info")
    private String photoInfo;

    @Column
    private String maintenance;

    @Column(name = "lat")
    private double lat;

    @Column(name = "lng")
    private double lng;

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
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
