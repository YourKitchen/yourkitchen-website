import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.json({
      ok: true,
      message: 'Succesfully got recipe',
      data: undefined,
    })
  } else if (req.method === 'DELETE') {
    return res.json({
      ok: true,
      message: 'Succesfully deleted recipe',
    })
  } else if (req.method === 'PUT') {
    return res.json({
      ok: true,
      message: 'Succesfully updated recipe',
      data: undefined,
    })
  }

  res.status(405).json({
    ok: false,
    message: 'Method not allowed',
  })
}
