package msps.back.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import msps.back.dto.response.AllMenuIngredientsGetResponse;
import msps.back.repository.MenuIngredientRepository;
import msps.back.service.MenuService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/ingredients/check")
public class IngredientCheckController {

    private final MenuService menuService;

    @GetMapping
    public List<AllMenuIngredientsGetResponse> getAllMenuIngredients() {
        return menuService.getAllData();
    }
}
