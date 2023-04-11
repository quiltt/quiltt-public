'use client'

import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useState } from 'react'

import type { JsonWebToken, Maybe } from '@quiltt/core'
import { Timeoutable, JsonWebTokenParse } from '@quiltt/core'

import { useStorage } from './useStorage'

export type PrivateClaims = {
  oid: string // Organization ID
  did: string // Deployment ID
  aid: string // Administrator ID
  ver: number // Session Token Version
}
export type QuilttJWT = JsonWebToken<PrivateClaims>
export type SetSession = Dispatch<SetStateAction<Maybe<string> | undefined>>

const parse = JsonWebTokenParse<PrivateClaims>

/**
 * Singleton timeout, allows hooks to come and go, while ensuring that there is
 * one notification being sent, preventing race conditions.
 */
const sessionTimer = new Timeoutable()

/**
 * useSession uses useStorage to support a global singleton style of access. When
 * updated, all components, and windows should also invalidate.
 *
 * TODO: Support Rotation before Expiry
 *
 * Dataflow can come from two directions:
 *  1. Login - Bottom Up
 *    This happens on login, when a token is passed up through the setSession
 *    callback. From here it needs to be stored, and shared for usage.
 *  2. Refresh - Top Down
 *    This happens when a page is reloaded or a person returns, and everything is
 *    reinitialized.
 */
export const useSession = (): [Maybe<QuilttJWT> | undefined, SetSession] => {
  const [token, setToken] = useStorage<string>('session')

  const initializeState = () => {
    const initalState = parse(token)
    if (initalState === undefined && token) {
      setToken(null)
    } else {
      return initalState
    }
  }

  const [session, setState] = useState<Maybe<QuilttJWT> | undefined>(initializeState())

  // Clear session if/when it expires
  useEffect(() => {
    if (!session) return
    const expirationMS = session.claims.exp * 1000

    const expire = () => {
      setToken(null)
    }

    if (Date.now() >= expirationMS) {
      expire()
    } else {
      sessionTimer.set(expire, expirationMS - Date.now())
      return () => sessionTimer.clear(expire)
    }
  }, [setToken, session])

  // Update from upstream useStorage Changes
  useEffect(() => {
    if (token) {
      setState(parse(token))
    } else {
      setState(null)
    }
  }, [token])

  // Bubbles up from Login
  const setSession = (
    nextState: Maybe<string> | undefined | SetStateAction<Maybe<string> | undefined>
  ) => {
    const newState = nextState instanceof Function ? nextState(token) : nextState

    if (token !== newState && (!newState || parse(newState))) {
      setToken(newState)
    }
  }

  return [session, setSession]
}

export default useSession