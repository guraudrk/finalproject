package com.example.finalproject.finalproject.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.finalproject.finalproject.entity.RoadDamageEntity;

@Repository
public interface RoadDamageRepository extends JpaRepository<RoadDamageEntity, Integer> {
    // 기본적인 CRUD 메서드는 JpaRepository에서 자동으로 제공됩니다.

    // id로 찾기.
    Optional<RoadDamageEntity> findById(Integer id);

}