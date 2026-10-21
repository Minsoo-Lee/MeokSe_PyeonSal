package msps.back.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;

@Entity
@Getter
@Table(
        uniqueConstraints =
                @UniqueConstraint(
                        columnNames = {"menu_id", "user_id"}
                )
)
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_id", nullable = false)
    private Menu menu;

    @Column(nullable = false, length = 500)
    private String content;

    public Comment() {
    }

    @Builder
    public Comment(User user, Menu menu, String content) {
        this.user = user;
        this.menu = menu;
        this.content = content;
    }

    //== 연관관계 메서드 ==//
    public void updateContent(String content) {
        this.content = content;
    }
}
