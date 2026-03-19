import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  )

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const {
    operacion_tipo,
    arbol_ID: bodyArbolID,
    arbol_linked,
    RC_Numero,
    operacion_importeretenido,
    operacion_descripcion,
    operacion_unidadgestora,
    operacion_fecha,
    operacion_aplicacion,
  } = body

  if (!operacion_tipo) {
    return NextResponse.json({ error: 'El tipo de operación es obligatorio.' }, { status: 400 })
  }

  // Validate RC_Numero format if provided
  if (operacion_tipo === 'RC' && RC_Numero && RC_Numero.trim() !== '') {
    if (!/^RC-\d{4}-\d{5}$/.test(RC_Numero.trim())) {
      return NextResponse.json(
        { error: 'RC Número debe tener formato RC-AAAA-NNNNN (ej: RC-2025-00124).' },
        { status: 400 }
      )
    }
  }

  // Determine next operacion_ID by finding the max existing number
  const { data: ops, error: opsError } = await supabase
    .from('HACK_Conta_Operaciones')
    .select('operacion_ID')

  if (opsError) {
    return NextResponse.json({ error: `Error al consultar operaciones: ${opsError.message}` }, { status: 500 })
  }

  const maxNum = (ops || []).reduce((max, op) => {
    const match = op.operacion_ID?.match(/CONT-OP-(\d+)/)
    if (match) {
      const n = parseInt(match[1], 10)
      return n > max ? n : max
    }
    return max
  }, 0)

  const operacion_ID = `CONT-OP-${String(maxNum + 1).padStart(6, '0')}`

  // Determine arbol_ID: use linked one or default to new operacion_ID
  const arbol_ID = arbol_linked && bodyArbolID ? bodyArbolID : operacion_ID

  // Parse date to ISO string for timestamptz
  let parsedFecha = null
  if (operacion_fecha && operacion_fecha.trim() !== '') {
    // datetime-local sends "YYYY-MM-DDTHH:MM" or "YYYY-MM-DDTHH:MM:SS"
    const d = new Date(operacion_fecha)
    if (!isNaN(d.getTime())) {
      parsedFecha = d.toISOString()
    }
  }

  // Build insert payload
  const insertPayload = {
    operacion_ID,
    arbol_ID,
    operacion_tipo,
    operacion_descripcion: operacion_descripcion?.trim() || null,
    operacion_unidadgestora: operacion_unidadgestora?.trim() || null,
    operacion_fecha: parsedFecha,
    operacion_aplicacion: operacion_aplicacion || null,
  }

  // RC-specific fields
  if (operacion_tipo === 'RC') {
    insertPayload.RC_Numero = RC_Numero?.trim() || null
    const imp = parseFloat(operacion_importeretenido)
    insertPayload.operacion_importeretenido = isNaN(imp) ? null : imp
  }

  const { error: insertError } = await supabase
    .from('HACK_Conta_Operaciones')
    .insert(insertPayload)

  if (insertError) {
    return NextResponse.json({ error: `Error al insertar operación: ${insertError.message}` }, { status: 500 })
  }

  // Update fecha_ultimocambio on matching Aplicacion row
  if (operacion_aplicacion) {
    const { error: updateError } = await supabase
      .from('HACK_CONTA_Aplicaciones')
      .update({ fecha_ultimocambio: new Date().toISOString() })
      .eq('aplicacion_presup', operacion_aplicacion)

    if (updateError) {
      // Non-fatal: operation was saved, just log the warning
      console.warn(`No se pudo actualizar fecha_ultimocambio: ${updateError.message}`)
    }
  }

  return NextResponse.json({ success: true, operacion_ID })
}
