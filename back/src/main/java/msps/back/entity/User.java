package msps.back.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import msps.back.entity.base.TimeBaseEntity;

@Entity
@Getter
@Table(name = "users")
public class User extends TimeBaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id; // 추후에 uuid로 변경

    private String name;

    private String email;

    // OAuth2 정보들
    private String provider;
    private String providerId;

    @Setter
    private boolean nicknameSet;

    // 업데이트 배너를 마지막으로 확인(닫기)했을 때의 앱 버전. null이면 아직 한 번도 안 본 것.
    @Setter
    private String lastSeenVersion;

    //== Constructor ==//
    public User() { }

    @Builder
    public User(String name, String email, String provider, String providerId) {
        this.name = name;
        this.email = email;
        this.provider = provider;
        this.providerId = providerId;
    }

    //== 연관관계 메서드 ==//
    public void completeSignup(String name) {
        this.name = name;
        this.nicknameSet = true;
    }
}
