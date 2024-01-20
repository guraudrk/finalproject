package com.example.finalproject.finalproject.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import com.example.finalproject.finalproject.dto.memberDTO;

@Entity
@Table(name = "ROADs")
public class MemberEntity {
    // Table이라는 어노테이션은 데이터베이스에 해당 이름의 테이블이 자동으로 생기도록 해준다.
    // 이 엔티티 클래스가 테이블의 역활을 한다.

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_id")
    private Long id;

    @Column(name = "email", unique = true)
    private String email;

    @Column(name = "member_pw")
    private String password;

    public MemberEntity() {
        // 기본 생성자
    }

    public MemberEntity(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    // memberDTO를 MemberEntity로 변환하는 메소드
    public static MemberEntity toMemberEntity(memberDTO memberDTO) {
        MemberEntity memberEntity = new MemberEntity();
        memberEntity.setEmail(memberDTO.getEmail());
        memberEntity.setPassword(memberDTO.getPassword());

        return memberEntity;
    }
}