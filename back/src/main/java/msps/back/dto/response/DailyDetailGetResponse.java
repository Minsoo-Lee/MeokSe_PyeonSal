package msps.back.dto.response;

import java.util.List;

public record DailyDetailGetResponse(
        String name,
        int day,
        String recipe,
        int page,
        String videoId,
        boolean checked,
        boolean favorite,
        List<IngredientInfo> ingredientInfos,
        Long prevMenuId,
        Integer prevDay,
        Long nextMenuId,
        Integer nextDay
) {
    public record IngredientInfo(
            String name,
            String type,
            String amount
    ) {}
}
