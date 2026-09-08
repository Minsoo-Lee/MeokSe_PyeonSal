package msps.back.repository;

import msps.back.entity.Check;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CheckRepository extends JpaRepository<Check, Long> {

    @Query("select c.menu.id " +
            "from Check c " +
            "where c.user.id = :userId " +
            "and c.menu.id in :menuIds")
    List<Long> findMenuIdsByUserIdAndMenuIdIn(Long userId, List<Long> menuIds);

    @Query("select c " +
            "from Check c " +
            "where c.user.id = :userId " +
            "and c.menu.id = :menuId")
    Optional<Check> findByUserIdAndMenuId(Long userId, Long menuId);
}
