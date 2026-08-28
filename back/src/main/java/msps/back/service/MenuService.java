package msps.back.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import msps.back.dto.response.AllMenuIngredientsGetResponse;
import msps.back.dto.response.DailyDetailGetResponse;
import msps.back.dto.response.DailyGetResponse;
import msps.back.entity.AmountType;
import msps.back.entity.Menu;
import msps.back.entity.MenuIngredient;
import msps.back.repository.MenuIngredientRepository;
import msps.back.repository.MenuRepository;
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

    public DailyGetResponse getMenuInfos(int page, int limit) {
        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<Menu> menuPage = menuRepository.findAllByOrderByDayAsc(pageable);

        List<Menu> menus = menuPage.getContent();
        List<Long> menuIds = menus.stream().map(Menu::getId).toList();
        List<MenuIngredient> ingredients =
                menuIngredientRepository.findByMenuIdsWithIngredient(menuIds);

        // menu_id별로 묶고, 양념 제외하고, 이름만 뽑기
        Map<Long, List<String>> ingredientNamesByMenuId = ingredients.stream()
                .filter(mi -> !"양념".equals(mi.getIngredient().getType()))
                .collect(Collectors.groupingBy(
                        mi -> mi.getMenu().getId(),
                        Collectors.mapping(mi -> mi.getIngredient().getName(), Collectors.toList())
                ));

        List<DailyGetResponse.MenuInfo> menuInfos = menus.stream()
                .map(menu -> new DailyGetResponse.MenuInfo(
                        menu.getId(),
                        menu.getDay(),
                        menu.getName(),
                        ingredientNamesByMenuId.getOrDefault(menu.getId(), List.of())
                ))
                .toList();

        return new DailyGetResponse(menuInfos, (int) menuPage.getTotalElements());
    }

    public DailyDetailGetResponse getMenuDetail(Long id) {
        // IngredientInfo 구하기
        List<MenuIngredient> menuIngredients =
                menuIngredientRepository.findMenuIngredientsByMenuId(id);

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
        Menu menu = menuRepository.findById(id).orElseThrow(RuntimeException::new);
        int count = menuRepository.countByDayLessThan(menu.getDay());
        int page = (count / PAGE_SIZE) + 1;

        return new DailyDetailGetResponse(
                menu.getName(), menu.getDay(), menu.getRecipe(), page, menu.getVideoId(), ingredientInfos);
    }

    public List<AllMenuIngredientsGetResponse> getAllData() {
        List<MenuIngredient> allMI = menuIngredientRepository.findAllWithMenuAndIngredient();
        Map<Long, AllMenuIngredientsGetResponse> allMap = new HashMap<>();

        for (MenuIngredient mi : allMI) {
            if (!allMap.containsKey(mi.getMenu().getId())) {
                AllMenuIngredientsGetResponse dto =
                        new AllMenuIngredientsGetResponse(
                                mi.getMenu().getId(),
                                mi.getMenu().getDay(),
                                mi.getMenu().getName());
                allMap.put(mi.getMenu().getId(), dto);
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
}
