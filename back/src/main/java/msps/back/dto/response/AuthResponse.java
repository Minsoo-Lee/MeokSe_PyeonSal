package msps.back.dto.response;

public record AuthResponse(
        String email,
        String name,
        boolean nicknameSet
) {
}
