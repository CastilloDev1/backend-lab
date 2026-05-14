# Lost Update

## Fallo

Dos transacciones leen el mismo valor y escriben en base a una lectura obsoleta/vieja.

## Daño

El stock (u otro contador) queda incorrecto: se pierde una actualización concurrente.

## Escenario 01: broken

**Endpoint:**  
`POST /lost-update/broken/discount`

**Body ejemplo:** `{ "id": 1, "name": "Producto 1", "quantity": 2 }`

**Resultado esperado:**  
Con concurrencia y ventana artificial, dos descuentos concurrentes pueden dejar un stock menor al esperado (lost update).

## Escenario 02: atomic update

**Endpoint:**  
`POST /lost-update/atomic-update/discount`

**Body ejemplo:** `{ "id": 1, "name": "Producto 1", "quantity": 2 }`

**Resultado esperado:**  
Un solo `UPDATE` condicional en PostgreSQL evita el read-modify-write en memoria; bajo la misma carga, el stock refleja todas las restas aplicadas de forma segura.
