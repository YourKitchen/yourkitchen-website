import type { Session } from 'next-auth'
import type {
  AppRouteHandlerFn,
  AppRouteHandlerFnContext,
} from 'next-auth/lib/types'
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
  | ((
      session: Session['user'],
    ) => boolean | Promise<boolean> | string | Promise<string>)

type BypassFunction = (req: NextRequest) => boolean

type ConfigType = {
  permissions: PermissionOption
  bypass?: BypassFunction
}

export const validatePermissions = <Config extends ConfigType>(
  config: Config,
  callback: (
    req: NextRequest,
    session: 'bypass' extends keyof Config ? Session | null : Session,
    ctx: AppRouteHandlerFnContext,
  ) => Response | Promise<Response>,
): AppRouteHandlerFn => {
  const func = auth(async (req, ctx) => {
    try {
      if (config.bypass) {
        if (config.bypass(req)) {
          return await callback(
            req,
            null as 'bypass' extends keyof Config ? null : Session,
            ctx,
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
            session as 'bypass' extends keyof Config ? null : Session,
            ctx,
          )
        }
        // End the request no matter what. (If it was set to false, it should not continue)
        return Response.json(
          {
            ok: false,
            message: 'Permission denied',
          },
          {
            status: 401,
          },
        )
      }
      if (typeof config.permissions === 'function') {
        const result = await config.permissions(session.user)
        if (typeof result === 'boolean') {
          if (result) {
            return await callback(
              req,
              session as 'bypass' extends keyof Config ? null : Session,
              ctx,
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
        // If the result is a string the operation failed. The string is the return message
        return Response.json(
          {
            ok: false,
            message: result,
          },
          {
            status: 401,
          },
        )
      }

      return await callback(
        req,
        session as 'bypass' extends keyof Config ? null : Session,
        ctx,
      )
    } catch (err) {
      const message = err.message || err
      console.error(err)
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

  return func
}
