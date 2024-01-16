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
    private String email;
    private String password;

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

    // entity를 dto로 변환할 때 쓴다.
    // 이렇게 변환을 해야 더 효율적으로 쓸 수 있다.
    public static memberDTO toMemberDTO(MemberEntity memberEntity) {
        memberDTO memberDTO = new memberDTO();
        memberDTO.setId(memberEntity.getId());
        memberDTO.setEmail(memberEntity.getEmail());
        memberDTO.setPassword(memberEntity.getPassword());
        return memberDTO;

    }
}