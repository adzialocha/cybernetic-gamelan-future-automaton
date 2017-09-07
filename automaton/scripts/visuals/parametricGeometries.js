import {
  Vector3,
} from 'three'

export const klein = (v, u, optionalTarget) => {
  const result = optionalTarget || new Vector3()

  u *= Math.PI
  v *= 2 * Math.PI

  u = u * 2

  let x
  let z

  if ( u < Math.PI ) {

    x = 3 * Math.cos( u ) * ( 1 + Math.sin( u ) ) + ( 2 * ( 1 - Math.cos( u ) / 2 ) ) * Math.cos( u ) * Math.cos( v )
    z = -8 * Math.sin( u ) -2 * ( 1 - Math.cos( u ) / 2 ) * Math.sin( u ) * Math.cos( v )

  } else {

    x = 3 * Math.cos( u ) * ( 1 + Math.sin( u ) ) + ( 2 * ( 1 - Math.cos( u ) / 2 ) ) * Math.cos( v + Math.PI )
    z = -8 * Math.sin( u )

  }

  const y = -2 * ( 1 - Math.cos( u ) / 2 ) * Math.sin( v )

  return result.set( x, y, z )
}

export const mobius3d = (u, t, optionalTarget) => {
  const result = optionalTarget || new Vector3()

  u *= Math.PI
  t *= 2 * Math.PI
  u = u * 2

  const phi = u / 2
  const major = 30.25
  const a = 10.125
  const b = 20.65

  let x = a * Math.cos( t ) * Math.cos( phi ) - b * Math.sin( t ) * Math.sin( phi )
  const z = a * Math.cos( t ) * Math.sin( phi ) + b * Math.sin( t ) * Math.cos( phi )
  const y = ( major + x ) * Math.sin( u )

  x = ( major + x ) * Math.cos( u )

  return result.set( x, y, z )
}
