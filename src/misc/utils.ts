import type { Session } from 'next-auth'
import type { AppRouteHandlerFn } from 'next-auth/lib/types'
import type { NextRequest } from 'next/server'
import { auth } from './auth'

/**
 * Converts a string to title case
 * @param str The string to convert
 * @returns The converted string
 */
export const toTitleCase = (str: string): string => {
  const s = str.replace(/([A-Z])/g, ' $1').trim()
  return s
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}
type PermissionOption =
  | boolean
  | ((session: Session['user']) => boolean | Promise<boolean>)

type BypassFunction = (req: NextRequest) => boolean

type ConfigType = {
  permissions: PermissionOption
  bypass?: BypassFunction
}

export type ValidatedUser = Omit<Session['user'], 'teamId'> & { teamId: string }

export const validatePermissions = <Config extends ConfigType>(
  config: Config,
  callback: (
    req: NextRequest,
    user: 'bypass' extends keyof Config ? ValidatedUser | null : ValidatedUser,
    ctx: { params: Promise<any> },
  ) => Response | Promise<Response>,
): ((
  req: NextRequest,
  ctx: { params: Promise<any> },
) => Response | Promise<Response>) => {
  const func = auth(async (req, ctx) => {
    // Temporary fix until NextAuth is updated
    const context = ctx as any as { params: Promise<any> }
    try {
      if (config.bypass) {
        if (config.bypass(req)) {
          return await callback(
            req,
            null as 'bypass' extends keyof Config ? null : ValidatedUser,
            context,
          )
        }
      }

      const session = req.auth

      // Session is only required from this point on. It is optional in the above if-statement.
      if (!session) {
        return Response.json(
          {
            ok: false,
            message: 'You need to be signed in',
          },
          {
            status: 401,
          },
        )
      }

      if (typeof config.permissions === 'boolean') {
        // If method item is defined and boolean, check if it is true
        if (config.permissions) {
          return await callback(
            req,
            session.user as 'bypass' extends keyof Config
              ? null
              : ValidatedUser,
            context,
          )
        }
        // End the request no matter what. (If it was set to false, it should not continue)
        return Response.json(
          {
            ok: false,
            message: 'You need to be signed in',
          },
          {
            status: 401,
          },
        )
      }

      return await callback(
        req,
        session.user as 'bypass' extends keyof Config ? null : ValidatedUser,
        context,
      )
    } catch (err) {
      const message = err.message || err
      return Response.json(
        {
          ok: false,
          message,
        },
        {
          status: 500,
        },
      )
    }
  })

  // Type casting is temporary fix until next-auth is updated for NextJS v15
  return func as any as (
    req: NextRequest,
    ctx?: { params: Promise<any> },
  ) => Response | Promise<Response>
}
