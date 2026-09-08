package msps.back.repository;

import msps.back.entity.Favorite;
import msps.back.entity.Menu;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    @Query("select f.menu.id " +
            "from Favorite f " +
            "where f.user.id = :userId " +
            "and f.menu.id in :menuIds")
    List<Long> findMenuIdsByUserIdAndMenuIdIn(Long userId, List<Long> menuIds);

    @Query("select f " +
            "from Favorite f " +
            "where f.user.id = :userId " +
            "and f.menu.id = :menuId")
    Optional<Favorite> findByUserIdAndMenuId(Long userId, Long menuId);

    @Query("select f.menu " +
            "from Favorite f " +
            "where f.user.id = :userId " +
            "order by f.menu.day asc")
    Page<Menu> findFavoriteMenusByUserId(Long userId, Pageable pageable);
}
