package msps.back.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
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

    //== Constructor ==//
    public User() { }

    @Builder
    public User(String name, String email, String provider, String providerId) {
        this.name = name;
        this.email = email;
        this.provider = provider;
        this.providerId = providerId;
    }
}
