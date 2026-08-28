package msps.back.repository;

import msps.back.entity.MenuIngredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MenuIngredientRepository extends JpaRepository<MenuIngredient, Long> {

    @Query("select mi " +
            "from MenuIngredient mi " +
            "join fetch mi.ingredient " +
            "where mi.menu.id " +
            "in :menuIds")
    List<MenuIngredient> findByMenuIdsWithIngredient(List<Long> menuIds);

    @Query("select mi " +
            "from MenuIngredient mi " +
            "join fetch mi.ingredient " +
            "where mi.menu.id = :id")
    List<MenuIngredient> findMenuIngredientsByMenuId(Long id);

    @Query("select mi " +
            "from MenuIngredient mi " +
            "join fetch mi.menu " +
            "join fetch mi.ingredient")
    List<MenuIngredient> findAllWithMenuAndIngredient();
}
