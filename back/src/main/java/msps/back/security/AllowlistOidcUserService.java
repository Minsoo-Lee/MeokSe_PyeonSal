package msps.back.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 허용된 이메일(가족 계정)만 로그인시킨다.
 *
 * 성공 핸들러(AuthenticationSuccessHandler) 쪽에서 사후에 걸러내는 방식도 가능하지만,
 * 그러면 이미 SecurityContext/세션에는 "인증된 사용자"로 올라간 뒤에 거부하는 셈이라
 * 세션을 명시적으로 지워야 하는 등 번거롭다. 여기서(loadUser 단계) 막으면 애초에
 * 인증 자체가 실패 처리되어 더 안전하고 간단하다.
 */
@Service
public class AllowlistOidcUserService extends OidcUserService {

    private final String allowedEmailsRaw;

    public AllowlistOidcUserService(@Value("${app.auth.allowed-emails}") String allowedEmailsRaw) {
        this.allowedEmailsRaw = allowedEmailsRaw;
    }

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) {
        OidcUser oidcUser = super.loadUser(userRequest);

        Set<String> allowedEmails = Arrays.stream(allowedEmailsRaw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());

        if (!allowedEmails.contains(oidcUser.getEmail())) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("not_allowed"),
                    "허용되지 않은 계정입니다: " + oidcUser.getEmail()
            );
        }

        return oidcUser;
    }
}
