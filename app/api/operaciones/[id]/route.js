import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function PUT(request, { params }) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  )

  const { id } = await params

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const {
    operacion_tipo,
    arbol_ID,
    arbol_linked,
    operacion_importeretenido,
    operacion_importegastado,
    operacion_descripcion,
    operacion_unidadgestora,
    operacion_fecha,
    operacion_aplicacion,
    NIF_tercero,
    expediente_codigo,
  } = body

  if (!operacion_tipo) {
    return NextResponse.json({ error: 'El tipo de operación es obligatorio.' }, { status: 400 })
  }

  // Parse date to ISO string for timestamptz
  let parsedFecha = null
  if (operacion_fecha && operacion_fecha.trim() !== '') {
    const d = new Date(operacion_fecha)
    if (!isNaN(d.getTime())) {
      parsedFecha = d.toISOString()
    }
  }

  // Build update payload
  const updatePayload = {
    operacion_tipo,
    arbol_ID: arbol_linked && arbol_ID ? arbol_ID : id,
    operacion_descripcion: operacion_descripcion?.trim() || null,
    operacion_unidadgestora: operacion_unidadgestora?.trim() || null,
    operacion_fecha: parsedFecha,
    operacion_aplicacion: operacion_aplicacion || null,
    NIF_tercero: NIF_tercero?.trim() || null,
    expediente_codigo: expediente_codigo?.trim() || null,
    operacion_importeretenido: null,
    operacion_importegastado: null,
  }

  const impRet = parseFloat(operacion_importeretenido)
  if (!isNaN(impRet)) {
    updatePayload.operacion_importeretenido = impRet
  }

  if (operacion_tipo === 'O' || operacion_tipo === 'ADO') {
    const impGast = parseFloat(operacion_importegastado)
    updatePayload.operacion_importegastado = isNaN(impGast) ? null : impGast
  }

  const { error: updateError } = await supabase
    .from('HACK_CONTA_Operaciones')
    .update(updatePayload)
    .eq('operacion_ID', id)

  if (updateError) {
    return NextResponse.json({ error: `Error al actualizar operación: ${updateError.message}` }, { status: 500 })
  }

  // Update fecha_ultimocambio on matching Aplicacion row
  if (operacion_aplicacion) {
    await supabase
      .from('HACK_CONTA_Aplicaciones')
      .update({ fecha_ultimocambio: new Date().toISOString() })
      .eq('aplicacion_presup', operacion_aplicacion)
  }

  return NextResponse.json({ success: true, operacion_ID: id })
}
