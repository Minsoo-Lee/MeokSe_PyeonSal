package msps.back.auth;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import msps.back.dto.request.UserEditRequest;
import msps.back.dto.request.UserSignupRequest;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@ToString
public class CustomOAuth2User extends DefaultOidcUser {

    private final Long userId;

    public CustomOAuth2User(Long userId, OidcIdToken idToken, OidcUserInfo userInfo) {
        super(List.of(new SimpleGrantedAuthority("ROLE_USER")), idToken, userInfo);
        this.userId = userId;
    }
}
