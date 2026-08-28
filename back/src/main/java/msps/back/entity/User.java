package msps.back.entity;

import jakarta.persistence.*;
import lombok.ToString;

import java.time.Instant;

@Entity
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id; // 추후에 uuid로 변경

    private String name;

    // OAuth2 정보들
    private String provider;
    private String providerId;
}
