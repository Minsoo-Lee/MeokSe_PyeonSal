package msps.back.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentSaveRequest(
        @NotBlank
        @Size(max = 500)
        String content
) {
}
