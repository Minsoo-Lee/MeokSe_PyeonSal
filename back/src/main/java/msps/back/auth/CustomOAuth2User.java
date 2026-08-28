package msps.back.auth;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import msps.back.dto.request.UserEditRequest;
import msps.back.dto.request.UserSignupRequest;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@ToString
public class CustomOAuth2User implements OAuth2User {

    private String userId;
    private String name;
    private String provider;
    private String providerId;

    private Map<String, Object> attributes;

    public CustomOAuth2User(
            String userId,
            String name,
            String provider,
            String providerId,
            Map<String, Object> attributes) {
        this.userId = userId;
        this.name = name;
        this.provider = provider;
        this.providerId = providerId;
        this.attributes = attributes;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    public Long getLongId() {
        return Long.valueOf(this.userId);
    }

    public void setAfterSignup(String userId, UserSignupRequest dto) {
        this.userId = userId;
        this.name = dto.name();
    }

    public void setAfterUserEdit(UserEditRequest dto) {
        this.name = dto.name();
    }
}
