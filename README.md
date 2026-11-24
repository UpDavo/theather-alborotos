# Theater Path · Armando All-Borotos

Línea de tiempo técnica de la obra para seguir en un iPad: cada tap avanza un **pie** y muestra
qué deben hacer Sonido/Video, Luces, Escenario/Telón y Actores/Utilería.

## Uso

```bash
npm install
npm run dev        # o: npm run build && npm start
```

Abrir en el iPad (misma Wi-Fi): `http://<IP-de-la-Mac>:3000`.
En Safari: Compartir → "Agregar a pantalla de inicio" para verla a pantalla completa.

- Tocar la tarjeta o **Siguiente**: avanza. Deslizar ← → : adelante / atrás.
- Teclado o clicker Bluetooth: → / espacio / AvPág avanza, ← / RePág retrocede.
- **Mi rol**: resalta un área y avisa cuántos pies faltan para su próxima acción.
- **Libreto**: lista completa por escena; tocar un pie salta a él.
- La posición se guarda: si se recarga la página, sigue en el mismo pie.
- Cada área marca **Acción** (hay que hacer algo) o **Mantener** (vacío, "Mantener", "Sin cambio"
  o igual al pie anterior). Las etiquetas **Por confirmar** y **Opcional** salen del texto.

## Actualizar el libreto

Reemplazar `data/Libreto_tecnico_Armando_Allborotos.xlsx` y correr (requiere `pip install openpyxl`):

```bash
npm run import:libreto
```

Genera `src/data/libreto.json`, que es lo que usa la app.
