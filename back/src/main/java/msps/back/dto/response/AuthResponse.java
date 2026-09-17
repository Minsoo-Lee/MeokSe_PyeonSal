package msps.back.dto.response;

public record AuthResponse(
        String email,
        String name,
        boolean nicknameSet,
        String appVersion,
        String updateNote,
        String lastSeenVersion
) {
}
