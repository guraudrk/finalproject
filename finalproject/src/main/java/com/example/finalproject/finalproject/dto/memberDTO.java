package com.example.finalproject.finalproject.dto;

import org.springframework.stereotype.Component;

import com.example.finalproject.finalproject.entity.MemberEntity;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.ToString;

@AllArgsConstructor
@NoArgsConstructor
@ToString
@Component
public class memberDTO {

    // 회원가입을 위한 변수들을 정의한다.
    private Long id;
    private String member_id; // 변수명 수정
    private String email;
    private String password;

    // 아이디/비밀번호를 담는 dto이다.
    public memberDTO(String member_Id, String password) {
        this.member_id = member_Id;
        this.password = password;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMemberId() { // 메소드명 수정
        return member_id; // 변수명 수정
    }

    public void setMemberId(String member_id) { // 메소드명 수정
        this.member_id = member_id; // 변수명 수정
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

    // entity를 dto로 변환할 때 쓴다.
    // 이렇게 변환을 해야 더 효율적으로 쓸 수 있다.
    public static memberDTO toMemberDTO(MemberEntity memberEntity) {
        memberDTO memberDTO = new memberDTO();
        memberDTO.setId(memberEntity.getId());
        memberDTO.setMemberId(memberEntity.getMemberId());
        memberDTO.setEmail(memberEntity.getEmail());
        memberDTO.setPassword(memberEntity.getPassword());
        return memberDTO;
    }
}