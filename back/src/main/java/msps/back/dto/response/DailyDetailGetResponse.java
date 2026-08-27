package msps.back.dto.response;

import java.util.List;

public record DailyDetailGetResponse(
        String name,
        int day,
        String recipe,
        int page,
        String videoId,
        List<IngredientInfo> ingredientInfos
) {
    public record IngredientInfo(
            String name,
            String type,
            String amount
    ) {}
}
