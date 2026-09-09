# 🏀 UCAM Murcia CB - Monitorización de Progreso del Delegado

Este documento registra los objetivos, especificaciones, arquitectura y fases de desarrollo de la aplicación de **Gestión de Horarios y Envío Automatizado por WhatsApp** para el Delegado del **UCAM Murcia Club de Baloncesto**.

---

## 📋 1. Requisitos del Delegado (User Requirements)

1. **Gestión de Actividades Diarias con Horarios (ej: 10:45 AM, 7:30 PM, etc.)**:
   - `Individual Work Out` (Trabajo individual por jugador)
   - `Positional Work Out` (Trabajo por posiciones: bases, exteriores, interiores)
   - `Team Practice` (Entrenamiento de equipo: selector **Taped** / **Not Taped**)
   - `Taping Session` (Sesión de vendajes previos con fisioterapia)
   - `Weights` (Sesión de gimnasio / pesas / fuerza)
   - `Video Meeting` (Sesión de vídeo y scouting táctico)
   - `Recovery` (Recuperación activa, fisioterapia, crioterapia)
   - `Team Event` (Acto de equipo, compromisos institucionales / prensa)
   - `Team Meal` (Comida de equipo: opciones **Breakfast**, **Lunch**, **Dinner**, **Snack**)
   - `Departure Time` (Hora de salida / viaje: opción **With luggage** / **Without luggage**)
   - `+ Actividad Personalizada` (Añadir cualquier actividad con hora, lugar, enlace a Google Maps y notas)
   - **Localización con Google Maps**: Posibilidad de incluir el enlace directo de Google Maps en cada actividad.

2. **Tipos de Destinatarios y Envíos**:
   - Enviar a los **jugadores de forma individual** (itinerario personalizado en inglés con sus horas exactas de workout/vendaje + horarios colectivos).
   - Enviar a los **técnicos/staff de forma individual** (itinerario con desglose técnico y horarios).
   - Enviar a los **jugadores de forma colectiva** (mensaje para el grupo de WhatsApp de jugadores).
   - Enviar a los **técnicos de forma colectiva** (mensaje para el grupo de WhatsApp de entrenadores).
   - Enviar a **todos los miembros del equipo en su conjunto** (plan oficial para el grupo general).

3. **Reglas Estrictas de Formato de Mensajes WhatsApp**:
   - **Idioma:** 100% redactados en inglés (`INDIVIDUAL WORK OUT`, `TEAM PRACTICE [TAPED]`, etc.).
   - **Sin Emojis:** Prohibido el uso de emojis en los mensajes salientes.
   - **Sin Líneas:** Prohibido el uso de líneas horizontales separadoras.
   - **Encabezado Limpio:** Eliminado el título de jornada o partido en el encabezado. Se inicia directamente con `UCAM MURCIA CB` y la fecha formateada en inglés.
   - **Indumentaria:** Eliminado el ítem de indumentaria/ropa.

4. **Integración con WhatsApp y Grupos**:
   - Asociación de cada miembro a su número de teléfono (+34 prefijo internacional).
   - Soporte para enlaces directos de grupos de WhatsApp (`https://chat.whatsapp.com/...`) y WhatsApp Web.
   - Enlaces directos de apertura WhatsApp Web / App (`wa.me/34XXXXXXXXX?text=...`).
   - Cola de envío automatizada y asistida (secuencial paso a paso o directo).

5. **Programación de Envíos (Scheduled Send)**:
   - Configuración de hora y fecha para programar el envío automático de la jornada.
   - Cuenta atrás visual, comprobación periódica y notificaciones de sistema.
   - Registro de histórico y logs de envíos realizados.

6. **Identidad Visual UCAM Murcia y Plantilla Oficial**:
   - Escudo oficial UCAM Murcia Club de Baloncesto.
   - Plantilla oficial de jugadores: Juani Marcos, Souley Boum, Mike Forrest, Dylan Ennis, Jonah Radebaugh, Howard Sant-Ross, Sander Raieste, Will Falk, Rubén López de la Torre, Kaiser Gates, Toni Nakic, Marcis Steinbergs, Jean - Marc Pansa, Emanuel Cate, Moussa Diagne, Joao Neves, Pablo Sevilla.
   - Staff técnico y médico: Sito Alonso, Lucas Pérez, Dimitris Tsesmetzis, Antonio Lozano, Manu Marín, Rogelio Diz, Pablo Ortín, Carlos Grávalos, José Antonio Pangua, Alejandro Gómez, José Miguel Garrido, Felipe Meseguer, Toze Mota, Adrián Díaz, Ermes Renolfi.

---

## 🚀 2. Estado de Ejecución y Fases

| Fase | Tarea / Módulo | Estado | Detalles |
| :--- | :--- | :---: | :--- |
| **Fase 1** | Modelos de Datos TypeScript | ✅ Actualizado | `src/types.ts` con soporte `locationUrl`, enlaces de grupo y eliminación de `dressCode`. |
| **Fase 2** | Plantilla Oficial UCAM Murcia | ✅ Actualizado | `src/data/defaultRoster.ts` con los 17 jugadores y 15 miembros del staff técnico. |
| **Fase 3** | Motor WhatsApp en Inglés (Sin Emojis/Líneas) | ✅ Actualizado | `src/utils/whatsappGenerator.ts` con formato en inglés y sin emojis ni líneas horizontales. |
| **Fase 4** | Constructor con Google Maps y Sin Indumentaria | ✅ Actualizado | `src/components/ScheduleBuilder.tsx` con generador de enlaces de Google Maps y sin campos de ropa. |
| **Fase 5** | Panel de Envío WhatsApp y Enlace a Grupos | ✅ Actualizado | `src/components/WhatsAppDispatchPanel.tsx` con soporte para grupos de WhatsApp y vista previa. |
| **Fase 6** | Gestor de Contactos y Plantilla | ✅ Actualizado | `src/components/RosterManager.tsx` con los nuevos jugadores y técnicos. |
| **Fase 7** | Identidad Visual Oficial | ✅ Actualizado | `src/components/UcamLogo.tsx` con el escudo oficial UCAM Murcia CB. |
