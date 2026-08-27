package msps.back.entity;

import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Getter
public class Menu {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "menu_id")
    private Long id;

    // N일차
    @Column(nullable = false)
    private int day;

    // 메뉴 이름
    @Column(nullable = false)
    private String name;

    // 해당 메뉴 레시피
    @Column(columnDefinition = "TEXT", nullable = false)
    private String recipe;

    @Column(nullable = false, length = 20)
    private String videoId;
}
