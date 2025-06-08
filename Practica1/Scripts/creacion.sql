DROP DATABASE IF EXISTS hotel_db;

CREATE DATABASE hotel_db;

USE hotel_db;

CREATE TABLE CLIENTE (
	id_cliente INT NOT NULL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(75),
    telefono VARCHAR(8)
);

CREATE TABLE HABITACION (
	id_habitacion INT NOT NULL PRIMARY KEY,
    tipo VARCHAR(45) NOT NULL,
    precio DECIMAL NOT NULL
);

CREATE TABLE LOG_HABITACION (
	timestamp DATETIME,
    status VARCHAR(100),
    id_habitacion INT,
    CONSTRAINT fk_log_habitacion_id FOREIGN KEY (id_habitacion) REFERENCES HABITACION(id_habitacion)
);

CREATE TABLE RESERVA (
	id_reserva INT NOT NULL PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_habitacion INT NOT NULL,
    fecha_entrada DATETIME NOT NULL,
    fecha_salida DATETIME NOT NULL,
    CONSTRAINT fk_cliente_id FOREIGN KEY (id_cliente) REFERENCES CLIENTE(id_cliente),
    CONSTRAINT fk_habitacion_id FOREIGN KEY (id_habitacion) REFERENCES HABITACION(id_habitacion)
);

CREATE TABLE PAGO (
	id_pago INT NOT NULL PRIMARY KEY,
    id_reserva INT,
    fecha_pago DATETIME,
    monto DECIMAL,
    metodo_pago VARCHAR(25),
    CONSTRAINT fk_reserva_id FOREIGN KEY (id_reserva) REFERENCES RESERVA(id_reserva)
);
