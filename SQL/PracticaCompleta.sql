/*  
--------------------------------------------------------------------
                              ENUNCIADO 1 
--------------------------------------------------------------------                              
*/

/*
Explora el fichero flights y analiza:
*/
select * 
from flights;

--  1. Cuántos registros hay en total
select 
  count(*) as total_flights
from flights;


-- 2. Cuántos vuelos distintos hay
select 
  count(distinct unique_identifier) as total_distinct_flights
from flights;

-- 3. Cuántos vuelos tienen más de un registro
select unique_identifier,
  count(unique_identifier) as registers_per_flight
from flights
group by unique_identifier
having count(unique_identifier) > 1;


/*  
--------------------------------------------------------------------
                              ENUNCIADO 2 
--------------------------------------------------------------------                              
*/

/*
Por qué hay registro duplicados para un mismo vuelo. Para ello, selecciona varios vuelos y
analiza la evolución temporal de cada vuelo.

1. Qué información cambia de un registro a otro
*/
select fl.*
from flights fl


/*Obtenemos los vuelos que se repiten más de una vez*/
SELECT fl.unique_identifier as id_vuelo, COUNT(fl.*) AS total_registros 
FROM flights fl
WHERE fl.updated_at is not null
GROUP BY unique_identifier
HAVING COUNT(*) > 1;

/*Cogemos un vuelo aleatorio que se repita. Mostramos los datos ordenando por fecha de update y se analiza la evolución temporal*/
select fl.*
from flights fl
where fl.unique_identifier = 'AF-271-20250714-CDG-MAD'
order by fl.updated_at

/*CONCLUSION FINAL*/

/*
Se observa que el sistema genera varias actualizaciones del mismo vuelo a lo largo del tiempo (Se observa un patrón que es cada 6h).
En los primeros registros la información está incompleta, ya que todavía no se conocen los datos reales del vuelo. 
En el registro final se añaden los datos completos, como las horas reales de salida y llegada y el retraso.
*/

/*  
--------------------------------------------------------------------
                              ENUNCIADO 3 
--------------------------------------------------------------------                              
*/

/*
Evalúa la calidad del dato. La calidad del dato nos indica si la información es consistente,
completa, coherente y representa una realidad verosímil. Para ello debemos establecer
unos criterios:
*/

/*
1. La información de created_at debe ser única para cada vuelo aunque tenga más de
un registro.
*/
SELECT unique_identifier, COUNT(DISTINCT created_at) AS total_created
FROM flights
GROUP BY unique_identifier
HAVING COUNT(DISTINCT created_at) > 1;

/*
No devuelve ningún registro, por lo que es correcto.
*/


/*
2. La información de updated_at deber ser igual o más que la información de
created_at, lo que nos indica coherencia y consistencia
*/

SELECT *
FROM flights
WHERE updated_at < created_at;

/*Tampoco devuelve ningún registro, por lo que la información muestra coherencia y consistencia*/

/*  
--------------------------------------------------------------------
                              ENUNCIADO 4 
--------------------------------------------------------------------                              
*/

/*
El último estado de cada vuelo. Cada vuelo puede aparecer varias veces en el dataset, para
avanzar con nuestro análisis necesitamos quedarnos solo con el último registro de cada
vuelo.
Puedes crear una tabla o vista resultante de esta query en tu base de datos local, la
utilizaremos en los siguientes enunciados. Si prefieres no guardar la última información,
tendrás que hacer uso de esa query como una CTE en los enunciados siguientes.
*/

CREATE VIEW last_flights AS
SELECT *
FROM flights f
WHERE updated_at = (
    SELECT MAX(updated_at)
    FROM flights
    WHERE unique_identifier = f.unique_identifier
);


/*Verificamos que solo hay un registro por vuelo*/
SELECT unique_identifier, COUNT(*)
FROM last_flights
GROUP BY unique_identifier
HAVING COUNT(*) > 1;

/*No devuelve ningún registro por lo que parece que ha funcionado bien*/

/*  
--------------------------------------------------------------------
                              ENUNCIADO 5 
--------------------------------------------------------------------                              
*/

/*
Considerando que los campos local_departure y local_actual_departure son necesarios
para el análisis, valida y reconstruye estos valores siguiendo estas reglas:

1. Si local_departure es nulo, utiliza created_at.
2. Si local_actual_departure es nulo, utiliza local_departure. Si este también es nulo,
utiliza created_at.

Crea dos nuevos campos:
● effective_local_departure
● effective_local_actual_departure
Extra:
Realiza las validaciones para los campos local_arrival y local_actual_arrival.*/

SELECT 
    lf.*,
    CASE 
        WHEN local_departure IS NULL THEN created_at
        ELSE local_departure
    END AS effective_local_departure,
    CASE 
        WHEN local_actual_departure IS NOT NULL THEN local_actual_departure
        WHEN local_departure IS NOT NULL THEN local_departure
        ELSE created_at
    END AS effective_local_actual_departure,
    CASE 
        WHEN local_arrival IS NULL THEN created_at
        ELSE local_arrival
    END AS effective_local_arrival,
    CASE 
        WHEN local_actual_arrival IS NOT NULL THEN local_actual_arrival
        WHEN local_arrival IS NOT NULL THEN local_arrival
        ELSE created_at
    END AS effective_local_actual_arrival

FROM last_flights lf;

/*  
--------------------------------------------------------------------
                              ENUNCIADO 6 
--------------------------------------------------------------------                              
*/

/*
Análisis del estado del vuelo. Haciendo uso del resultado del enunciado 4, analiza los
estados de los vuelos.
*/
select *
from last_flights

/*
1. Qué estados de vuelo existen
*/

SELECT DISTINCT lf.arrival_status
FROM last_flights lf;

/*
2. Cuántos vuelos hay por cada estado
*/

SELECT 
    lf.arrival_status,
    COUNT(lf.*) AS total_vuelos
FROM last_flights lf
GROUP BY lf.arrival_status;

/*
¿Podrías decir qué significa las siglas de cada estado?
*/
select *
from last_flights

select *
from last_flights
where arrival_status = 'CX'

/*
Comparando los estados con los delay_mins, se puede deducir que:
El estado "OT" significa "On Time", el vuelo llegó a tiempo o antes de lo previsto.
El estado "DY" significa "Delayed" , el vuelo llegó con retraso
El estado "CX", como se da cuando los delay_mins == null, se entiende que significa "Cancelled"
*/

/*  
--------------------------------------------------------------------
                              ENUNCIADO 7 
--------------------------------------------------------------------                              
*/

/*
País de salida de cada vuelo. Tienes disponible un csv. con información de aeropuertos
airports.csv. Haciendo uso del resultado del enunciado 4, analiza los aeropuertos de salida.
*/

/*
1. De qué país despegan los vuelos
*/
SELECT DISTINCT ai.country
FROM last_flights lf
JOIN airports ai
ON lf.departure_airport = ai.airport_code;

/*
2. Cuántos vuelos despegan por país
*/

SELECT 
    ai.country,
    COUNT(*) AS total_vuelos
FROM last_flights lf
JOIN airports ai
ON lf.departure_airport = ai.airport_code
GROUP BY ai.country
ORDER BY total_vuelos DESC;

/*  
--------------------------------------------------------------------
                              ENUNCIADO 8 
--------------------------------------------------------------------                              
*/

/*
Delay medio y estado de vuelo por país de salida. Haciendo uso del resultado del enunciado
4, analiza el estado y el delay/retraso medio con el objetivo de identificar si existen países
que pueden presentar problemas operativos en los aeropuertos de salida.
*/

/*
1. Cuál es el delay medio por país
*/

SELECT 
    aia.country,
    AVG(lf.delay_mins) AS delay_medio
FROM last_flights lf
JOIN airports ai
ON lf.departure_airport = a.airport_code
GROUP BY a.country
ORDER BY delay_medio DESC;

/*
2. Cuál es la distribución de estados de vuelos por país.
*/

SELECT 
    ai.country,
    lf.arrival_status,
    COUNT(*) AS total_vuelos
FROM last_flights lf
JOIN airports ai 
ON lf.departure_airport = ai.airport_code
GROUP BY ai.country, lf.arrival_status
ORDER BY ai.country;

/*
Extra:
Representa gráficamente la distribución de estados por país. Puedes dibujar un gráfico de
barras o representarlo como creas que mejor se visualiza.
*/

/*Imagen adjuntada en el repositorio aparte*/

/*  
--------------------------------------------------------------------
                              ENUNCIADO 9 
--------------------------------------------------------------------                              
*/

/*
El estado de vuelo por país y por época del año. Dado que no en todas las épocas del año
las condiciones climatólogicas son iguales, analiza si la estaciones del año impactan en el
delay medio por país. Considera la siguiente clasificación de meses del año por época:
● Invierno: diciembre, enero, febrero
● Primavera: marzo, abril, mayo
● Verano: junio, julio, agosto
● Otoño: septiembre, octubre, noviembre
*/

SELECT 
    ai.country,
    CASE
        WHEN EXTRACT(MONTH FROM lf.local_departure) IN (12,1,2) THEN 'Invierno'
        WHEN EXTRACT(MONTH FROM lf.local_departure) IN (3,4,5) THEN 'Primavera'
        WHEN EXTRACT(MONTH FROM lf.local_departure) IN (6,7,8) THEN 'Verano'
        ELSE 'Otoño'
    END AS estacion,
    lf.arrival_status,
    COUNT(*) AS total_vuelos
FROM last_flights lf
JOIN airports ai
ON lf.departure_airport = ai.airport_code
GROUP BY ai.country, estacion, lf.arrival_status
ORDER BY ai.country, estacion;

/*  
--------------------------------------------------------------------
                              ENUNCIADO 10
--------------------------------------------------------------------                              
*/

/*
Frecuencia de actualización de los vuelos. Volviendo al análisis de la calidad del dataset,
explora con qué frecuencia se registran actualizaciones de cada vuelo y calcula la
frecuencia media de actualización por aeropuerto de salida.
*/

/*Frecuencias de actualizaciones de vuelos*/
WITH actualizaciones_vuelo AS (
    SELECT 
        unique_identifier,
        departure_airport,
        MAX(updated_at) - MIN(updated_at) AS frecuencia_actualizacion
    FROM flights
    GROUP BY unique_identifier, departure_airport
)
SELECT *
FROM actualizaciones_vuelo;

/*Para obtener la frecuencia media de actualización por aeropuerto de salida*/
WITH actualizaciones_vuelo AS (
    SELECT 
        unique_identifier,
        departure_airport,
        MAX(updated_at) - MIN(updated_at) AS tiempo_actualizacion
    FROM flights
    GROUP BY unique_identifier, departure_airport
)
SELECT 
    departure_airport,
    AVG(tiempo_actualizacion) AS frecuencia_media_actualizacion
FROM actualizaciones_vuelo
GROUP BY departure_airport
ORDER BY departure_airport;

/*  
--------------------------------------------------------------------
                              ENUNCIADO 11
--------------------------------------------------------------------                              
*/

/*
Consistencia del dato. El campo unique_identifier identifica el vuelo y se construye con:
aerolínea, número de vuelo, fecha y aeropuertos. Para cada vuelo (último snapshot),
comprueba si la información del unique_identifier es consistente con las columnas del
dataset.
*/
WITH vuelos_check AS (
    SELECT 
        lf.*,
        CASE 
            WHEN split_part(unique_identifier,'-',1) = airline_code
             AND split_part(unique_identifier,'-',4) = departure_airport
             AND split_part(unique_identifier,'-',5) = arrival_airport
             AND split_part(unique_identifier,'-',3) = to_char(local_departure,'YYYYMMDD')
            THEN TRUE
            ELSE FALSE
        END AS is_consistent
    FROM last_flights lf
)

SELECT *
FROM vuelos_check;

/*
1. Crea un flag is_consistent.
*/

WITH vuelos_check AS (
    SELECT 
        lf.*,
        CASE 
            WHEN split_part(unique_identifier,'-',1) = airline_code
             AND split_part(unique_identifier,'-',4) = departure_airport
             AND split_part(unique_identifier,'-',5) = arrival_airport
             AND split_part(unique_identifier,'-',3) = to_char(local_departure,'YYYYMMDD')
            THEN TRUE
            ELSE FALSE
        END AS is_consistent
    FROM last_flights lf
)
SELECT *
FROM vuelos_check;

/*
2. Calcula cuántos vuelos no son consistentes.
*/

WITH vuelos_check AS (
    SELECT 
        lf.*,
        CASE 
            WHEN split_part(unique_identifier,'-',1) = airline_code
             AND split_part(unique_identifier,'-',4) = departure_airport
             AND split_part(unique_identifier,'-',5) = arrival_airport
             AND split_part(unique_identifier,'-',3) = to_char(local_departure,'YYYYMMDD')
            THEN TRUE
            ELSE FALSE
        END AS is_consistent
    FROM last_flights lf
)
SELECT COUNT(*) AS vuelos_no_consistentes
FROM vuelos_check
WHERE is_consistent = FALSE;

/*
3. Usando la tabla airlines, muestra el nombre de la aerolínea y cuántos vuelos no
consistentes tiene.*/

WITH vuelos_check AS (
    SELECT 
        lf.*,
        CASE 
            WHEN split_part(unique_identifier,'-',1) = airline_code
             AND split_part(unique_identifier,'-',4) = departure_airport
             AND split_part(unique_identifier,'-',5) = arrival_airport
             AND split_part(unique_identifier,'-',3) = to_char(local_departure,'YYYYMMDD')
            THEN TRUE
            ELSE FALSE
        END AS is_consistent
    FROM last_flights lf
)

SELECT 
    a.name AS airline,
    COUNT(*) AS vuelos_no_consistentes
FROM vuelos_check v
JOIN airlines a 
ON v.airline_code = a.airline_code
WHERE v.is_consistent = FALSE
GROUP BY a.name
ORDER BY vuelos_no_consistentes DESC;