package msps.back.repository;

import msps.back.entity.Menu;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Long> {

    Page<Menu> findAllByOrderByDayAsc(Pageable pageable);
    int countByDayLessThan(int day);

    Optional<Menu> findFirstByDayLessThanOrderByDayDesc(Integer day);
    Optional<Menu> findFirstByDayGreaterThanOrderByDayAsc(Integer day);
}
