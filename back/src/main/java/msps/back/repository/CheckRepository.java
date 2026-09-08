package msps.back.repository;

import msps.back.entity.Check;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CheckRepository extends JpaRepository<Check, Long> {

    @Query("select c.menu.id " +
            "from Check c " +
            "where c.user.id = :userId " +
            "and c.menu.id in :menuIds")
    List<Long> findMenuIdsByUserIdAndMenuIdIn(Long userId, List<Long> menuIds);
}
