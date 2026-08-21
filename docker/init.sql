-- 컨테이너를 처음 띄울 때(볼륨이 비어있을 때) 딱 한 번만 실행됨.
-- dev용 / 운영(prod)용 DB를 분리해서, dev 프로파일의 ddl-auto=create-drop이
-- 운영(msps_prod) 데이터를 건드리지 않도록 한다.
--
-- 테이블 스키마는 이 파일(SQL)이 기준이다. back의 JPA 엔티티는 이 구조에 맞춰서 작성한다.
-- prod는 ddl-auto=validate라서 Hibernate가 테이블을 새로 만들어주지 않으므로, msps_prod의
-- 테이블은 반드시 여기서 미리 만들어둬야 한다. msps_dev는 어차피 dev 프로파일의
-- ddl-auto=create-drop이 앱 켤 때마다 새로 만들지만, 여기서도 동일하게 만들어서 back 없이도
-- 바로 테스트할 수 있게 해둔다.

CREATE DATABASE IF NOT EXISTS msps_dev  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS msps_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 프로시저는 임시로 만들어서 끝에 DROP할 거라, 어디 만들든 상관없지만
-- CREATE PROCEDURE는 현재 선택된 DB가 있어야 하므로 하나를 선택해둔다.
USE msps_dev;

DELIMITER $$

CREATE PROCEDURE msps_create_schema(IN target_db VARCHAR(64))
BEGIN
    SET @create_menu = CONCAT('CREATE TABLE IF NOT EXISTS `', target_db, '`.`menu` (
        `menu_id` INT AUTO_INCREMENT PRIMARY KEY,
        `day` INT NOT NULL,
        `recipe` TEXT,
        UNIQUE KEY `uk_menu_day` (`day`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
    PREPARE stmt FROM @create_menu; EXECUTE stmt; DEALLOCATE PREPARE stmt;

    SET @create_ingredient = CONCAT('CREATE TABLE IF NOT EXISTS `', target_db, '`.`ingredient` (
        `ingredient_id` INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(255) NOT NULL,
        `type` VARCHAR(255),
        UNIQUE KEY `uk_ingredient_name` (`name`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
    PREPARE stmt FROM @create_ingredient; EXECUTE stmt; DEALLOCATE PREPARE stmt;

    SET @create_menu_ingredient = CONCAT('CREATE TABLE IF NOT EXISTS `', target_db, '`.`menu_ingredient` (
        `menu_ingredient_id` INT AUTO_INCREMENT PRIMARY KEY,
        `menu_id` INT NOT NULL,
        `ingredient_id` INT NOT NULL,
        `amount_type` ENUM(''EXACT'', ''APPROX'') NOT NULL,
        `amount_value` INT NULL,
        `amount_unit` VARCHAR(20) NULL,
        `amount_text` VARCHAR(255) NULL,
        UNIQUE KEY `uk_menu_ingredient` (`menu_id`, `ingredient_id`),
        CONSTRAINT `fk_mi_menu` FOREIGN KEY (`menu_id`) REFERENCES `', target_db, '`.`menu` (`menu_id`)
            ON DELETE CASCADE,
        CONSTRAINT `fk_mi_ingredient` FOREIGN KEY (`ingredient_id`) REFERENCES `', target_db, '`.`ingredient` (`ingredient_id`)
            ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
    PREPARE stmt FROM @create_menu_ingredient; EXECUTE stmt; DEALLOCATE PREPARE stmt;
END$$

DELIMITER ;

CALL msps_create_schema('msps_dev');
CALL msps_create_schema('msps_prod');

DROP PROCEDURE msps_create_schema;
