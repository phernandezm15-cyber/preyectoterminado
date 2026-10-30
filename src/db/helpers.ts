import { db } from './index.ts';
import {
  medicamentos,
  clientes,
  proveedores,
  compras,
  ventas,
  ventaItems,
  users,
} from './schema.ts';
import { eq, desc, sql } from 'drizzle-orm';

// ----------------- MEDICAMENTOS -----------------
export async function getMedicamentos() {
  try {
    return await db.select().from(medicamentos).orderBy(medicamentos.id);
  } catch (error) {
    console.error('Error fetching medicamentos:', error);
    throw new Error('Error al consultar medicamentos', { cause: error });
  }
}

export async function upsertMedicamento(data: any) {
  try {
    const id = data.id || `MED-${Date.now().toString().slice(-4)}`;
    const precioCompra = data.precioCompra != null ? String(data.precioCompra) : data.precio_compra != null ? String(data.precio_compra) : '0.00';
    const precioVenta = data.precioVenta != null ? String(data.precioVenta) : data.precio_venta != null ? String(data.precio_venta) : '0.00';

    return await db
      .insert(medicamentos)
      .values({
        id,
        codigo: data.codigo || `750${Date.now().toString().slice(-8)}`,
        nombre: data.nombre,
        principio: data.principio || '',
        categoria: data.categoria || 'General',
        caducidad: data.caducidad || new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
        precioCompra,
        precioVenta,
        stock: Number(data.stock ?? 0),
      })
      .onConflictDoUpdate({
        target: medicamentos.id,
        set: {
          codigo: data.codigo,
          nombre: data.nombre,
          principio: data.principio,
          categoria: data.categoria,
          caducidad: data.caducidad,
          precioCompra,
          precioVenta,
          stock: Number(data.stock ?? 0),
        },
      })
      .returning();
  } catch (error) {
    console.error('Error upserting medicamento:', error);
    throw new Error('Error al guardar medicamento en base de datos', { cause: error });
  }
}

export async function deleteMedicamento(id: string) {
  try {
    return await db.delete(medicamentos).where(eq(medicamentos.id, id)).returning();
  } catch (error) {
    console.error('Error deleting medicamento:', error);
    throw new Error('Error al eliminar medicamento', { cause: error });
  }
}

// ----------------- CLIENTES -----------------
export async function getClientes() {
  try {
    return await db.select().from(clientes).orderBy(clientes.nombre);
  } catch (error) {
    console.error('Error fetching clientes:', error);
    throw new Error('Error al consultar clientes', { cause: error });
  }
}

export async function upsertCliente(data: any) {
  try {
    const id = data.id || `CLI-${Date.now().toString().slice(-4)}`;
    return await db
      .insert(clientes)
      .values({
        id,
        nombre: data.nombre,
        telefono: data.telefono || '',
        nit: data.nit || 'CF',
        puntos: Number(data.puntos ?? 0),
      })
      .onConflictDoUpdate({
        target: clientes.id,
        set: {
          nombre: data.nombre,
          telefono: data.telefono || '',
          nit: data.nit || 'CF',
          puntos: Number(data.puntos ?? 0),
        },
      })
      .returning();
  } catch (error) {
    console.error('Error upserting cliente:', error);
    throw new Error('Error al guardar cliente en base de datos', { cause: error });
  }
}

// ----------------- PROVEEDORES -----------------
export async function getProveedores() {
  try {
    return await db.select().from(proveedores).orderBy(proveedores.empresa);
  } catch (error) {
    console.error('Error fetching proveedores:', error);
    throw new Error('Error al consultar proveedores', { cause: error });
  }
}

export async function upsertProveedor(data: any) {
  try {
    const id = data.id || `PRV-${Date.now().toString().slice(-4)}`;
    const payload = {
      id,
      empresa: data.empresa || '',
      contacto: data.contacto || '',
      telefono: data.telefono || '',
      correo: data.correo || '',
      direccion: data.direccion || '',
    };
    return await db
      .insert(proveedores)
      .values(payload)
      .onConflictDoUpdate({
        target: proveedores.id,
        set: payload,
      })
      .returning();
  } catch (error) {
    console.error('Error upserting proveedor:', error);
    throw new Error('Error al guardar proveedor', { cause: error });
  }
}

export async function deleteProveedor(id: string) {
  try {
    return await db.delete(proveedores).where(eq(proveedores.id, id)).returning();
  } catch (error) {
    console.error('Error deleting proveedor:', error);
    throw new Error('Error al eliminar proveedor', { cause: error });
  }
}

// ----------------- COMPRAS -----------------
export async function getCompras() {
  try {
    return await db.select().from(compras).orderBy(desc(compras.fecha));
  } catch (error) {
    console.error('Error fetching compras:', error);
    throw new Error('Error al consultar compras', { cause: error });
  }
}

export async function createCompra(data: any) {
  try {
    const id = data.id || `CMP-${Date.now().toString().slice(-4)}`;
    const codigo = data.codigo || id;
    const proveedorId = data.proveedorId || data.proveedor_id;
    const medId = data.medId || data.med_id;
    const costo = String(data.costo ?? 0);

    return await db
      .insert(compras)
      .values({
        id,
        codigo,
        proveedorId,
        medId,
        cantidad: Number(data.cantidad ?? 1),
        costo,
        estado: data.estado || 'Pendiente',
        nota: data.nota ?? null,
      })
      .returning();
  } catch (error) {
    console.error('Error creating compra:', error);
    throw new Error('Error al registrar compra', { cause: error });
  }
}

export async function updateCompraEstado(id: string, nuevoEstado: string) {
  try {
    return await db.transaction(async (tx) => {
      const [compra] = await tx
        .update(compras)
        .set({ estado: nuevoEstado })
        .where(eq(compras.id, id))
        .returning();

      // Si se completó, incrementamos el stock automáticamente en inventario
      if (nuevoEstado === 'Completado' && compra && compra.medId) {
        await tx
          .update(medicamentos)
          .set({
            stock: sql`${medicamentos.stock} + ${compra.cantidad}`,
          })
          .where(eq(medicamentos.id, compra.medId));
      }

      return compra;
    });
  } catch (error) {
    console.error('Error updating compra estado:', error);
    throw new Error('Error al actualizar estado de compra', { cause: error });
  }
}

// ----------------- VENTAS & POS (Transaccional) -----------------
export async function getVentas() {
  try {
    return await db.query.ventas.findMany({
      orderBy: [desc(ventas.fecha)],
      limit: 1000,
      with: {
        items: true,
      },
    });
  } catch (error) {
    console.error('Error fetching ventas:', error);
    throw new Error('Error al consultar ventas', { cause: error });
  }
}

export async function createVentaTransaccional(
  ventaData: {
    id: string;
    codigo: string;
    subtotal: number;
    descuento: number;
    descPct: number;
    iva: number;
    total: number;
    vendedorNombre: string;
    vendedorId?: string | null;
    clienteId?: string | null;
    puntos: number;
  },
  items: {
    medId: string;
    nombre: string;
    cantidad: number;
    precio: number;
  }[]
) {
  try {
    return await db.transaction(async (tx) => {
      // 1. Insertar la venta
      const [nuevaVenta] = await tx
        .insert(ventas)
        .values({
          id: ventaData.id,
          codigo: ventaData.codigo,
          subtotal: String(ventaData.subtotal),
          descuento: String(ventaData.descuento),
          descPct: String(ventaData.descPct),
          iva: String(ventaData.iva),
          total: String(ventaData.total),
          vendedorNombre: ventaData.vendedorNombre,
          vendedorId: ventaData.vendedorId ?? null,
          clienteId: ventaData.clienteId ?? null,
          puntos: ventaData.puntos,
        })
        .returning();

      // 2. Insertar cada ítem y decrementar el stock
      for (const item of items) {
        await tx.insert(ventaItems).values({
          ventaId: nuevaVenta.id,
          medId: item.medId,
          nombre: item.nombre,
          cantidad: item.cantidad,
          precio: String(item.precio),
        });

        await tx
          .update(medicamentos)
          .set({
            stock: sql`GREATEST(0, ${medicamentos.stock} - ${item.cantidad})`,
          })
          .where(eq(medicamentos.id, item.medId));
      }

      // 3. Si hay cliente y sumó puntos, actualizarlos
      if (ventaData.clienteId && ventaData.puntos > 0) {
        await tx
          .update(clientes)
          .set({
            puntos: sql`${clientes.puntos} + ${ventaData.puntos}`,
          })
          .where(eq(clientes.id, ventaData.clienteId));
      }

      return nuevaVenta;
    });
  } catch (error) {
    console.error('Error creating venta:', error);
    throw new Error('Error al procesar la venta en el punto de venta', { cause: error });
  }
}

// ----------------- USUARIOS & AUTH -----------------
export async function getUsers() {
  try {
    const list = await db.select().from(users).orderBy(users.id);
    return list.map(({ password: _p, ...u }) => u);
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Error al consultar usuarios', { cause: error });
  }
}

export async function getUserByEmail(email: string) {
  try {
    const [u] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
    return u || null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw new Error('Error al consultar usuario', { cause: error });
  }
}

export async function createUser(data: {
  email: string;
  password: string;
  nombre: string;
  role: string;
}) {
  try {
    const [u] = await db
      .insert(users)
      .values({
        email: data.email.toLowerCase().trim(),
        password: data.password,
        nombre: data.nombre.trim(),
        role: data.role,
      })
      .returning();
    const { password: _p, ...safeUser } = u;
    return safeUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Error al registrar usuario', { cause: error });
  }
}

export async function deleteUser(id: number) {
  try {
    return await db.delete(users).where(eq(users.id, id)).returning();
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Error al eliminar usuario', { cause: error });
  }
}
