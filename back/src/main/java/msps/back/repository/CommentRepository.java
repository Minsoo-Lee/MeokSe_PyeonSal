package msps.back.repository;

import msps.back.entity.Comment;
import msps.back.entity.Menu;
import msps.back.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    @Query("select c.content " +
            "from Comment c " +
            "where c.user.id = :userId " +
            "and c.menu.id = :menuId")
    String findContentByUserIdAndMenuId(Long userId, Long menuId);

    List<Comment> findCommentByUserAndMenu(User user, Menu menu);

    @Query("select c " +
            "from Comment c " +
            "where c.user.id = :userId " +
            "and c.menu.id = :menuId")
    Comment findByUserIdAndMenuId(Long userId, Long menuId);
}
