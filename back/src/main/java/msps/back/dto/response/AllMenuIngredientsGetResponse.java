package msps.back.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import msps.back.entity.AmountType;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString
public class AllMenuIngredientsGetResponse {

    private Long menuId;
    private int day;
    private String name;
    private List<IngredientInfo> ingredientInfos =  new ArrayList<>();

    public AllMenuIngredientsGetResponse(Long menuId, int day, String name) {
        this.menuId = menuId;
        this.day = day;
        this.name = name;
    }

    public void addIngredientInfo (IngredientInfo info) {
        ingredientInfos.add(info);
    }

    @Getter
    @ToString
    @AllArgsConstructor
    public static class IngredientInfo {
        private Long ingredientId;
        private String name;
        private String type;
        private AmountType amountType;
        private Long amountValue;
        private String amountUnit;
        private String amountText;
    }
}
