declare module '@wolfram-alpha/wolfram-alpha-api' {
  export interface WolframAlphaSubpod {
    title: string
    microsources: any
    img: any
    plaintext: string
  }

  export interface WolframAlphaPod {
    title: string
    scanner: string
    id: string
    position: number
    error: boolean
    numsubpods: number
    subpods: WolframAlphaSubpod[]
    expressiontypes: any
    states?: any[]
    primary?: boolean
  }

  export interface WolframAlphaAPIResponse {
    success: boolean
    error: boolean
    numpods: number
    datatypes: string
    timedout: string
    timeoutpods: string
    timing: number
    parsetiming: number
    parsetimedout: boolean
    recalculate: string
    id: string
    host: string
    server: string
    related: string
    version: string
    inputstring: string
    pods: WolframAlphaPod[]
    sources: {
      url: string
      text: string
    }
    didyoumeans?:
      | {
          score: string
          level: string
          val: string
        }
      | {
          score: string
          level: string
          val: string
        }[]
  }

  export default function WolframAlphaAPI(app_id: string): {
    getFull(query: string): Promise<WolframAlphaAPIResponse>

    getFull(params: {
      input: string
      includepodid?: string
      format?:
        | 'plaintext'
        | 'image'
        | 'imagemap'
        | 'minput'
        | 'moutput'
        | 'cell'
        | 'mathml'
        | 'sourd'
        | 'wav'
      output?: 'json' | 'xml'
    }): Promise<WolframAlphaAPIResponse>
  }
}
