package msps.back.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * 로그인 실패(화이트리스트에 없는 계정 포함) 시 프론트 로그인 페이지로 되돌려보낸다.
 * AllowlistOidcUserService에서 던진 OAuth2AuthenticationException("not_allowed")도 여기로 들어옴.
 */
@Component
public class OAuth2LoginFailureHandler implements AuthenticationFailureHandler {

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException {
        response.sendRedirect(frontendBaseUrl + "/login?error=not_allowed");
    }
}
