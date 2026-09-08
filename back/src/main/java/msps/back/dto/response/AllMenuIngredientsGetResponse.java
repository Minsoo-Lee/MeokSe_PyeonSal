package msps.back.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import msps.back.entity.type.AmountType;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString
public class AllMenuIngredientsGetResponse {

    private Long menuId;
    private int day;
    private String name;
    private boolean checked;
    private List<IngredientInfo> ingredientInfos =  new ArrayList<>();

    public AllMenuIngredientsGetResponse(Long menuId, int day, String name, boolean checked) {
        this.menuId = menuId;
        this.day = day;
        this.name = name;
        this.checked = checked;
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
        private Integer amountValue;
        private String amountUnit;
        private String amountText;
    }
}
