package msps.back.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.WeakKeyException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

/**
 * 우리 자체 JWT 발급/검증. 구글 로그인이 성공한 뒤에 "이 사용자다"라는 걸 표시하는
 * 토큰을 우리가 직접 만들고, 이후 API 요청은 이 토큰(Authorization: Bearer)만 보고 인증한다.
 *
 * JWT_SECRET은 HMAC 키로 쓰이는데, Keys.hmacShaKeyFor()는 원본 바이트가 32바이트(256bit)
 * 미만이면 WeakKeyException을 던진다. 그냥 사람이 대충 지은 짧은 문자열을 넣으면 앱이
 * 아예 안 뜨니, `openssl rand -base64 32` 등으로 충분히 긴 랜덤 값을 만들어서 넣을 것.
 */
@Component
public class JwtService {

    private final SecretKey key;
    private final long expirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs
    ) {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new WeakKeyException(
                    "JWT_SECRET이 너무 짧습니다 (최소 32바이트 필요). "
                            + "예: openssl rand -base64 32 로 생성한 값을 사용하세요."
            );
        }
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationMs;
    }

    public String generateToken(Long userId, String email) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("email", email)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expirationMs)))
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    /**
     * 토큰이 유효하면 userId를, 유효하지 않으면(만료/변조 등) null을 반환한다.
     * 예외를 던지지 않는 이유: 필터에서 "토큰이 없거나 잘못됨"과 "정상 인증"을 한 번에
     * 깔끔하게 분기하기 위함 (JwtAuthenticationFilter 참고).
     */
    public Long parseUserId(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return Long.valueOf(claims.getSubject());
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }
}
