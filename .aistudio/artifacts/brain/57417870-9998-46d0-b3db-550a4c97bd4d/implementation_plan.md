# Entrega de Manuales de la Aplicación Web: FarmaciaDB

Módulo interactivo integrado en FarmaciaDB para la visualización, navegación y exportación formal en formato PDF del **Manual Técnico** y del **Manual de Usuario**, dando cumplimiento total a las directrices académicas de entrega de proyecto.

## Decisiones Críticas y Preferencias del Usuario

> [!IMPORTANT]
> Se han incorporado las decisiones confirmadas por el usuario para la entrega de los manuales del proyecto:
> - **Modalidad de Entrega**: Módulo interactivo con navegación por pestañas en la aplicación web (`/manuales`) con soporte de descarga/impresión directa a PDF optimizada para hojas A4/Carta con portada institucional y saltos de página limpios.
> - **Alcance del Manual Técnico**: Documentación completa de stack tecnológico, herramientas de desarrollo, modelo de Inteligencia Artificial (Google Gemini 2.5 Flash), diagrama de arquitectura en cajas ASCII, diagrama Entidad-Relación (ERD) de Cloud SQL PostgreSQL y catálogo exhaustivo de endpoints REST.
> - **Alcance del Manual de Usuario**: Guía paso a paso ilustrada de cada módulo del sistema (POS con IA, Inventario, Clientes y Lealtad, Proveedores, Compras, Reportes y Gestión de Personal) con flujos de trabajo prácticos y roles diferenciados (Administrador vs. Empleado).

---

## 1. Visión General y Concepto Central

- **Propósito**: Proveer a los evaluadores académicos y al equipo operativo un centro de documentación interactivo dentro del sistema FarmaciaDB. Permite consultar directamente en pantalla o imprimir en PDF dos manuales completos de estándar universitario e industrial.
- **Público Objetivo**: 
  1. *Docentes / Evaluadores*: Para calificar la arquitectura técnica, base de datos relacional, modelos de IA y buenas prácticas de ingeniería de software.
  2. *Usuarios Finales (Farmacéuticos y Administradores)*: Como guía operativa de inducción para la atención en punto de venta, control de inventario y cierre de turno.
- **Valor Principal**: Centraliza la evidencia del proyecto, eliminando la necesidad de redactar documentos externos desfasados y garantizando que la documentación refleje con exactitud la base de datos PostgreSQL, los endpoints de Express y la IA en ejecución.

---

## 2. Experiencia de Usuario y Diseño Visual

### 2.1 Flujos de Usuario Principales

1. **Acceso al Centro de Documentación**:
   - Enlace directo desde la barra lateral (`/manuales`) con ícono de libro/documentación y acceso rápido en la cabecera.
   - Selector superior con dos pestañas de alto contraste:
     - 📘 **Manual Técnico**: Arquitectura, Base de Datos, IA, Seguridad y API REST.
     - 📗 **Manual de Usuario**: Operación de módulos, Punto de Venta, Inventario y Casos Prácticos.

2. **Navegación Dinámica y Tabla de Contenidos**:
   - Barra lateral interna o índice interactivo con enlaces anclados (scroll suave) a cada capítulo y sección.
   - Visualizador de código con resaltado de sintaxis para consultas SQL y contratos JSON de endpoints.
   - Tarjetas de evidencia visual simulada/capturas con insignias de estado para cada módulo.

3. **Exportación y Descarga en PDF**:
   - Botón destacado: **"📥 Descargar / Imprimir en PDF"**.
   - Hoja de estilos de impresión `@media print`:
     - Oculta automáticamente barra lateral, botones de navegación, chat y pie de página.
     - Genera carátula formal con título del proyecto, fecha y autoría.
     - Aplica saltos de página inteligentes (`page-break-before: always`) entre capítulos principales.
     - Tipografía ajustada a escala de grises y serif/sans-serif de lectura en papel.

### 2.2 Identidad Visual y Estilo

- **Paleta de Colores**: Integrada con el tema farmacéutico esmeralda y pizarra de FarmaciaDB:
  - Primario: Verde Clínico (`emerald-600` / `#059669`) para elementos clave y Manual de Usuario.
  - Secundario: Azul Técnico / Cian (`sky-600` / `#0284c7`) para arquitectura y Manual Técnico.
  - Fondo: Pizarra neutra clara (`bg-slate-50`) en modo día y carbón (`bg-slate-950`) en modo oscuro.
- **Tipografía**:
  - Títulos y subtítulos: `font-semibold` / `font-bold` con espaciado ajustado.
  - Bloques de código y contratos REST: `font-mono text-xs` con fondos protegidos.
- **Componentes y Accesibilidad**: Diseñado bajo Tailwind CSS, con atajos de teclado y botones accesibles.

---

## 3. Decisiones de Producto y Compensaciones

- **Visualizador Web vs. Archivo PDF Estático Externo**:
  - *Decisión*: Implementar un visor interactivo rico en React que renderice el documento formalmente y aproveche el motor de impresión nativo del navegador (`window.print()` con CSS print media).
  - *Ventaja*: El contenido nunca se desincroniza del estado real del código, no requiere descargas de MB innecesarios y permite exportar directamente a PDF idéntico a una memoria técnica.
- **Estructura Modular de los Manuales**:
  - *Decisión*: Separar el contenido en componentes estructurados reutilizables por capítulos (`ManualTecnicoView` y `ManualUsuarioView`).
  - *Ventaja*: Mantenibilidad limpia, carga instantánea y posibilidad de actualizar cualquier sección o endpoint sin tocar la lógica del resto de la app.

---

## 4. Arquitectura Técnica y Estrategia de Datos

### 4.1 Diagrama de Arquitectura del Sistema

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NAVEGADOR CLIENTE (SPA)                         │
│                                                                        │
│  ┌───────────────────────┐          ┌───────────────────────────────┐  │
│  │   Vite + React 19     │          │    Módulo de Manuales Web     │  │
│  │   TanStack Router     │ ◄──────► │    - Manual Técnico Tab       │  │
│  │   Tailwind CSS v4     │          │    - Manual de Usuario Tab    │  │
│  └───────────┬───────────┘          │    - Generador PDF Impresión  │  │
│              │                      └───────────────────────────────┘  │
│              │ HTTPS / REST JSON                                       │
└──────────────┼─────────────────────────────────────────────────────────┘
               ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       BACKEND (Node.js / Express)                      │
│                                                                        │
│  ┌─────────────────────────┐          ┌─────────────────────────────┐  │
│  │  Servidor REST Express  │          │   Servicios de IA Gemini    │  │
│  │  - Rutas: /api/*        │ ◄──────► │   - @google/genai SDK       │  │
│  │  - Auth JWT & Roles     │          │   - Modelo: gemini-2.5-flash│  │
│  └───────────┬─────────────┘          │   - Transcripción de Voz    │  │
│              │                        │   - Asistente Farmacéutico  │  │
│              │ Drizzle ORM / pg.Pool  └─────────────────────────────┘  │
└──────────────┼─────────────────────────────────────────────────────────┘
               ▼
┌────────────────────────────────────────────────────────────────────────┐
│            BASE DE DATOS RELACIONAL (Google Cloud SQL)                 │
│                                                                        │
│  Instancia: ai-studio-57417870 (Región: us-east1)                      │
│  Motor: PostgreSQL 16                                                  │
│                                                                        │
│  ┌───────────┐   ┌───────────────┐   ┌──────────────┐   ┌───────────┐  │
│  │  usuarios │   │  proveedores  │   │   clientes   │   │  compras  │  │
│  └─────┬─────┘   └───────┬───────┘   └───────┬──────┘   └─────┬─────┘  │
│        │                 │                   │                │        │
│        ▼                 ▼                   ▼                ▼        │
│  ┌───────────┐   ┌───────────────┐   ┌──────────────┐   ┌───────────┐  │
│  │  ventas   │◄──┤ venta_detalles│──►│ medicamentos │◄──┤compra_det.│  │
│  └───────────┘   └───────────────┘   └──────────────┘   └───────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Contenido Detallado del Manual Técnico

El Manual Técnico incluirá las siguientes secciones requeridas por la pauta:

1. **Ficha de Identificación del Proyecto**: Nombre del sistema, versión, año lectivo y objetivo.
2. **Herramientas y Tecnologías Utilizadas**:
   - *Frontend*: React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Query v5, TanStack Router, Lucide Icons, Sonner.
   - *Backend*: Node.js v20+, Express.js, Drizzle ORM, `pg` (node-postgres Connection Pool), CORS, JSON Web Tokens (JWT).
   - *Inteligencia Artificial*: Google Gemini 2.5 Flash mediante `@google/genai` TypeScript SDK para procesamiento de recetas, reconocimiento de voz y chatbot farmacéutico.
   - *Gestor de Base de Datos*: PostgreSQL 16 alojado en Google Cloud SQL (instancia administrada con alta disponibilidad, almacenamiento SSD y transacciones ACID).
3. **Diagrama de Arquitectura y Flujo de Datos**: Diagrama esquemático en cajas con descripción de capas de presentación, lógica de negocio y persistencia.
4. **Diagrama Entidad-Relación (ERD) y Diccionario de Datos**:
   - Tablas documentadas con campos, tipos de datos, llaves primarias y foráneas (`usuarios`, `medicamentos`, `clientes`, `proveedores`, `compras`, `ventas`, `venta_detalles`).
5. **Catálogo de Endpoints de la API REST**:
   - Métodos HTTP, rutas (`/api/medicamentos`, `/api/clientes`, `/api/ventas`, etc.), parámetros requeridos y ejemplos de respuesta JSON.
6. **Políticas de Seguridad y Control de Acceso**:
   - Autenticación mediante tokens de sesión y autorización por roles (Administrador con privilegios de compras/proveedores/reportes financieros y Empleado con punto de venta e inventario).

### 4.3 Contenido Detallado del Manual de Usuario

El Manual de Usuario abarcará las guías ilustradas paso a paso:

1. **Inicio de Sesión y Perfiles**:
   - Cómo acceder al sistema con credenciales de Administrador o Empleado.
2. **Punto de Venta (POS)**:
   - Selección de medicamentos mediante lector de código de barras o buscador de texto.
   - Uso del botón de micrófono para búsqueda por voz impulsada por Gemini 2.5 Flash.
   - Asignación de cliente y canje automático de puntos de fidelidad.
   - Métodos de pago (Efectivo, Tarjeta, Transferencia) y generación de ticket de venta.
3. **Control de Inventario**:
   - Alta y edición de medicamentos con alertas de stock mínimo.
   - Monitoreo del semáforo de fechas de vencimiento (verde, amarillo de precaución, rojo vencido).
4. **Clientes y Fidelización**:
   - Registro de clientes, acumulación de puntos por compras y descuentos.
5. **Proveedores y Compras de Mercadería (Admin)**:
   - Registro de órdenes de compra para actualización de stock en tiempo real.
6. **Corte de Turno y Reportes Financieros**:
   - Arqueo de caja al final de la jornada laboral y métricas de rentabilidad.
7. **Asistente Virtual Farmacéutico**:
   - Consultas de posología, contraindicaciones y alternativas terapéuticas.

---

## 5. Plan de Ejecución por Fases (Post-Aprobación)

1. **Creación de la Ruta y Componentes**:
   - Crear `src/routes/_app.manuales.tsx` con el visualizador de dos pestañas, carátula institucional y soporte de impresión CSS.
   - Desarrollar `src/components/manuales/ManualTecnico.tsx` y `src/components/manuales/ManualUsuario.tsx` con todo el contenido técnico y operativo.
2. **Integración en la Navegación**:
   - Agregar el elemento "Documentación / Manuales" en el sidebar (`src/routes/_app.tsx`).
   - Agregar botón de acceso rápido en el header del dashboard.
3. **Verificación y Pruebas**:
   - Ejecución de `lint_applet` y `compile_applet`.
   - Validación del botón de impresión y vista previa del PDF generado.
