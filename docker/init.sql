-- 컨테이너를 처음 띄울 때(볼륨이 비어있을 때) 딱 한 번만 실행됨.
-- dev용 / 운영(prod)용 DB를 분리해서, dev 프로파일의 ddl-auto=create-drop이
-- 운영(msps_prod) 데이터를 건드리지 않도록 한다.

CREATE DATABASE IF NOT EXISTS msps_dev  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS msps_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
