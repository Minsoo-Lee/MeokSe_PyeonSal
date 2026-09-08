package msps.back.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import msps.back.dto.response.AllMenuIngredientsGetResponse;
import msps.back.dto.response.DailyDetailGetResponse;
import msps.back.dto.response.DailyGetResponse;
import msps.back.dto.response.FavoritesGetResponse;
import msps.back.entity.Check;
import msps.back.entity.Favorite;
import msps.back.entity.type.AmountType;
import msps.back.entity.Menu;
import msps.back.entity.MenuIngredient;
import msps.back.repository.*;
import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MenuService {

    private static final int PAGE_SIZE = 8;

    private final MenuRepository menuRepository;
    private final MenuIngredientRepository menuIngredientRepository;
    private final CheckRepository checkRepository;
    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;

    public DailyGetResponse getMenuInfos(int page, int limit, Long userId) {
        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<Menu> menuPage = menuRepository.findAllByOrderByDayAsc(pageable);

        List<Menu> menus = menuPage.getContent();
        List<Long> menuIds = menus.stream().map(Menu::getId).toList();
        List<MenuIngredient> ingredients =
                menuIngredientRepository.findByMenuIdsWithIngredient(menuIds);

        Map<Long, List<String>> ingredientNamesByMenuId = getIngredientNamesByMenuId(ingredients);

        Set<Long> checks = new HashSet<>(checkRepository.findMenuIdsByUserIdAndMenuIdIn(userId, menuIds));
        Set<Long> favorites = new HashSet<>(favoriteRepository.findMenuIdsByUserIdAndMenuIdIn(userId, menuIds));



        List<DailyGetResponse.MenuInfo> menuInfos = menus.stream()
                .map(menu -> new DailyGetResponse.MenuInfo(
                        menu.getId(),
                        menu.getDay(),
                        menu.getName(),
                        ingredientNamesByMenuId.getOrDefault(menu.getId(), List.of()),
                        checks.contains(menu.getId()),
                        favorites.contains(menu.getId())
                ))
                .toList();

        return new DailyGetResponse(menuInfos, (int) menuPage.getTotalElements());
    }

    private static @NonNull Map<Long, List<String>> getIngredientNamesByMenuId(List<MenuIngredient> ingredients) {
        // menu_id별로 묶고, 양념 제외하고, 이름만 뽑기
        Map<Long, List<String>> ingredientNamesByMenuId = ingredients.stream()
                .filter(mi -> !"양념".equals(mi.getIngredient().getType()))
                .collect(Collectors.groupingBy(
                        mi -> mi.getMenu().getId(),
                        Collectors.mapping(mi -> mi.getIngredient().getName(), Collectors.toList())
                ));
        return ingredientNamesByMenuId;
    }

    public DailyDetailGetResponse getMenuDetail(Long userId, Long menuId) {
        // IngredientInfo 구하기
        List<MenuIngredient> menuIngredients =
                menuIngredientRepository.findMenuIngredientsByMenuId(menuId);

        List<DailyDetailGetResponse.IngredientInfo> ingredientInfos =
                menuIngredients.stream()
                        .map(mi -> new DailyDetailGetResponse.IngredientInfo(
                                mi.getIngredient().getName(),
                                mi.getIngredient().getType(),
                                mi.getAmountType() == AmountType.APPROX ?
                                        mi.getAmountText() :
                                        mi.getAmountValue() + " " + mi.getAmountUnit()
                        )).toList();

        // page 구하기
        Menu menu = menuRepository.findById(menuId).orElseThrow(RuntimeException::new);
        int count = menuRepository.countByDayLessThan(menu.getDay());
        int page = (count / PAGE_SIZE) + 1;

        // favorite, check 상태 구하기
        boolean checked = checkRepository.findByUserIdAndMenuId(userId, menuId).isPresent();
        boolean favorite = favoriteRepository.findByUserIdAndMenuId(userId, menuId).isPresent();

        return new DailyDetailGetResponse(
                menu.getName(),
                menu.getDay(),
                menu.getRecipe(),
                page,
                menu.getVideoId(),
                checked,
                favorite,
                ingredientInfos);
    }

    public List<AllMenuIngredientsGetResponse> getAllData(Long userId) {
        List<MenuIngredient> allMI = menuIngredientRepository.findAllWithMenuAndIngredient();

        List<Long> menuIds = allMI.stream()
                .map(mi -> mi.getMenu().getId())
                .distinct()
                .toList();

        Set<Long> checkedMenuIds =
                new HashSet<>(checkRepository.findMenuIdsByUserIdAndMenuIdIn(userId, menuIds));

        Map<Long, AllMenuIngredientsGetResponse> allMap = new HashMap<>();

        for (MenuIngredient mi : allMI) {
            Long menuId = mi.getMenu().getId();
            if (!allMap.containsKey(menuId)) {
                AllMenuIngredientsGetResponse dto =
                        new AllMenuIngredientsGetResponse(
                                menuId,
                                mi.getMenu().getDay(),
                                mi.getMenu().getName(),
                                checkedMenuIds.contains(menuId)
                                );
                allMap.put(menuId, dto);
            }
            AllMenuIngredientsGetResponse response = allMap.get(mi.getMenu().getId());
            if (!mi.getIngredient().getType().equals("양념")) {
                response.addIngredientInfo(
                        new AllMenuIngredientsGetResponse.IngredientInfo(
                                mi.getIngredient().getId(),
                                mi.getIngredient().getName(),
                                mi.getIngredient().getType(),
                                mi.getAmountType(),
                                mi.getAmountValue(),
                                mi.getAmountUnit(),
                                mi.getAmountText()
                        )
                );
            }
        }
        List<AllMenuIngredientsGetResponse> list = allMap.values().stream().toList();
        log.info("[list] {}", list);
        return list;
    }

    public boolean addCheck(Long menuId, Long userId) {
        try {
            Optional<Check> existing = checkRepository.findByUserIdAndMenuId(userId, menuId);
            if (existing.isPresent()) {
                checkRepository.delete(existing.get());
                return false;
            }
            Check check = Check.builder()
                    .menu(menuRepository.getReferenceById(menuId))
                    .user(userRepository.getReferenceById(userId))
                    .build();
            checkRepository.save(check);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean addFavorite(Long menuId, Long userId) {
        try {
            Optional<Favorite> existing = favoriteRepository.findByUserIdAndMenuId(userId, menuId);
            if (existing.isPresent()) {
                favoriteRepository.delete(existing.get());
                return false;
            }
            Favorite favorite = Favorite.builder()
                    .menu(menuRepository.getReferenceById(menuId))
                    .user(userRepository.getReferenceById(userId))
                    .build();
            favoriteRepository.save(favorite);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public FavoritesGetResponse getFavoriteMenuInfos(int page, int limit, Long userId) {
        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<Menu> menuPage = favoriteRepository.findFavoriteMenusByUserId(userId, pageable);

        List<Menu> menus = menuPage.getContent();
        List<Long> menuIds = menus.stream().map(Menu::getId).toList();
        List<MenuIngredient> ingredients =
                menuIngredientRepository.findByMenuIdsWithIngredient(menuIds);

        Map<Long, List<String>> ingredientNamesByMenuId = getIngredientNamesByMenuId(ingredients);

        Set<Long> favorites = new HashSet<>(favoriteRepository.findMenuIdsByUserIdAndMenuIdIn(userId, menuIds));

        List<FavoritesGetResponse.MenuInfo> menuInfos = menus.stream()
                .map(menu -> new FavoritesGetResponse.MenuInfo(
                        menu.getId(),
                        menu.getDay(),
                        menu.getName(),
                        ingredientNamesByMenuId.getOrDefault(menu.getId(), List.of()),
                        true
                ))
                .toList();

        return new FavoritesGetResponse(menuInfos, (int) menuPage.getTotalElements());
    }
}
