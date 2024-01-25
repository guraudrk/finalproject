package com.example.finalproject.finalproject.entity;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import com.example.finalproject.finalproject.dto.memberDTO;

@Entity
@Table(name = "MemberInfo")
public class MemberEntity implements Serializable {
    // Table이라는 어노테이션은 데이터베이스에 해당 이름의 테이블이 자동으로 생기도록 해준다.
    // 이 엔티티 클래스가 테이블의 역활을 한다.

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "member_id", unique = true, nullable = false)
    private String memberId;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "member_pw", nullable = false)
    private String password;

    public MemberEntity(String memberId, String email, String password) {
        this.memberId = memberId;
        this.email = email;
        this.password = password;
    }

    public MemberEntity() {
        // 기본 생성자
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMemberId() {
        return memberId;
    }

    public void setMemberId(String memberId) {
        this.memberId = memberId;
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
        memberEntity.setId(memberDTO.getId());
        memberEntity.setMemberId(memberDTO.getMemberId());
        memberEntity.setEmail(memberDTO.getEmail());
        memberEntity.setPassword(memberDTO.getPassword());

        return memberEntity;
    }
}