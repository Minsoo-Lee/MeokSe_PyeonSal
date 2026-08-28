package msps.back.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import msps.back.entity.User;
import msps.back.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * 구글 로그인이 (화이트리스트까지 통과해서) 성공했을 때 호출됨.
 * User를 find-or-create 하고, 우리 자체 JWT를 발급해서 프론트로 리다이렉트한다.
 *
 * 토큰을 쿼리 파라미터가 아니라 URL 프래그먼트(#token=...)로 넘기는 이유: 프래그먼트는
 * 브라우저가 다음 요청(서버 로그, Referer 헤더 등)에 절대 포함시키지 않는 순수 클라이언트
 * 전용 값이라, 토큰이 로그 등에 남을 걱정이 없다.
 */
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {
        OidcUser oidcUser = (OidcUser) authentication.getPrincipal();

        User user = userRepository.findByGoogleSub(oidcUser.getSubject())
                .orElseGet(() -> userRepository.save(User.builder()
                        .googleSub(oidcUser.getSubject())
                        .email(oidcUser.getEmail())
                        .name(oidcUser.getFullName())
                        .pictureUrl(oidcUser.getPicture())
                        .build()));

        String token = jwtService.generateToken(user.getUserId(), user.getEmail());

        response.sendRedirect(frontendBaseUrl + "/oauth/callback#token=" + token);
    }
}
