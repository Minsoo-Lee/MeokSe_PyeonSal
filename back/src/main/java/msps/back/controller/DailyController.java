package msps.back.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import msps.back.dto.response.DailyDetailGetResponse;
import msps.back.dto.response.DailyGetResponse;
import msps.back.service.MenuService;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/daily")
public class DailyController {

    private final MenuService menuService;

    @GetMapping
    public DailyGetResponse getDailyMenus(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "8") int limit) {
        log.info("[getDailyMenus]");
        return menuService.getMenuInfos(page, limit);
    }

    @GetMapping("/{id}")
    public DailyDetailGetResponse getDailyMenuDetail(
            @PathVariable Long id
    ) {
        return menuService.getMenuDetail(id);
    }
}
