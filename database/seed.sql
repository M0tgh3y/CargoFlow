USE cargo_system;

-- =========================
-- ADMIN
-- =========================

INSERT INTO admin
(full_name, phone, username, password, email)
VALUES
(
    'Admin One',
    '09120000001',
    'admin1',
    '123456',
    'admin1@gmail.com'
),
(
    'Admin Two',
    '09120000002',
    'admin2',
    '123456',
    'admin2@gmail.com'
);

-- =========================
-- COMPANY
-- =========================

INSERT INTO company
(company_code, company_name, city, commission_percent)
VALUES
(
    'CMP001',
    'Fast Cargo',
    'Tehran',
    10.00
),
(
    'CMP002',
    'Express Transport',
    'Mashhad',
    15.00
);

-- =========================
-- COMPANY PHONE
-- =========================

INSERT INTO company_phone
(company_id, phone)
VALUES
(1,'02111111111'),
(1,'02111111112'),
(2,'05122222222');

-- =========================
-- SENDER
-- =========================

INSERT INTO sender
(
    admin_id,
    full_name,
    phone,
    username,
    password,
    email,
    city,
    street,
    alley,
    house_number
)
VALUES
(
    1,
    'Ali Ahmadi',
    '09121111111',
    'ali',
    '123456',
    'ali@gmail.com',
    'Tehran',
    'Azadi',
    '10',
    '20'
),
(
    2,
    'Reza Mohammadi',
    '09122222222',
    'reza',
    '123456',
    'reza@gmail.com',
    'Mashhad',
    'Imam Reza',
    '5',
    '15'
);

-- =========================
-- DRIVER
-- =========================

INSERT INTO driver
(
    admin_id,
    company_id,
    full_name,
    phone,
    username,
    password,
    email,
    city,
    street,
    alley,
    house_number,
    birth_date,
    work_experience,
    license_number,
    disease,
    gender,
    current_location
)
VALUES
(
    1,
    1,
    'Hossein Driver',
    '09123333333',
    'driver1',
    '123456',
    'driver1@gmail.com',
    'Tehran',
    'Valiasr',
    '2',
    '30',
    '1990-05-10',
    8,
    'LIC001',
    NULL,
    'male',
    ST_GeomFromText('POINT(51.3890 35.6892)',4326)
),
(
    2,
    NULL,
    'Mahdi Driver',
    '09124444444',
    'driver2',
    '123456',
    'driver2@gmail.com',
    'Karaj',
    'Shahid Beheshti',
    '8',
    '10',
    '1988-03-01',
    12,
    'LIC002',
    NULL,
    'male',
    ST_GeomFromText('POINT(50.9378 35.8400)',4326)
);

-- =========================
-- VEHICLE
-- =========================

INSERT INTO vehicle
(
    driver_id,
    cargo_dimensions,
    vehicle_type,
    refrigerator,
    depreciation,
    plate_number
)
VALUES
(
    1,
    '6x2x2',
    'truck',
    TRUE,
    15.00,
    '11A11111'
),
(
    2,
    '12x2.5x3',
    'trailer',
    FALSE,
    22.00,
    '22B22222'
);

-- =========================
-- CARGO
-- =========================

INSERT INTO cargo
(
    sender_id,
    weight,
    cargo_type,
    refrigerator_required
)
VALUES
(
    1,
    1500,
    'food',
    TRUE
),
(
    2,
    5000,
    'construction_material',
    FALSE
);

-- =========================
-- RULES
-- =========================

INSERT INTO rules
(
    cargo_type,
    cargo_feature,
    vehicle_type,
    vehicle_feature,
    weight_rate,
    distance_rate,
    time_rate,
    company_percent,
    delay_penalty_per_hour
)
VALUES
(
    'food',
    TRUE,
    'truck',
    TRUE,
    2.5,
    10,
    5,
    10,
    50
),
(
    'construction_material',
    FALSE,
    'trailer',
    FALSE,
    1.8,
    8,
    4,
    15,
    40
);

-- =========================
-- REQUEST
-- =========================

INSERT INTO request
(
    sender_id,
    driver_id,
    rule_id,
    cargo_id,

    origin_location,
    destination_location,

    loading_datetime,
    delivery_datetime,

    receiver_name,
    receiver_phone
)
VALUES
(
    1,
    1,
    1,
    1,

    ST_GeomFromText('POINT(51.3890 35.6892)',4326),
    ST_GeomFromText('POINT(59.6062 36.2605)',4326),

    '2026-06-20 08:00:00',
    '2026-06-20 14:00:00',

    'Receiver One',
    '09125555555'

),
(
    2,
    2,
    2,
    2,

    ST_GeomFromText('POINT(59.6062 36.2605)',4326),
    ST_GeomFromText('POINT(51.3890 35.6892)',4326),

    '2026-06-21 09:00:00',
    '2026-06-21 16:00:00',

    'Receiver Two',
    '09126666666'

);

-- =========================
-- RATING
-- =========================

INSERT INTO rating
(
    sender_id,
    driver_id,
    request_id,
    score,
    comment,
    rating_datetime,
    rated_by,
    rated_user
)
VALUES
(
    1,
    1,
    1,
    5,
    'Excellent driver',
    NOW(),
    'sender',
    'driver'
),
(
    2,
    2,
    2,
    4,
    'Good sender',
    NOW(),
    'driver',
    'sender'
);