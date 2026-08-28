package msps.back.auth;

import lombok.Getter;
import lombok.ToString;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;

import java.util.List;

@Getter
@ToString
public class CustomOAuth2User extends DefaultOidcUser {

    private final Long userId;

    public CustomOAuth2User(Long userId, OidcIdToken idToken, OidcUserInfo userInfo) {
        super(List.of(new SimpleGrantedAuthority("ROLE_USER")), idToken, userInfo);
        this.userId = userId;
    }
}
