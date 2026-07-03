DROP DATABASE IF EXISTS cargo_system;

CREATE DATABASE cargo_system
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE cargo_system;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('sender','driver') NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE
);

CREATE TABLE company (
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    company_code VARCHAR(50) UNIQUE NOT NULL,
    company_name VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    commission_percent DECIMAL(5,2)
);

CREATE TABLE company_phone (
    phone_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT,
    phone VARCHAR(20),
    FOREIGN KEY (company_id)
        REFERENCES company(company_id)
        ON DELETE CASCADE
);

CREATE TABLE sender (
    sender_id INT AUTO_INCREMENT PRIMARY KEY,

    admin_id INT NOT NULL,

    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255),
    email VARCHAR(100) UNIQUE,

    city VARCHAR(100),
    street VARCHAR(100),
    alley VARCHAR(100),
    house_number VARCHAR(20),

    FOREIGN KEY(admin_id)
        REFERENCES admin(admin_id)
);

CREATE TABLE driver (
    driver_id INT AUTO_INCREMENT PRIMARY KEY,

    admin_id INT NOT NULL,
    company_id INT NULL,

    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255),
    email VARCHAR(100),

    city VARCHAR(100),
    street VARCHAR(100),
    alley VARCHAR(100),
    house_number VARCHAR(20),

    birth_date DATE,
    work_experience INT,

    license_number VARCHAR(50) UNIQUE,

    disease VARCHAR(255),

    gender ENUM('male','female'),

    current_location POINT,
    
    status ENUM(
        'available',
        'loading',
        'on_route',
        'delivered'

    ) DEFAULT 'available',

    FOREIGN KEY(admin_id)
        REFERENCES admin(admin_id),

    FOREIGN KEY(company_id)
        REFERENCES company(company_id)
);

CREATE TABLE vehicle (
    vehicle_id INT AUTO_INCREMENT PRIMARY KEY,

    driver_id INT UNIQUE,

    cargo_dimensions VARCHAR(100),

    vehicle_type ENUM(
        'truck',
        'trailer',
        'pickup',
        'khavar'
    ),

    refrigerator BOOLEAN DEFAULT FALSE,

    depreciation DECIMAL(10,2),

    plate_number VARCHAR(30) UNIQUE,

    FOREIGN KEY(driver_id)
        REFERENCES driver(driver_id)
);

CREATE TABLE cargo (
    cargo_id INT AUTO_INCREMENT PRIMARY KEY,

    sender_id INT NOT NULL,

    weight DECIMAL(10,2),

    cargo_type ENUM(
        'food',
        'furniture',
        'construction_material'
    ),

    refrigerator_required BOOLEAN DEFAULT FALSE,

    status ENUM(
        'waiting',
        'loading',
        'unloading',
        'on_route'
    ) DEFAULT 'waiting',

    FOREIGN KEY(sender_id)
        REFERENCES sender(sender_id)
);

CREATE TABLE rules (
    rule_id INT AUTO_INCREMENT PRIMARY KEY,

    cargo_type ENUM(
        'food',
        'furniture',
        'construction_material'
    ),

    cargo_feature BOOLEAN,

    vehicle_type ENUM(
        'truck',
        'trailer',
        'pickup',
        'khavar'
    ),

    vehicle_feature BOOLEAN,

    weight_rate DECIMAL(10,2),

    distance_rate DECIMAL(10,2),

    time_rate DECIMAL(10,2),

    company_percent DECIMAL(5,2),

    delay_penalty_per_hour DECIMAL(10,2)
);

CREATE TABLE request (
    request_id INT AUTO_INCREMENT PRIMARY KEY,

    sender_id INT NOT NULL,

    driver_id INT NULL,

    rule_id INT NOT NULL,

    cargo_id INT UNIQUE,

    origin_location POINT,

    destination_location POINT,

    distance_km DECIMAL(10,2),

    estimated_time INT,

    loading_datetime DATETIME,

    delivery_datetime DATETIME,

    receiver_name VARCHAR(100),

    receiver_phone VARCHAR(20),

    price DECIMAL(12,2),

    status ENUM(
        'pending',
        'accepted',
        'on_route',
        'delivered',
        'cancelled'
    ) DEFAULT 'pending',

    delivery_code VARCHAR(10) NULL,

    FOREIGN KEY(sender_id)
        REFERENCES sender(sender_id),

    FOREIGN KEY(driver_id)
        REFERENCES driver(driver_id),

    FOREIGN KEY(rule_id)
        REFERENCES rules(rule_id),

    FOREIGN KEY(cargo_id)
        REFERENCES cargo(cargo_id)
);

CREATE TABLE rating (

    sender_id INT,
    driver_id INT,
    request_id INT,

    score INT CHECK(score BETWEEN 1 AND 10),

    comment TEXT,

    rating_datetime DATETIME,

    rated_by ENUM(
        'sender',
        'driver'
    ),

    rated_user ENUM(
        'sender',
        'driver'
    ),

    PRIMARY KEY(
        sender_id,
        driver_id,
        request_id
    ),

    FOREIGN KEY(sender_id)
        REFERENCES sender(sender_id),

    FOREIGN KEY(driver_id)
        REFERENCES driver(driver_id),

    FOREIGN KEY(request_id)
        REFERENCES request(request_id)
);

CREATE INDEX idx_driver_status
ON driver(status);

CREATE INDEX idx_request_status
ON request(status);

CREATE INDEX idx_cargo_type
ON cargo(cargo_type);

CREATE INDEX idx_driver_company
ON driver(company_id);