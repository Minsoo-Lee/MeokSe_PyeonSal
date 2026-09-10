package msps.back.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import msps.back.dto.response.*;
import msps.back.entity.User;
import msps.back.service.MenuService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/menu")
public class MenuController {

    private final MenuService menuService;

    @GetMapping("/daily")
    public DailyGetResponse getDailyMenus(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "8") int limit,
            @AuthenticationPrincipal User user) {
        log.info("[getDailyMenus]");
        return menuService.getMenuInfos(page, limit, user.getId());
    }

    @GetMapping("/{id}")
    public DailyDetailGetResponse getDailyMenuDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        log.info("[Controller] menuId = {}", id);
        return menuService.getMenuDetail(user.getId(), id);
    }

    @GetMapping("/ingredients")
    public List<AllMenuIngredientsGetResponse> getAllMenuIngredients(
            @AuthenticationPrincipal User user
    ) {
        log.info("[getAllMenuIngredients]");
        return menuService.getAllData(user.getId());
    }

    @PostMapping("/{id}/check")
    public AddCheckResponse addCheck(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        boolean checked = menuService.addCheck(id, user.getId());
        return new AddCheckResponse(checked);
    }

    @PostMapping("/{id}/favorite")
    public AddFavoriteResponse addFavorite(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        boolean favorite = menuService.addFavorite(id, user.getId());
        return new AddFavoriteResponse(favorite);
    }

    @GetMapping("/favorites")
    public FavoritesGetResponse getFavorites(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "8") int limit,
            @AuthenticationPrincipal User user) {
        return menuService.getFavoriteMenuInfos(page, limit, user.getId());
    }
}
