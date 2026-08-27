package msps.back.entity;

import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Getter
public class Ingredient {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ingredient_id")
    private Long id;

    // 재료 이름
    @Column(nullable = false)
    private String name;

    // 재료 타입 (육류, 채소, 양념 등)
    @Column(nullable = false)
    private String type;
}
