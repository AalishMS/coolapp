declare module 'hpp' {
  import { RequestHandler } from 'express'

  interface HppOptions {
    checkBody?: boolean
    checkParams?: boolean
    checkQuery?: boolean
    whitelist?: string[]
  }

  function hpp(options?: HppOptions): RequestHandler

  export = hpp
}
