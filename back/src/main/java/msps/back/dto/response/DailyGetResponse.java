package msps.back.dto.response;

import java.util.List;

public record DailyGetResponse(List<MenuInfo> menuInfos, int totalCount) {

    public record MenuInfo(
            Long menuId,
            int day,
            String name,
            List<String> ingredientNames
    ) {}
}

