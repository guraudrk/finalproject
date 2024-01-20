package com.example.finalproject.finalproject.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.finalproject.finalproject.dto.memberDTO;
import com.example.finalproject.finalproject.entity.MemberEntity;
import com.example.finalproject.finalproject.repository.memberRepository;

@Service
@Component
public class memberservice {

    /*
     * dto와 entity의 관계
     * service의 코드들을 잘 보기 전에, dto,entity의 관계를 잘 볼 필요가 있다.
     * 1.entity는 실제 디비와 매핑되는 핵심 클래스이다.
     * 테이블이 가지지 않는 컬럼을 필드로 가져서는 안된다
     * entity는 데이터베이스 영속성을 목적으로 사용되기 때문에 request,response값을 전달하는 클래스로 쓰지 말것.
     * 
     * 2.dto는 레이어간 데이터 교환이 이뤄질 수 있도록 하는 객체이다.
     * 디비에서 데이터를 얻어, service나 controller등으로 보낼 때 사용한다.
     * 
     * 3.entity를 직접 반환할 경우에는 엔터티의 이름이 변경될 경우, 추가 작업이 필요할 수 있다.
     * 또한, 보안 문제도 있고, 필요한 데이터만 전송하기 어렵다.
     * 
     * 
     * 4.컨트롤러에서는 dto의 형태로 데이터를 받아 서비스에 전달한다.
     * 5.서비스에서는 컨트롤러에서 받은 DTO를 Entity로 변환하고, 필요한 작업을 수행한 뒤에 Repository에 Entity를
     * 전달한다.
     * 
     */

    // service 객체에 쓰일 repository를 정의한다.
    // repository에 jpa가 있기 때문에 꼭 정의를 해야 한다.
    @Autowired
    private final memberRepository memberRepository;

    // memberRepository가 null인 상태에서 save 메서드를 호출하려 하면 오류가 난다. 그래서 이 코드를 추가.
    @Autowired
    public memberservice(memberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    // 받아온 데이터들을 저장하는 메소드이다.
    public void save(memberDTO memberDTO) {
        // repository의 save 메서드 호출.(entity를 넘겨야 한다.)
        // 1.dto를 entity로 변환한다.(dto 클래스에 구현)
        try {
            MemberEntity memberEntity = MemberEntity.toMemberEntity(memberDTO);
            memberRepository.save(memberEntity); // 이렇게 레포지토리로 데이터를 save시킨다.
        }
        // 2.save 메서드를 호출한다.(jpa에서 호출한다.)
        // 3.이 쿼리를 통해 데이터베이스 내에서 쿼리를 만들어 주는 것이다.
        catch (Exception e) {
            e.printStackTrace();
        }
    }

    public memberDTO login(memberDTO memberDTO) {
        // 로그인을 수행할 때 수행되는 함수이다.

        // 1.회원이 입력한 아이디로 db에서 조회를 한다.
        // Optional은 memberentity를 한번 더 감싸는 개념이다.
        Optional<MemberEntity> findById = memberRepository.findById(memberDTO.getMemberId());

        // 조회 결과가 있다면
        if (findById.isPresent()) {
            // 일단 이 구문을 통해 데이터를 벗겨낸다.
            MemberEntity memberEntity = findById.get();
            // 2.db에서 조회한 비밀번호(entity)가 사용자가 입력한 비밀번호(dto)가 일치하는지 판단한다.
            if (memberEntity.getPassword().equals(memberDTO.getPassword())) {
                // 비밀번호 일치
                // entity를 dto로 변환한 후 리턴해야 한다.(번거롭다.)
                // 결국, 로그인을 성공했을 때만 dto에 뭘 담아서 주는 것이다.
                memberDTO dto = memberDTO.toMemberDTO(memberEntity);
                return dto;
            } else {
                // 비밀번호 불일치(로그인 실패)
                return null;
            }

        } else {
            // 3.없다면
            return null;
        }

    }

    // 회원 조회를 위한 함수이다.
    public List<memberDTO> findAll() {
        List<MemberEntity> memberEntityList = memberRepository.findAll();
        // entity list를 dto list로 변환해야 한다.
        List<memberDTO> memberDTOList = new ArrayList<>();
        // 하나하나 꺼낸다.
        for (MemberEntity memberEntity : memberEntityList) {
            memberDTOList.add(memberDTO.toMemberDTO(memberEntity));

        }

        return memberDTOList;
    }

    public String emailCheck(String memberEmail) {
        // repository 함수를 통해 사용자가 입력한 이메일 값으로 조회를 한다.
        Optional<MemberEntity> byMemberEmail = memberRepository.findByEmail(memberEmail);
        if (byMemberEmail.isPresent()) {

            // 이메일 값이 이미 있으면(회원이 중복되어 있으면)사용할 수 없다.

            return null;
        }

        else {
            // 조회 결과가 없으면 사용할 수 있다.
            return "ok";
        }

    }

    public String idCheck(String memberId) {
        // repository 함수를 통해 사용자가 입력한 아이디 값으로 조회를 한다.
        Optional<MemberEntity> byMemberId = memberRepository.findById(memberId);
        if (byMemberId.isPresent()) {

            // 아이디 값이 이미 있으면(회원이 중복되어 있으면)사용할 수 없다.

            return null;
        }

        else {
            // 조회 결과가 없으면 사용할 수 있다.
            return "ok";
        }

    }

    public MemberEntity getPasswordByEmail(String memberEmail) {
        Optional<MemberEntity> byMemberEmail = memberRepository.findByEmail(memberEmail);
        return byMemberEmail.orElse(null);
    }

    // Transactional 어노테이션은 여러 줄의 코드를 하나의 작업으로 처리해준다.
    // 하나의 작업으로 처리해주면, 부분적으로 오류가 난 것을 같이 처리할 수 있다는 장점이 있다.
    @Transactional
    public boolean changePassword(String email, String newPassword) {
        Optional<MemberEntity> userOptional = memberRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            MemberEntity user = userOptional.get();
            user.setPassword(newPassword);
            memberRepository.save(user);
            return true;
        }

        return false;
    }
}
