package msps.back.entity.base;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Getter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public class TimeBaseEntity {

    @CreatedDate
    @Column(updatable = false)
    protected Instant createdAt;

    protected Instant deletedAt;

    protected Instant updatedAt;

    public void softDelete() {
        this.deletedAt = Instant.now().truncatedTo(ChronoUnit.SECONDS);
    }
}
