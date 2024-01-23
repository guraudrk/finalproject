package com.example.finalproject.finalproject.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.finalproject.finalproject.entity.MemberEntity;

public interface memberRepository extends JpaRepository<MemberEntity, Long> {

    // jparepository를 상속받는다.
    // 첫번째 인자는 엔터티이고, 두번째 인자는 primary key의 자료형이다.

    // 인터페이스로 repository를 정의하기 때문에, 추상 클래스를 정의할 수 있다.

    // 이메일로 찾기
    Optional<MemberEntity> findByEmail(String email);

    // member_id로 찾기.
    Optional<MemberEntity> findByMemberId(String memberId);
}
